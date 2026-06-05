import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { DEMO_STUDENTS, GEOFENCE_RADIUS_METERS, MONITORING_DURATION_MS } from '../data/students';
import * as storage from '../utils/storage';
import { calculateDistance } from '../utils/geo';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const navigate = useNavigate();

  const refreshData = useCallback(() => {
    setSessions(storage.getSessions());
    setAttendance(storage.getAttendance());
  }, []);

  useEffect(() => {
    const savedUser = storage.getCurrentUser();
    if (savedUser) {
      setCurrentUser(savedUser);
    }
    refreshData();
  }, [refreshData]);

  const login = useCallback((studentId) => {
    let user;
    if (studentId === 'admin') {
      user = { id: 'admin', name: 'Admin', role: 'admin' };
    } else {
      const student = DEMO_STUDENTS.find((s) => s.id === studentId);
      if (!student) return;
      user = { ...student, role: 'student' };
    }
    setCurrentUser(user);
    storage.setCurrentUser(user);
    navigate(user.role === 'admin' ? '/admin' : '/student');
  }, [navigate]);

  const logout = useCallback(() => {
    setCurrentUser(null);
    storage.clearCurrentUser();
    navigate('/login');
  }, [navigate]);

  const createSession = useCallback(({ name, className, startTime, endTime, lat, lng }) => {
    const id = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const qrToken = Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
    const qrData = JSON.stringify({ sessionId: id, qrToken, lat, lng });

    const session = {
      id,
      name,
      className,
      startTime,
      endTime,
      lat,
      lng,
      qrToken,
      qrData,
      createdAt: new Date().toISOString(),
    };

    storage.addSession(session);
    refreshData();
    return session;
  }, [refreshData]);

  const markAttendance = useCallback((qrData, studentLocation) => {
    let parsed;
    try {
      parsed = JSON.parse(qrData);
    } catch {
      return { success: false, message: 'Invalid QR code data.' };
    }

    const { sessionId, qrToken, lat, lng, timestamp } = parsed;

    if (timestamp && Date.now() - timestamp > 600000) {
      return { success: false, message: 'QR Code has expired. Please scan the new one.' };
    }

    const currentSessions = storage.getSessions();
    const session = currentSessions.find((s) => s.id === sessionId);
    if (!session) {
      return { success: false, message: 'Session not found.' };
    }

    if (session.qrToken !== qrToken) {
      return { success: false, message: 'Invalid QR token.' };
    }

    const now = new Date();
    const start = new Date(session.startTime);
    const end = new Date(session.endTime);
    if (now < start || now > end) {
      return { success: false, message: 'Session is not currently active.' };
    }

    if (storage.hasMarkedAttendance(currentUser.id, sessionId)) {
      return { success: false, message: 'Attendance Already Recorded' };
    }

    const distance = calculateDistance(
      studentLocation.lat,
      studentLocation.lng,
      lat,
      lng
    );

    const status = distance <= GEOFENCE_RADIUS_METERS ? 'Present' : 'Absent';

    const record = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      studentId: currentUser.id,
      studentName: currentUser.name,
      rollNumber: currentUser.rollNumber,
      sessionId,
      sessionName: session.name,
      scanTime: new Date().toISOString(),
      status,
      monitoringStatus: 'Monitoring',
      monitoringEndTime: Date.now() + MONITORING_DURATION_MS,
      originLat: studentLocation.lat,
      originLng: studentLocation.lng,
      currentLat: studentLocation.lat,
      currentLng: studentLocation.lng,
      currentDistance: distance,
      simulationActive: false,
      deviceId: storage.getDeviceId(),
      browserInfo: navigator.userAgent,
      riskLevel: 'Low',
    };

    storage.addAttendance(record);
    
    storage.addLocationLog({
      studentId: currentUser.id,
      sessionId,
      attendanceId: record.id,
      lat: studentLocation.lat,
      lng: studentLocation.lng,
      distance,
      status,
      timestamp: record.scanTime,
      event: 'Attendance Marked',
    });
    
    refreshData();
    return { success: true, record };
  }, [currentUser, refreshData]);

  const updateAttendanceStatus = useCallback((attendanceId, newStatus) => {
    storage.updateAttendance(attendanceId, newStatus);
    refreshData();
  }, [refreshData]);

  const simulateMovement = useCallback((attendanceId, latOffset, lngOffset) => {
    const record = storage.getAttendanceById(attendanceId);
    if (!record) return;

    const newLat = (record.currentLat || record.originLat) + latOffset;
    const newLng = (record.currentLng || record.originLng) + lngOffset;

    const distance = calculateDistance(newLat, newLng, record.originLat, record.originLng);
    const newStatus = distance <= GEOFENCE_RADIUS_METERS ? 'Present' : 'Absent';

    storage.addLocationLog({
      studentId: record.studentId,
      sessionId: record.sessionId,
      attendanceId: record.id,
      lat: newLat,
      lng: newLng,
      distance,
      status: newStatus,
      timestamp: new Date().toISOString(),
      isSimulation: true,
    });

    const updates = {
      currentLat: newLat,
      currentLng: newLng,
      currentDistance: distance,
      status: newStatus,
      simulationActive: true,
    };
    storage.updateAttendance(attendanceId, updates);
    refreshData();
  }, [refreshData]);

  const value = {
    currentUser,
    sessions,
    attendance,
    login,
    logout,
    refreshData,
    createSession,
    markAttendance,
    updateAttendanceStatus,
    simulateMovement,
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
