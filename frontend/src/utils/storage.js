const KEYS = {
  SESSIONS: 'gs_sessions',
  ATTENDANCE: 'gs_attendance',
  LOCATION_LOGS: 'gs_location_logs',
  CURRENT_USER: 'gs_current_user',
  DEVICE_ID: 'gs_device_id',
};

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

export function getDeviceId() {
  try {
    let deviceId = localStorage.getItem(KEYS.DEVICE_ID);
    if (!deviceId) {
      deviceId = 'DEV-' + generateId();
      localStorage.setItem(KEYS.DEVICE_ID, deviceId);
    }
    return deviceId;
  } catch {
    return 'DEV-' + generateId();
  }
}

// ── Core helpers ──────────────────────────────────────────────

export function getItem(key) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return null;
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function setItem(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('LocalStorage error:', err);
  }
}

// ── Sessions ──────────────────────────────────────────────────

export function getSessions() {
  return getItem(KEYS.SESSIONS) || [];
}

export function saveSessions(sessions) {
  setItem(KEYS.SESSIONS, sessions);
}

export function addSession(session) {
  const sessions = getSessions();
  const newSession = { ...session, id: session.id || generateId() };
  sessions.push(newSession);
  saveSessions(sessions);
  return newSession;
}

export function updateSession(id, updates) {
  const sessions = getSessions();
  const idx = sessions.findIndex((s) => s.id === id);
  if (idx !== -1) {
    sessions[idx] = { ...sessions[idx], ...updates };
    saveSessions(sessions);
  }
  return sessions[idx] || null;
}

export function deleteSession(id) {
  const sessions = getSessions().filter((s) => s.id !== id);
  saveSessions(sessions);
}

// ── Attendance ────────────────────────────────────────────────

export function getAttendance() {
  return getItem(KEYS.ATTENDANCE) || [];
}

export function saveAttendance(records) {
  setItem(KEYS.ATTENDANCE, records);
}

export function addAttendance(record) {
  const records = getAttendance();
  const newRecord = { ...record, id: record.id || generateId() };
  records.push(newRecord);
  saveAttendance(records);
  return newRecord;
}

export function updateAttendance(id, updates) {
  const records = getAttendance();
  const idx = records.findIndex((r) => r.id === id);
  if (idx !== -1) {
    records[idx] = { ...records[idx], ...updates };
    saveAttendance(records);
  }
  return records[idx] || null;
}

export function getAttendanceForStudent(studentId) {
  return getAttendance().filter((r) => r.studentId === studentId);
}

export function getAttendanceById(id) {
  return getAttendance().find((r) => r.id === id);
}

export function getAttendanceForSession(sessionId) {
  return getAttendance().filter((r) => r.sessionId === sessionId);
}

export function hasMarkedAttendance(studentId, sessionId) {
  return getAttendance().some(
    (r) => r.studentId === studentId && r.sessionId === sessionId
  );
}

// ── Location Logs ─────────────────────────────────────────────

export function getLocationLogs() {
  return getItem(KEYS.LOCATION_LOGS) || [];
}

export function addLocationLog(log) {
  const logs = getLocationLogs();
  logs.push({ ...log, id: log.id || generateId() });
  setItem(KEYS.LOCATION_LOGS, logs);
}

export function getLogsForStudent(studentId) {
  return getLocationLogs().filter((l) => l.studentId === studentId);
}

// ── Current User ──────────────────────────────────────────────

export function getCurrentUser() {
  return getItem(KEYS.CURRENT_USER);
}

export function setCurrentUser(user) {
  setItem(KEYS.CURRENT_USER, user);
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(KEYS.CURRENT_USER);
  } catch {}
}

// ── Utilities ─────────────────────────────────────────────────

export function clearAll() {
  try {
    Object.values(KEYS).forEach((key) => localStorage.removeItem(key));
  } catch {}
}

// ── Default export ────────────────────────────────────────────

const storage = {
  getItem,
  setItem,
  getSessions,
  saveSessions,
  addSession,
  updateSession,
  deleteSession,
  getAttendance,
  saveAttendance,
  addAttendance,
  updateAttendance,
  getAttendanceForStudent,
  getAttendanceForSession,
  hasMarkedAttendance,
  getLocationLogs,
  addLocationLog,
  getLogsForStudent,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  clearAll,
  getDeviceId,
};

export default storage;
