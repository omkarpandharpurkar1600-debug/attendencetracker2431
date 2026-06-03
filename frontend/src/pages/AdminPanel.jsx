import React, { useState, useEffect } from 'react';
import { Users, Radio, CalendarCheck, Database, Plus, QrCode, Trash2, Search, MapPin, LogOut, ShieldAlert } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { DEMO_STUDENTS } from '../data/students';
import QRGenerator from '../components/QRGenerator';
import LiveMonitor from '../components/LiveMonitor';
import Reports from '../components/Reports';
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

  const handleGenerateSamples = async () => {
    setIsGenerating(true);
    // 1. Create a dummy session
    const res = await createSession({
      name: 'Computer Networks - CN401',
      className: 'CSE 4th Year',
      duration: 60,
    });
    
    if (res.success) {
      const sessionId = res.session.id;
      // 2. Generate random attendance for some demo students
      DEMO_STUDENTS.forEach((student, index) => {
        const statuses = ['Present', 'Absent'];
        const monitoringStatuses = ['Monitoring', 'Completed', 'Suspicious', 'Location Disabled'];
        const riskLevels = ['Low', 'Medium', 'High'];
        
        const isPresent = Math.random() > 0.4;
        const status = isPresent ? 'Present' : 'Absent';
        const riskLevel = isPresent ? 'Low' : riskLevels[Math.floor(Math.random() * riskLevels.length)];
        
        storage.addAttendance({
          id: Date.now().toString(36) + Math.random().toString(36).substr(2) + index,
          studentId: student.id,
          studentName: student.name,
          rollNumber: student.rollNumber,
          sessionId,
          sessionName: 'Computer Networks - CN401',
          scanTime: new Date(Date.now() - Math.random() * 3600000).toISOString(),
          status,
          monitoringStatus: monitoringStatuses[Math.floor(Math.random() * monitoringStatuses.length)],
          monitoringEndTime: Date.now() + 120000,
          originLat: 15.8497,
          originLng: 74.4977,
          currentDistance: isPresent ? Math.random() * 15 : 25 + Math.random() * 50,
          deviceId: 'DEV-' + Math.random().toString(36).substr(2, 6).toUpperCase(),
          riskLevel
        });
      });
      toast.success('Sample demo data injected successfully!');
      setTimeout(() => window.location.reload(), 1000);
    }
  };

  const handleResetDemo = () => {
    storage.clearAll();
    toast.success('All demo data cleared.');
    setTimeout(() => window.location.reload(), 1000);
  };

  return (
    <>
      <div className="navbar no-print">
        <span className="navbar-brand">GeoSecure</span>
        <div className="navbar-right">
          <button className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => setShowDemoModal(true)}>
            Demo Controls
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
          <div className="stats-grid">
            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'rgba(59,130,246,0.15)', color: '#3b82f6', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Users size={20} />
              </div>
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Total Students</span>
                <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{DEMO_STUDENTS.length}</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'rgba(34,197,94,0.15)', color: '#22c55e', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Radio size={20} />
              </div>
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Active Sessions</span>
                <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{activeSessions.length}</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'rgba(251,146,60,0.15)', color: '#fb923c', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <CalendarCheck size={20} />
              </div>
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Today's Attendance</span>
                <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{todayAttendance.length}</span>
              </div>
            </div>

            <div className="stat-card glass-card">
              <div className="stat-icon" style={{ background: 'rgba(168,85,247,0.15)', color: '#a855f7', width: 40, height: 40, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Database size={20} />
              </div>
              <div className="stat-info" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <span className="stat-label" style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>Total Records</span>
                <span className="stat-value" style={{ fontSize: '1.8rem', fontWeight: 700 }}>{attendance.length}</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'sessions' && (
          <>
            <div className="toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
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
                      <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {formatDate(session.startTime)} · {formatTimeRange(session.startTime, session.endTime)}
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
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
              <div className="table-wrapper" style={{ overflowX: 'auto' }}>
                <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Roll No</th>
                      <th>Session</th>
                      <th>Date</th>
                      <th>Time</th>
                      <th>Risk Level</th>
                      <th>Status</th>
                      <th>Distance (Origin)</th>
                      <th>Monitoring</th>
                      <th>Device ID</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAttendance.map((record) => (
                      <tr key={record.id}>
                        <td>{record.studentName}</td>
                        <td>{record.rollNumber}</td>
                        <td>{record.sessionName}</td>
                        <td>{formatDate(record.scanTime)}</td>
                        <td>{formatTime(record.scanTime)}</td>
                        <td>
                          <span className={`badge ${
                            record.riskLevel === 'High' ? 'badge-error' :
                            record.riskLevel === 'Medium' ? 'badge-warning' :
                            'badge-success'
                          }`}>
                            {record.riskLevel || 'Low'}
                          </span>
                        </td>
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
                        <td style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                          {record.deviceId || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        )}

        {activeTab === 'audit' && (
          <>
            <div className="toolbar" style={{ marginBottom: 24 }}>
              <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldAlert size={20} /> Integrity Audit Logs
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Chronological trail of all attendance events.</p>
            </div>
            <div className="glass-card" style={{ padding: 24 }}>
              {storage.getLocationLogs().length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 24 }}>No audit logs recorded yet.</div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {storage.getLocationLogs().sort((a,b) => new Date(b.timestamp) - new Date(a.timestamp)).map((log, i) => {
                    const stu = DEMO_STUDENTS.find(s => s.id === log.studentId);
                    const isAlert = log.event?.includes('Disabled') || log.event?.includes('Interrupted');
                    return (
                      <div key={log.id || i} style={{ display: 'flex', gap: 16, borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: 16 }}>
                        <div style={{ width: 120, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                          {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div style={{ flex: 1 }}>
                          <strong style={{ display: 'block', marginBottom: 4 }}>{stu ? stu.name : log.studentId}</strong>
                          <span style={{ color: isAlert ? 'var(--error)' : 'var(--text-primary)' }}>
                            {log.event || `Location Updated (Distance: ${Math.round(log.distance)}m)`}
                          </span>
                        </div>
                        <div>
                          <span className={`badge ${log.status === 'Present' ? 'badge-success' : 'badge-error'}`}>{log.status}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}
      </div>

      {showDemoModal && (
        <div className="modal-overlay">
          <div className="modal-content glass-card fade-in" style={{ maxWidth: 400 }}>
            <h3 style={{ marginTop: 0, marginBottom: 16 }}>Project Demo Controls</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: 24 }}>
              Use these tools during your final-year presentation to quickly reset state or generate mock data to showcase the analytics.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <button className="btn-primary" onClick={handleGenerateSamples} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Sample Data & Charts'}
              </button>
              <button className="btn-danger" onClick={handleResetDemo}>
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
