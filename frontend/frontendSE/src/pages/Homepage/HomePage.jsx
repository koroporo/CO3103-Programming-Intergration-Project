import { useEffect, useState } from "react";
import CourseCard from "../../components/Homepage/CourseCard";
import "./HomePage.css";
import { Link } from "react-router-dom";

export default function HomePage() {
  const [courses, setCourses] = useState([]);
  const [featuredCourse, setFeaturedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("http://localhost:3000/courses");

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        const courseList = Array.isArray(data) ? data : data.courses;

        if (!Array.isArray(courseList)) {
          throw new Error("The courses response has an unexpected format.");
        }

        setCourses(courseList);
        setFeaturedCourse(courseList[0] ?? null);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) return <p>Loading courses...</p>;
  if (error) {
    return (
      <main className="home-page">
        <h1>Welcome to IELTS Trainer</h1>
        <p>Courses are temporarily unavailable. Please try again shortly.</p>
        <p className="home-page__error">{error}</p>
      </main>
    );
  }

  return (
    <div className="home-page">
      {featuredCourse && (
        <a
          className="featured-course"
          href={`/courses/details/${featuredCourse.id}`}
          aria-label={`View course: ${featuredCourse.title}`}
        >
          <img
            className="featured-course__image"
            src={featuredCourse.thumbnail_url}
            alt=""
          />

          <div className="featured-course__details">
            <h1>{featuredCourse.title}</h1>

            <div className="featured-course__instructor">
              <img src="/course-assets/instructor-avatar.svg" alt="" />
              <span>
                {featuredCourse.instructor ?? featuredCourse.instructor_id}
              </span>
            </div>
          </div>
        </a>
      )}

      <section className="course-grid" aria-label="IELTS courses">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/details/${course.id}`}
            className="course-card-link"
            aria-label={`View course: ${course.title}`}
          >
            <CourseCard
              id={course.id}
              thumbnail={course.thumbnail_url}
              title={course.title}
              instructor={course.instructor ?? course.instructor_id}
            />
          </Link>
        ))}
      </section>
      {courses.length === 0 && (
        <p>No courses are available yet. Please check back soon.</p>
      )}
    </div>
  );
}
