import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, CheckCircle, BarChart3, QrCode, History, ArrowLeft } from 'lucide-react';
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
        <span className="navbar-brand">GeoSecure</span>
        <div className="navbar-right">
          {trackingSession && (
            <div className="tracking-indicator">
              <span className="tracking-dot" />
              Location tracking active
            </div>
          )}
          <span>{currentUser.name}</span>
          <button className="btn-icon" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="page-content">
        {view === 'dashboard' && (
          <>
            <div className="page-header">
              <h1>Welcome back, {currentUser.name} 👋</h1>
              <p>Mark your attendance and track your records</p>
            </div>

            <div className="stats-grid">
              <div className="stat-card glass-card">
                <div
                  className="stat-icon"
                  style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <Calendar size={20} />
                </div>
                <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Total Classes</span>
                  <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{totalClasses}</span>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div
                  className="stat-icon"
                  style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <CheckCircle size={20} />
                </div>
                <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Present</span>
                  <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{presentCount}</span>
                </div>
              </div>

              <div className="stat-card glass-card">
                <div
                  className="stat-icon"
                  style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <BarChart3 size={20} />
                </div>
                <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Attendance %</span>
                  <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{percentage}%</span>
                </div>
              </div>
            </div>

            <div className="action-grid" style={{ marginTop: 32 }}>
              <div className="action-card glass-card" onClick={() => setView('scanner')}>
                <QrCode size={32} />
                <h3>Scan QR Code</h3>
                <p>Scan to mark attendance</p>
              </div>
              <div className="action-card glass-card" onClick={() => setView('history')}>
                <History size={32} />
                <h3>View History</h3>
                <p>See your attendance records</p>
              </div>
            </div>
          </>
        )}

        {view === 'scanner' && (
          <>
            <button className="btn-secondary" onClick={() => setView('dashboard')} style={{ marginBottom: 16 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <div className="page-header">
              <h2>Scan QR Code</h2>
            </div>
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
          </>
        )}

        {view === 'history' && (
          <>
            <button className="btn-secondary" onClick={() => setView('dashboard')} style={{ marginBottom: 16 }}>
              <ArrowLeft size={16} /> Back to Dashboard
            </button>
            <AttendanceHistory studentId={currentUser.id} />
          </>
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
