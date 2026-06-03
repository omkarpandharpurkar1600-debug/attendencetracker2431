import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { watchPosition, calculateDistance } from '../utils/geo';
import * as storage from '../utils/storage';
import { GEOFENCE_RADIUS_METERS } from '../data/students';
import { useApp } from '../context/AppContext';

export default function LocationTracker({
  sessionId,
  sessionLat,
  sessionLng,
  attendanceId,
  onStatusChange,
}) {
  const { currentUser, updateAttendanceStatus } = useApp();
  const lastStatusRef = useRef(null);

  useEffect(() => {
    const cleanup = watchPosition((position) => {
      const distance = calculateDistance(
        position.lat,
        position.lng,
        sessionLat,
        sessionLng
      );

      const newStatus = distance <= GEOFENCE_RADIUS_METERS ? 'Present' : 'Absent';

      // Log location to storage
      storage.addLocationLog({
        studentId: currentUser.id,
        sessionId,
        attendanceId,
        lat: position.lat,
        lng: position.lng,
        distance,
        status: newStatus,
        timestamp: new Date().toISOString(),
      });

      // Update attendance status if changed
      if (lastStatusRef.current !== null && lastStatusRef.current !== newStatus) {
        updateAttendanceStatus(attendanceId, { status: newStatus, distance });

        if (newStatus === 'Absent') {
          toast.error(
            `You moved outside the geofence (${Math.round(distance)}m away). Status changed to Absent.`,
            { duration: 5000 }
          );
        } else {
          toast.success(
            `You are back within the geofence (${Math.round(distance)}m). Status changed to Present.`,
            { duration: 5000 }
          );
        }
      }

      lastStatusRef.current = newStatus;

      if (onStatusChange) {
        onStatusChange(newStatus, distance);
      }
    }, null, 15000);

    return cleanup;
  }, [
    sessionId,
    sessionLat,
    sessionLng,
    attendanceId,
    currentUser,
    updateAttendanceStatus,
    onStatusChange,
  ]);

  // Invisible component
  return null;
}
