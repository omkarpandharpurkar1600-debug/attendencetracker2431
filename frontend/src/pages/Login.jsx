import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { DEMO_STUDENTS } from '../data/students';

export default function Login() {
  const { currentUser, login } = useApp();
  const [selected, setSelected] = useState('');

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return (
    <div className="page-content" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
      <div className="fade-in" style={{ maxWidth: 600 }}>
        <h1 className="text-8xl" style={{ marginBottom: 16 }}>GEOSECURE.</h1>
        <p className="text-xl text-muted" style={{ marginBottom: 64, maxWidth: 400 }}>
          Attendance Management System. Built for speed and strict location compliance.
        </p>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group" style={{ marginBottom: 40 }}>
            <label className="form-label">Select Identity</label>
            <select
              className="input-field"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
              style={{ fontSize: '1.25rem', height: 64, borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderRadius: 0, paddingLeft: 0, backgroundColor: 'transparent' }}
            >
              <option value="">Choose an identity...</option>
              {DEMO_STUDENTS.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.rollNumber}
                </option>
              ))}
              <option value="admin">Admin Panel</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-primary"
            disabled={!selected}
            onClick={() => login(selected)}
          >
            Authenticate Identity
          </button>
        </form>
      </div>
    </div>
  );
}
