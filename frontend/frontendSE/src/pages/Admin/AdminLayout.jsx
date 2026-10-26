import { useState } from 'react';
import NavigationPanel from '../../components/Admin/NavigationPanel';
import CourseManagement from './CourseManagement';
import InstructorRequest from './InstructorRequest';
import UserManagement from './UserManagement';
import ReportAudit from './ReportAudit';
import SvgIcon from '../../components/Common/SvgIcon';
import './AdminLayout.css';

export default function AdminLayout() {
  const [activeNavigationTab, setActiveNavigationTab] = useState('user-management');

  return (


      <div className="admin-main-wrapper">
        <header className="admin-topbar">
          <div className="admin-topbar__left">
            <a href="/" className="admin-topbar__brand">
              ieltstrainer
            </a>
            <span className="admin-topbar__tag">Admin Portal</span>
          </div>

          <div className="admin-topbar__right">
            <div className="admin-user-pill">
              <span className="admin-user-avatar">
                <SvgIcon name="user" size={14} color="#ffffff" />
              </span>
              <span>Administrator</span>
            </div>
          </div>
        </header>
            <div className="admin-layout">

        <NavigationPanel
          activeTab={activeNavigationTab}
          setActiveTab={setActiveNavigationTab}
        />   

        <main className="admin-content">
          {activeNavigationTab === 'user-management' && <UserManagement />}
          {activeNavigationTab === 'course-management' && <CourseManagement />}
          {activeNavigationTab === 'report-audit' && <ReportAudit />}
          {activeNavigationTab === 'instructor-request' && <InstructorRequest />}
        </main>
      </div>
    </div>
  );
}
