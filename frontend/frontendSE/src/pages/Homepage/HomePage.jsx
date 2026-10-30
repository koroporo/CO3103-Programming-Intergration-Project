
import { useEffect, useState } from "react";
import CourseCard from "../../components/Homepage/CourseCard";
import "./HomePage.css";
import { Link, useNavigate } from "react-router-dom";
import CourseFilter from "../../components/Homepage/CourseFilter";

export default function HomePage() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [featuredCourse, setFeaturedCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  function handleFilterChange(name, value) {
    const params = new URLSearchParams();
    if (value) params.set(name, value);
    navigate(`/courses?${params.toString()}`);
  }

  useEffect(() => {
    async function fetchCourses() {
      try {
        const response = await fetch("/api/courses");

        if (!response.ok) {
          throw new Error("Failed to fetch courses");
        }

        const data = await response.json();
        const courseList = Array.isArray(data) ? data : data.courses;

        if (!Array.isArray(courseList)) {
          throw new Error(
            "The courses response has an unexpected format."
          );
        }

        setCourses(courseList);
        setFeaturedCourse(courseList.find((c) => c.is_featured) ?? courseList[0] ?? null);
      } catch (err) {
        setError(err.message || "Something went wrong");
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  if (loading) {
    return <p>Loading courses...</p>;
  }

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
          href={`/courses/${featuredCourse.id}`}
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
      
      <section aria-label="Filter courses">
        <CourseFilter skill="" band="" onChange={handleFilterChange} />
      </section>

      <section className="course-grid" aria-label="IELTS courses">
        {courses.map((course) => (
          <Link
            key={course.id}
            to={`/courses/${course.id}`}
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
