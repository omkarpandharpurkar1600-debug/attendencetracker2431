import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Maximize2, MapPin, Clock } from 'lucide-react';

export default function QRGenerator({ session, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);
  const [qrTimestamp, setQrTimestamp] = useState(Date.now());
  const [timeLeft, setTimeLeft] = useState(600);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setQrTimestamp(Date.now());
          return 600;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const qrValue = JSON.stringify({
    sessionId: session.id,
    qrToken: session.qrToken,
    lat: session.lat,
    lng: session.lng,
    timestamp: qrTimestamp,
  });

  const isActive =
    new Date() >= new Date(session.startTime) && new Date() <= new Date(session.endTime);

  const downloadQR = () => {
    const svgElement = document.querySelector('.qr-code-area svg');
    if (!svgElement) return;

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);
    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 512;
      canvas.height = 512;
      const ctx = canvas.getContext('2d');
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, 512, 512);
      ctx.drawImage(img, 0, 0, 512, 512);

      const link = document.createElement('a');
      link.download = `qr-${session.name.replace(/\s+/g, '-')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      URL.revokeObjectURL(url);
    };
    img.src = url;
  };

  return (
    <>
      <div className="qr-container glass-card fade-in">
        <div className="modal-header">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Session QR Code</h3>
          <button className="btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ textAlign: 'center', marginBottom: 16 }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, marginBottom: 4 }}>{session.name}</h4>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
            {session.className}
          </p>
          <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
            {isActive ? 'Active' : 'Inactive'}
          </span>
          <div style={{ marginTop: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, color: timeLeft < 10 ? 'var(--error)' : 'var(--text-secondary)', fontSize: '0.85rem', fontWeight: 500 }}>
            <Clock size={14} /> 
            QR Expires in: {timeLeft}s
          </div>
        </div>

        <div
          className="qr-code-area"
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 24,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto',
            maxWidth: 280,
          }}
        >
          <QRCodeSVG value={qrValue} size={220} level="H" includeMargin />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 16,
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
          }}
        >
          <MapPin size={14} />
          <span>
            {session.lat.toFixed(4)}, {session.lng.toFixed(4)}
          </span>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 20, justifyContent: 'center' }}>
          <button className="btn-secondary" onClick={downloadQR}>
            <Download size={16} /> Download
          </button>
          <button className="btn-secondary" onClick={() => setFullscreen(true)}>
            <Maximize2 size={16} /> Fullscreen
          </button>
        </div>
      </div>

      {fullscreen && (
        <div
          className="qr-fullscreen"
          onClick={() => setFullscreen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.85)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            cursor: 'pointer',
          }}
        >
          <div
            style={{
              background: '#ffffff',
              borderRadius: 24,
              padding: 40,
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <QRCodeSVG value={qrValue} size={360} level="H" includeMargin />
          </div>
          <p
            style={{
              color: 'rgba(255,255,255,0.6)',
              marginTop: 24,
              fontSize: '0.9rem',
            }}
          >
            Tap anywhere to close
          </p>
        </div>
      )}
    </>
  );
}
