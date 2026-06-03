import { useEffect, useRef } from 'react';
import { Accelerometer, Gyroscope } from 'expo-sensors';
import { Platform } from 'react-native';
import * as Device from 'expo-device';
import { useSQLiteContext } from 'expo-sqlite';
import { useDriveStore } from '../store/useDriveStore';
import { LowPassFilter } from '../services/LowPassFilter';
import { EventDetector } from '../services/EventDetector';
import Config from '../constants/config';

export function useSensorPipeline() {
  const db = useSQLiteContext();
  const isDriving = useDriveStore((state) => state.isDriving);
  const currentSpeed = useDriveStore((state) => state.currentSpeed);

  // Persistence references
  const accelLpfRef = useRef(new LowPassFilter(0.12)); 
  const gyroLpfRef = useRef(new LowPassFilter(0.15));  
  const detectorRef = useRef(new EventDetector());

  const prevSpeedRef = useRef(0);
  const accelDataRef = useRef<number[]>([0, 0, Config.gravity]);
  const gyroDataRef = useRef<number[]>([0, 0, 0]);

  // Track prevSpeed in a separate hook to avoid re-triggering sensor subscriptions
  useEffect(() => {
    prevSpeedRef.current = currentSpeed;
  }, [currentSpeed]);

  useEffect(() => {
    let accelSub: any = null;
    let gyroSub: any = null;
    let mockInterval: any = null;

    // Detect if we are in a simulator or web browser
    const isMockMode = Platform.OS === 'web' || !Device.isDevice;

    async function startPipeline() {
      // Reset filter and physics engines
      accelLpfRef.current.reset();
      gyroLpfRef.current.reset();
      detectorRef.current.reset();

      if (isMockMode) {
        // Start Mock Telemetry Simulation
        let time = 0;
        mockInterval = setInterval(() => {
          time += Config.sensorPollInterval; // runs at 20Hz
          const seconds = time / 1000;

          // Base noise acceleration (near gravity in Z axis)
          let rx = (Math.random() - 0.5) * 0.12;
          let ry = (Math.random() - 0.5) * 0.12;
          let rz = 1.0 + (Math.random() - 0.5) * 0.12; 

          let gx = (Math.random() - 0.5) * 0.04;
          let gy = (Math.random() - 0.5) * 0.04;
          let gz = (Math.random() - 0.5) * 0.04;

          // 1. Harsh Acceleration spike at 5 seconds
          if (seconds >= 5 && seconds < 6) {
            ry += 0.38; // Surge forwards
          }

          // 2. Harsh Cornering spike at 20 seconds
          if (seconds >= 20 && seconds < 22) {
            rx += 0.42; // Lateral G-Force spike
            gz += 0.65; // High angular velocity (rad/s)
          }

          // 3. Harsh Braking spike at 32 seconds
          if (seconds >= 32 && seconds < 33) {
            ry -= 0.46; // Heavy deceleration
          }

          // Convert Gs back to m/s^2 for the filter pipeline
          const accelRaw = [rx * Config.gravity, ry * Config.gravity, rz * Config.gravity];
          const gyroRaw = [gx, gy, gz];

          const filtered = accelLpfRef.current.filter(accelRaw);
          accelDataRef.current = filtered;
          gyroDataRef.current = gyroRaw;

          const mag = Math.sqrt(filtered[0] ** 2 + filtered[1] ** 2 + filtered[2] ** 2) / Config.gravity;

          // Update active Zustand store
          useDriveStore.getState().updateSensors(filtered[0] / Config.gravity, filtered[1] / Config.gravity, filtered[2] / Config.gravity, mag);

          runDetection();
        }, Config.sensorPollInterval);
      } else {
        // Start physical hardware sensors
        Accelerometer.setUpdateInterval(Config.sensorPollInterval);
        Gyroscope.setUpdateInterval(Config.sensorPollInterval);

        accelSub = Accelerometer.addListener((data) => {
          const rawX = data.x * Config.gravity;
          const rawY = data.y * Config.gravity;
          const rawZ = data.z * Config.gravity;

          const filtered = accelLpfRef.current.filter([rawX, rawY, rawZ]);
          accelDataRef.current = filtered;

          const mag = Math.sqrt(filtered[0] ** 2 + filtered[1] ** 2 + filtered[2] ** 2) / Config.gravity;
          
          useDriveStore.getState().updateSensors(filtered[0] / Config.gravity, filtered[1] / Config.gravity, filtered[2] / Config.gravity, mag);
          
          runDetection();
        });

        gyroSub = Gyroscope.addListener((data) => {
          const filtered = gyroLpfRef.current.filter([data.x, data.y, data.z]);
          gyroDataRef.current = filtered;
        });
      }
    }

    function runDetection() {
      const storeState = useDriveStore.getState();
      
      // ONLY run event detection if Crash Detection feature is toggled on!
      if (!storeState.crashDetectionEnabled) return;

      const activeTrip = storeState.activeTrip;
      if (!activeTrip) return;

      const gpsPoints = activeTrip.gpsPoints;
      const latestPoint = gpsPoints.length > 0 ? gpsPoints[gpsPoints.length - 1] : null;
      
      const lat = latestPoint ? latestPoint.latitude : 0;
      const lon = latestPoint ? latestPoint.longitude : 0;

      const event = detectorRef.current.processSample(
        accelDataRef.current,
        gyroDataRef.current,
        storeState.currentSpeed,
        prevSpeedRef.current,
        lat,
        lon,
        storeState.settings
      );

      if (event) {
        storeState.addEvent(event, db);
      }
    }

    function stopPipeline() {
      if (mockInterval) {
        clearInterval(mockInterval);
        mockInterval = null;
      }
      if (accelSub) {
        accelSub.remove();
        accelSub = null;
      }
      if (gyroSub) {
        gyroSub.remove();
        gyroSub = null;
      }
    }

    if (isDriving) {
      startPipeline();
    } else {
      stopPipeline();
    }

    return () => {
      stopPipeline();
    };
  }, [isDriving, db]);
}
export default useSensorPipeline;
