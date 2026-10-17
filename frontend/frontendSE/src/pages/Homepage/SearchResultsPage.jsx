import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/Homepage/CourseCard';
import { getCourses } from '../../services/courseService';
import './HomePage.css';

export default function SearchResultsPage() {
  const [searchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';

  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();

    getCourses({ search, signal: controller.signal })
      .then((result) => {
        setCourses(result.courses);
        setTotal(result.total);
      })
      .catch((requestError) => {
        if (requestError.name !== 'AbortError') setError(requestError.message);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [search]);

  return (
    <div className="home-page">
      <h1>{search ? `Results for "${search}"` : 'All courses'}</h1>
      {!loading && !error && <p>{total} courses</p>}

      {loading && <p>Loading courses...</p>}
      {error && <p role="alert">{error}</p>}
      {!loading && !error && courses.length === 0 && (
        <p>No courses found.</p>
      )}

      <section className="course-grid" aria-label="Search results">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            id={course.slug}
            thumbnail={course.thumbnail_url}
            title={course.title}
            instructor={course.instructor_name}
          />
        ))}
      </section>
    </div>
  );
}