import SvgIcon from '../Common/SvgIcon';
import './NavigationPanel.css';

export default function NavigationPanel({ activeTab, setActiveTab }) {
  const navItems = [
    { id: 'user-management', label: 'User Management', icon: 'user' },
    { id: 'course-management', label: 'Course Management', icon: 'course' },
    { id: 'report-audit', label: 'Reports & Audit Log', icon: 'report' },
    { id: 'instructor-request', label: 'Instructor Requests', icon: 'instructor' },
  ];

  return (
    <aside className="navigation-panel" aria-label="Admin navigation sidebar">
      <nav>
        {navItems.map((item) => (
          <button
            key={item.id}
            type="button"
            className={activeTab === item.id ? 'active' : ''}
            onClick={() => setActiveTab(item.id)}
          >
            <span className="nav-icon" aria-hidden="true">
              <SvgIcon name={item.icon} size={18} />
            </span>
            <span>{item.label}</span>
          </button>
        ))}
      </nav>
    </aside>
  );
}
