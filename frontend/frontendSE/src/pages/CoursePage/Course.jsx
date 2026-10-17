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
        <img className="course-detail__image" src={course.thumbnail} alt="" />
        <div className="course-detail__content">
          <h1>{course.title}</h1>
          <div className="course-detail__instructor">
            <img src={course.instructorThumbnail} alt="" />
            <span>{course.instructor}</span>
          </div>
          <p className="course-detail__description">{course.description}</p>
          <span className="course-detail__duration">Duration: {course.duration}</span>

          <div>
                <span className="course-detail__level">Level: {course.level}</span>
                <span className="course-detail__rating">Rating: {course.rating}</span>
                <span className="course-detail__reviews-count">({course.reviews?.length ?? 0} reviews)</span>
          </div>
          <div className="enroll-button-container">
                <EnrollButton />
          </div>
          
        </div>

      </article>
      <article>
        <h2 class="course-detail__prerequisite">Prerequisite:</h2>
        <p>{course.prerequisite}</p>
      </article>

      <nav>
        <button onClick={() => setActiveTab('reviews')} className={activeTab === 'reviews' ? 'active' : ''}>Reviews</button>
        <button onClick={() => setActiveTab('syllabus')} className={activeTab === 'syllabus' ? 'active' : ''}>Syllabus</button>
        <button onClick={() => setActiveTab('materials')} className={activeTab === 'materials' ? 'active' : ''}>Materials</button>
      </nav>

      {activeTab === 'reviews' && <CourseReviews reviews={course.reviews ?? []} />}
      {activeTab === 'syllabus' && <CourseSyllabus courseId={course.id} />}
      {activeTab === 'materials' && <CourseMaterials materials={course.materials ?? []} />}

    </div>
  );
} 
   