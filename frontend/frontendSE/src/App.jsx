import ProfileButton from "./components/Profile/ProfileButton"
import { BrowserRouter } from "react-router-dom";
import AppRoutes from "./routes"


function App() {

  return (
    <BrowserRouter>
      <ProfileButton></ProfileButton>
      <AppRoutes></AppRoutes>
    </BrowserRouter>
    
  );
}
export default App
