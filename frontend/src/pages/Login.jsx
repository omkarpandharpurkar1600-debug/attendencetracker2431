import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { ShieldCheck, User, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';

export default function Login() {
  const { currentUser, login } = useApp();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [failCount, setFailCount] = useState(0);
  const [lockUntil, setLockUntil] = useState(0);

  if (currentUser) {
    return <Navigate to={currentUser.role === 'admin' ? '/admin' : '/student'} replace />;
  }

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error('Please enter username and password.');
      return;
    }
    if (Date.now() < lockUntil) {
      const secs = Math.ceil((lockUntil - Date.now()) / 1000);
      toast.error(`Too many attempts. Try again in ${secs}s.`);
      return;
    }
    setIsLoading(true);
    try {
      const result = await login(username.trim(), password);
      if (!result.success) {
        toast.error(result.message || 'Login failed.');
        const newCount = failCount + 1;
        setFailCount(newCount);
        if (newCount >= 5) {
          setLockUntil(Date.now() + 30000);
          setFailCount(0);
          toast.error('Too many failed attempts. Locked for 30 seconds.', { duration: 5000 });
        }
      } else {
        setFailCount(0);
      }
    } catch {
      toast.error('Could not connect to the server.');
      const newCount = failCount + 1;
      setFailCount(newCount);
      if (newCount >= 5) {
        setLockUntil(Date.now() + 30000);
        setFailCount(0);
        toast.error('Too many failed attempts. Locked for 30 seconds.', { duration: 5000 });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card glass-card slide-up">
        <div className="login-icon">
          <ShieldCheck size={48} />
        </div>
        <h1 className="login-title">GeoSecure</h1>
        <p className="login-subtitle">Attendance Management System</p>

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <div style={{ position: 'relative' }}>
              <User size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                id="login-username"
                type="text"
                className="input-field w-full"
                style={{ paddingLeft: 40 }}
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                autoFocus
              />
            </div>
          </div>

          <div className="form-group" style={{ marginTop: 12 }}>
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input
                id="login-password"
                type={showPassword ? 'text' : 'password'}
                className="input-field w-full"
                style={{ paddingLeft: 40, paddingRight: 40 }}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4 }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className="btn-primary w-full"
            style={{ marginTop: 20 }}
            disabled={isLoading || !username.trim() || !password.trim()}
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: 24, fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.8, lineHeight: '1.5' }}>
          Made by <strong>Omkar, Bhavana, Yash, &amp; Kartik</strong><br />
          KLS Gogte Institute Of Technology, Belagavi, Karnataka
        </div>
      </div>
    </div>
  );
}
