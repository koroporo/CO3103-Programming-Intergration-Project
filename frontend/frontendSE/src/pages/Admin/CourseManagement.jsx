
import './CourseManagement.css';
import { useState, useEffect } from 'react';
import { getAllCourses } from '../../services/adminServices';
import Table from '../../components/Admin/Table';

export default function CourseManagement() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await getAllCourses();
        setCourses(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCourses();
  }, []);

  return (
    <div className="course-management">
      <div className="admin-page-header">
        <h1>Course Management</h1>
        <p>
          Review course approvals, publish status,
          ratings, and active enrollments.
        </p>
      </div>

      {loading && <p>Loading courses...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <Table
          tableName="Courses Moderation"
          data={courses}
        />
      )}
    </div>
  );
}
