import './CoursePage.css';

export default function CoursePage({ course }) {
  return (
    <div className="course-page">
      <a className="course-page__back" href="/">
        <span aria-hidden="true">←</span> Back to courses
      </a>
      <article className="course-detail">
        <img className="course-detail__image" src={course.thumbnail} alt="" />
        <div className="course-detail__content">
          <p className="course-detail__eyebrow">IELTS course</p>
          <h1>{course.title}</h1>
          <div className="course-detail__instructor">
            <img src="/course-assets/instructor-avatar.svg" alt="" />
            <span>{course.instructor}</span>
          </div>
          <p className="course-detail__description">{course.description}</p>
          <a className="course-detail__catalog-link" href="/">
            Explore more courses
          </a>
        </div>
      </article>
    </div>
  );
}
