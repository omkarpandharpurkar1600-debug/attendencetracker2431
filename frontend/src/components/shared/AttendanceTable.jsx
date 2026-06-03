import React from 'react';

function formatDate(isoString) {
  return new Date(isoString).toLocaleDateString();
}

function formatTime(isoString) {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function AttendanceTable({ records, isAdmin = false }) {
  if (!records || records.length === 0) {
    return (
      <div className="empty-state glass-card" style={{ padding: 48, textAlign: 'center' }}>
        <h3>No Records Found</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          No attendance data is available for the current filter.
        </p>
      </div>
    );
  }

  return (
    <div className="table-wrapper" style={{ overflowX: 'auto' }}>
      <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {isAdmin && <th>Student</th>}
            {isAdmin && <th>Roll No</th>}
            <th>Session</th>
            <th>Date</th>
            <th>Time</th>
            {isAdmin && <th>Risk Level</th>}
            <th>Status</th>
            <th>Distance (Origin)</th>
            <th>Monitoring</th>
            {isAdmin && <th>Device ID</th>}
          </tr>
        </thead>
        <tbody>
          {records.map((record) => (
            <tr key={record.id}>
              {isAdmin && <td>{record.studentName}</td>}
              {isAdmin && <td>{record.rollNumber}</td>}
              <td>{record.sessionName}</td>
              <td>{formatDate(record.scanTime)}</td>
              <td>{formatTime(record.scanTime)}</td>
              {isAdmin && (
                <td>
                  <span className={`badge ${
                    record.riskLevel === 'High' ? 'badge-error' :
                    record.riskLevel === 'Medium' ? 'badge-warning' :
                    'badge-success'
                  }`}>
                    {record.riskLevel || 'Low'}
                  </span>
                </td>
              )}
              <td>
                <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-error'}`}>
                  {record.status}
                </span>
              </td>
              <td>{(record.currentDistance ?? record.distance) != null ? `${Math.round(record.currentDistance ?? record.distance)}m` : '—'}</td>
              <td>
                <span className={`badge ${
                  record.monitoringStatus === 'Monitoring' ? 'badge-warning' :
                  record.monitoringStatus === 'Completed' ? 'badge-expired' :
                  record.monitoringStatus === 'Suspicious' ? 'badge-warning' :
                  record.monitoringStatus === 'Location Disabled' ? 'badge-error' :
                  record.monitoringStatus === 'Location Error' ? 'badge-error' : ''
                }`}>
                  {record.monitoringStatus || '—'}
                </span>
              </td>
              {isAdmin && (
                <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {record.deviceId || '—'}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
