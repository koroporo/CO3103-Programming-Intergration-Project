import CoursePage from './pages/CoursePage';
import Header from './components/Header';
import { getCourseById } from './data/courses';
import './components/Header.css';
import HomePage from './pages/HomePage';

function App() {
  const [collection, courseId] = window.location.pathname.split('/').filter(Boolean);
  const course = collection === 'courses' ? getCourseById(courseId) : null;

  return (
    <>
      <Header />
      <main>
        {course ? <CoursePage course={course} /> : <HomePage />}
      </main>
    </>
  );
}

export default App;
