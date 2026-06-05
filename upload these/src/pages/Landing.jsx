import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, MapPin, QrCode, Clock, Navigation, 
  Smartphone, Eye, Users, ChevronDown, CheckCircle, 
  Zap, Database, Server, Smartphone as Phone, Cloud, Brain
} from 'lucide-react';

export default function Landing() {
  const navigate = useNavigate();

  const handleLaunch = () => {
    navigate('/login');
  };

  return (
    <div className="landing-page" style={{ color: 'var(--text-primary)', overflowX: 'hidden' }}>
      
      {/* Navbar */}
      <nav style={{ padding: '24px 48px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.05)', background: 'rgba(15, 23, 42, 0.8)', backdropFilter: 'blur(12px)', position: 'sticky', top: 0, zIndex: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontWeight: 700, fontSize: '1.25rem' }}>
          <div style={{ background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-hover))', padding: 8, borderRadius: 12 }}>
            <MapPin size={24} color="#fff" />
          </div>
          GeoSecure
        </div>
        <button className="btn-primary" onClick={handleLaunch}>Launch Demo</button>
      </nav>

      {/* Hero Section */}
      <header style={{ padding: '120px 24px', textAlign: 'center', maxWidth: 900, margin: '0 auto', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 24 }}>
        <div className="badge badge-active" style={{ fontSize: '0.85rem', padding: '6px 16px', borderRadius: 20 }}>First Year Project Demonstration</div>
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, lineHeight: 1.1, margin: 0, background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', color: 'transparent' }}>
          QR-Based Smart Attendance<br/>with Location Validation
        </h1>
        <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', maxWidth: 600, lineHeight: 1.6 }}>
          Eliminate proxy attendance completely. GeoSecure combines dynamic QR codes with live GPS geofencing to ensure students are actually in the classroom.
        </p>
        <div style={{ display: 'flex', gap: 16, marginTop: 16 }}>
          <button className="btn-primary" onClick={handleLaunch} style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
            Start Interactive Demo
          </button>
          <a href="#workflow" className="btn-secondary" style={{ padding: '12px 32px', fontSize: '1.1rem', textDecoration: 'none' }}>
            View Workflow
          </a>
        </div>
      </header>

      {/* Problem & Solution */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 40 }}>
          <div className="glass-card" style={{ borderTop: '4px solid var(--error)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--error)' }}><Eye size={24} /> The Problem</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              Traditional attendance systems (roll call, static QR codes, or RFID) are highly susceptible to proxy attendance. Students can easily share static QR codes or ID cards with friends who are present in the class, completely bypassing the physical presence requirement.
            </p>
          </div>
          <div className="glass-card" style={{ borderTop: '4px solid var(--success)' }}>
            <h3 style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--success)' }}><ShieldCheck size={24} /> The Solution</h3>
            <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
              GeoSecure bridges the gap by demanding <strong>Cryptographic Time</strong> and <strong>Physical Location</strong>. Our dynamic QR codes expire every 10 minutes, and the app utilizes HTML5 Geolocation to monitor the student's physical radius from their scan point for a defined period.
            </p>
          </div>
        </div>
      </section>

      {/* Workflow Visualization */}
      <section id="workflow" style={{ padding: '100px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <h2 style={{ fontSize: '2.5rem', marginBottom: 16 }}>System Workflow</h2>
          <p style={{ color: 'var(--text-secondary)' }}>How the verification pipeline executes in real-time.</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
          <div style={{ position: 'absolute', left: 40, top: 20, bottom: 20, width: 2, background: 'linear-gradient(to bottom, var(--accent-primary), var(--error))', zIndex: -1 }} />
          
          {[
            { icon: <QrCode />, title: '1. Teacher Generates QR', desc: 'A dynamic QR code is projected on the screen with a 10-minute expiry.' },
            { icon: <Smartphone />, title: '2. Student Scans QR', desc: 'Student scans using their mobile device.' },
            { icon: <CheckCircle />, title: '3. Attendance Marked', desc: 'Initial validation succeeds. Student is marked Present.' },
            { icon: <MapPin />, title: '4. GPS Location Captured', desc: 'The exact latitude/longitude of the scan is locked as the Origin point.' },
            { icon: <Clock />, title: '5. Monitoring Starts', desc: 'A 2-minute live tracking window begins in the background.' },
            { icon: <Navigation />, title: '6. Student Leaves Radius', desc: 'The student attempts to leave the 20-meter geofenced classroom area.' },
            { icon: <ShieldAlert />, title: '7. Attendance Revoked', desc: 'System detects movement and instantly downgrades status to Absent.' }
          ].map((step, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '16px 24px', marginLeft: 16, transform: `translateX(${i % 2 === 0 ? 0 : 20}px)` }}>
              <div style={{ background: 'var(--bg-card)', width: 48, height: 48, borderRadius: 24, display: 'flex', alignItems: 'center', justifyContent: 'center', color: i === 6 ? 'var(--error)' : 'var(--accent-primary)', border: '2px solid rgba(255,255,255,0.1)' }}>
                {step.icon}
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px', fontSize: '1.1rem' }}>{step.title}</h4>
                <p style={{ margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem' }}>{step.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Tech Stack & Documentation */}
      <section style={{ padding: '80px 24px', background: 'var(--bg-card)' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto' }}>
          <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 48 }}>Technical Architecture</h2>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 24 }}>
            <div className="glass-card">
              <Zap size={32} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
              <h3>Frontend Framework</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Built entirely on <strong>React 19</strong> and <strong>Vite</strong> for lightning-fast HMR and optimized production bundling. Fully responsive SPA architecture.</p>
            </div>
            <div className="glass-card">
              <Database size={32} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
              <h3>State & Storage</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Utilizes browser <strong>LocalStorage</strong> to simulate database persistence for demonstration purposes, allowing offline-capable demo scenarios.</p>
            </div>
            <div className="glass-card">
              <MapPin size={32} color="var(--accent-primary)" style={{ marginBottom: 16 }} />
              <h3>Geospatial Processing</h3>
              <p style={{ color: 'var(--text-secondary)' }}>Integrates <strong>HTML5 Geolocation API</strong> with custom Haversine mathematical formulas for precise meter-level distance calculation.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Future Scope */}
      <section style={{ padding: '80px 24px', maxWidth: 1000, margin: '0 auto' }}>
        <h2 style={{ fontSize: '2.5rem', textAlign: 'center', marginBottom: 16 }}>Future Scope</h2>
        <p style={{ color: 'var(--text-secondary)', textAlign: 'center', marginBottom: 48 }}>Where this project can go next in a production environment.</p>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {[
            { icon: <Phone />, text: 'Native Mobile App (React Native)' },
            { icon: <Cloud />, text: 'AWS/GCP Cloud Deployment' },
            { icon: <Brain />, text: 'AI-Based Attendance Analytics' },
            { icon: <Eye />, text: 'Face Recognition Auth' },
            { icon: <Server />, text: 'PostgreSQL & Node.js Backend' },
            { icon: <ShieldCheck />, text: 'Bluetooth / NFC Verification' }
          ].map((item, i) => (
            <div key={i} className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: 16 }}>
              <div style={{ color: 'var(--accent-primary)' }}>{item.icon}</div>
              <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.text}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Team Info */}
      <footer style={{ padding: '80px 24px', background: 'var(--bg-card)', textAlign: 'center', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <h3 style={{ color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 2, fontSize: '0.85rem', marginBottom: 24 }}>
          Developed By
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '24px 48px', marginBottom: 32 }}>
          {['Omkar (2GI25ME056)', 'Bhavana (2GI25CS045)', 'Yash (2GI25CV108)', 'Kartik (2GI25EC056)'].map((member, i) => (
            <div key={i} style={{ fontWeight: 600, fontSize: '1.1rem' }}>{member}</div>
          ))}
        </div>
        <p style={{ color: 'var(--text-secondary)' }}>
          KLS Gogte Institute Of Technology, Belagavi, Karnataka
        </p>
      </footer>
    </div>
  );
}

// Icon wrapper for ShieldAlert (since we didn't import it at the top, just redefining it here)
function ShieldAlert({ size = 24, ...props }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <path d="M12 8v4" />
      <path d="M12 16h.01" />
    </svg>
  );
}
