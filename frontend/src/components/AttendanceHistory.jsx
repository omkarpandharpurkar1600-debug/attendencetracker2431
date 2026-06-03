import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import * as storage from '../utils/storage';

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
      <div className="search-bar" style={{ marginBottom: 40, maxWidth: '100%' }}>
        <input
          type="text"
          placeholder="SEARCH BY SESSION NAME..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="input-field"
          style={{ textTransform: 'uppercase', fontFamily: 'var(--font-mono)' }}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state" style={{ padding: '80px 0' }}>
          <p className="text-xl text-muted">
            {records.length === 0
              ? 'No attendance records yet. Scan a QR code to get started.'
              : 'No records match your search.'}
          </p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto', borderTop: '1px solid var(--border)' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Time</th>
                <th>Session</th>
                <th>Status</th>
                <th>Distance</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((record) => {
                const dt = new Date(record.scanTime);
                return (
                  <tr key={record.id}>
                    <td className="text-mono text-sm">{dt.toLocaleDateString()}</td>
                    <td className="text-mono text-sm">{dt.toLocaleTimeString()}</td>
                    <td style={{ fontWeight: 600 }}>{record.sessionName}</td>
                    <td>
                      <span
                        className={`badge ${
                          record.status === 'Present' ? 'badge-success' : 'badge-error'
                        }`}
                      >
                        {record.status}
                      </span>
                    </td>
                    <td className="text-mono text-sm">{Math.round(record.distance)}M</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
