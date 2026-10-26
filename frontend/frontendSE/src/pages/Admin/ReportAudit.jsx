import './ReportAudit.css';
import Table from '../../components/Admin/Table';
import data from '../../data/admin-mock/reports-logs.json';

export default function ReportAudit() {
  return (
    <div className="report-audit">
      <div className="admin-page-header">
        <h1>Reports & Audit Log</h1>
        <p>Track reported content violations and review operational activity history.</p>
      </div>

      <Table tableName="All Reported Items" data={data.report_items || []} />
      <Table tableName="Audit Activity Logs" data={data.audit_logs || []} />
    </div>
  );
}
