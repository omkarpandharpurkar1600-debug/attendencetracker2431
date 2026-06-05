// ── Supabase-based Storage Layer ──────────────────────────────
// All functions talk directly to Supabase from the browser.
// No separate backend server needed.

import supabase from './supabaseClient';

// ── Helper ────────────────────────────────────────────────────

const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).substr(2);

// ── Auth (hardcoded users, checked locally) ───────────────────

export async function login(username, password) {
  const email = `${username.toLowerCase()}@attendai.local`;
  
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // Fetch their profile
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (profileError || !profile) {
    return { success: false, message: 'Profile not found.' };
  }

  const safeUser = {
    id: profile.id, // using UUID from auth.users
    studentId: profile.student_id, // old STU001
    name: profile.name,
    rollNumber: profile.roll_number,
    username: profile.username,
    role: profile.role,
  };

  setCurrentUser(safeUser);
  return { success: true, user: safeUser };
}

export async function getStudentsList() {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('role', 'student');
  
  if (error) return [];
  return data.map(p => ({
    id: p.id,
    studentId: p.student_id,
    name: p.name,
    rollNumber: p.roll_number,
    username: p.username,
    role: p.role,
  }));
}

// ── Device ID (stays local — unique per browser) ──────────────

const DEVICE_KEY = 'gs_device_id';
const USER_KEY = 'gs_current_user';

export function getDeviceId() {
  try {
    let deviceId = localStorage.getItem(DEVICE_KEY);
    if (!deviceId) {
      deviceId = 'DEV-' + generateId();
      localStorage.setItem(DEVICE_KEY, deviceId);
    }
    return deviceId;
  } catch {
    return 'DEV-' + generateId();
  }
}

// ── Current User (stays local — per browser session) ──────────

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user) {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  } catch {}
}

export function clearCurrentUser() {
  try {
    localStorage.removeItem(USER_KEY);
    supabase.auth.signOut().catch(() => {});
  } catch {}
}

// ── Sessions ──────────────────────────────────────────────────

export async function getSessions() {
  const { data, error } = await supabase
    .from('sessions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getSessions error:', error); return []; }

  return data.map((s) => ({
    id: s.id,
    name: s.name,
    className: s.class_name,
    startTime: s.start_time,
    endTime: s.end_time,
    lat: s.lat,
    lng: s.lng,
    createdBy: s.created_by,
  }));
}

export async function addSession(session) {
  const id = generateId();
  const { data, error } = await supabase.from('sessions').insert([{
    id,
    name: session.name,
    class_name: session.className,
    start_time: session.startTime,
    end_time: session.endTime,
    lat: session.lat,
    lng: session.lng,
    created_by: session.createdBy,
  }]).select();

  if (error) { console.error('addSession error:', error); throw error; }

  return {
    id: data[0].id,
    name: data[0].name,
    className: data[0].class_name,
    startTime: data[0].start_time,
    endTime: data[0].end_time,
    lat: data[0].lat,
    lng: data[0].lng,
    createdBy: data[0].created_by,
  };
}

export async function deleteSession(id) {
  const { error } = await supabase.from('sessions').delete().eq('id', id);
  if (error) console.error('deleteSession error:', error);
}

// ── Attendance ────────────────────────────────────────────────

export async function getAttendance() {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getAttendance error:', error); return []; }

  return data.map((a) => ({
    id: a.id,
    studentId: a.student_id,
    studentName: a.student_name,
    rollNumber: a.roll_number,
    sessionId: a.session_id,
    scanTime: a.scan_time,
    lat: a.lat,
    lng: a.lng,
    distance: a.distance,
    status: a.status,
    qrToken: a.qr_token,
    sessionName: a.session_name,
    monitoringStatus: a.monitoring_status,
    monitoringEndTime: a.monitoring_end_time ? new Date(a.monitoring_end_time).getTime() : null,
    originLat: a.origin_lat,
    originLng: a.origin_lng,
    currentDistance: a.current_distance,
    currentLat: a.current_lat,
    currentLng: a.current_lng,
    riskLevel: a.risk_level,
  }));
}

export async function addAttendance(record) {
  const id = generateId();
  const { data, error } = await supabase.from('attendance').insert([{
    id,
    student_id: record.studentId,
    student_name: record.studentName,
    roll_number: record.rollNumber,
    session_id: record.sessionId,
    scan_time: record.scanTime,
    lat: record.lat,
    lng: record.lng,
    distance: record.distance,
    status: record.status || 'present',
    device_id: record.deviceId,
    qr_token: record.qrToken,
    session_name: record.sessionName,
    monitoring_status: record.monitoringStatus || 'Monitoring',
    monitoring_end_time: record.monitoringEndTime ? new Date(record.monitoringEndTime).toISOString() : null,
    origin_lat: record.originLat,
    origin_lng: record.originLng,
    current_distance: record.currentDistance,
    current_lat: record.currentLat,
    current_lng: record.currentLng,
    risk_level: record.riskLevel || 'Low',
  }]).select();

  if (error) { console.error('addAttendance error:', error); throw error; }

  return {
    id: data[0].id,
    studentId: data[0].student_id,
    studentName: data[0].student_name,
    rollNumber: data[0].roll_number,
    sessionId: data[0].session_id,
    scanTime: data[0].scan_time,
    lat: data[0].lat,
    lng: data[0].lng,
    distance: data[0].distance,
    status: data[0].status,
    deviceId: data[0].device_id,
    qrToken: data[0].qr_token,
    sessionName: data[0].session_name,
    monitoringStatus: data[0].monitoring_status,
    monitoringEndTime: data[0].monitoring_end_time ? new Date(data[0].monitoring_end_time).getTime() : null,
    originLat: data[0].origin_lat,
    originLng: data[0].origin_lng,
    currentDistance: data[0].current_distance,
    currentLat: data[0].current_lat,
    currentLng: data[0].current_lng,
    riskLevel: data[0].risk_level,
  };
}

export async function updateAttendance(id, updates) {
  const fieldMap = {
    status: 'status',
    distance: 'distance',
    monitoringStatus: 'monitoring_status',
    riskLevel: 'risk_level',
    currentDistance: 'current_distance',
    currentLat: 'current_lat',
    currentLng: 'current_lng',
    monitoringEndTime: 'monitoring_end_time',
    originLat: 'origin_lat',
    originLng: 'origin_lng',
    sessionName: 'session_name',
  };

  const dbUpdates = {};
  for (const [jsKey, dbKey] of Object.entries(fieldMap)) {
    if (updates[jsKey] !== undefined) {
      if (jsKey === 'monitoringEndTime' && updates[jsKey]) {
        dbUpdates[dbKey] = new Date(updates[jsKey]).toISOString();
      } else {
        dbUpdates[dbKey] = updates[jsKey];
      }
    }
  }

  if (Object.keys(dbUpdates).length === 0) return;

  const { error } = await supabase
    .from('attendance')
    .update(dbUpdates)
    .eq('id', id);

  if (error) console.error('updateAttendance error:', error);
}

function mapAttendanceRow(a) {
  return {
    id: a.id,
    studentId: a.student_id,
    studentName: a.student_name,
    rollNumber: a.roll_number,
    sessionId: a.session_id,
    sessionName: a.session_name,
    scanTime: a.scan_time,
    lat: a.lat,
    lng: a.lng,
    distance: a.distance,
    status: a.status,
    deviceId: a.device_id,
    qrToken: a.qr_token,
    monitoringStatus: a.monitoring_status,
    monitoringEndTime: a.monitoring_end_time ? new Date(a.monitoring_end_time).getTime() : null,
    originLat: a.origin_lat,
    originLng: a.origin_lng,
    currentDistance: a.current_distance,
    currentLat: a.current_lat,
    currentLng: a.current_lng,
    riskLevel: a.risk_level,
  };
}

export async function getAttendanceForStudent(studentId) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('student_id', studentId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getAttendanceForStudent error:', error); return []; }
  return data.map(mapAttendanceRow);
}

export async function getAttendanceForSession(sessionId) {
  const { data, error } = await supabase
    .from('attendance')
    .select('*')
    .eq('session_id', sessionId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getAttendanceForSession error:', error); return []; }
  return data.map(mapAttendanceRow);
}

export async function hasMarkedAttendance(studentId, sessionId) {
  const { data, error } = await supabase
    .from('attendance')
    .select('id')
    .eq('student_id', studentId)
    .eq('session_id', sessionId)
    .limit(1);

  if (error) { console.error('hasMarkedAttendance error:', error); return false; }
  return data.length > 0;
}

// ── Location Logs ─────────────────────────────────────────────

export async function getLocationLogs() {
  const { data, error } = await supabase
    .from('location_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) { console.error('getLocationLogs error:', error); return []; }

  return data.map((l) => ({
    id: l.id,
    studentId: l.student_id,
    attendanceId: l.attendance_id,
    sessionId: l.session_id,
    lat: l.lat,
    lng: l.lng,
    distance: l.distance,
    timestamp: l.timestamp,
    status: l.status,
    event: l.event,
  }));
}

export async function addLocationLog(log) {
  const id = generateId();
  const { error } = await supabase.from('location_logs').insert([{
    id,
    student_id: log.studentId,
    attendance_id: log.attendanceId,
    session_id: log.sessionId,
    lat: log.lat,
    lng: log.lng,
    distance: log.distance,
    timestamp: log.timestamp,
    status: log.status,
    event: log.event,
  }]);

  if (error) console.error('addLocationLog error:', error);
}

export async function getLogsForStudent(studentId) {
  const all = await getLocationLogs();
  return all.filter((l) => l.studentId === studentId);
}

export async function getLogsForAttendance(attendanceId) {
  const { data, error } = await supabase
    .from('location_logs')
    .select('*')
    .eq('attendance_id', attendanceId)
    .order('created_at', { ascending: false });

  if (error) { console.error('getLogsForAttendance error:', error); return []; }
  return data.map((l) => ({
    id: l.id,
    studentId: l.student_id,
    attendanceId: l.attendance_id,
    sessionId: l.session_id,
    lat: l.lat,
    lng: l.lng,
    distance: l.distance,
    timestamp: l.timestamp,
    status: l.status,
    event: l.event,
  }));
}

// ── Utilities ─────────────────────────────────────────────────

export function clearAll() {
  try {
    localStorage.removeItem(DEVICE_KEY);
    localStorage.removeItem(USER_KEY);
    supabase.auth.signOut().catch(() => {});
  } catch {}
}

export async function resetAllData() {
  await supabase.from('sessions').delete().neq('id', '0'); // Hack to delete all since no id is '0'
  clearAll();
}

// ── Default export ────────────────────────────────────────────

const storage = {
  login,
  getStudentsList,
  getDeviceId,
  getSessions,
  addSession,
  deleteSession,
  getAttendance,
  addAttendance,
  updateAttendance,
  getAttendanceForStudent,
  getAttendanceForSession,
  hasMarkedAttendance,
  getLocationLogs,
  addLocationLog,
  getLogsForStudent,
  getLogsForAttendance,
  getCurrentUser,
  setCurrentUser,
  clearCurrentUser,
  clearAll,
  resetAllData,
};

export default storage;
