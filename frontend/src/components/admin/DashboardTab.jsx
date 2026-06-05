import React from 'react';
import { Users, Radio, CalendarCheck, Database } from 'lucide-react';

export default function DashboardTab({ activeSessions, todayAttendance, attendance, totalStudents }) {
  return (
    <div className="stats-grid">
      <div className="stat-card glass-card">
        <div
          className="stat-icon"
          style={{
            background: 'rgba(247,147,26,0.12)',
            color: '#F7931A',
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Users size={20} />
        </div>
        <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            className="stat-label"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            Total Students
          </span>
          <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {totalStudents || 120}
          </span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div
          className="stat-icon"
          style={{
            background: 'rgba(255,214,0,0.12)',
            color: '#FFD600',
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Radio size={20} />
        </div>
        <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            className="stat-label"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            Active Sessions
          </span>
          <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {activeSessions.length}
          </span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div
          className="stat-icon"
          style={{
            background: 'rgba(247,147,26,0.12)',
            color: '#F7931A',
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <CalendarCheck size={20} />
        </div>
        <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            className="stat-label"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            Today's Attendance
          </span>
          <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {todayAttendance.length}
          </span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div
          className="stat-icon"
          style={{
            background: 'rgba(234,88,12,0.12)',
            color: '#EA580C',
            width: 40,
            height: 40,
            borderRadius: 12,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Database size={20} />
        </div>
        <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          <span
            className="stat-label"
            style={{
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              fontWeight: 500,
            }}
          >
            Total Records
          </span>
          <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>
            {attendance.length}
          </span>
        </div>
      </div>
    </div>
  );
}
