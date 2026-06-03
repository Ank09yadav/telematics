import { useEffect, useRef, useState } from 'react';
import * as Location from 'expo-location';
import { Platform, Alert } from 'react-native';
import * as Device from 'expo-device';
import { useDriveStore } from '../store/useDriveStore';
import Config from '../constants/config';

export function useLocationTracker() {
  const isDriving = useDriveStore((state) => state.isDriving);
  const updateLocation = useDriveStore((state) => state.updateLocation);
  const resetActiveTrip = useDriveStore((state) => state.resetActiveTrip);
  
  // Toggles for live location
  const liveLocationEnabled = useDriveStore((state) => state.liveLocationEnabled);
  const locationSharingEnabled = useDriveStore((state) => state.locationSharingEnabled);
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);
  const subscriptionRef = useRef<Location.LocationSubscription | null>(null);

  // Request location permission on mount
  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    if (isWeb) {
      setPermissionGranted(true);
      return;
    }

    async function requestPermissions() {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Permission to access location was denied');
          setPermissionGranted(false);
          return;
        }
        setPermissionGranted(true);
      } catch (err: any) {
        setErrorMsg(err.message || 'Failed to request location permissions');
      }
    }
    requestPermissions();
  }, []);

  // Listen to driving state and toggle GPS / Mock subscription
  useEffect(() => {
    const isWeb = Platform.OS === 'web';
    let mockInterval: any = null;

    async function startTracking() {
      // If location is disabled by the user toggles, skip tracking
      if (!liveLocationEnabled || !locationSharingEnabled) {
        return;
      }

      let gpsAvailable = false;
      if (!isWeb) {
        try {
          const hasServices = await Location.hasServicesEnabledAsync();
          gpsAvailable = hasServices && permissionGranted;
        } catch (e) {
          console.warn('GPS services check failed:', e);
        }
      }

      if (isWeb || !gpsAvailable) {
        // --- Simulated Driving Route ---
        let lat = 37.7749;
        let lon = -122.4194;
        let speed = 0; // m/s
        let time = 0; // seconds

        mockInterval = setInterval(() => {
          time += 1;

          // Road test velocity profile
          if (time < 5) {
            speed = 0; // stop light
          } else if (time < 12) {
            speed += 2.2; // accelerate forwards (up to ~15.4 m/s or 55 km/h)
          } else if (time < 19) {
            speed = Math.max(12, speed + (Math.random() - 0.5) * 0.4); // cruise
          } else if (time < 22) {
            // sharp curve
            speed = Math.max(6, speed - 1.5);
          } else if (time < 31) {
            speed = Math.max(10, speed + (Math.random() - 0.5) * 0.4); // speed up
          } else if (time < 33) {
            speed = Math.max(0, speed - 6.5); // harsh stop!
          } else {
            speed = 0; // stopped
          }

          // Advance coordinate vectors based on current speed
          lat += 0.0001 * (speed / 12);
          lon -= 0.00013 * (speed / 12);

          updateLocation(
            parseFloat(lat.toFixed(6)),
            parseFloat(lon.toFixed(6)),
            parseFloat(speed.toFixed(2)),
            315, // heading
            18 // altitude
          );
        }, Config.gpsPollInterval);

        return;
      }

      // --- Physical GPS Mode ---
      if (!permissionGranted) {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'GPS Access Required',
            'Foreground location access is required to track speed, distance, and map routes.'
          );
          resetActiveTrip(); 
          return;
        }
        setPermissionGranted(true);
      }

      try {
        if (subscriptionRef.current) {
          subscriptionRef.current.remove();
          subscriptionRef.current = null;
        }

        subscriptionRef.current = await Location.watchPositionAsync(
          {
            accuracy: Location.Accuracy.BestForNavigation,
            timeInterval: Config.gpsPollInterval, 
            distanceInterval: 1, 
          },
          (location) => {
            const { coords } = location;
            updateLocation(
              coords.latitude,
              coords.longitude,
              coords.speed || 0,
              coords.heading || 0,
              coords.altitude
            );
          }
        );
      } catch (err: any) {
        console.error('Error starting GPS tracker:', err);
        setErrorMsg(err.message || 'Error subscribing to location updates');
      }
    }

    function stopTracking() {
      if (mockInterval) {
        clearInterval(mockInterval);
        mockInterval = null;
      }
      if (subscriptionRef.current) {
        subscriptionRef.current.remove();
        subscriptionRef.current = null;
      }
    }

    if (isDriving) {
      startTracking();
    } else {
      stopTracking();
    }

    return () => {
      stopTracking();
    };
  }, [isDriving, permissionGranted, updateLocation, resetActiveTrip, liveLocationEnabled, locationSharingEnabled]);

  return { permissionGranted, errorMsg };
}
export default useLocationTracker;
