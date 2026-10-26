import SvgIcon from '../../components/Common/SvgIcon';
import './NotificationBell.css';

export default function NotificationBell() {
  return (
    <button type="button" className="notification-bell-btn" aria-label="Notifications">
      <SvgIcon name="bell" size={20} />
    </button>
  );
}
