
import { useAuth } from "../../hooks/Authentication/useAuth";
import LoginButton from "./LoginButton";
import ProfileButton from "../Profile/ProfileButton";
import SearchBar from "./SearchBar";
import "./Header.css";

export default function Header() {
  const { isLoggedIn, isAuthLoading } = useAuth();

  return (
    <header className="site-header">
      <a
        href="/"
        className="site-header__brand"
        aria-label="IELTS Trainer home"
      >
        ieltstrainer
      </a>

      <SearchBar />

      <div className="site-header__actions">
        {isAuthLoading ? null : isLoggedIn ? (
          <ProfileButton />
        ) : (
          <LoginButton />
        )}
      </div>
    </header>
  );
}
