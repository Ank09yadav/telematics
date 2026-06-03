import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useDriveStore } from '../../store/useDriveStore';

interface RadarProtectionProps {
  onToggle: () => void;
}

export default function RadarProtection({ onToggle }: RadarProtectionProps) {
  const isDriving = useDriveStore((state) => state.isDriving);
  
  const radarAnim = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.parallel([
        Animated.sequence([
          Animated.timing(radarAnim, {
            toValue: 1.35,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(radarAnim, {
            toValue: 1.0,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(radarOpacity, {
            toValue: 0.2,
            duration: 1800,
            useNativeDriver: true,
          }),
          Animated.timing(radarOpacity, {
            toValue: 0.8,
            duration: 1800,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, [radarAnim, radarOpacity]);

  return (
    <View style={styles.radarCard}>
      <TouchableOpacity 
        style={styles.radarButton} 
        activeOpacity={0.8}
        onPress={onToggle}
      >
        <Animated.View style={[
          styles.radarRing, 
          { transform: [{ scale: radarAnim }], opacity: radarOpacity }
        ]} />
        <View style={styles.radarRingInner} />
        <View style={styles.radarCenter}>
          <ShieldCheck size={36} color={Colors.primary} />
          <Text style={styles.radarText}>ACTIVE</Text>
        </View>
      </TouchableOpacity>

      <View style={styles.radarStatus}>
        <Text style={styles.statusTitle}>Active Protection</Text>
        <View style={styles.statusRow}>
          <View style={styles.safeIndicator} />
          <Text style={styles.statusText}>All sensors operational</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  radarCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  radarButton: {
    width: 140,
    height: 140,
    borderRadius: 70,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  radarRing: {
    position: 'absolute',
    width: 140,
    height: 140,
    borderRadius: 70,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.04)',
  },
  radarRingInner: {
    position: 'absolute',
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.2)',
    backgroundColor: 'rgba(0, 200, 83, 0.02)',
  },
  radarCenter: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: '#0A120E',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.primary,
  },
  radarText: {
    color: Colors.primary,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.0,
    marginTop: 2,
  },
  radarStatus: {
    alignItems: 'center',
    marginTop: 18,
  },
  statusTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  safeIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
  },
  statusText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '600',
  },
});
