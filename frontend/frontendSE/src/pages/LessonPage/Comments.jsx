import './Comments.css';

export default function Comments({ comments }) {
  const items = Array.isArray(comments) ? comments : [];

  return (
    <div className="lesson-comments">
      {items.length === 0 ? (
        <p className="lesson-comments__empty">No comments yet. Be the first to start the discussion!</p>
      ) : (
        items.map((comment, index) => {
          const userName = comment.user || comment.commenter || 'Anonymous';
          const initial = userName.charAt(0).toUpperCase();

          return (
            <div key={index} className="lesson-comments__item">
              <div className="lesson-comments__avatar">{initial}</div>
              <div className="lesson-comments__body">
                <div className="lesson-comments__header">
                  <span className="lesson-comments__user">{userName}</span>
                  {comment.time && (
                    <span className="lesson-comments__time">{comment.time}</span>
                  )}
                </div>
                <p className="lesson-comments__text">{comment.comment}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
