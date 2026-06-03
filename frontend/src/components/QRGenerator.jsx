import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { X, Download, Maximize2, MapPin } from 'lucide-react';

export default function QRGenerator({ session, onClose }) {
  const [fullscreen, setFullscreen] = useState(false);

  const qrValue = JSON.stringify({
    sessionId: session.id,
    qrToken: session.qrToken,
    lat: session.lat,
    lng: session.lng,
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
      <div className="qr-container fade-in" style={{ padding: 48, background: 'var(--background)', border: '1px solid var(--border)' }}>
        <div className="modal-header" style={{ marginBottom: 48 }}>
          <h3 className="text-3xl tracking-tight" style={{ margin: 0 }}>SESSION QR</h3>
          <button className="btn-ghost" onClick={onClose}>
            CLOSE <X size={18} />
          </button>
        </div>

        <div style={{ marginBottom: 48 }}>
          <h4 className="text-4xl" style={{ marginBottom: 8 }}>{session.name}</h4>
          <p className="text-mono text-muted uppercase tracking-wide" style={{ marginBottom: 16 }}>
            {session.className}
          </p>
          <span className={`badge ${isActive ? 'badge-success' : 'badge-error'}`}>
            {isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
        </div>

        <div
          className="qr-code-area"
          style={{
            background: '#ffffff',
            padding: 32,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            margin: '0 auto 32px',
            maxWidth: 320,
            border: '1px solid var(--border)',
          }}
        >
          <QRCodeSVG value={qrValue} size={256} level="H" includeMargin />
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 12,
            marginBottom: 48,
            color: 'var(--muted-foreground)',
          }}
          className="text-mono uppercase"
        >
          <MapPin size={16} />
          <span>
            {session.lat.toFixed(4)}, {session.lng.toFixed(4)}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <button className="btn-secondary" onClick={downloadQR}>
            <Download size={16} /> DOWNLOAD
          </button>
          <button className="btn-secondary" onClick={() => setFullscreen(true)}>
            <Maximize2 size={16} /> FULLSCREEN
          </button>
        </div>
      </div>

      {fullscreen && (
        <div
          className="qr-fullscreen"
          onClick={() => setFullscreen(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'var(--background)',
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
              padding: 64,
              border: '1px solid var(--border)'
            }}
          >
            <QRCodeSVG value={qrValue} size={480} level="H" includeMargin />
          </div>
          <p className="text-mono text-muted uppercase tracking-wide" style={{ marginTop: 48 }}>
            CLICK ANYWHERE TO CLOSE
          </p>
        </div>
      )}
    </>
  );
}
