import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import './Course.css';
import CourseReviews from "./CourseReviews";
import CourseSyllabus from "./CourseSyllabus";
import CourseMaterials from "./CourseMaterials";
import EnrollButton from "../../components/CoursePage/EnrollButton";

export default function Course() {
  const { courseId } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState('syllabus');

  useEffect(() => {
    async function fetchCourse() {
      if (!courseId) {
        setError("Course ID is missing.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `http://localhost:3000/courses/details/${courseId}`
        );

        if (!response.ok) {
          throw new Error(
            response.status === 404
              ? "Course not found."
              : "Failed to load course."
          );
        }

        const data = await response.json();
        setCourse(data.course ?? data);
      } catch (err) {
        setError(err.message || "Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <div className="course-page">
        <p>Loading course...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-page">
        <Link className="course-page__back" to="/">
          <span aria-hidden="true">←</span> Back to courses
        </Link>
        <p role="alert">{error}</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-page">
        <Link className="course-page__back" to="/">
          <span aria-hidden="true">←</span> Back to courses
        </Link>
        <p className="course-page__not-found">Course not found.</p>
      </div>
    );
  }

  const thumbnail = course.thumbnail_url || course.thumbnail || "";

  const instructorName =
    typeof course.instructor === "string"
      ? course.instructor
      : course.instructor?.name || "Not specified";

  const instructorThumbnail =
    course.instructorThumbnail ||
    course.instructor?.thumbnail ||
    "icons.svg";

  const tags = course.tags ?? [];

  const reviews = course.reviews ?? [];

  return (
    <div className="course-page">
      <Link className="course-page__back" to="/">
        <span aria-hidden="true">←</span> Back to courses
      </Link>

      <article className="course-detail">
        <img
          className="course-detail__image"
          src={thumbnail}
          alt={course.title || "Course"}
        />

        <div className="course-detail__content">
          <h1>{course.title || "Untitled course"}</h1>

          <div className="course-detail__meta-badges">
            {course.enrollmentCount && (
              <span className="course-detail__tag">
                Enrolled by {course.enrollmentCount}+
              </span>
            )}

            {tags.slice(0, 2).map((tag, idx) => (
              <span key={idx} className="course-detail__tag">
                {tag}
              </span>
            ))}

            {(course.rate || course.rating) && (
              <span className="course-detail__tag course-detail__tag--rating">
                <span className="course-detail__tag-star" aria-hidden="true">
                  ★
                </span>
                {course.rate || course.rating} ({reviews.length})
              </span>
            )}
          </div>

          <div className="course-detail__instructor">
            <img
              src={`/${instructorThumbnail.replace(/^\//, '')}`}
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <span>{instructorName}</span>
          </div>

          <p className="course-detail__description">
            {course.description || "No description available yet."}
          </p>

          <div className="course-detail__meta-info">
            {course.duration && (
              <span className="course-detail__duration">
                Duration: {course.duration}
              </span>
            )}

            {course.level && (
              <span className="course-detail__level">
                Level: {course.level}
              </span>
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

      {activeTab === 'materials' && (
        <CourseMaterials materials={course.materials ?? []} />
      )}

      {activeTab === 'reviews' && (
        <CourseReviews reviews={reviews} />
      )}
    </div>
  );
}