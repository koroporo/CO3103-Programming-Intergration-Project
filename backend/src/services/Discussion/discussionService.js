const model = require("../../models/Discussion/discussionModel");
const { createError, positiveId, postBody, patchBody, pageQuery, page } = require("../../utils/discussionUtils");

async function access(client, lessonId, user) {
  const actor = await model.findActor(client, user.id);
  if (!actor || actor.status !== "active" || !["learner", "instructor", "admin"].includes(actor.role)) {
    throw createError(403, "An active learner, instructor or administrator account is required");
  }
  const lesson = await model.findLesson(client, lessonId);
  if (!lesson || ["hidden", "archived"].includes(lesson.course_status)
    || ["hidden", "archived"].includes(lesson.status)) throw createError(404, "Lesson not found");
  const canModerate = actor.role === "admin"
    || (actor.role === "instructor" && String(actor.id) === String(lesson.instructor_id));
  if (!canModerate) {
    const enrollment = actor.role === "learner"
      ? await model.findEnrollment(client, actor.id, lesson.course_id) : null;
    if (!enrollment || !["active", "completed"].includes(enrollment.status)
      || lesson.status !== "published" || lesson.course_status !== "published") {
      throw createError(403, "You must be enrolled in this course to access its discussions");
    }
  }
  return { actor, lesson, canModerate };
}

async function visiblePost(client, lessonId, id, lock = false) {
  let post = await model.findPost(client, lessonId, id);
  if (!post) throw createError(404, "Discussion not found");
  // Always lock the root before a reply so deleting a thread cannot race a reply.
  let root = post.parent_id ? await model.findPost(client, lessonId, post.parent_id, lock) : null;
  if (post.parent_id && (!root || root.parent_id)) throw createError(404, "Discussion not found");
  if (lock) {
    post = await model.findPost(client, lessonId, id, true);
    if (!post) throw createError(404, "Discussion not found");
  }
  return { post, root };
}

function withLesson(lessonId, user, work) {
  const id = positiveId(lessonId, "lesson_id");
  return model.withTransaction(async (client) => work(client, await access(client, id, user), id));
}

function list(lessonId, query, user) {
  const pagination = pageQuery(query);
  return withLesson(lessonId, user, async (client, context, id) => ({
    ...page(await model.listThreads(client, id, pagination), pagination),
    permissions: { can_moderate: context.canModerate },
  }));
}

function get(lessonId, discussionId, user) {
  const id = positiveId(discussionId, "discussion_id");
  return withLesson(lessonId, user, async (client, _context, lesson) =>
    (await visiblePost(client, lesson, id)).post);
}

function replies(lessonId, discussionId, query, user) {
  const id = positiveId(discussionId, "discussion_id");
  const pagination = pageQuery(query);
  return withLesson(lessonId, user, async (client, _context, lesson) => {
    const { post } = await visiblePost(client, lesson, id);
    if (post.parent_id) throw createError(400, "Replies must belong to a top-level discussion");
    return page(await model.listReplies(client, lesson, id, pagination), pagination);
  });
}

function create(lessonId, discussionId, body, user) {
  const data = postBody(body);
  const parentId = discussionId == null ? null : positiveId(discussionId, "discussion_id");
  return withLesson(lessonId, user, async (client, { actor, lesson }, id) => {
    let root = null;
    if (parentId) {
      root = (await visiblePost(client, id, parentId, true)).post;
      if (root.parent_id) throw createError(400, "Only one level of replies is supported");
    }
    const post = await model.insert(client, id, actor.id, parentId, data.content);
    await model.notify(client, lesson, actor, post, root);
    return { ...post, author_name: actor.full_name, author_role: actor.role, reply_count: 0 };
  });
}

function edit(lessonId, discussionId, body, user) {
  const id = positiveId(discussionId, "discussion_id");
  const patch = patchBody(body);
  return withLesson(lessonId, user, async (client, { actor, canModerate }, lesson) => {
    const { post } = await visiblePost(client, lesson, id, true);
    const owns = String(post.author_id) === String(actor.id);
    if ("content" in patch && !owns) throw createError(403, "You can only edit your own content");
    if (("is_resolved" in patch || "is_pinned" in patch) && post.parent_id) {
      throw createError(400, "Only top-level discussions can be resolved or pinned");
    }
    if ("is_resolved" in patch && !owns && !canModerate) throw createError(403, "Only the author or course moderator can resolve a discussion");
    if ("is_pinned" in patch && !canModerate) throw createError(403, "Only course moderators can pin discussions");
    return { ...post, ...await model.update(client, id, patch) };
  });
}

function remove(lessonId, discussionId, user) {
  const id = positiveId(discussionId, "discussion_id");
  return withLesson(lessonId, user, async (client, { actor, canModerate }, lesson) => {
    const { post } = await visiblePost(client, lesson, id, true);
    if (String(post.author_id) !== String(actor.id) && !canModerate) {
      throw createError(403, "Only the author or course moderator can delete a discussion");
    }
    await model.softDelete(client, id);
  });
}

module.exports = { list, get, replies, create, edit, remove };
