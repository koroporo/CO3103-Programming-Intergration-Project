import './InstructorRequest.css';
import requests from '../../data/admin-mock/instructor-request.json';
import Table from '../../components/Admin/Table';

export default function InstructorRequest() {
  return (
    <div className="instructor-request">
      <div className="admin-page-header">
        <h1>Instructor Requests</h1>
        <p>Evaluate teacher applications, credentials, certificates, and approval requests.</p>
      </div>
      <Table tableName="Instructor Applications" data={requests} />
    </div>
  );
}
