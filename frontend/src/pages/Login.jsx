import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { DEMO_STUDENTS } from '../data/students';

export default function Login() {
  const { currentUser, login } = useApp();
  const [selected, setSelected] = useState('');

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  return (
    <div className="login-page">
      <div className="login-card glass-card slide-up">
        <div className="login-icon">
          <ShieldCheck size={48} />
        </div>
        <h1 className="login-title">GeoSecure</h1>
        <p className="login-subtitle">Attendance Management System</p>

        <form onSubmit={(e) => e.preventDefault()}>
          <div className="form-group">
            <label className="form-label">Select Your Identity</label>
            <select
              className="input-field w-full"
              value={selected}
              onChange={(e) => setSelected(e.target.value)}
            >
              <option value="">Choose your identity...</option>
              {DEMO_STUDENTS.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.name} — {student.rollNumber}
                </option>
              ))}
              <option value="admin">🔒 Admin Panel</option>
            </select>
          </div>

          <button
            type="button"
            className="btn-primary w-full"
            style={{ marginTop: 16 }}
            disabled={!selected}
            onClick={() => login(selected)}
          >
            Login
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8, lineHeight: '1.5' }}>
          Made by <strong>Omkar, Bhavana, Yash, & Kartik</strong><br />
          KLS Gogte Institute Of Technology, Belagavi, Karnataka
        </div>
      </div>
    </div>
  );
}
