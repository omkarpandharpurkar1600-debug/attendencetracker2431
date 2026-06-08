import React, { useState, useEffect } from 'react';
import { Radio, Database, Plus, QrCode, Trash2, Search, MapPin, LogOut } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import QRGenerator from '../components/QRGenerator';
import LiveMonitor from '../components/LiveMonitor';
import Reports from '../components/Reports';
import AttendanceTable from '../components/shared/AttendanceTable';
import DashboardTab from '../components/admin/DashboardTab';
import AuditLogsTab from '../components/admin/AuditLogsTab';
import storage from '../utils/storage';
import { getCurrentPosition } from '../utils/geo';

export default function AdminPanel() {
  const { currentUser, sessions, attendance, logout, refreshData, createSession } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showQR, setShowQR] = useState(null);
  const [sessionForm, setSessionForm] = useState({ name: '', className: '', startTime: '', endTime: '' });
  const [locationStatus, setLocationStatus] = useState('');
  const [capturedLocation, setCapturedLocation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [studentsList, setStudentsList] = useState([]);

  useEffect(() => {
    refreshData();
    storage.getStudentsList().then(setStudentsList);
  }, []);

  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 5000);
    return () => clearInterval(timer);
  }, []);
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
        startTime: new Date(sessionForm.startTime).toISOString(),
        endTime: new Date(sessionForm.endTime).toISOString(),
        lat: pos.lat,
        lng: pos.lng,
      });

      setSessionForm({ name: '', className: '', startTime: '', endTime: '' });
      setShowCreateForm(false);
      setLocationStatus('');
      setCapturedLocation(null);
      toast.success('Session created successfully!');
      await refreshData();
    } catch (err) {
      setLocationStatus('');
      toast.error('Failed to get location or create session');
    }
  };

  const handleDeleteSession = async (sessionId) => {
    if (!window.confirm('Delete this session? Associated attendance records will also be deleted.')) return;
    await storage.deleteSession(sessionId);
    await refreshData();
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

  const handleGenerateSamples = async () => {
    setIsGenerating(true);
    try {
      // 1. Create a dummy session
      const now = new Date();
      const endTime = new Date(now.getTime() + 3600000);
      const session = await createSession({
        name: 'Computer Networks - CN401',
        className: 'CSE 4th Year',
        startTime: now.toISOString(),
        endTime: endTime.toISOString(),
        lat: 15.8497,
        lng: 74.4977,
      });

      const sessionId = session.id;
      // 2. Generate random attendance for some students
      const sampleStudents = studentsList.slice(0, 10);
      for (const student of sampleStudents) {
        const isPresent = Math.random() > 0.4;
        const status = isPresent ? 'Present' : 'Absent';
        await storage.addAttendance({
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          sessionId,
          scanTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          lat: 15.8497 + (Math.random() - 0.5) * 0.001,
          lng: 74.4977 + (Math.random() - 0.5) * 0.001,
          distance: isPresent ? Math.random() * 15 : 25 + Math.random() * 50,
          status,
          deviceId: 'DEV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
        });
      }
      toast.success('Sample data generated successfully!');
      await refreshData();
    } catch (err) {
      toast.error('Failed to generate sample data.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleResetData = async () => {
    if (!window.confirm('Are you sure? This will permanently delete ALL sessions, attendance records, and location logs.')) return;
    try {
      await storage.resetAllData();
      toast.success('All data cleared.');
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      toast.error('Failed to clear data: ' + err.message);
    }
  };

  return (
    <>
      <div className="navbar no-print">
        <span className="navbar-brand">GeoSecure</span>
        <div className="navbar-right">
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowDemoModal(true)}>
            Admin Tools
          </button>
          <span>Admin Panel</span>
          <button className="btn-icon" onClick={logout}>
            <LogOut size={18} />
          </button>
        </div>
      </div>

      <div className="page-content">
        <div className="tabs">
          <button className={`tab ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            Dashboard
          </button>
          <button className={`tab ${activeTab === 'live' ? 'active' : ''}`} onClick={() => setActiveTab('live')}>
            Live Monitor
          </button>
          <button className={`tab ${activeTab === 'sessions' ? 'active' : ''}`} onClick={() => setActiveTab('sessions')}>
            Sessions
          </button>
          <button className={`tab ${activeTab === 'attendance' ? 'active' : ''}`} onClick={() => setActiveTab('attendance')}>
            Attendance
          </button>
          <button className={`tab ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}>
            Audit Logs
          </button>
          <button className={`tab ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
            Reports & Analytics
          </button>
        </div>

        {activeTab === 'reports' && <Reports />}

        {activeTab === 'live' && (
          <LiveMonitor activeSessionId={activeSessions.length > 0 ? activeSessions[0].id : null} />
        )}

        {activeTab === 'dashboard' && (
          <DashboardTab 
            activeSessions={activeSessions} 
            todayAttendance={todayAttendance} 
            attendance={attendance}
            totalStudents={studentsList.length}
          />
        )}

        {activeTab === 'sessions' && (
          <>
            <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Sessions</h2>
              <button className="btn-primary" onClick={() => setShowCreateForm(!showCreateForm)}>
                <Plus size={16} /> Create Session
              </button>
            </div>

            {showCreateForm && (
              <div className="glass-card" style={{ padding: 24, marginBottom: 24 }}>
                <div className="form-group">
                  <label className="form-label">Session Name</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g. Data Structures Lecture"
                    value={sessionForm.name}
                    onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Class Name</label>
                  <input
                    className="input-field w-full"
                    placeholder="e.g. CS-201"
                    value={sessionForm.className}
                    onChange={(e) => setSessionForm({ ...sessionForm, className: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Start Time</label>
                  <input
                    type="datetime-local"
                    className="input-field w-full"
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">End Time</label>
                  <input
                    type="datetime-local"
                    className="input-field w-full"
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                  />
                </div>
                <div style={{ display: 'flex', gap: 12, marginTop: 16 }}>
                  <button className="btn-primary" onClick={handleCreateSession} disabled={locationStatus === 'getting'}>
                    {locationStatus === 'getting' ? (
                      <>
                        <span className="spinner" style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.6s linear infinite', display: 'inline-block' }} />
                        {' '}Getting location...
                      </>
                    ) : (
                      <>
                        <MapPin size={16} /> Capture Location &amp; Create
                      </>
                    )}
                  </button>
                  <button className="btn-secondary" onClick={() => { setShowCreateForm(false); setLocationStatus(''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {sessions.length === 0 ? (
              <div className="empty-state">
                <Radio size={48} style={{ opacity: 0.3 }} />
                <p>No sessions created yet</p>
              </div>
            ) : (
              sessions.map((session) => (
                <div key={session.id} className="session-card glass-card" style={{ padding: 20, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 12 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                        <strong style={{ fontSize: '1.05rem' }}>{session.name}</strong>
                        {isSessionActive(session) ? (
                          <span className="badge badge-active">Active</span>
                        ) : (
                          <span className="badge badge-expired">Expired</span>
                        )}
                      </div>
                      <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{session.className}</p>
                      <p style={{ color: 'var(--error)', fontSize: '0.75rem', fontFamily: 'monospace', margin: '4px 0' }}>
                        Origin: {session.lat?.toFixed(6)}, {session.lng?.toFixed(6)}
                      </p>
                      <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(session.startTime)} · {formatTimeRange(session.startTime, session.endTime)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      <button className="btn-secondary" onClick={() => setShowQR(session)}>
                        <QrCode size={16} /> Show QR
                      </button>
                      <button className="btn-danger" onClick={() => handleDeleteSession(session.id)}>
                        <Trash2 size={16} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}

            {showQR && (
              <div className="modal-overlay" onClick={() => setShowQR(null)}>
                <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: 520 }}>
                  <QRGenerator session={showQR} onClose={() => setShowQR(null)} />
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'attendance' && (
          <>
            <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <h2 style={{ margin: 0 }}>Attendance Records</h2>
              <div className="search-bar" style={{ position: 'relative' }}>
                <Search className="search-icon" size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input
                  className="input-field"
                  placeholder="Search by name or session..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ paddingLeft: 40 }}
                />
              </div>
            </div>

            {filteredAttendance.length === 0 ? (
              <div className="empty-state">
                <Database size={48} style={{ opacity: 0.3 }} />
                <p>No attendance records found</p>
              </div>
            ) : (
              <div className="glass-card">
                <AttendanceTable records={filteredAttendance} isAdmin={true} />
              </div>
            )}
          </>
        )}

        {activeTab === 'audit' && (
          <AuditLogsTab />
        )}
      </div>

      {showDemoModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in" style={{ maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Admin Tools</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Use these tools to generate sample data for testing or reset the database.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-primary" onClick={handleGenerateSamples} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Sample Data & Charts'}
              </button>
              <button className="btn-danger" onClick={handleResetData}>
                Factory Reset (Clear All Data)
              </button>
              <button className="btn-secondary" onClick={() => setShowDemoModal(false)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
