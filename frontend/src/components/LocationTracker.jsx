import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { watchPosition, calculateDistance } from '../utils/geo';
import * as storage from '../utils/storage';
import { GEOFENCE_RADIUS_METERS } from '../data/students';
import { useApp } from '../context/AppContext';

export default function LocationTracker({
  sessionId,
  originLat,
  originLng,
  monitoringEndTime,
  attendanceId,
  simulationActive,
  onStatusChange,
  onComplete,
}) {
  const { currentUser, updateAttendanceStatus } = useApp();
  const lastStatusRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    const handleBeforeUnload = () => {
      if (Date.now() <= monitoringEndTime) {
        updateAttendanceStatus(attendanceId, { 
          monitoringStatus: 'Suspicious',
          riskLevel: 'Medium'
        });
        storage.addLocationLog({
          studentId: currentUser.id,
          sessionId,
          attendanceId,
          lat: originLat,
          lng: originLng,
          distance: 0,
          status: 'Absent',
          timestamp: new Date().toISOString(),
          event: 'Monitoring Interrupted (Tab Closed)'
        });
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    // Also use a standard interval to check for timeout even if position doesn't change
    intervalRef.current = setInterval(() => {
      if (Date.now() > monitoringEndTime) {
        updateAttendanceStatus(attendanceId, { monitoringStatus: 'Completed' });
        toast.success('Monitoring period completed.');
        if (onComplete) onComplete();
        if (intervalRef.current) clearInterval(intervalRef.current);
      }
    }, 1000);

    const cleanup = watchPosition(
      (position) => {
        if (Date.now() > monitoringEndTime) return;
        
        // Pause real GPS tracking if simulation is currently controlling this record
        if (simulationActive) return;

        const distance = calculateDistance(
          position.lat,
          position.lng,
          originLat,
          originLng
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

        // Always update distance in storage so UI reflects live distance
        updateAttendanceStatus(attendanceId, { 
          status: newStatus, 
          currentDistance: distance,
          riskLevel: newStatus === 'Absent' ? 'High' : 'Low'
        });

        if (lastStatusRef.current !== null && lastStatusRef.current !== newStatus) {
          if (newStatus === 'Absent') {
            toast.error(
              `You moved outside the allowed radius (${Math.round(distance)}m away). Status changed to Absent.`,
              { duration: 5000 }
            );
          } else {
            toast.success(
              `You are back within the allowed radius (${Math.round(distance)}m). Status changed to Present.`,
              { duration: 5000 }
            );
          }
        }

        lastStatusRef.current = newStatus;

        if (onStatusChange) {
          onStatusChange(newStatus, distance);
        }
      },
      (error) => {
        // Location Error
        if (Date.now() <= monitoringEndTime) {
          updateAttendanceStatus(attendanceId, { 
            status: 'Absent',
            monitoringStatus: 'Location Disabled',
            riskLevel: 'High'
          });
          storage.addLocationLog({
            studentId: currentUser.id,
            sessionId,
            attendanceId,
            lat: originLat,
            lng: originLng,
            distance: 0,
            status: 'Absent',
            timestamp: new Date().toISOString(),
            event: 'Location Disabled'
          });
          toast.error('Location tracking error. Status set to Absent.');
          if (onComplete) onComplete();
        }
      },
      15000
    );

    return () => {
      cleanup();
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [
    sessionId,
    originLat,
    originLng,
    monitoringEndTime,
    attendanceId,
    simulationActive,
    currentUser,
    updateAttendanceStatus,
    // onStatusChange and onComplete omitted to prevent infinite loops from unstable references
  ]);

  return null;
}
