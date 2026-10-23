import { useNavigate } from 'react-router-dom';
import CourseCard from '../../components/Homepage/CourseCard';
import CourseFilter from '../../components/Homepage/CourseFilter';
import { courses, featuredCourse } from '../../data/courses';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

function handleFilterChange(name, value) {
  const params = new URLSearchParams();
  if (value) params.set(name, value);
  navigate(`/courses?${params.toString()}`);
}
  return (
    <div className="home-page">
      <a
        className="featured-course"
        href={`/courses/${featuredCourse.id}`}
        aria-label={`View course: ${featuredCourse.title}`}
      >
        <img
          className="featured-course__image"
          src={featuredCourse.thumbnail}
          alt=""
        />
        <div className="featured-course__details">
          <h1>{featuredCourse.title}</h1>
          <div className="featured-course__instructor">
            <img src="/course-assets/instructor-avatar.svg" alt="" />
            <span>{featuredCourse.instructor}</span>
          </div>
        </div>
      </a>
      <section aria-label="Filter courses">
        <CourseFilter skill="" band="" onChange={handleFilterChange} />
      </section>

      <section className="course-grid" aria-label="IELTS courses">
        {courses.map((course) => (
          <CourseCard key={course.id} {...course} />
        ))}
      </section>
    </div>
  );
}
