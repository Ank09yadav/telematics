import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, Compass, ShieldCheck, Mic } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useDriveStore } from '../../store/useDriveStore';

export default function SensorMonitoringGrid() {
  const isDriving = useDriveStore((state) => state.isDriving);
  const gForce = useDriveStore((state) => state.gForce);
  const crashDetectionEnabled = useDriveStore((state) => state.crashDetectionEnabled);
  const liveLocationEnabled = useDriveStore((state) => state.liveLocationEnabled);
  const soundAlertEnabled = useDriveStore((state) => state.soundAlertEnabled);

  return (
    <View style={styles.sensorGrid}>
      {/* Accelerometer */}
      <View style={styles.sensorCard}>
        <View style={[styles.sensorIconContainer, crashDetectionEnabled && styles.activeSensorIcon]}>
          <Activity size={18} color={crashDetectionEnabled ? Colors.primary : '#FFA000'} />
        </View>
        <Text style={styles.sensorName}>Accelerometer</Text>
        <Text style={[styles.sensorStatus, crashDetectionEnabled && styles.activeStatusText]}>
          {crashDetectionEnabled ? (isDriving ? `${gForce.magnitude.toFixed(2)}G` : 'Active') : 'Disabled'}
        </Text>
      </View>

      {/* Gyroscope */}
      <View style={styles.sensorCard}>
        <View style={[styles.sensorIconContainer, crashDetectionEnabled && styles.activeSensorIcon]}>
          <Compass size={18} color={crashDetectionEnabled ? Colors.primary : '#FFA000'} />
        </View>
        <Text style={styles.sensorName}>Gyroscope</Text>
        <Text style={[styles.sensorStatus, crashDetectionEnabled && styles.activeStatusText]}>
          {crashDetectionEnabled ? 'Active' : 'Disabled'}
        </Text>
      </View>

      {/* GPS Location */}
      <View style={styles.sensorCard}>
        <View style={[styles.sensorIconContainer, liveLocationEnabled && styles.activeSensorIcon]}>
          <ShieldCheck size={18} color={liveLocationEnabled ? Colors.primary : '#FFA000'} />
        </View>
        <Text style={styles.sensorName}>GPS Location</Text>
        <Text style={[styles.sensorStatus, liveLocationEnabled && styles.activeStatusText]}>
          {liveLocationEnabled ? 'Active' : 'Disabled'}
        </Text>
      </View>

      {/* Microphone */}
      <View style={styles.sensorCard}>
        <View style={[styles.sensorIconContainer, soundAlertEnabled && styles.activeSensorIcon]}>
          <Mic size={18} color={soundAlertEnabled ? Colors.primary : '#FFA000'} />
        </View>
        <Text style={styles.sensorName}>Microphone</Text>
        <Text style={[styles.sensorStatus, soundAlertEnabled && styles.activeStatusText]}>
          {soundAlertEnabled ? 'Standby' : 'Disabled'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  sensorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
  },
  sensorCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    width: '48%',
    alignItems: 'flex-start',
  },
  sensorIconContainer: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 160, 0, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  activeSensorIcon: {
    backgroundColor: 'rgba(0, 200, 83, 0.06)',
  },
  sensorName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  sensorStatus: {
    color: '#FFA000',
    fontSize: 11,
    fontWeight: '600',
  },
  activeStatusText: {
    color: Colors.primary,
  },
});
