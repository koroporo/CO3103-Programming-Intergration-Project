import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import CourseCard from '../../components/Homepage/CourseCard';
import { getCourses } from '../../services/courseService';
import './HomePage.css';

const SKILLS = ['listening', 'reading', 'writing', 'speaking'];
const LEVELS = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2'];
function capitalize(text) {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function SearchResultsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const skill = searchParams.get('skill') ?? '';
  const level = skill ? (searchParams.get('level') ?? '') : '';
  const [courses, setCourses] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');

    getCourses({ search, skill, level, signal: controller.signal })
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
  }, [search, skill, level]);
  function updateFilter(name, value) {
    const next = new URLSearchParams(searchParams);
    if (value) {
      next.set(name, value);
    } else {
      next.delete(name);
    }
    if (name === 'skill' && !value) {
      next.delete('level');
    }

    setSearchParams(next);
  }

  return (
    <div className="home-page">
      <h1>{search ? `Results for "${search}"` : 'All courses'}</h1>
      <div>
        <select
          aria-label="Filter by skill"
          value={skill}
          onChange={(event) => updateFilter('skill', event.target.value)}
        >
          <option value="">All skills</option>
          {SKILLS.map((item) => (
            <option key={item} value={item}>
              {capitalize(item)}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by level"
          value={level}
          disabled={!skill}
          onChange={(event) => updateFilter('level', event.target.value)}
        >
          <option value="">All levels</option>
          {LEVELS.map((item) => (
            <option key={item} value={item}>
              {item.toUpperCase()}
            </option>
          ))}
        </select>
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
    </div>
  );
}