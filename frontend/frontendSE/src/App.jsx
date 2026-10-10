// import { getCourseById } from './data/courses';
import './components/Homepage/Header.css';
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes"
import { AuthProvider } from './contexts/Authentication/AuthContexts';


function App() {
  // const [collection, courseId] = window.location.pathname.split('/').filter(Boolean);
  // const course = collection === 'courses' ? getCourseById(courseId) : null;

  return (
    <>
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes></AppRoutes>
        </AuthProvider>
      </BrowserRouter>
    </>

  );
}

export default App;
