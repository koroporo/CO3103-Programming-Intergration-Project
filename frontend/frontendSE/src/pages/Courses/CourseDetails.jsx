import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function CourseDetail() {
  const { id } = useParams();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchCourse() {
      try {
        const response = await fetch(
          `http://localhost:3000/api/courses/details/${id}`
        );

        if (!response.ok) {
          throw new Error("Failed to load course");
        }

        const data = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourse();
  }, [id]);

  if (loading) return <p>Loading course...</p>;
  if (error) return <p>{error}</p>;
  if (!course) return <p>Course not found.</p>;

  return (
    <div className="course-detail">
      <img src={course.thumbnail_url} alt="" />
      <h1>{course.title}</h1>
      <p>{course.description}</p>
      <p>Instructor: {course.instructor}</p>
    </div>
  );
}