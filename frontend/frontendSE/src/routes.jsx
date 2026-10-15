import { Routes, Route } from "react-router-dom";

import MyAccount from "./pages/ProfilePage/MyAccount";
import History from "./pages/ProfilePage/History";
import Notifications from "./pages/ProfilePage/Notifications";
import AdminBoard from "./pages/ProfilePage/AdminBoard";
import ApplyInstructor from "./pages/ProfilePage/ApplyInstructor";
import InstructorStudio from "./pages/Instructor/InstructorStudio";
import QuizManager from "./pages/Instructor/QuizManager";
import Dashboard from "./pages/Instructor/Dashboard";
import Course_1 from "./pages/Courses/Course_1";
import Course_2 from "./pages/Courses/Course_2";
import Course_3 from "./pages/Courses/Course_3";
import QuizBuilder from "./pages/Quizzes/QuizBuilder";
export default function AppRoutes() {
    return (
            <Routes>
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/admin-board" element={<AdminBoard></AdminBoard>}/>
                <Route path="/apply-instructor" element={<ApplyInstructor></ApplyInstructor>}></Route>
                <Route path="/instructor-studio" element={<InstructorStudio></InstructorStudio>}></Route>
                <Route path="/quiz-manager" element={<QuizManager></QuizManager>}></Route>
                <Route path="/dashboard" element={<Dashboard></Dashboard>}></Route>
                <Route path="/course-1" element={<Course_1/>} />
                <Route path="/course-2" element={<Course_2/>} />
                <Route path="/course-3" element={<Course_3/>} />
                <Route path="/quiz-builder" element={<QuizBuilder></QuizBuilder>}></Route>
            </Routes>
    );
}