import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Animated, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import { useDriveStore } from '../store/useDriveStore';
import { useSensorPipeline } from '../hooks/useSensorPipeline';
import { useLocationTracker } from '../hooks/useLocationTracker';
import { formatDuration, formatDistance } from '../utils/timeFormatter';
import Speedometer from '../components/Speedometer';
import ActiveMap from '../components/ActiveMap';
import { Shield, ShieldAlert, Square, AlertTriangle } from 'lucide-react-native';

export default function ActiveDriveScreen() {
  const db = useSQLiteContext();
  const isDriving = useDriveStore((state) => state.isDriving);
  const activeTrip = useDriveStore((state) => state.activeTrip);
  const gForce = useDriveStore((state) => state.gForce);
  const currentSpeed = useDriveStore((state) => state.currentSpeed);
  const stopTrip = useDriveStore((state) => state.stopTrip);
  const resetActiveTrip = useDriveStore((state) => state.resetActiveTrip);

  // Initialize telemetry listeners
  useSensorPipeline();
  useLocationTracker();

  // Save saving state
  const [isSaving, setIsSaving] = useState(false);

  // State to track events for visual flashing alerts
  const [lastEventCount, setLastEventCount] = useState(0);
  const [alertVisible, setAlertVisible] = useState(false);
  const [alertText, setAlertText] = useState('');
  const alertOpacity = useRef(new Animated.Value(0)).current;

  // Track event triggers to show flashing alert banners
  useEffect(() => {
    if (activeTrip && activeTrip.events.length > lastEventCount) {
      const newEvent = activeTrip.events[activeTrip.events.length - 1];
      let typeText = 'HARSH EVENT';
      if (newEvent.type === 'harsh_acceleration') typeText = 'HARSH ACCELERATION';
      if (newEvent.type === 'harsh_braking') typeText = 'HARSH BRAKING';
      if (newEvent.type === 'harsh_cornering') typeText = 'HARSH CORNERING';

      setAlertText(typeText);
      setLastEventCount(activeTrip.events.length);
      triggerAlert();
    }
  }, [activeTrip?.events.length]);

  const triggerAlert = () => {
    setAlertVisible(true);
    Animated.sequence([
      Animated.timing(alertOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.delay(2200),
      Animated.timing(alertOpacity, {
        toValue: 0,
        duration: 350,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setAlertVisible(false);
    });
  };

  const handleStopDrive = () => {
    Alert.alert(
      'End Driving Session',
      'Are you sure you want to end this trip and save your telematics log?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Save & End',
          onPress: async () => {
            try {
              setIsSaving(true);
              const tripId = await stopTrip(db);
              if (tripId) {
                router.replace(`/summary/${tripId}`);
              } else {
                // If trip was empty/too short and returned null
                resetActiveTrip();
                router.replace('/(tabs)');
              }
            } catch (err) {
              setIsSaving(false);
              Alert.alert('Database Error', 'Failed to save driving session.');
            }
          },
        },
      ]
    );
  };

  if (!isDriving || !activeTrip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No active driving session initialized.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backBtnText}>Return to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Map 2D G-Force to bubble meter offset (Max 1.0G translates to 50px offset)
  const maxBubbleOffset = 50; 
  const bubbleX = Math.max(-maxBubbleOffset, Math.min(maxBubbleOffset, gForce.x * maxBubbleOffset));
  // SVG/Layout Y-axis goes down, so invert accelerometer Y
  const bubbleY = Math.max(-maxBubbleOffset, Math.min(maxBubbleOffset, -gForce.y * maxBubbleOffset));

  const isGForceHarsh = gForce.magnitude > 0.35;

  return (
    <View style={styles.container}>
      
      {/* 1. Top HUD bar */}
      <View style={styles.hudHeader}>
        <View style={styles.durationGroup}>
          <Text style={styles.hudVal}>{formatDuration(activeTrip.duration)}</Text>
          <Text style={styles.hudLabel}>DURATION</Text>
        </View>

        <View style={styles.scoreGroup}>
          <View style={[styles.scorePill, { backgroundColor: activeTrip.score >= 80 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(239, 68, 68, 0.15)' }]}>
            {activeTrip.score >= 80 ? (
              <Shield size={16} color="#10B981" />
            ) : (
              <ShieldAlert size={16} color="#EF4444" />
            )}
            <Text style={[styles.scoreVal, { color: activeTrip.score >= 80 ? '#10B981' : '#EF4444' }]}>
              {activeTrip.score}
            </Text>
          </View>
          <Text style={styles.hudLabel}>SAFETY SCORE</Text>
        </View>

        <View style={styles.distanceGroup}>
          <Text style={styles.hudVal}>{formatDistance(activeTrip.distance)}</Text>
          <Text style={styles.hudLabel}>DISTANCE</Text>
        </View>
      </View>

      {/* 2. Flashing warning alert banner */}
      {alertVisible && (
        <Animated.View style={[styles.alertBanner, { opacity: alertOpacity }]}>
          <AlertTriangle size={18} color="#0B0F19" />
          <Text style={styles.alertText}>{alertText}</Text>
        </Animated.View>
      )}

      {/* 3. Speedometer & Telemetry grid */}
      <View style={styles.hudMain}>
        {/* Animated speed needle gauge */}
        <Speedometer value={currentSpeed} />

        {/* 2D G-Force visual bubble map */}
        <View style={styles.gForceCard}>
          <Text style={styles.gForceCardTitle}>Vector G-Force</Text>
          <View style={styles.gForceGrid}>
            {/* Safe boundaries ring */}
            <View style={styles.gForceGridRing} />
            <View style={[styles.gForceGridRing, styles.gForceGridRingOuter]} />
            <View style={styles.gForceCrosshairX} />
            <View style={styles.gForceCrosshairY} />
            
            {/* The shifting bubble */}
            <View
              style={[
                styles.gForceBubble,
                isGForceHarsh && styles.gForceBubbleHarsh,
                { transform: [{ translateX: bubbleX }, { translateY: bubbleY }] },
              ]}
            />
          </View>
          <Text style={styles.gForceMagnitudeText}>
            Linear: <Text style={isGForceHarsh ? styles.textRed : styles.textBlue}>{gForce.magnitude.toFixed(2)}G</Text>
          </Text>
        </View>
      </View>

      {/* 4. Live map overlay */}
      <View style={styles.mapContainer}>
        <ActiveMap gpsPoints={activeTrip.gpsPoints} events={activeTrip.events} height={140} interactive={false} />
      </View>

      {/* 5. End Drive CTA */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.stopButton}
          onPress={handleStopDrive}
          disabled={isSaving}
          activeOpacity={0.8}
        >
          {isSaving ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Square fill="#FFFFFF" size={18} color="#FFFFFF" style={styles.stopIcon} />
              <Text style={styles.stopButtonText}>END TRIP</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
    paddingTop: 50,
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  errorText: {
    color: '#94A3B8',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
    textAlign: 'center',
  },
  backBtn: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#208AEF',
    borderRadius: 10,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  hudHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  durationGroup: {
    alignItems: 'flex-start',
  },
  scoreGroup: {
    alignItems: 'center',
  },
  distanceGroup: {
    alignItems: 'flex-end',
  },
  hudVal: {
    color: '#F8FAFC',
    fontSize: 20,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  hudLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  scorePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  scoreVal: {
    fontSize: 16,
    fontWeight: '800',
  },
  alertBanner: {
    position: 'absolute',
    top: 110,
    left: 20,
    right: 20,
    backgroundColor: '#EF4444',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    zIndex: 999,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  alertText: {
    color: '#0B0F19',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudMain: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginVertical: 10,
  },
  gForceCard: {
    backgroundColor: 'rgba(30, 41, 59, 0.4)',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gForceCardTitle: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 10,
  },
  gForceGrid: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#070A13',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.03)',
  },
  gForceGridRing: {
    position: 'absolute',
    width: 50,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  gForceGridRingOuter: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.1)', // outer boundary is red
  },
  gForceCrosshairX: {
    position: 'absolute',
    width: '100%',
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gForceCrosshairY: {
    position: 'absolute',
    height: '100%',
    width: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
  },
  gForceBubble: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#3B82F6', // Blue dot in safe boundaries
    shadowColor: '#3B82F6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
    zIndex: 10,
  },
  gForceBubbleHarsh: {
    backgroundColor: '#EF4444', // Red dot in harsh boundaries
    shadowColor: '#EF4444',
  },
  gForceMagnitudeText: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '600',
    marginTop: 10,
  },
  textBlue: {
    color: '#3B82F6',
    fontWeight: '700',
  },
  textRed: {
    color: '#EF4444',
    fontWeight: '700',
  },
  mapContainer: {
    paddingHorizontal: 20,
    marginVertical: 15,
  },
  footer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 30,
    marginTop: 5,
  },
  stopButton: {
    width: 160,
    height: 52,
    backgroundColor: '#EF4444',
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 15,
    elevation: 6,
  },
  stopIcon: {
    marginRight: 8,
  },
  stopButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
});
