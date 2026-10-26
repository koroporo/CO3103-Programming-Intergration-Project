import './CourseManagement.css';
import courses from '../../data/admin-mock/course-data.json';
import Table from '../../components/Admin/Table';

export default function CourseManagement() {
  return (
    <div className="course-management">
      <div className="admin-page-header">
        <h1>Course Management</h1>
        <p>Review course approvals, publish status, ratings, and active enrollments.</p>
      </div>
      <Table tableName="Courses Moderation" data={courses} />
    </div>
  );
}
