import './UserManagement.css';
import users from '../../data/admin-mock/user-data.json';
import Table from '../../components/Admin/Table';

export default function UserManagement() {
  return (
    <div className="user-management">
      <div className="admin-page-header">
        <h1>User Management</h1>
        <p>Monitor user accounts, permissions, roles, and security statuses.</p>
      </div>
      <Table tableName="Registered Users" data={users} />
    </div>
  );
}
