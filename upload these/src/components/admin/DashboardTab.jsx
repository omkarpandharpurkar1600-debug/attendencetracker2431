import React from 'react';
import { Users, Radio, CalendarCheck, Database } from 'lucide-react';
import { DEMO_STUDENTS } from '../../data/students';

export default function DashboardTab({ activeSessions, todayAttendance, attendance }) {
  return (
    <div className="stats-grid">
      <div className="stat-card glass-card">
        <div
          className="stat-icon"
          style={{
            background: 'rgba(59,130,246,0.15)',
            color: '#3b82f6',
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
            {DEMO_STUDENTS.length}
          </span>
        </div>
      </div>

      <div className="stat-card glass-card">
        <div
          className="stat-icon"
          style={{
            background: 'rgba(34,197,94,0.15)',
            color: '#22c55e',
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
            background: 'rgba(251,146,60,0.15)',
            color: '#fb923c',
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
            background: 'rgba(168,85,247,0.15)',
            color: '#a855f7',
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
