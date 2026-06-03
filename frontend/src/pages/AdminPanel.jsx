import React, { useState, useEffect } from 'react';
import { LogOut, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { DEMO_STUDENTS } from '../data/students';
import QRGenerator from '../components/QRGenerator';
import storage from '../utils/storage';
import { getCurrentPosition } from '../utils/geo';

export default function AdminPanel() {
  const { currentUser, sessions, attendance, logout, refreshData, createSession } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [sessionForm, setSessionForm] = useState({ name: '', className: '', startTime: '', endTime: '' });
  const [locationStatus, setLocationStatus] = useState('');
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    refreshData();
  }, []);

  const now = new Date();
  const activeSessions = sessions.filter((s) => {
    const start = new Date(s.startTime);
    const end = new Date(s.endTime);
    return now >= start && now <= end;
  });

  const todayAttendance = attendance.filter((a) => {
    const scanDate = new Date(a.scanTime);
    return (
      scanDate.getFullYear() === now.getFullYear() &&
      scanDate.getMonth() === now.getMonth() &&
      scanDate.getDate() === now.getDate()
    );
  });

  const handleCreateSession = async () => {
    if (!sessionForm.name || !sessionForm.className || !sessionForm.startTime || !sessionForm.endTime) {
      toast.error('Please fill in all fields');
      return;
    }
    try {
      setLocationStatus('getting');
      const pos = await getCurrentPosition();
      setCapturedLocation({ lat: pos.lat, lng: pos.lng });
      setLocationStatus('captured');

      await createSession({
        name: sessionForm.name,
        className: sessionForm.className,
        startTime: sessionForm.startTime,
        endTime: sessionForm.endTime,
        lat: pos.lat,
        lng: pos.lng,
      });

      setSessionForm({ name: '', className: '', startTime: '', endTime: '' });
      setShowCreateForm(false);
      setLocationStatus('');
      setCapturedLocation(null);
      toast.success('Session created successfully!');
    } catch (err) {
      setLocationStatus('');
      toast.error('Failed to get location or create session');
    }
  };

  const handleDeleteSession = (sessionId) => {
    storage.deleteSession(sessionId);
    refreshData();
    toast.success('Session deleted');
  };

  const formatDate = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatTime = (dateStr) => {
    const d = new Date(dateStr);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };

  const formatTimeRange = (start, end) => {
    return `${formatTime(start)} — ${formatTime(end)}`;
  };

  const isSessionActive = (session) => {
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    return now >= start && now <= end;
  };

  const filteredAttendance = [...attendance]
    .sort((a, b) => new Date(b.scanTime) - new Date(a.scanTime))
    .filter((a) => {
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return (
        (a.studentName || '').toLowerCase().includes(term) ||
        (a.sessionName || '').toLowerCase().includes(term)
      );
    });

  return (
    <>
      <div className="navbar">
        <span className="navbar-brand">GEOSECURE.</span>
        <div className="navbar-right">
          <span className="text-mono text-sm tracking-wide">ADMIN PANEL</span>
          <button className="btn-ghost" onClick={logout}>
            LOGOUT
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button className={`tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            Sessions
          </button>
          <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            Attendance
          </button>
        </div>

        {activeTab === 'dashboard' && (
          <div className="fade-in">
            <h2 className="text-7xl" style={{ marginBottom: 40 }}>OVERVIEW</h2>
            <div className="stats-grid" style={{ paddingTop: 0 }}>
              <div className="stat-item">
                <span className="stat-label">Total Students</span>
                <span className="stat-value">{DEMO_STUDENTS.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Active Sessions</span>
                <span className="stat-value text-accent">{activeSessions.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Today's Attendance</span>
                <span className="stat-value">{todayAttendance.length}</span>
              </div>
              <div className="stat-item">
                <span className="stat-label">Total Records</span>
                <span className="stat-value">{attendance.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="fade-in">
            <div className="toolbar">
              <h2 className="text-6xl">SESSIONS</h2>
              <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                {showCreateForm ? 'Cancel Creation' : 'Create Session'}
              </button>
            </div>

            {showCreateForm && (
              <div className="card" style={{ marginBottom: 48 }}>
                <h3 className="text-3xl" style={{ marginBottom: 24 }}>NEW SESSION</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Session Name</label>
                    <input
                      className="input-field"
                      placeholder="e.g. Data Structures Lecture"
                      value={sessionForm.name}
                      onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Class Name</label>
                    <input
                      className="input-field"
                      placeholder="e.g. CS-201"
                      value={sessionForm.className}
                      onChange={(e) => setSessionForm({ ...sessionForm, className: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">Start Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={sessionForm.startTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    />
                  </div>
                  <div className="form-group" style={{ marginBottom: 0 }}>
                    <label className="form-label">End Time</label>
                    <input
                      type="datetime-local"
                      className="input-field"
                      value={sessionForm.endTime}
                      onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    />
                  </div>
                </div>
                <div style={{ marginTop: 32 }}>
                  <button className="btn-primary" onClick={handleCreateSession} disabled={locationStatus === 'getting'}>
                    {locationStatus === 'getting' ? 'Capturing Location...' : 'Capture Location & Create'}
                  </button>
                </div>
              </div>
            )}

            {sessions.length === 0 ? (
              <div style={{ padding: '80px 0' }}>
                <p className="text-xl text-muted">No sessions created yet.</p>
              </div>
            ) : (
              <div style={{ borderTop: '1px solid var(--border)' }}>
                {sessions.map((session) => (
                  <div key={session.id} style={{ padding: '32px 0', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 24 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                        <h3 className="text-3xl tracking-tight">{session.name}</h3>
                        {isSessionActive(session) ? (
                          <span className="badge badge-active">Active</span>
                        ) : (
                          <span className="badge">Expired</span>
                        )}
                      </div>
                      <p className="text-muted text-mono text-sm uppercase tracking-wide mb-2">{session.className}</p>
                      <p className="text-muted">
                        {formatDate(session.startTime)} · {formatTimeRange(session.startTime, session.endTime)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                      <button className="btn-primary" onClick={() => setShowQR(session)}>
                        Show QR
                      </button>
                      <button className="btn-ghost text-muted" onClick={() => handleDeleteSession(session.id)}>
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {showQR && (
              <div className="modal-overlay" onClick={() => setShowQR(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                  <QRGenerator session={showQR} onClose={() => setShowQR(null)} />
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div className="fade-in">
            <div className="toolbar">
              <h2 className="text-6xl">ATTENDANCE</h2>
              <div className="search-bar">
                <input
                  className="input-field"
                  placeholder="SEARCH BY NAME OR SESSION..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
                />
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div style={{ padding: '80px 0' }}>
                <p className="text-xl text-muted">No attendance records found.</p>
              </div>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table className="data-table">
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Session</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Status</th>
                      <th>Distance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record.id}>
                        <td style={{ fontWeight: 600 }}>{record.studentName}</td>
                        <td className="text-mono text-muted text-sm">{record.rollNumber}</td>
                        <td>{record.sessionName}</td>
                        <td className="text-mono text-sm">{formatDate(record.scanTime)}</td>
                        <td className="text-mono text-sm">{formatTime(record.scanTime)}</td>
                        <td>
                          <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-error'}`}>
                            {record.status}
                          </span>
                        </td>
                        <td className="text-mono text-sm">{record.distance != null ? `${Math.round(record.distance)}M` : '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
