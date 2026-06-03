import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Shield } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

export default function ProtectionActiveBanner() {
  const waveAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [waveAnim]);

  return (
    <View style={styles.bannerContainer}>
      <Animated.View style={[
        styles.bannerBgGlow,
        { opacity: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.12] }) }
      ]} />
      <View style={styles.bannerContent}>
        <View style={styles.bannerLeft}>
          <View style={styles.statusDotActive} />
          <View>
            <Text style={styles.bannerTitle}>Protection Active</Text>
            <Text style={styles.bannerText}>Telemetry engine monitoring for sudden impacts</Text>
          </View>
        </View>
        <Shield size={20} color={Colors.primary} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  bannerContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerBgGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  bannerText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
});
