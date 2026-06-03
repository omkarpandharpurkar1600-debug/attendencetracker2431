import React, { useState, useEffect } from 'react';
import { LogOut, ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import QRScanner from '../components/QRScanner';
import AttendanceHistory from '../components/AttendanceHistory';
import LocationTracker from '../components/LocationTracker';

export default function StudentDashboard() {
  const { currentUser, attendance, logout, refreshData } = useApp();
  const [view, setView] = useState('dashboard');
  const [trackingSession, setTrackingSession] = useState(null);
  const [trackingStatus, setTrackingStatus] = useState('Present');

  useEffect(() => {
    refreshData();
  }, []);

  const studentAttendance = attendance.filter((a) => a.studentId === currentUser.id);
  const totalClasses = studentAttendance.length;
  const presentCount = studentAttendance.filter((a) => a.status === 'Present').length;
  const percentage = totalClasses > 0 ? Math.round((presentCount / totalClasses) * 100) : 0;

  return (
    <>
      <div className="navbar">
        <span className="navbar-brand">GEOSECURE.</span>
        <div className="navbar-right">
          {trackingSession && (
            <div className="tracking-indicator text-accent text-mono text-xs uppercase tracking-wider flex-center" style={{ gap: 8 }}>
              <span className="tracking-dot" style={{ width: 8, height: 8, background: 'var(--accent)', borderRadius: '50%', animation: 'pulse 2s infinite' }} />
              Tracking Active
            </div>
          )}
          <span className="text-mono text-sm tracking-wide">{currentUser.name}</span>
          <button className="btn-ghost" onClick={logout}>
            LOGOUT
          </button>
        </div>
      </div>

      <div className="page-content">
        {view === 'dashboard' && (
          <div className="fade-in">
            <div className="section" style={{ paddingTop: 0, paddingBottom: 40, borderBottom: 'none' }}>
              <h1 className="text-7xl" style={{ marginBottom: 16 }}>WELCOME, {currentUser.name.split(' ')[0].toUpperCase()}</h1>
              <p className="text-xl text-muted">Scan QR to authenticate your location.</p>
            </div>

            <div className="stats-grid">
              <div className="stat-item">
                <span className="stat-label">Total Classes</span>
                <span className="stat-value">{totalClasses}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Present</span>
                <span className="stat-value">{presentCount}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Attendance Rate</span>
                <span className="stat-value text-accent">{percentage}%</span>
              </div>
            </div>

            <div className="action-grid">
              <div className="action-item" onClick={() => setView('scanner')}>
                <h3 className="text-3xl font-display uppercase tracking-tight">Scan QR Code</h3>
                <div style={{ marginTop: 32 }}>
                  <span className="btn-primary" style={{ border: 'none', background: 'transparent' }}>
                    Open Scanner <ArrowRight size={16} />
                  </span>
                </div>
              </div>
              <div className="action-item" onClick={() => setView('history')}>
                <h3 className="text-3xl font-display uppercase tracking-tight">View History</h3>
                <div style={{ marginTop: 32 }}>
                  <span className="btn-primary" style={{ border: 'none', background: 'transparent' }}>
                    View Records <ArrowRight size={16} />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'scanner' && (
          <div className="fade-in">
            <button className="btn-ghost" onClick={() => setView('dashboard')} style={{ marginBottom: 40, paddingLeft: 0 }}>
              <ArrowLeft size={16} /> BACK TO DASHBOARD
            </button>
            <h2 className="text-5xl" style={{ marginBottom: 32 }}>SCAN QR CODE</h2>
            <QRScanner
              onSuccess={(result) => {
                setTrackingSession({
                  sessionId: result.sessionId,
                  sessionLat: result.sessionLat,
                  sessionLng: result.sessionLng,
                  attendanceId: result.record.id,
                });
                setView('dashboard');
              }}
            />
          </div>
        )}

        {view === 'history' && (
          <div className="fade-in">
            <button className="btn-ghost" onClick={() => setView('dashboard')} style={{ marginBottom: 40, paddingLeft: 0 }}>
              <ArrowLeft size={16} /> BACK TO DASHBOARD
            </button>
            <h2 className="text-5xl" style={{ marginBottom: 32 }}>ATTENDANCE HISTORY</h2>
            <AttendanceHistory studentId={currentUser.id} />
          </div>
        )}
      </div>

      {trackingSession && (
        <LocationTracker
          sessionId={trackingSession.sessionId}
          sessionLat={trackingSession.sessionLat}
          sessionLng={trackingSession.sessionLng}
          attendanceId={trackingSession.attendanceId}
          onStatusChange={(status, distance) => {
            setTrackingStatus(status);
            refreshData();
          }}
        />
      )}
    </>
  );
}
