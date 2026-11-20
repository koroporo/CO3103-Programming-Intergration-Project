import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../hooks/Authentication/useAuth";
import { discussionPath, forumRequest } from "../../services/discussionService";
import "./DiscussionForum.css";

function PostForm({ label, initialValue = "", onSubmit, onCancel }) {
  const [content, setContent] = useState(initialValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event) {
    event.preventDefault();
    if (busy || !content.trim()) return;
    setBusy(true);
    setError("");
    try {
      await onSubmit(content.trim());
      setContent("");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="discussion-form" onSubmit={submit}>
    <label>
      {label}
      <textarea value={content} onChange={(event) => setContent(event.target.value)}
        rows={4} maxLength={10000} required disabled={busy}
        placeholder="Share a question or an idea about this lesson…" />
    </label>
    <div className="discussion-actions">
      <button type="submit" disabled={busy || !content.trim()}>{busy ? "Posting…" : label}</button>
      {onCancel && <button type="button" onClick={onCancel} disabled={busy}>Cancel</button>}
      <small>{content.length}/10000</small>
    </div>
    {error && <p role="alert" className="discussion-error">{error}</p>}
  </form>;
}

function Post({ post, user, canModerate, onChange, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const owns = String(user?.id) === String(post.author_id);

  async function mutate(action) {
    setBusy(true);
    setError("");
    try { await action(); } catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }

  return <article className="discussion-post" id={`discussion-${post.id}`}>
    <header>
      <strong>{post.author_name}</strong>
      {post.author_role === "instructor" && <span className="discussion-badge">Instructor</span>}
      <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleString()}</time>
      {post.is_pinned && <span className="discussion-badge">Pinned</span>}
      {post.is_resolved && <span className="discussion-badge">Resolved</span>}
    </header>
    {editing ? <PostForm label="Save changes" initialValue={post.content}
      onCancel={() => setEditing(false)} onSubmit={async (content) => {
        await onChange(post.id, { content });
        setEditing(false);
      }} /> : <p className="discussion-content">{post.content}</p>}
    <div className="discussion-actions">
      {owns && !editing && <button disabled={busy} onClick={() => setEditing(true)}>Edit</button>}
      {(owns || canModerate) && <button disabled={busy} onClick={() => {
        if (window.confirm(post.parent_id ? "Delete this reply?" : "Delete this discussion and its replies?")) {
          mutate(() => onDelete(post));
        }
      }}>Delete</button>}
      {!post.parent_id && (owns || canModerate) && <button disabled={busy}
        onClick={() => mutate(() => onChange(post.id, { is_resolved: !post.is_resolved }))}>
        {post.is_resolved ? "Reopen" : "Mark resolved"}
      </button>}
      {!post.parent_id && canModerate && <button disabled={busy}
        onClick={() => mutate(() => onChange(post.id, { is_pinned: !post.is_pinned }))}>
        {post.is_pinned ? "Unpin" : "Pin"}
      </button>}
    </div>
    {error && <p role="alert" className="discussion-error">{error}</p>}
  </article>;
}

function Thread({ lessonId, threadId, user, canModerate, onBack, onUpdate }) {
  const [thread, setThread] = useState(null);
  const [replies, setReplies] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const [topic, replyPage] = await Promise.all([
          forumRequest(discussionPath(lessonId, `/${threadId}`), { signal: controller.signal }),
          forumRequest(discussionPath(lessonId, `/${threadId}/replies?limit=20&offset=${offset}`), { signal: controller.signal }),
        ]);
        if (controller.signal.aborted) return;
        setThread(topic.data);
        setReplies(replyPage.data);
        setHasMore(replyPage.pagination.has_more);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [lessonId, threadId, offset, revision]);

  function refresh() { setRevision((value) => value + 1); onUpdate(); }
  async function change(id, patch) {
    const result = await forumRequest(discussionPath(lessonId, `/${id}`), {
      method: "PATCH", body: JSON.stringify(patch),
    });
    if (String(id) === String(threadId)) setThread(result.data);
    else setReplies((items) => items.map((item) => item.id === id ? result.data : item));
    onUpdate();
  }
  async function remove(post) {
    await forumRequest(discussionPath(lessonId, `/${post.id}`), { method: "DELETE" });
    if (!post.parent_id) { onUpdate(); onBack(); }
    else { setOffset(0); refresh(); }
  }

  return <div className="discussion-thread">
    <button type="button" onClick={onBack}>← All discussions</button>
    {loading && <p role="status">Loading discussion…</p>}
    {error && <p role="alert" className="discussion-error">{error}
      <button onClick={() => setRevision((value) => value + 1)}>Try again</button>
    </p>}
    {!loading && !error && thread && <>
      <Post post={thread} user={user} canModerate={canModerate} onChange={change} onDelete={remove} />
      <h3>Replies</h3>
      {replies.length === 0 && <p>No replies on this page yet.</p>}
      <div className="discussion-replies">
        {replies.map((reply) => <Post key={reply.id} post={reply} user={user}
          canModerate={canModerate} onChange={change} onDelete={remove} />)}
      </div>
      <div className="discussion-pagination">
        <button disabled={offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 20))}>Previous replies</button>
        <span>Page {offset / 20 + 1}</span>
        <button disabled={!hasMore} onClick={() => setOffset((value) => value + 20)}>Next replies</button>
      </div>
      <PostForm label="Post reply" onSubmit={async (content) => {
        await forumRequest(discussionPath(lessonId, `/${threadId}/replies`), {
          method: "POST", body: JSON.stringify({ content }),
        });
        setOffset(0);
        refresh();
      }} />
    </>}
  </div>;
}

export default function DiscussionForum({ lessonId }) {
  const { user, isAuthLoading } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const threadId = searchParams.get("discussion");
  const [topics, setTopics] = useState([]);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(false);
  const [canModerate, setCanModerate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    if (!user) return;
    const controller = new AbortController();
    async function load() {
      setLoading(true);
      setError("");
      try {
        const result = await forumRequest(discussionPath(lessonId, `?limit=20&offset=${offset}`), { signal: controller.signal });
        if (controller.signal.aborted) return;
        setTopics(result.data);
        setHasMore(result.pagination.has_more);
        setCanModerate(result.permissions.can_moderate);
      } catch (err) {
        if (err.name !== "AbortError") setError(err.message);
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, [lessonId, user, offset, revision]);

  function select(id) {
    setSearchParams((previous) => {
      const next = new URLSearchParams(previous);
      if (id) next.set("discussion", id); else next.delete("discussion");
      return next;
    }, { preventScrollReset: true });
  }
  function refresh() { setRevision((value) => value + 1); }

  return <section id="lesson-discussions" className="discussion-forum" aria-labelledby="discussion-heading">
    <div className="discussion-heading">
      <div><h2 id="discussion-heading">Lesson discussions</h2><p>Ask questions, share ideas, and learn together.</p></div>
      {user && <button type="button" onClick={refresh} disabled={loading}>Refresh</button>}
    </div>
    {isAuthLoading ? <p role="status">Loading your session…</p> : !user ? <p><Link to="/login-page">Log in</Link> to join the discussion.</p> : <>
      {loading && <p role="status">Loading discussions…</p>}
      {error && <p role="alert" className="discussion-error">{error}</p>}
      {!error && (threadId ? <Thread key={`${lessonId}:${threadId}:${user.id}`} lessonId={lessonId}
        threadId={threadId} user={user} canModerate={canModerate} onBack={() => select(null)} onUpdate={refresh} /> : <>
        <PostForm label="Start discussion" onSubmit={async (content) => {
          const result = await forumRequest(discussionPath(lessonId), { method: "POST", body: JSON.stringify({ content }) });
          setOffset(0);
          refresh();
          select(result.data.id);
        }} />
        {!loading && topics.length === 0 && <p>No discussions yet. Start the first one!</p>}
        <div className="discussion-topics">
          {topics.map((topic) => <button className="discussion-topic" key={topic.id} onClick={() => select(topic.id)}>
            <span className="discussion-topic-meta"><strong>{topic.author_name}</strong>
              <time dateTime={topic.created_at}>{new Date(topic.created_at).toLocaleString()}</time>
              {topic.is_pinned && <span className="discussion-badge">Pinned</span>}
              {topic.is_resolved && <span className="discussion-badge">Resolved</span>}
            </span>
            <span className="discussion-preview">{topic.content}</span>
            <span>{topic.reply_count} {topic.reply_count === 1 ? "reply" : "replies"} · Open discussion →</span>
          </button>)}
        </div>
        <div className="discussion-pagination">
          <button disabled={loading || offset === 0} onClick={() => setOffset((value) => Math.max(0, value - 20))}>Previous</button>
          <span>Page {offset / 20 + 1}</span>
          <button disabled={loading || !hasMore} onClick={() => setOffset((value) => value + 20)}>Next</button>
        </div>
      </>)}
    </>}
  </section>;
}
