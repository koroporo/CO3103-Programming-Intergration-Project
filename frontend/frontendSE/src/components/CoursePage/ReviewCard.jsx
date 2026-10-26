import SvgIcon from '../Common/SvgIcon';
import './ReviewCard.css';

export default function ReviewCard({ reviewer, rating = 5, comment, time }) {
  const initial = reviewer ? reviewer.charAt(0).toUpperCase() : '?';
  const starCount = Math.max(1, Math.min(5, Math.round(rating)));

  return (
    <div className="review-card">
      <div className="review-card__header">
        <div className="review-card__avatar">{initial}</div>
        <div className="review-card__user-info">
          <span className="review-card__reviewer">{reviewer}</span>
          <div className="review-card__meta">
            <span className="review-card__stars" aria-label={`${starCount} out of 5 stars`}>
              {Array.from({ length: starCount }).map((_, i) => (
                <SvgIcon key={i} name="star" size={14} color="#ff9500" style={{ marginRight: 2 }} />
              ))}
            </span>
            {time && <span>· {time}</span>}
          </div>
        </div>
      </div>
      <p className="review-card__comment">{comment}</p>
    </div>
  );
}
