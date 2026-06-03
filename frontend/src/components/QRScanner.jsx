import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { getCurrentPosition } from '../utils/geo';

export default function QRScanner({ onSuccess }) {
  const { markAttendance, currentUser } = useApp();

  const [scanning, setScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const scannerRef = useRef(null);
  const isProcessingRef = useRef(false);
  const qrDataRef = useRef(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (scannerRef.current) {
        scannerRef.current
          .stop()
          .then(() => scannerRef.current.clear())
          .catch(() => {});
      }
    };
  }, []);

  const startScanner = () => {
    const scanner = new Html5Qrcode('qr-reader');
    scannerRef.current = scanner;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        onScanSuccess,
        () => {} // error callback — ignored
      )
      .then(() => {
        setScanning(true);
      })
      .catch((err) => {
        toast.error('Could not start camera: ' + err.message);
      });
  };

  const stopScanner = () => {
    if (scannerRef.current) {
      scannerRef.current
        .stop()
        .then(() => scannerRef.current.clear())
        .catch(() => {});
    }
    setScanning(false);
  };

  const onScanSuccess = async (decodedText) => {
    if (isProcessingRef.current) return;
    isProcessingRef.current = true;
    setProcessing(true);

    // Stop scanner
    try {
      await scannerRef.current.stop();
      scannerRef.current.clear();
    } catch {
      // ignore stop errors
    }
    setScanning(false);

    // Parse QR data
    let parsed;
    try {
      parsed = JSON.parse(decodedText);
      qrDataRef.current = parsed;
    } catch {
      toast.error('Invalid QR code format');
      isProcessingRef.current = false;
      setProcessing(false);
      return;
    }

    // Get location
    let position;
    try {
      position = await getCurrentPosition();
    } catch {
      toast.error('Could not get location');
      isProcessingRef.current = false;
      setProcessing(false);
      return;
    }

    // Mark attendance
    const attendanceResult = markAttendance(decodedText, {
      lat: position.lat,
      lng: position.lng,
    });

    if (attendanceResult.success) {
      setResult(attendanceResult);
      toast.success('Attendance marked successfully!');
    } else {
      toast.error(attendanceResult.message);
      isProcessingRef.current = false;
    }

    setProcessing(false);
  };

  const handleDone = () => {
    onSuccess({
      record: result.record,
      sessionId: qrDataRef.current.sessionId,
      sessionLat: qrDataRef.current.lat,
      sessionLng: qrDataRef.current.lng,
    });
  };

  return (
    <div className="fade-in">
      {!result ? (
        <>
          <div className="qr-reader-wrapper" style={{ background: 'transparent', border: '1px solid var(--border)' }}>
            <div id="qr-reader" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, marginTop: 40 }}>
            {!scanning && !processing && (
              <button className="btn-primary" onClick={startScanner}>
                START SCANNER <Camera size={16} />
              </button>
            )}
            {scanning && (
              <button className="btn-secondary" onClick={stopScanner}>
                STOP SCANNER <X size={16} />
              </button>
            )}
            {processing && (
              <div className="text-mono text-muted uppercase tracking-wide flex-center" style={{ gap: 8 }}>
                <span className="spinner" style={{ width: 16, height: 16, border: '2px solid var(--border)', borderTopColor: 'var(--foreground)', borderRadius: '50%', animation: 'spin 1s linear infinite' }} />
                PROCESSING LOCATION...
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="fade-in" style={{ padding: '40px 0' }}>
          <h3 className="text-6xl text-accent" style={{ marginBottom: 16 }}>
            SUCCESS
          </h3>
          <p className="text-xl text-muted" style={{ marginBottom: 48 }}>
            Your attendance has been cryptographically recorded.
          </p>
          
          <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '24px 0', marginBottom: 40 }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px 24px', alignItems: 'center' }}>
              <span className="text-mono text-sm text-muted uppercase">Student</span>
              <span className="text-xl font-display">{result.record.studentName}</span>
              
              <span className="text-mono text-sm text-muted uppercase">Roll Number</span>
              <span className="text-xl text-mono">{result.record.rollNumber}</span>
              
              <span className="text-mono text-sm text-muted uppercase">Session</span>
              <span className="text-xl font-display">{result.record.sessionName}</span>
              
              <span className="text-mono text-sm text-muted uppercase">Timestamp</span>
              <span className="text-xl text-mono">
                {new Date(result.record.scanTime).toLocaleString()}
              </span>
              
              <span className="text-mono text-sm text-muted uppercase">Status</span>
              <span>
                <span className={`badge ${result.record.status === 'Present' ? 'badge-success' : 'badge-error'}`}>
                  {result.record.status}
                </span>
              </span>
              
              <span className="text-mono text-sm text-muted uppercase">Distance</span>
              <span className="text-xl text-mono">{Math.round(result.record.distance)}M</span>
            </div>
          </div>

          <button className="btn-primary" onClick={handleDone}>
            CONTINUE
          </button>
        </div>
      )}
    </div>
  );
}
