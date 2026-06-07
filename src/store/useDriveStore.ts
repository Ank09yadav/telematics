import { create } from 'zustand';
import { Trip, GPSPoint, TelemetryEvent, DriveSettings } from '../types/telemetry';
import { ScoringEngine } from '../services/ScoringEngine';
import { DriveRepository } from '../database/driveRepository';
import { AlertsRepository, SafetyAlert } from '../database/alertsRepository';
import { SQLiteDatabase } from 'expo-sqlite';
import Config from '../constants/config';
import { playSound } from '../utils/soundPlayer';

interface DriveState {
  isDriving: boolean;
  activeTrip: Trip | null;
  currentSpeed: number; // m/s
  maxSpeed: number; // m/s
  gForce: { x: number; y: number; z: number; magnitude: number };
  settings: DriveSettings;
  
  // SafeGuard Protection Toggles
  crashDetectionEnabled: boolean;
  liveLocationEnabled: boolean;
  soundAlertEnabled: boolean;
  speedMonitorEnabled: boolean;
  
  // Profile preferences
  notificationsEnabled: boolean;
  locationSharingEnabled: boolean;
  
  // Profile stats
  healthScore: number;
  responseMs: number;
  safeDays: number;
  crashCount: number;
  
  // Actions
  startTrip: () => void;
  stopTrip: (db: SQLiteDatabase) => Promise<number | null>;
  updateLocation: (
    latitude: number,
    longitude: number,
    speed: number,
    heading: number,
    altitude: number | null
  ) => void;
  updateSensors: (
    x: number,
    y: number,
    z: number,
    magnitude: number
  ) => void;
  addEvent: (event: Omit<TelemetryEvent, 'tripId'>, db?: SQLiteDatabase) => void;
  updateSettings: (newSettings: Partial<DriveSettings>) => void;
  resetActiveTrip: () => void;
  
  // Toggle triggers
  toggleCrashDetection: () => void;
  toggleLiveLocation: () => void;
  setLiveLocation: (enabled: boolean) => void;
  toggleSoundAlert: () => void;
  toggleSpeedMonitor: () => void;
  toggleNotifications: () => void;
  toggleLocationSharing: () => void;
  refreshStats: (db: SQLiteDatabase) => Promise<void>;
}

// Haversine distance calculator between two coordinates (returns meters)
function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = Config.earthRadius;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const DEFAULT_SETTINGS: DriveSettings = {
  accelThreshold: Config.accelThreshold, 
  brakeThreshold: Config.brakeThreshold,  
  cornerThreshold: Config.cornerThreshold, 
  weightAccel: Config.weightAccel,       
  weightBrake: Config.weightBrake,
  weightCorner: Config.weightCorner,
};

export const useDriveStore = create<DriveState>((set, get) => ({
  isDriving: false,
  activeTrip: null,
  currentSpeed: 0,
  maxSpeed: 0,
  gForce: { x: 0, y: 0, z: 0, magnitude: 0 },
  settings: DEFAULT_SETTINGS,

  // SafeGuard default toggle states matching screenshots
  crashDetectionEnabled: true,
  liveLocationEnabled: true,
  soundAlertEnabled: true,
  speedMonitorEnabled: false,
  notificationsEnabled: true,
  locationSharingEnabled: true,
  
  healthScore: 98,
  responseMs: 12,
  safeDays: 142,
  crashCount: 0,

  startTrip: () => {
    const timestamp = Date.now();
    
    if (get().soundAlertEnabled) {
      playSound('start');
    }

    set({
      isDriving: true,
      currentSpeed: 0,
      maxSpeed: 0,
      gForce: { x: 0, y: 0, z: 0, magnitude: 0 },
      activeTrip: {
        startTime: timestamp,
        endTime: timestamp,
        duration: 0,
        distance: 0,
        avgSpeed: 0,
        maxSpeed: 0,
        score: 100,
        harshAccelCount: 0,
        harshBrakeCount: 0,
        harshCornerCount: 0,
        gpsPoints: [],
        events: [],
      },
    });
  },

  stopTrip: async (db: SQLiteDatabase) => {
    const { activeTrip, isDriving } = get();
    if (!isDriving || !activeTrip) return null;

    const endTime = Date.now();
    const duration = Math.max(1, Math.round((endTime - activeTrip.startTime) / 1000));
    
    let avgSpeed = 0;
    if (activeTrip.gpsPoints.length > 0) {
      const sumSpeed = activeTrip.gpsPoints.reduce((sum, p) => sum + p.speed, 0);
      avgSpeed = sumSpeed / activeTrip.gpsPoints.length;
    }

    const finalTrip: Trip = {
      ...activeTrip,
      endTime,
      duration,
      avgSpeed: parseFloat(avgSpeed.toFixed(2)),
      maxSpeed: parseFloat(get().maxSpeed.toFixed(2)),
      score: ScoringEngine.calculateScore(activeTrip.events, activeTrip.distance, get().settings),
    };

    const savedId = await DriveRepository.saveTrip(db, finalTrip);

    set({
      isDriving: false,
      activeTrip: null,
      currentSpeed: 0,
      maxSpeed: 0,
      gForce: { x: 0, y: 0, z: 0, magnitude: 0 },
    });

    return savedId;
  },

  updateLocation: (latitude, longitude, speed, heading, altitude) => {
    const state = get();
    if (!state.isDriving || !state.activeTrip) return;

    const timestamp = Date.now();
    const newPoint: GPSPoint = {
      latitude,
      longitude,
      speed,
      heading,
      timestamp,
      altitude,
    };

    const updatedPoints = [...state.activeTrip.gpsPoints, newPoint];

    let distanceIncrement = 0;
    if (state.activeTrip.gpsPoints.length > 0) {
      const lastPoint = state.activeTrip.gpsPoints[state.activeTrip.gpsPoints.length - 1];
      distanceIncrement = calculateHaversineDistance(
        lastPoint.latitude,
        lastPoint.longitude,
        latitude,
        longitude
      );
      if (speed === 0 && distanceIncrement < 1.5) {
        distanceIncrement = 0;
      }
    }

    const newDistance = state.activeTrip.distance + distanceIncrement;
    const newMaxSpeed = Math.max(state.maxSpeed, speed);
    const currentDuration = Math.round((timestamp - state.activeTrip.startTime) / 1000);

    const runningScore = ScoringEngine.calculateScore(
      state.activeTrip.events,
      newDistance,
      state.settings
    );

    set({
      currentSpeed: speed,
      maxSpeed: newMaxSpeed,
      activeTrip: {
        ...state.activeTrip,
        duration: currentDuration,
        distance: parseFloat(newDistance.toFixed(1)),
        maxSpeed: parseFloat(newMaxSpeed.toFixed(2)),
        gpsPoints: updatedPoints,
        score: runningScore,
      },
    });
  },

  updateSensors: (x, y, z, magnitude) => {
    set({
      gForce: { x, y, z, magnitude },
    });
  },

  addEvent: async (event, db) => {
    const state = get();
    if (!state.isDriving || !state.activeTrip) return;

    // Play event sound if sound alerts are enabled
    if (state.soundAlertEnabled) {
      if (event.type === 'harsh_braking') {
        playSound('crash');
      } else {
        playSound('hs');
      }
    }

    const eventWithId = {
      ...event,
      tripId: state.activeTrip.id,
    };

    const updatedEvents = [...state.activeTrip.events, eventWithId];

    let accelCount = state.activeTrip.harshAccelCount;
    let brakeCount = state.activeTrip.harshBrakeCount;
    let cornerCount = state.activeTrip.harshCornerCount;

    if (event.type === 'harsh_acceleration') accelCount++;
    if (event.type === 'harsh_braking') brakeCount++;
    if (event.type === 'harsh_cornering') cornerCount++;

    const newScore = ScoringEngine.calculateScore(
      updatedEvents,
      state.activeTrip.distance,
      state.settings
    );

    set({
      activeTrip: {
        ...state.activeTrip,
        events: updatedEvents,
        harshAccelCount: accelCount,
        harshBrakeCount: brakeCount,
        harshCornerCount: cornerCount,
        score: newScore,
      },
    });

    // Write alert log directly to SQLite DB to populate the Alerts screen
    if (db) {
      try {
        let alertType: SafetyAlert['type'] = 'speed_warning';
        let title = 'Driving Anomaly';
        let severity: SafetyAlert['severity'] = 'medium';

        if (event.type === 'harsh_acceleration') {
          alertType = 'speed_warning';
          title = 'Speed Threshold Warning';
          severity = 'medium';
        } else if (event.type === 'harsh_braking') {
          alertType = 'sudden_impact';
          title = 'Sudden Impact Detected';
          severity = 'high';
        } else if (event.type === 'harsh_cornering') {
          alertType = 'speed_warning';
          title = 'Harsh Swerve Detected';
          severity = 'medium';
        }

        const newAlert: SafetyAlert = {
          timestamp: event.timestamp,
          type: alertType,
          title,
          description: event.description,
          severity,
          status: 'active',
          latitude: event.latitude || undefined,
          longitude: event.longitude || undefined,
        };

        await AlertsRepository.saveAlert(db, newAlert);
      } catch (err) {
        console.error('Failed to log alert to DB:', err);
      }
    }
  },

  updateSettings: (newSettings) => {
    set((state) => ({
      settings: {
        ...state.settings,
        ...newSettings,
      },
    }));
  },

  resetActiveTrip: () => {
    set({
      isDriving: false,
      activeTrip: null,
      currentSpeed: 0,
      maxSpeed: 0,
      gForce: { x: 0, y: 0, z: 0, magnitude: 0 },
    });
  },

  // Toggle implementations
  toggleCrashDetection: () => set((state) => ({ crashDetectionEnabled: !state.crashDetectionEnabled })),
  toggleLiveLocation: () => set((state) => ({ liveLocationEnabled: !state.liveLocationEnabled })),
  setLiveLocation: (enabled) => set({ liveLocationEnabled: enabled }),
  toggleSoundAlert: () => set((state) => ({ soundAlertEnabled: !state.soundAlertEnabled })),
  toggleSpeedMonitor: () => set((state) => ({ speedMonitorEnabled: !state.speedMonitorEnabled })),
  toggleNotifications: () => set((state) => ({ notificationsEnabled: !state.notificationsEnabled })),
  toggleLocationSharing: () => set((state) => ({ locationSharingEnabled: !state.locationSharingEnabled })),
  refreshStats: async (db: SQLiteDatabase) => {
    const startTime = Date.now();
    try {
      // 1. Calculate health score (average safety score of trips)
      const tripStats = await db.getFirstAsync<{ avg_score: number | null }>(
        'SELECT AVG(score) as avg_score FROM trips;'
      );
      const healthScore = (tripStats && tripStats.avg_score !== null)
        ? Math.round(tripStats.avg_score)
        : 100;

      // 2. Calculate safe days (days since last high-severity alert or since first trip)
      const lastHighAlert = await db.getFirstAsync<{ timestamp: number }>(
        "SELECT timestamp FROM alerts WHERE severity = 'high' ORDER BY timestamp DESC LIMIT 1;"
      );
      
      let safeDays = 0;
      if (lastHighAlert) {
        const diffTime = Date.now() - lastHighAlert.timestamp;
        safeDays = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
      } else {
        const firstTrip = await db.getFirstAsync<{ start_time: number }>(
          "SELECT start_time FROM trips ORDER BY start_time ASC LIMIT 1;"
        );
        if (firstTrip) {
          const diffTime = Date.now() - firstTrip.start_time;
          safeDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
        } else {
          safeDays = 0;
        }
      }

      // 3. Get crash count (sudden impacts)
      const crashStats = await db.getFirstAsync<{ count: number }>(
        "SELECT COUNT(*) as count FROM alerts WHERE type = 'sudden_impact';"
      );
      const crashCount = crashStats ? crashStats.count : 0;

      // 4. Measure response latency
      const queryTime = Date.now() - startTime;
      const responseMs = Math.max(8, queryTime + 2); // real DB query time + overhead

      set({
        healthScore,
        safeDays,
        crashCount,
        responseMs,
      });
    } catch (err) {
      console.error('Error refreshing drive stats from DB:', err);
    }
  },
}));
export default useDriveStore;
