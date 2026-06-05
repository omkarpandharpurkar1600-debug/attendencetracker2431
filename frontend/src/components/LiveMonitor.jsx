import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { 
  Users, CheckCircle, XCircle, Activity, Flag, 
  MapPin, Clock, ArrowRight, Play, Navigation
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import storage from '../utils/storage';
import { GEOFENCE_RADIUS_METERS } from '../data/students';

// Fix Leaflet's default icon paths in React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const redIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function LiveMonitor({ activeSessionId }) {
  const { attendance } = useApp();
  const [selectedStudentId, setSelectedStudentId] = useState(null);
  const [now, setNow] = useState(Date.now());
  const [simMode, setSimMode] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const sessionAttendance = attendance.filter(a => a.sessionId === activeSessionId);
  const total = sessionAttendance.length;
  const present = sessionAttendance.filter(a => a.status === 'Present').length;
  const absent = sessionAttendance.filter(a => a.status === 'Absent').length;
  const monitoring = sessionAttendance.filter(a => a.monitoringStatus === 'Monitoring').length;
  const completed = sessionAttendance.filter(a => a.monitoringStatus === 'Completed').length;

  const selectedRecord = sessionAttendance.find(a => a.studentId === selectedStudentId) || sessionAttendance[0];

  useEffect(() => {
    if (selectedRecord && !selectedStudentId) {
      setSelectedStudentId(selectedRecord.studentId);
    }
  }, [selectedRecord, selectedStudentId]);

  const [locationLogs, setLocationLogs] = useState([]);

  useEffect(() => {
    if (selectedRecord) {
      storage.getLogsForAttendance(selectedRecord.id).then((logs) => {
        setLocationLogs(logs);
      });
    } else {
      setLocationLogs([]);
    }
  }, [selectedRecord]);

  const handleSimulate = async (latOffset, lngOffset) => {
    if (!selectedRecord) return;
    const newLat = (selectedRecord.currentLat || selectedRecord.originLat || selectedRecord.lat) + latOffset;
    const newLng = (selectedRecord.currentLng || selectedRecord.originLng || selectedRecord.lng) + lngOffset;
    const newDistance = Math.round(
      Math.sqrt(Math.pow((newLat - (selectedRecord.originLat || selectedRecord.lat)) * 111320, 2) + Math.pow((newLng - (selectedRecord.originLng || selectedRecord.lng)) * 111320 * Math.cos((selectedRecord.originLat || selectedRecord.lat) * Math.PI / 180), 2))
    );
    const newStatus = newDistance <= GEOFENCE_RADIUS_METERS ? 'Present' : 'Absent';
    await storage.updateAttendance(selectedRecord.id, {
      currentLat: newLat,
      currentLng: newLng,
      currentDistance: newDistance,
      status: newStatus,
      riskLevel: newStatus === 'Absent' ? 'High' : 'Low',
    });
    await storage.addLocationLog({
      studentId: selectedRecord.studentId,
      sessionId: selectedRecord.sessionId,
      attendanceId: selectedRecord.id,
      lat: newLat,
      lng: newLng,
      distance: newDistance,
      status: newStatus,
      timestamp: new Date().toISOString(),
      event: `Simulated movement (${newStatus === 'Present' ? 'Within Range' : 'Out of Range'})`,
    });
  };

  const getProgress = (record) => {
    if (record.monitoringStatus !== 'Monitoring') return 100;
    const duration = 120000;
    const elapsed = now - new Date(record.scanTime).getTime();
    return Math.min(100, Math.max(0, (elapsed / duration) * 100));
  };

  const formatTimeLeft = (record) => {
    if (record.monitoringStatus !== 'Monitoring') return '00:00';
    const remaining = Math.max(0, record.monitoringEndTime - now);
    const m = Math.floor(remaining / 60000);
    const s = Math.floor((remaining % 60000) / 1000);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (!activeSessionId || sessionAttendance.length === 0) {
    return (
      <div className="empty-state glass-card" style={{ padding: 48, textAlign: 'center', marginTop: 24 }}>
        <Activity size={48} style={{ opacity: 0.3, marginBottom: 16 }} />
        <h3>No Live Activity</h3>
        <p style={{ color: 'var(--text-secondary)' }}>
          Select an active session and wait for students to scan the QR code.
        </p>
      </div>
    );
  }

  return (
    <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
      {/* Analytics Summary */}
      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))' }}>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--text-primary)' }}><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Scans</span>
            <span className="stat-value">{total}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}><CheckCircle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Present</span>
            <span className="stat-value">{present}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--error)' }}><XCircle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Absent</span>
            <span className="stat-value">{absent}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--warning)' }}><Activity size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Monitoring</span>
            <span className="stat-value">{monitoring}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--text-secondary)' }}><Flag size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Completed</span>
            <span className="stat-value">{completed}</span>
          </div>
        </div>
      </div>

      <div className="monitor-layout" style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24 }}>
        {/* Main View: Map + Students */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {selectedRecord && (
            <div className="glass-card monitor-map" style={{ padding: 0, overflow: 'hidden', height: 400, position: 'relative' }}>
              <MapContainer 
                center={[selectedRecord.originLat, selectedRecord.originLng]} 
                zoom={18} 
                style={{ height: '100%', width: '100%' }}
                key={selectedRecord.id}
              >
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <Marker position={[selectedRecord.originLat, selectedRecord.originLng]} icon={greenIcon}>
                  <Popup>Scan Origin</Popup>
                </Marker>
                {selectedRecord.currentLat && (
                  <Marker position={[selectedRecord.currentLat, selectedRecord.currentLng]} icon={selectedRecord.status === 'Present' ? blueIcon : redIcon}>
                    <Popup>Current Location</Popup>
                  </Marker>
                )}
                {selectedRecord.currentLat && (
                  <Polyline 
                    positions={[
                      [selectedRecord.originLat, selectedRecord.originLng],
                      [selectedRecord.currentLat, selectedRecord.currentLng]
                    ]}
                    color={selectedRecord.status === 'Present' ? '#FFD600' : '#ef4444'}
                    dashArray="5, 10"
                    weight={3}
                  />
                )}
              </MapContainer>
              <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 400, background: 'var(--bg-card)', padding: '8px 16px', borderRadius: 20, boxShadow: '0 4px 12px rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', fontWeight: 600 }}>
                <MapPin size={16} style={{ color: selectedRecord.status === 'Present' ? 'var(--success)' : 'var(--error)' }} />
                {selectedRecord.status === 'Present' ? 'Within Range' : 'Out of Range'}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3>Students in Session</h3>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.9rem', cursor: 'pointer', background: simMode ? 'rgba(247, 147, 26, 0.12)' : 'rgba(255,255,255,0.05)', padding: '6px 12px', borderRadius: 20 }}>
              <input type="checkbox" checked={simMode} onChange={e => setSimMode(e.target.checked)} style={{ margin: 0 }} />
              Test Simulation Mode
            </label>
          </div>

          <div className="student-cards-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
            {sessionAttendance.map(record => (
              <div 
                key={record.id} 
                className={`glass-card ${selectedStudentId === record.studentId ? 'selected' : ''}`}
                style={{ 
                  padding: 16, 
                  cursor: 'pointer', 
                  border: selectedStudentId === record.studentId ? '1px solid var(--accent-primary)' : '1px solid rgba(255,255,255,0.05)',
                  transform: selectedStudentId === record.studentId ? 'translateY(-2px)' : 'none',
                  transition: 'all 0.2s ease'
                }}
                onClick={() => setSelectedStudentId(record.studentId)}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                  <div>
                    <h4 style={{ margin: '0 0 4px' }}>{record.studentName}</h4>
                    <span className={`badge ${record.status === 'Present' ? 'badge-success' : 'badge-error'}`} style={{ fontSize: '0.7rem', padding: '2px 8px' }}>
                      {record.status}
                    </span>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Range</div>
                    <div style={{ fontWeight: 600 }}>{record.status === 'Present' ? 'Within Range' : 'Out of Range'}</div>
                  </div>
                </div>

                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: 4, color: 'var(--text-secondary)' }}>
                    <span>{record.monitoringStatus}</span>
                    <span>{formatTimeLeft(record)}</span>
                  </div>
                  <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3, overflow: 'hidden' }}>
                    <div style={{ 
                      height: '100%', 
                      width: `${getProgress(record)}%`, 
                      background: record.monitoringStatus === 'Monitoring' ? 'var(--warning)' : 'var(--text-secondary)',
                      transition: 'width 1s linear'
                    }} />
                  </div>
                </div>

                {simMode && selectedStudentId === record.studentId && record.monitoringStatus === 'Monitoring' && (
                  <div style={{ display: 'flex', gap: 8, marginTop: 16, paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <button className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); handleSimulate(0.000045, 0); }}>
                      +5m N
                    </button>
                    <button className="btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); handleSimulate(0, 0.00009); }}>
                      +10m E
                    </button>
                    <button className="btn-danger" style={{ flex: 1, padding: '4px', fontSize: '0.75rem' }} onClick={(e) => { e.stopPropagation(); handleSimulate(0.0002, 0.0002); }}>
                      Out (20m+)
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar: Timeline */}
        <div className="glass-card" style={{ padding: 20, height: 'fit-content' }}>
          <h3 style={{ margin: '0 0 20px', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Clock size={18} /> Timeline
          </h3>
          {locationLogs.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>No events recorded yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {locationLogs.map((log, i) => (
                <div key={log.id || i} style={{ display: 'flex', gap: 12, position: 'relative' }}>
                  {i !== locationLogs.length - 1 && (
                    <div style={{ position: 'absolute', left: 4, top: 16, bottom: -16, width: 2, background: 'rgba(255,255,255,0.1)' }} />
                  )}
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: log.status === 'Present' ? 'var(--success)' : 'var(--error)', marginTop: 4, zIndex: 2 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: 2 }}>
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </div>
                    <div style={{ fontSize: '0.9rem', lineHeight: 1.4 }}>
                      {log.isSimulation && <span style={{ color: 'var(--accent-primary)', fontSize: '0.75rem', marginRight: 4 }}>[SIM]</span>}
                      {log.event ? (
                        <span style={{ color: log.event.includes('Interrupted') || log.event.includes('Disabled') ? 'var(--error)' : 'inherit' }}>
                          {log.event}
                        </span>
                      ) : (
                        log.distance === 0 ? 'Attendance Marked' : `Location Updated (${log.status === 'Present' ? 'Within Range' : 'Out of Range'})`
                      )}
                    </div>
                    {i === 0 && log.status === 'Absent' && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--error)', marginTop: 2 }}>Changed to Absent</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
