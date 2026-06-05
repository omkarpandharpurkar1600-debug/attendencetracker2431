import React, { useState, useEffect } from 'react';
import { Download, Printer, PieChart, BarChart2, Activity, Users, ShieldAlert, CheckCircle } from 'lucide-react';
import storage from '../utils/storage';

export default function Reports() {
  const [allAttendance, setAllAttendance] = useState([]);

  useEffect(() => {
    storage.getAttendance().then(setAllAttendance).catch(() => {});
  }, []);
  
  const totalRecords = allAttendance.length;
  const present = allAttendance.filter(a => a.status === 'Present').length;
  const absent = allAttendance.filter(a => a.status === 'Absent').length;
  const suspicious = allAttendance.filter(a => a.monitoringStatus === 'Suspicious').length;
  
  const riskLow = allAttendance.filter(a => a.riskLevel === 'Low').length;
  const riskMedium = allAttendance.filter(a => a.riskLevel === 'Medium').length;
  const riskHigh = allAttendance.filter(a => a.riskLevel === 'High').length;

  const downloadCSV = () => {
    const headers = ['Student Name', 'Roll Number', 'Session', 'Scan Time', 'Status', 'Risk Level', 'Monitoring Status', 'Range', 'Device ID'];
    const rows = allAttendance.map(r => [
      r.studentName,
      r.rollNumber,
      r.sessionName,
      new Date(r.scanTime).toLocaleString(),
      r.status,
      r.riskLevel || 'Low',
      r.monitoringStatus || 'Completed',
      r.status === 'Present' ? 'Within Range' : 'Out of Range',
      r.deviceId || 'Unknown'
    ]);
    
    const csvContent = [headers.join(','), ...rows.map(r => r.map(cell => `"${cell}"`).join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `GeoSecure_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-container fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 24, marginTop: 24 }}>
      
      <div className="toolbar no-print reports-toolbar" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
            <PieChart size={24} color="var(--accent-primary)" /> Reports & Analytics
          </h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: 8 }}>Overview of all historical attendance data.</p>
        </div>
        <div className="reports-actions" style={{ display: 'flex', gap: 12 }}>
          <button className="btn-secondary" onClick={handlePrint}><Printer size={16} /> Print Report</button>
          <button className="btn-primary" onClick={downloadCSV}><Download size={16} /> Download CSV</button>
        </div>
      </div>

      <div className="stats-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--text-primary)' }}><Users size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Total Records</span>
            <span className="stat-value">{totalRecords}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--success)' }}><CheckCircle size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Successful</span>
            <span className="stat-value">{present}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--error)' }}><ShieldAlert size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Invalid / Absent</span>
            <span className="stat-value">{absent}</span>
          </div>
        </div>
        <div className="stat-card glass-card">
          <div className="stat-icon" style={{ color: 'var(--warning)' }}><Activity size={20} /></div>
          <div className="stat-info">
            <span className="stat-label">Suspicious</span>
            <span className="stat-value">{suspicious}</span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(400px, 100%), 1fr))', gap: 24 }}>
        
        {/* Simple Risk Chart */}
        <div className="glass-card">
          <h3 style={{ marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8 }}><BarChart2 size={18} /> Risk Level Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              { label: 'Low Risk', count: riskLow, color: 'var(--success)' },
              { label: 'Medium Risk', count: riskMedium, color: 'var(--warning)' },
              { label: 'High Risk', count: riskHigh, color: 'var(--error)' }
            ].map(tier => (
              <div key={tier.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 6 }}>
                  <span>{tier.label}</span>
                  <span style={{ fontWeight: 600 }}>{tier.count}</span>
                </div>
                <div style={{ width: '100%', height: 8, background: 'rgba(255,255,255,0.05)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ 
                    height: '100%', 
                    width: totalRecords > 0 ? `${(tier.count / totalRecords) * 100}%` : '0%', 
                    background: tier.color,
                    borderRadius: 4
                  }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Printable Data Table */}
        <div className="glass-card" style={{ padding: 24 }}>
          <h3 style={{ marginBottom: 16 }}>Latest Records</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table" style={{ width: '100%', fontSize: '0.85rem' }}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Status</th>
                  <th>Risk Level</th>
                  <th>Range</th>
                </tr>
              </thead>
              <tbody>
                {allAttendance.slice(0, 10).map(r => (
                  <tr key={r.id}>
                    <td>{r.studentName}</td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-success' : 'badge-error'}`}>{r.status}</span>
                    </td>
                    <td>
                      <span className={`badge ${r.riskLevel === 'High' ? 'badge-error' : r.riskLevel === 'Medium' ? 'badge-warning' : 'badge-success'}`}>
                        {r.riskLevel || 'Low'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${r.status === 'Present' ? 'badge-success' : 'badge-error'}`}>
                        {r.status === 'Present' ? 'Within Range' : 'Out of Range'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
