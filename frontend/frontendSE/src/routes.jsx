import { Routes, Route } from "react-router-dom";

import MyAccount from "./pages/ProfilePage/MyAccount";
import History from "./pages/ProfilePage/History";
import Notifications from "./pages/ProfilePage/Notifications";
import AdminBoard from "./pages/ProfilePage/AdminBoard";
import ApplyInstructor from "./pages/ProfilePage/ApplyInstructor";
import LoginPage from "./pages/Loginpage/Loginpage";
import Signuppage from "./pages/Loginpage/Signuppage";
import Header from "./components/Homepage/Header";
import HomePage from "./pages/Homepage/HomePage";
import CustomizePage from "./pages/Loginpage/Customizepage";
// import CourseDetail from "./pages/Courses (unused)/CourseDetails";
import SearchResultsPage from "./pages/Homepage/SearchResultsPage";
import ResetPasswordPage from "./pages/Loginpage/ResetPasswordPage";
import ForgotPassword from "./pages/Loginpage/ForgotPassword";
import MyCourses from "./pages/ProfilePage/MyCourses";
import Course from "./pages/CoursePage/Course";
import Lesson from "./pages/LessonPage/Lesson"; 

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/my-account" element={<MyAccount />} />
      <Route path="/history" element={<History />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/admin-board" element={<AdminBoard></AdminBoard>} />
      <Route
        path="/apply-instructor"
        element={<ApplyInstructor></ApplyInstructor>}
      ></Route>
      <Route path="/login-page" element={<LoginPage></LoginPage>}></Route>
      <Route path="/signup" element={<Signuppage></Signuppage>}></Route>
      <Route
        path="/courses"
        element={
          <>
            <Header></Header>
            <SearchResultsPage></SearchResultsPage>
          </>
        }
      ></Route>
      <Route
        path="/"
        element={
          <>
            <Header></Header>
            <HomePage></HomePage>
          </>
        }
      ></Route>
      
      <Route
        path="/customize"
        element={<CustomizePage></CustomizePage>}
      ></Route>
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/forgot-password" element={<ForgotPassword></ForgotPassword>}></Route>
      <Route path="/my-courses" element={<MyCourses></MyCourses>}></Route>
      {/* <Route
        path="/courses/details/:id"
        element={<CourseDetail></CourseDetail>}
      /> */}
      <Route path="/courses/:courseId" element={<><Header></Header><Course/></>}></Route>
      <Route path="/courses/:courseId/:lessonId" element={<><Header></Header><Lesson/></>}></Route>
    </Routes>
    
  );
}
