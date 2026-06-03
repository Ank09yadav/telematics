export interface GPSPoint {
  latitude: number;
  longitude: number;
  speed: number; // in meters/second
  heading: number; // in degrees
  timestamp: number; // ms timestamp
  altitude: number | null;
}

export interface TelemetryEvent {
  id?: number;
  tripId?: number;
  timestamp: number;
  type: 'harsh_acceleration' | 'harsh_braking' | 'harsh_cornering';
  latitude: number;
  longitude: number;
  magnitude: number; // G-force value or angular velocity rad/s
  description: string;
}

export interface Trip {
  id?: number;
  startTime: number; // ms timestamp
  endTime: number; // ms timestamp
  duration: number; // in seconds
  distance: number; // in meters
  avgSpeed: number; // in m/s
  maxSpeed: number; // in m/s
  score: number; // 0 to 100
  harshAccelCount: number;
  harshBrakeCount: number;
  harshCornerCount: number;
  gpsPoints: GPSPoint[];
  events: TelemetryEvent[];
}

export interface DriveSettings {
  accelThreshold: number; // in Gs (e.g. 0.3)
  brakeThreshold: number; // in Gs (e.g. 0.35)
  cornerThreshold: number; // in Gs or angular velocity threshold
  weightAccel: number; // deduction weight
  weightBrake: number; // deduction weight
  weightCorner: number; // deduction weight
}
