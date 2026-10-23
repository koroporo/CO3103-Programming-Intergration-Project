const enrollmentModel = require("../models/enrollmentModel");
const { createError, positiveId } = require("../ultils/courseUltils");
const { validateEnrollment, validateResume, validateList } = require("../ultils/enrollmentUltils");

async function getActiveLearner(client, learnerId) {
  const learner = await enrollmentModel.lockLearner(client, learnerId);
  if (!learner || learner.status !== "active" || learner.role !== "learner") {
    throw createError(403, "An active learner account is required");
  }
  return learner;
}

async function enroll(body, user) {
  const data = validateEnrollment(body);
  const courseId = data.course_id;

  // các câu SQL trong hàm bên dưới dùng chung một connection (client)
  return enrollmentModel.withTransaction(async (client) => {
    const learner = await getActiveLearner(client, user.id);

    // 1. nếu đang học hoặc đã hoàn thành, trả lại audit log hiện có
    const existing = await enrollmentModel.findByCourse(client, learner.id, courseId);
    if (existing) {
      if (existing.status === "active" || existing.status === "completed") {
        return { enrollment: existing, created: false, reactivated: false };
      }
      if (existing.status !== "withdrawn") {
        throw createError(409, "Enrollment cannot be reactivated from its current status");
      }
    }

    // 2. re-enroll chỉ được thực hiện với course có status = published
    const course = await enrollmentModel.lockCourse(client, courseId);
    if (!course) {
      throw createError(404, "Course not found");
    }
    if (course.status !== "published") {
      throw createError(409, "Course must be published");
    }

    // 3. phải hoàn thành các khóa tiên quyết trước
    const missing = await enrollmentModel.findMissingPrerequisites(client, learner.id, courseId);
    if (missing.length > 0) {
      throw createError(409, "Complete all prerequisite courses before enrolling");
    }

    // 4. đã từng rút khỏi khóa: kích hoạt bản audit log cũ để giữ tiến độ
    if (existing) {
      const enrollment = await enrollmentModel.reactivateEnrollment(client, existing.id);
      await enrollmentModel.createAudit(client, learner, "reenroll_course", existing, enrollment);
      return { enrollment, created: false, reactivated: true };
    }

    // 5. chưa từng đăng ký: tạo mới và ghi lịch sử thao tác
    const enrollment = await enrollmentModel.createEnrollment(client, learner.id, courseId);
    await enrollmentModel.createAudit(
      client, learner, "enroll_course", existing, enrollment
    );
    return { enrollment, created: true, reactivated: false };
  });
}

async function list(query, user) {
  const filters = validateList(query);
  const rows = await enrollmentModel.listByLearner(user.id, filters);

  const hasMore = rows.length > filters.limit;
  const enrollments = rows.slice(0, filters.limit);

  return {
    data: enrollments,
    pagination: {
      limit: filters.limit,
      offset: filters.offset,
      has_more: hasMore
    }
  };
}

async function getById(id, user) {
  const enrollmentId = positiveId(id, "enrollment_id");
  const enrollment = await enrollmentModel.findOwnedById(enrollmentId, user.id);
  if (!enrollment) {
    throw createError(404, "Enrollment not found");
  }
  return enrollment;
}

async function withdraw(id, user) {
  const enrollmentId = positiveId(id, "enrollment_id");

  return enrollmentModel.withTransaction(async (client) => {
    const learner = await getActiveLearner(client, user.id);
    const existing = await enrollmentModel.lockOwnedEnrollment(client, enrollmentId, learner.id);
    if (!existing) {
      throw createError(404, "Enrollment not found");
    }

    if (existing.status === "withdrawn") {
      return existing;
    }
    if (existing.status !== "active") {
      throw createError(409, "Only active enrollments can be withdrawn");
    }

    const enrollment = await enrollmentModel.withdrawEnrollment(client, enrollmentId);
    await enrollmentModel.createAudit(client, learner, "withdraw_course", existing, enrollment);
    return enrollment;
  });
}

async function resume(id, body, user) {
  const enrollmentId = positiveId(id, "enrollment_id");
  const data = validateResume(body);
  const lessonId = data.lesson_id;

  return enrollmentModel.withTransaction(async (client) => {
    const learner = await getActiveLearner(client, user.id);

    // 1. enrollment phải thuộc người gọi và vẫn đang học
    const existing = await enrollmentModel.lockOwnedEnrollment(client, enrollmentId, learner.id);
    if (!existing) {
      throw createError(404, "Enrollment not found");
    }
    if (existing.status !== "active") {
      throw createError(409, "Only active enrollments can update the resume lesson");
    }

    // 2. course phải published; bài cũng phải published và thuộc đúng khóa
    const course = await enrollmentModel.lockCourse(client, existing.course_id);
    if (!course) {
      throw createError(404, "Course not found");
    }
    if (course.status !== "published") {
      throw createError(409, "Course must be published");
    }
    const lesson = await enrollmentModel.findPublishedLesson(client, lessonId, existing.course_id);
    if (!lesson) {
      throw createError(404, "Published lesson not found in this course");
    }

    // 3. chỉ lưu bài tiếp tục, không đánh dấu bài đã hoàn thành
    const enrollment = await enrollmentModel.updateResume(client, enrollmentId, lessonId);
    await enrollmentModel.createAudit(client, learner, "update_enrollment_resume", existing, enrollment);
    return enrollment;
  });
}

module.exports = { enroll, list, getById, withdraw, resume };
