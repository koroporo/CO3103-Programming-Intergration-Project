
import './UserManagement.css';
import { useState, useEffect } from 'react';
import { getAllAccounts } from '../../services/adminServices';
import Table from '../../components/Admin/Table';

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchUsers() {
      try {
        const data = await getAllAccounts();
        setUsers(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  return (
    <div className="user-management">
      <div className="admin-page-header">
        <h1>User Management</h1>
        <p>
          Monitor user accounts, permissions, roles,
          and security statuses.
        </p>
      </div>

      {loading && <p>Loading users...</p>}

      {error && <p>Error: {error}</p>}

      {!loading && !error && (
        <Table
          tableName="Registered Users"
          data={users}
        />
      )}
    </div>
  );
}
