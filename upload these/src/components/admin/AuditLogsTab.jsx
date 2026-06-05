import React from 'react';
import { ShieldAlert } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/students';
import storage from '../../utils/storage';

export default function AuditLogsTab() {
  const logs = storage.getLocationLogs().sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return (
    <>
      <div className="toolbar" style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
          <ShieldAlert size={20} /> Integrity Audit Logs
        </h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>
          Chronological trail of all attendance events.
        </p>
      </div>
      <div className="glass-card" style={{ padding: 24 }}>
        {logs.length === 0 ? (
          <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>
            No audit logs recorded yet.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {logs.map((log, i) => {
              const stu = DEMO_STUDENTS.find((s) => s.id === log.studentId);
              const isAlert = log.event?.includes('Disabled') || log.event?.includes('Interrupted');
              return (
                <div
                  key={log.id || i}
                  style={{
                    display: 'flex',
                    gap: 16,
                    borderBottom: '1px solid rgba(255,255,255,0.05)',
                    paddingBottom: 16,
                  }}
                >
                  <div style={{ width: 120, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    {new Date(log.timestamp).toLocaleString()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <strong style={{ display: 'block', marginBottom: 4 }}>
                      {stu ? stu.name : log.studentId}
                    </strong>
                    <span style={{ color: isAlert ? 'var(--error)' : 'var(--text-primary)' }}>
                      {log.event || `Location Updated (Distance: ${Math.round(log.distance)}m)`}
                    </span>
                  </div>
                  <div>
                    <span
                      className={`badge ${
                        log.status === 'Present' ? 'badge-success' : 'badge-error'
                      }`}
                    >
                      {log.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
