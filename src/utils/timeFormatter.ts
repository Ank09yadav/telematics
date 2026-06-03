export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const formattedMins = mins.toString().padStart(2, '0');
  const formattedSecs = secs.toString().padStart(2, '0');

  if (hrs > 0) {
    const formattedHrs = hrs.toString().padStart(2, '0');
    return `${formattedHrs}:${formattedMins}:${formattedSecs}`;
  }

  return `${formattedMins}:${formattedSecs}`;
}

export function formatDate(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatTime(timestamp: number): string {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

export function formatSpeed(speedMps: number, useImperial: boolean = false): string {
  if (useImperial) {
    const mph = speedMps * 2.23694;
    return `${Math.round(mph)} mph`;
  }
  const kmh = speedMps * 3.6;
  return `${Math.round(kmh)} km/h`;
}

export function formatDistance(distanceMeters: number, useImperial: boolean = false): string {
  if (useImperial) {
    const miles = distanceMeters / 1609.34;
    return `${miles.toFixed(2)} mi`;
  }
  const km = distanceMeters / 1000;
  return `${km.toFixed(2)} km`;
}
