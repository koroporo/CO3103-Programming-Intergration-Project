import { useAuth } from '../../hooks/useAuth';
import LoginButton from './LoginButton';
import NotificationBell from './NotificationBell';
import ProfileButton from '../Profile/ProfileButton';
import SearchBar from './SearchBar';
import './Header.css';

export default function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <header className="site-header">
      <a href="/" className="site-header__brand" aria-label="IELTS Trainer home">
        ieltstrainer
      </a>
      <SearchBar />
      <div className="site-header__actions">
        {isLoggedIn && <NotificationBell />}
        {isLoggedIn ? <ProfileButton /> : <LoginButton />}
      </div>
    </header>
  );
}
