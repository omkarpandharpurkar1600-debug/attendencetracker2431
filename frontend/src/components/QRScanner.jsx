import React, { useState, useRef, useEffect } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Camera, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { getCurrentPosition } from '../utils/geo';
import { INITIAL_SCAN_RADIUS_METERS } from '../data/students';

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
        try {
          // If scanning, stop it safely. We don't need clear() because React unmounts the DOM node.
          scannerRef.current.stop().catch(() => {});
        } catch (err) {}
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
        if (err.name === 'NotAllowedError' || err.message?.includes('Permission denied')) {
          toast.error('Camera access denied. Please grant permission in your browser settings to scan the QR code.', { duration: 5000 });
        } else {
          toast.error('Could not start camera: ' + (err.message || 'Unknown error'));
        }
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
    const attendanceResult = await markAttendance(decodedText, {
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
          <div className="qr-reader-wrapper">
            <div id="qr-reader" style={{ width: '100%' }} />
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
            {!scanning && !processing && (
              <button className="btn-primary" onClick={startScanner}>
                <Camera size={18} /> Start Scanner
              </button>
            )}
            {scanning && (
              <button className="btn-secondary" onClick={stopScanner}>
                <X size={18} /> Stop Scanner
              </button>
            )}
            {processing && (
              <div className="loader-center">
                <div className="spinner" />
              </div>
            )}
          </div>
        </>
      ) : (
        <div className="success-animation">
          <div className="success-checkmark">
            <CheckCircle size={32} />
          </div>
          <h3 style={{ fontSize: '1.3rem', fontWeight: 600, marginBottom: 4 }}>
            Attendance Marked!
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            Your attendance has been recorded
          </p>
          <div className="success-details">
            <div className="detail-row">
              <span className="detail-label">Student</span>
              <span className="detail-value">{result.record.studentName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Roll Number</span>
              <span className="detail-value">{result.record.rollNumber}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Session</span>
              <span className="detail-value">{result.record.sessionName}</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Date &amp; Time</span>
              <span className="detail-value">
                {new Date(result.record.scanTime).toLocaleString()}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Status</span>
              <span
                className={`badge ${
                  result.record.status === 'Present' ? 'badge-success' : 'badge-error'
                }`}
              >
                {result.record.status}
              </span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Range</span>
              <span className={`badge ${(result.record.currentDistance ?? 0) <= INITIAL_SCAN_RADIUS_METERS ? 'badge-success' : 'badge-error'}`}>
                {(result.record.currentDistance ?? 0) <= INITIAL_SCAN_RADIUS_METERS ? 'Within Range' : 'Out of Range'}
              </span>
            </div>
          </div>
          <button
            className="btn-primary w-full"
            style={{ marginTop: 20 }}
            onClick={handleDone}
          >
            Done
          </button>
        </div>
      )}
    </div>
  );
}
