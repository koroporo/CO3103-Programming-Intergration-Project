import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/Homepage/CourseCard';
import { getCourses } from '../../services/courseService';
import CourseFilter from '../../components/Homepage/CourseFilter';
import './HomePage.css';

const PAGE_SIZE = 6;

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const skill = searchParams.get('skill') ?? '';
  const band = skill ? (searchParams.get('band') ?? '') : '';
  const page = Math.max(1, parseInt(searchParams.get('page'), 10) || 1);
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getCourses({ search, skill, band, page, limit: PAGE_SIZE, signal: controller.signal })
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
  }, [search, skill, band, page]);
  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    if (name === 'skill' && !value) {
      next.delete('band');
    }
    next.delete('page');
    setSearchParams(next);
  }
  function goToPage(newPage) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(newPage));
    setSearchParams(next);
    window.scrollTo(0, 0);
  }
  const totalPages = Math.ceil(total / PAGE_SIZE);
  return (
    <div className="home-page">
      <h1>{search ? `Results for "${search}"` : 'All courses'}</h1>
      <div>
        <CourseFilter skill={skill} band={band} onChange={updateFilter} />
      </div>
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
      {total > PAGE_SIZE && (
        <nav aria-label="Course pages">
          <button
            type="button"
            disabled={page <= 1 || loading}
            onClick={() => goToPage(page - 1)}
          >
            Previous
          </button>
          <span>
            {' '}Page {page} of {totalPages}{' '}
          </span>
          <button
            type="button"
            disabled={page >= totalPages || loading}
            onClick={() => goToPage(page + 1)}
          >
            Next
          </button>
        </nav>
      )}
    </div>
  );
}