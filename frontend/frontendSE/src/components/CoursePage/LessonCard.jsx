import './LessonCard.css';
import { Link } from 'react-router-dom';

export default function LessonCard({ to, title, duration, description, image }) {
  return (
    <Link to={to} className="lesson-card">
      <div className="lesson-card__image">
        <img src={image} alt="" />
        <span className="lesson-card__duration">{duration}</span>
      </div>
      <div className="lesson-card__content">
        <h3>{title}</h3>
        <p>{description}</p>
      </div>
    </Link>
  );
}