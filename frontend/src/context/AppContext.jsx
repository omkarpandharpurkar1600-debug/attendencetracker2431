import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { GEOFENCE_RADIUS_METERS, INITIAL_SCAN_RADIUS_METERS, MONITORING_DURATION_MS } from '../data/students';
import * as storage from '../utils/storage';
import { calculateDistance } from '../utils/geo';
import supabase from '../utils/supabaseClient';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const refreshData = useCallback(async () => {
    try {
      const [sessionsData, attendanceData] = await Promise.all([
        storage.getSessions(),
        storage.getAttendance(),
      ]);

      // Auto-complete any monitoring records whose timer has expired
      const now = Date.now();
      const staleRecords = attendanceData.filter(
        (a) => a.monitoringStatus === 'Monitoring' && a.monitoringEndTime && now > a.monitoringEndTime
      );
      for (const record of staleRecords) {
        await storage.updateAttendance(record.id, { monitoringStatus: 'Completed' });
        record.monitoringStatus = 'Completed';
      }

      setSessions(sessionsData);
      setAttendance(attendanceData);
    } catch (err) {
      console.error('Failed to refresh data:', err);
    }
  }, []);

  useEffect(() => {
    async function init() {
      const savedUser = storage.getCurrentUser();
      if (savedUser) {
        // Verify the Supabase auth session is still valid
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          setCurrentUser(savedUser);
        } else {
          // JWT expired — clear stale local data
          storage.clearCurrentUser();
        }
      }
      await refreshData();
      setLoading(false);
    }
    init();
  }, [refreshData]);

  // Auto-refresh every 10 seconds so admin sees live updates
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 10000);
    return () => clearInterval(interval);
  }, [refreshData]);

  const login = useCallback(async (username, password) => {
    const result = await storage.login(username, password);
    if (result.success) {
      setCurrentUser(result.user);
      storage.setCurrentUser(result.user);
      navigate(result.user.role === 'admin' ? '/admin' : '/student');
      return { success: true };
    }
    return { success: false, message: result.message || 'Login failed.' };
  }, [navigate]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    storage.clearCurrentUser();
    navigate('/login');
  }, [navigate]);

  const createSession = useCallback(async ({ name, className, startTime, endTime, lat, lng }) => {
    const qrToken = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);

    const session = await storage.addSession({
      name,
      className,
      startTime,
      endTime,
      lat,
      lng,
      createdBy: currentUser?.id || 'admin',
      qrToken,
    });

    session.qrData = JSON.stringify({ sessionId: session.id, qrToken, lat, lng });

    await refreshData();
    return session;
  }, [currentUser, refreshData]);

  const markAttendance = useCallback(async (qrData, studentLocation) => {
    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return { success: false, message: 'Invalid QR code data.' };
    }

    const { sessionId, qrToken, lat, lng, timestamp } = parsed;

    if (timestamp && Date.now() - timestamp > 120000) {
      return { success: false, message: 'QR Code has expired. Please scan the new one.' };
    }

    // Fetch fresh sessions from backend
    const currentSessions = await storage.getSessions();
    const session = currentSessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Session not found.' };
    }

    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    if (now < start || now > end) {
      return { success: false, message: 'Session is not currently active.' };
    }

    const alreadyMarked = await storage.hasMarkedAttendance(currentUser.studentId, sessionId);
    if (alreadyMarked) {
      return { success: false, message: 'Attendance Already Recorded' };
    }

    const distance = calculateDistance(
      studentLocation.lat,
      studentLocation.lng,
      lat,
      lng
    );

    // Initial Teacher-to-Student scan logic
    // Add student's GPS inaccuracy radius to the limit, plus an extra 500m buffer for poor laptop IP geolocation
    const allowedRadius = INITIAL_SCAN_RADIUS_METERS + (studentLocation.accuracy || 0) + 500;
    const status = distance <= allowedRadius ? 'Present' : 'Absent';

    // If Absent on initial scan, skip monitoring entirely — they are not in the classroom
    const monitoringStatus = status === 'Absent' ? 'Completed' : 'Monitoring';

    const record = await storage.addAttendance({
      studentId: currentUser.studentId,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber,
      sessionId,
      sessionName: session.name,
      scanTime: new Date().toISOString(),
      lat: studentLocation.lat,
      lng: studentLocation.lng,
      distance,
      status,
      deviceId: storage.getDeviceId(),
      qrToken,
      monitoringStatus,
      monitoringEndTime: status === 'Absent' ? null : new Date(Date.now() + MONITORING_DURATION_MS).toISOString(),
      // Because laptop IP geolocation is inaccurate, we must anchor the 20m live geofence 
      // to the student's high-precision phone coordinates at the exact moment they scanned.
      originLat: studentLocation.lat,
      originLng: studentLocation.lng,
      currentDistance: distance,
      currentLat: studentLocation.lat,
      currentLng: studentLocation.lng,
      riskLevel: status === 'Absent' ? 'High' : 'Low',
    });

    await storage.addLocationLog({
      studentId: currentUser.studentId,
      sessionId,
      attendanceId: record.id,
      lat: studentLocation.lat,
      lng: studentLocation.lng,
      distance,
      timestamp: new Date().toISOString(),
    });

    await refreshData();
    return { success: true, record };
  }, [currentUser, refreshData]);

  const updateAttendanceStatus = useCallback(async (attendanceId, updates) => {
    await storage.updateAttendance(attendanceId, updates);
    await refreshData();
  }, [refreshData]);

  const value = {
    currentUser,
    sessions,
    attendance,
    loading,
    login,
    logout,
    refreshData,
    createSession,
    markAttendance,
    updateAttendanceStatus,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
