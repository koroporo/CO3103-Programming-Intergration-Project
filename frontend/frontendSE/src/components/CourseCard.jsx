import './CourseCard.css';

export default function CourseCard({ id, thumbnail, title, instructor }) {
  return (
    <a className="course-card" href={`/courses/${id}`}>
      <img className="course-card__thumbnail" src={thumbnail} alt="" />
      <h2 className="course-card__title">{title}</h2>
      <div className="course-card__instructor">
        <img className="course-avatar" src="/course-assets/instructor-avatar.svg" alt="" />
        <span>{instructor}</span>
      </div>
    </a>
  );
}
