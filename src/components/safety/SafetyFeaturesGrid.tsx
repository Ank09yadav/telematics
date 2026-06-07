import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Switch, Alert, Platform, Linking } from 'react-native';
import { Activity, MapPin, Volume2, Gauge } from 'lucide-react-native';
import * as Location from 'expo-location';
import { Colors } from '../../constants/theme';
import { useDriveStore } from '../../store/useDriveStore';

export default function SafetyFeaturesGrid() {
  const crashDetectionEnabled = useDriveStore((state) => state.crashDetectionEnabled);
  const liveLocationEnabled = useDriveStore((state) => state.liveLocationEnabled);
  const soundAlertEnabled = useDriveStore((state) => state.soundAlertEnabled);
  const speedMonitorEnabled = useDriveStore((state) => state.speedMonitorEnabled);

  const toggleCrashDetection = useDriveStore((state) => state.toggleCrashDetection);
  const toggleLiveLocation = useDriveStore((state) => state.toggleLiveLocation);
  const setLiveLocation = useDriveStore((state) => state.setLiveLocation);
  const toggleSoundAlert = useDriveStore((state) => state.toggleSoundAlert);
  const toggleSpeedMonitor = useDriveStore((state) => state.toggleSpeedMonitor);

  // Monitor device location status and permissions
  useEffect(() => {
    let isMounted = true;

    async function checkDeviceLocation() {
      // Skip status check on Web as it doesn't support hasServicesEnabledAsync cleanly
      if (Platform.OS === 'web') return;

      try {
        const servicesEnabled = await Location.hasServicesEnabledAsync();
        const { status } = await Location.getForegroundPermissionsAsync();

        if (!servicesEnabled || status !== 'granted') {
          if (liveLocationEnabled && isMounted) {
            setLiveLocation(false);
          }
        }
      } catch (err) {
        console.error('Error checking device location services status:', err);
      }
    }

    // Run initial check
    checkDeviceLocation();

    // Set up a 3-second interval check to automatically disable the switch if user turns off GPS
    const interval = setInterval(checkDeviceLocation, 3000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [liveLocationEnabled, setLiveLocation]);

  const handleToggleLiveLocation = async (value: boolean) => {
    if (value) {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          Alert.alert(
            'Location Permission Required',
            'Foreground location access is required to enable Live Location sharing.'
          );
          return;
        }

        const servicesEnabled = await Location.hasServicesEnabledAsync();
        if (!servicesEnabled) {
          if (Platform.OS === 'android') {
            try {
              await Location.enableNetworkProviderAsync();
            } catch {
              Alert.alert(
                'Location Services Disabled',
                'Please enable device location services to use Live Location tracking.'
              );
              return;
            }
          } else {
            Alert.alert(
              'Location Services Disabled',
              'Please enable location services in your device settings to use Live Location tracking.',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Settings', onPress: () => Linking.openSettings() }
              ]
            );
            return;
          }
        }

        toggleLiveLocation();
      } catch (err) {
        console.error('Error requesting location activation:', err);
        Alert.alert('Location Error', 'Could not access or enable location services.');
      }
    } else {
      toggleLiveLocation();
    }
  };

  return (
    <View style={styles.featureGrid}>
      {/* Crash Detection */}
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <View style={[styles.featureIconContainer, crashDetectionEnabled && styles.featureIconActive]}>
            <Activity size={20} color={crashDetectionEnabled ? Colors.primary : Colors.textSecondary} />
          </View>
          <Switch
            value={crashDetectionEnabled}
            onValueChange={toggleCrashDetection}
            trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
            thumbColor={crashDetectionEnabled ? Colors.primary : '#64748B'}
          />
        </View>
        <Text style={styles.featureTitle}>Crash Detection</Text>
        <Text style={styles.featureDesc}>Utilizes G-force thresholds to report sudden decelerations.</Text>
      </View>

      {/* Live Location */}
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <View style={[styles.featureIconContainer, liveLocationEnabled && styles.featureIconActive]}>
            <MapPin size={20} color={liveLocationEnabled ? Colors.primary : Colors.textSecondary} />
          </View>
          <Switch
            value={liveLocationEnabled}
            onValueChange={handleToggleLiveLocation}
            trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
            thumbColor={liveLocationEnabled ? Colors.primary : '#64748B'}
          />
        </View>
        <Text style={styles.featureTitle}>Live Location</Text>
        <Text style={styles.featureDesc}>Shares active driving coordinates with selected emergency contacts.</Text>
      </View>

      {/* Sound Alert */}
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <View style={[styles.featureIconContainer, soundAlertEnabled && styles.featureIconActive]}>
            <Volume2 size={20} color={soundAlertEnabled ? Colors.primary : Colors.textSecondary} />
          </View>
          <Switch
            value={soundAlertEnabled}
            onValueChange={toggleSoundAlert}
            trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
            thumbColor={soundAlertEnabled ? Colors.primary : '#64748B'}
          />
        </View>
        <Text style={styles.featureTitle}>Sound Alert</Text>
        <Text style={styles.featureDesc}>Provides real-time verbal coaching during dangerous maneuvers.</Text>
      </View>

      {/* Speed Monitor */}
      <View style={styles.featureCard}>
        <View style={styles.featureHeader}>
          <View style={[styles.featureIconContainer, speedMonitorEnabled && styles.featureIconActive]}>
            <Gauge size={20} color={speedMonitorEnabled ? Colors.primary : Colors.textSecondary} />
          </View>
          <Switch
            value={speedMonitorEnabled}
            onValueChange={toggleSpeedMonitor}
            trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
            thumbColor={speedMonitorEnabled ? Colors.primary : '#64748B'}
          />
        </View>
        <Text style={styles.featureTitle}>Speed Monitor</Text>
        <Text style={styles.featureDesc}>Warns when vehicle speed exceeds configured limits.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    width: '48%',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconActive: {
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
    borderColor: 'rgba(0, 200, 83, 0.15)',
  },
  featureTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
});
