import { Routes, Route } from "react-router-dom";

import MyAccount from "./pages/ProfilePage/MyAccount";
import History from "./pages/ProfilePage/History";
import Notifications from "./pages/ProfilePage/Notifications";
import AdminBoard from "./pages/ProfilePage/AdminBoard";

export default function AppRoutes() {
    return (
            <Routes>
                <Route path="/my-account" element={<MyAccount />} />
                <Route path="/history" element={<History />} />
                <Route path="/notifications" element={<Notifications />} />
                <Route path="/admin-board" element={<AdminBoard></AdminBoard>}/>
            </Routes>
    );
}