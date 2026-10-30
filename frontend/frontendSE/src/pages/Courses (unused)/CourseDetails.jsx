import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import "./CoursePage.css";

export default function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


useEffect(() => {
  async function fetchCourse() {
    if (!id) {
      setError("Course ID is missing.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(
        `/api/courses/details/${id}`
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
}, [id]);


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
        <p>Course not found.</p>
        <Link className="course-detail__catalog-link" to="/">
          Explore more courses
        </Link>
      </div>
    );
  }

  const thumbnail =
    course.thumbnail_url || course.thumbnail || "";

  const instructorName =
    typeof course.instructor === "string"
      ? course.instructor
      : course.instructor?.name || "Not specified";

  return (
    <div className="course-page">
      <Link className="course-page__back" to="/">
        <span aria-hidden="true">←</span> Back to courses
      </Link>

      <article className="course-detail">
        <div className="course-detail__media">
          {thumbnail ? (
            <img
              className="course-detail__image"
              src={thumbnail}
              alt={`${course.title || "Course"} thumbnail`}
            />
          ) : (
            <div className="course-detail__image course-detail__image--empty">
              Course image unavailable
            </div>
          )}
        </div>

        <div className="course-detail__content">
          <p className="course-detail__eyebrow">
            {course.category || course.level || "English course"}
          </p>

          <h1>{course.title || "Untitled course"}</h1>

          <div className="course-detail__instructor">
            <img
              src="/course-assets/instructor-avatar.svg"
              alt=""
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
            <span>Instructor: {instructorName}</span>
          </div>

          <p className="course-detail__description">
            {course.description || "No description available yet."}
          </p>

          {course.level && (
            <p className="course-detail__meta">
              <strong>Level:</strong> {course.level}
            </p>
          )}

          {course.duration && (
            <p className="course-detail__meta">
              <strong>Duration:</strong> {course.duration}
            </p>
          )}

          {course.price != null && (
            <p className="course-detail__meta">
              <strong>Price:</strong> {course.price}
            </p>
          )}

          <Link
            className="course-detail__catalog-link"
            to="/"
          >
            Explore more courses
          </Link>
        </div>
      </article>
    </div>
  );
}
