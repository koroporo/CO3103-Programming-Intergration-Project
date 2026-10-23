import { useParams } from "react-router-dom";
import { featuredCourse, courses } from "../../data/courses"; 
import { useState } from "react";
import './Course.css';
import CourseReviews from "./CourseReviews";
import CourseSyllabus from "./CourseSyllabus";
import CourseMaterials from "./CourseMaterials";
import EnrollButton from "../../components/CoursePage/EnrollButton";

export default function Course() {
  const { courseId } = useParams();
  const course = courses.find((c) => c.id === courseId) || (featuredCourse && featuredCourse.id === courseId ? featuredCourse : null);
  const [activeTab, setActiveTab] = useState('syllabus'); 

  if (!course) {
    return (
      <div className="course-page">
        <a className="course-page__back" href="/">
          <span aria-hidden="true">←</span> Back to courses
        </a>
        <p className="course-page__not-found">Course not found.</p>
      </div>
    );
  }

  return (
    <div className="course-page">
      <a className="course-page__back" href="/">
        <span aria-hidden="true">←</span> Back to courses
      </a>
      
      <article className="course-detail">
        <img className="course-detail__image" src={course.thumbnail} alt={course.title} />
        
        <div className="course-detail__content">
          <h1>{course.title}</h1>

          <div className="course-detail__meta-badges">
            {course.enrollmentCount && (
              <span className="course-detail__tag">
                Enrolled by {course.enrollmentCount}+
              </span>
            )}
            {course.tags && course.tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="course-detail__tag">{tag}</span>
            ))}
            {(course.rate || course.rating) && (
              <span className="course-detail__tag course-detail__tag--rating">
                <span className="course-detail__tag-star" aria-hidden="true">★</span>
                {course.rate || course.rating} ({course.reviews?.length ?? 0})
              </span>
            )}
          </div>

          <div className="course-detail__instructor">
            <img src={`/${course.instructorThumbnail?.replace(/^\//, '') || 'icons.svg'}`} alt="" />
            <span>{course.instructor}</span>
          </div>

          <p className="course-detail__description">{course.description}</p>
          
          <div className="course-detail__meta-info">
            {course.duration && (
              <span className="course-detail__duration">Duration: {course.duration}</span>
            )}
            {course.level && (
              <span className="course-detail__level">Level: {course.level}</span>
            )}
          </div>

          <div className="enroll-button-container">
            <EnrollButton />
          </div>
        </div>
      </article>

      {course.prerequisites && (
        <article className="course-detail__prerequisite-section">
          <h2 className="course-detail__prerequisite">Prerequisite:</h2>
          <p>{course.prerequisites}</p>
        </article>
      )}

      <nav className="course-tabs-nav" aria-label="Course section navigation">
        <button 
          onClick={() => setActiveTab('syllabus')} 
          className={activeTab === 'syllabus' ? 'active' : ''}
        >
          Syllabus
        </button>
        <button 
          onClick={() => setActiveTab('materials')} 
          className={activeTab === 'materials' ? 'active' : ''}
        >
          Materials/Links
        </button>
        <button 
          onClick={() => setActiveTab('reviews')} 
          className={activeTab === 'reviews' ? 'active' : ''}
        >
          Reviews
        </button>
      </nav>

      {activeTab === 'syllabus' && <CourseSyllabus courseId={course.id} />}
      {activeTab === 'materials' && <CourseMaterials materials={course.materials ?? []} />}
      {activeTab === 'reviews' && <CourseReviews reviews={course.reviews ?? []} />}
    </div>
  );
}
