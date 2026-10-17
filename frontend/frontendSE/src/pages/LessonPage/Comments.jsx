export default function Comments({ comments }) {
    const items = Array.isArray(comments) ? comments : [];
    return (
    <div className="lesson-comments">
      {items.length === 0 && <p>No comments yet.</p>}
      {items.map((comment, index) => (
        <div key={index} className="lesson-comments__item">
          <strong>{comment.commenter}</strong>
          <p>{comment.comment}</p>
          <p>{comment.time}</p>
        </div>
      ))}
    </div>
  );
}