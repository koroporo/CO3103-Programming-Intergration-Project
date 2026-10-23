import './ReviewCard.css';

export default function ReviewCard({ reviewer, rating, comment, time }) {
  const initial = reviewer ? reviewer.charAt(0).toUpperCase() : '?';

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">{initial}</div>
        <div className="review-card__user-info">
          <span className="review-card__reviewer">{reviewer}</span>
          <div className="review-card__meta">
            <span className="review-card__stars">{"★".repeat(Math.round(rating || 5))}</span>
            {time && <span>· {time}</span>}
          </div>
        </div>
      </div>
      <p className="review-card__comment">{comment}</p>
    </div>
  );
}
