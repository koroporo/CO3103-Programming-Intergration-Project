import { Routes, Route } from "react-router-dom";

import MyAccount from "./pages/ProfilePage/MyAccount";
import History from "./pages/ProfilePage/History";
import Notifications from "./pages/ProfilePage/Notifications";
import AdminBoard from "./pages/ProfilePage/AdminBoard";
import ApplyInstructor from "./pages/ProfilePage/ApplyInstructor";
import LoginPage from "./pages/Loginpage/Loginpage";


export default function AppRoutes() {
    return (
            <Routes>
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/admin-board" element={<AdminBoard></AdminBoard>}/>
                <Route path="/apply-instructor" element={<ApplyInstructor></ApplyInstructor>}></Route>
                <Route path="/login-page" element={<LoginPage></LoginPage>}></Route>
            </Routes>
    );
}