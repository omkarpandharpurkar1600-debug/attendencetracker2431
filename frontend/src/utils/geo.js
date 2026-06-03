/**
 * Geolocation utilities for GeoSecure Attendance.
 * Provides position retrieval, Haversine distance, radius checks, and polling.
 */

/**
 * Get the device's current position with high accuracy.
 * @returns {Promise<{lat: number, lng: number}>}
 */
export function getCurrentPosition() {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject('Geolocation is not supported by this browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject('Location permission denied. Please enable location access in your browser settings.');
            break;
          case error.POSITION_UNAVAILABLE:
            reject('Location information is unavailable. Please try again.');
            break;
          case error.TIMEOUT:
            reject('Location request timed out. Please try again.');
            break;
          default:
            reject('An unknown error occurred while retrieving location.');
            break;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  });
}

/**
 * Calculate the distance between two geographic coordinates using the Haversine formula.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @returns {number} Distance in meters
 */
export function calculateDistance(lat1, lng1, lat2, lng2) {
  const R = 6371000; // Earth's radius in meters
  const toRad = (deg) => (deg * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Check whether two coordinates are within a given radius.
 * @param {number} lat1 - Latitude of point 1
 * @param {number} lng1 - Longitude of point 1
 * @param {number} lat2 - Latitude of point 2
 * @param {number} lng2 - Longitude of point 2
 * @param {number} radiusMeters - Allowed radius in meters
 * @returns {boolean}
 */
export function isWithinRadius(lat1, lng1, lat2, lng2, radiusMeters) {
  return calculateDistance(lat1, lng1, lat2, lng2) <= radiusMeters;
}

/**
 * Poll the device position at a fixed interval.
 * @param {function} callback - Called with {lat, lng, timestamp} on each successful read.
 * @param {function} errorCallback - Called with error message string on failure.
 * @param {number} [intervalMs=15000] - Polling interval in milliseconds.
 * @returns {function} Cleanup function that stops polling when called.
 */
export function watchPosition(callback, errorCallback, intervalMs = 15000) {
  const poll = () => {
    getCurrentPosition()
      .then(({ lat, lng }) => {
        callback({ lat, lng, timestamp: Date.now() });
      })
      .catch((err) => {
        if (errorCallback) errorCallback(err);
      });
  };

  // Fire immediately, then on interval
  poll();
  const intervalId = setInterval(poll, intervalMs);

  return () => clearInterval(intervalId);
}
