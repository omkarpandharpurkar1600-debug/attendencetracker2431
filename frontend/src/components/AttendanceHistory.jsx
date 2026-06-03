import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import * as storage from '../utils/storage';
import AttendanceTable from './shared/AttendanceTable';

export default function AttendanceHistory({ studentId }) {
  const [searchQuery, setSearchQuery] = useState('');

  const records = useMemo(() => {
    const all = storage.getAttendanceForStudent(studentId);
    // Sort newest first
    return all.sort((a, b) => new Date(b.scanTime) - new Date(a.scanTime));
  }, [studentId]);

  const filtered = useMemo(() => {
    if (!searchQuery.trim()) return records;
    const q = searchQuery.toLowerCase();
    return records.filter((r) => r.sessionName.toLowerCase().includes(q));
  }, [records, searchQuery]);

  return (
    <div className="fade-in">
      <div className="page-header">
        <h2>Attendance History</h2>
      </div>

      <div className="search-bar" style={{ marginBottom: 20 }}>
        <div
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            width: '100%',
            maxWidth: 400,
          }}
        >
          <Search
            size={16}
            style={{
              position: 'absolute',
              left: 12,
              color: 'var(--text-secondary)',
              pointerEvents: 'none',
            }}
          />
          <input
            type="text"
            placeholder="Search by session name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field"
            style={{ paddingLeft: 36, width: '100%' }}
          />
        </div>
      </div>

      {filtered.length === 0 && records.length === 0 ? (
        <div className="empty-state glass-card" style={{ textAlign: 'center', padding: 48 }}>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1rem' }}>
            No attendance records yet. Scan a QR code to get started!
          </p>
        </div>
      ) : (
        <div className="glass-card">
          <AttendanceTable records={filtered} isAdmin={false} />
        </div>
      )}
    </div>
  );
}
