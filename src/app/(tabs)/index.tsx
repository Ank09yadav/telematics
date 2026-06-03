import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { router, useFocusEffect } from 'expo-router';
import { useDriveStore } from '../../store/useDriveStore';
import { AlertsRepository, SafetyAlert } from '../../database/alertsRepository';
import { Colors } from '../../constants/theme';
import { 
  Shield, 
  Bell, 
  Activity, 
  Zap, 
  ShieldCheck, 
  ChevronRight, 
  AlertTriangle, 
  ArrowUpRight, 
  Compass, 
  Mic 
} from 'lucide-react-native';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const isDriving = useDriveStore((state) => state.isDriving);
  const startTrip = useDriveStore((state) => state.startTrip);
  
  // Dynamic sensors tracking
  const gForce = useDriveStore((state) => state.gForce);
  const crashDetectionEnabled = useDriveStore((state) => state.crashDetectionEnabled);
  const liveLocationEnabled = useDriveStore((state) => state.liveLocationEnabled);
  const soundAlertEnabled = useDriveStore((state) => state.soundAlertEnabled);
  const speedMonitorEnabled = useDriveStore((state) => state.speedMonitorEnabled);
  
  const healthScore = useDriveStore((state) => state.healthScore);
  const responseMs = useDriveStore((state) => state.responseMs);
  const safeDays = useDriveStore((state) => state.safeDays);

  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Radar pulsing animation
  const radarAnim = useRef(new Animated.Value(1)).current;
  const radarOpacity = useRef(new Animated.Value(0.8)).current;

  // Retrieve recent alerts on screen focus
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      async function fetchRecentAlerts() {
        try {
          setIsLoading(true);
          const data = await AlertsRepository.getAlerts(db);
          if (isMounted) {
            setAlerts(data.slice(0, 2)); // Show only 2 recent alerts
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsLoading(false);
        }
      }
      fetchRecentAlerts();
      return () => {
        isMounted = false;
      };
    }, [db])
  );

  // Loop radar animations
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

  const handleToggleProtection = () => {
    if (isDriving) {
      router.push('/active-drive');
    } else {
      startTrip();
      router.push('/active-drive');
    }
  };

  return (
    <View style={styles.container}>
      {/* 1. Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.preTitle}>Safety Center</Text>
          <Text style={styles.title}>SafeGuard</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
            <Bell size={20} color={Colors.text} />
            <View style={styles.badge} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* 2. Radar Protection circle */}
        <View style={styles.radarCard}>
          <TouchableOpacity 
            style={styles.radarButton} 
            activeOpacity={0.8}
            onPress={handleToggleProtection}
          >
            {/* Multi-layered pulsing circles */}
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

        {/* 3. Aggregate Stats grid */}
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Activity size={20} color={Colors.primary} style={styles.statIcon} />
            <Text style={styles.statVal}>{healthScore}%</Text>
            <Text style={styles.statLbl}>Health</Text>
          </View>
          <View style={styles.statCard}>
            <Zap size={20} color="#FFA000" style={styles.statIcon} />
            <Text style={styles.statVal}>{responseMs}ms</Text>
            <Text style={styles.statLbl}>Response</Text>
          </View>
          <View style={styles.statCard}>
            <ShieldCheck size={20} color={Colors.primary} style={styles.statIcon} />
            <Text style={styles.statVal}>{safeDays}</Text>
            <Text style={styles.statLbl}>Safe Days</Text>
          </View>
        </View>

        {/* 4. Sensor Monitoring grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sensor Monitoring</Text>
          <TouchableOpacity onPress={() => router.push('/safety' as any)}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>

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

        {/* 5. Recent Alerts preview */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => router.push('/alerts' as any)}>
            <ChevronRight size={18} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <ActivityIndicator size="small" color={Colors.primary} style={{ marginVertical: 12 }} />
        ) : alerts.length > 0 ? (
          alerts.map((alert) => {
            const isHigh = alert.severity === 'high';
            const iconColor = isHigh ? Colors.alert : '#FFA000';
            return (
              <TouchableOpacity
                key={alert.id}
                style={styles.alertPreviewCard}
                onPress={() => router.push('/alerts' as any)}
                activeOpacity={0.8}
              >
                <View style={styles.alertPreviewLeft}>
                  <View style={[styles.alertIconWrapper, { backgroundColor: `${iconColor}15` }]}>
                    <AlertTriangle size={18} color={iconColor} />
                  </View>
                  <View>
                    <Text style={styles.alertPreviewTitle}>{alert.title}</Text>
                    <Text style={styles.alertPreviewTime}>
                      {new Date(alert.timestamp).toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
                    </Text>
                  </View>
                </View>
                <View style={[styles.alertPreviewBadge, { backgroundColor: `${iconColor}15` }]}>
                  <Text style={[styles.alertPreviewBadgeText, { color: iconColor }]}>
                    {alert.severity.toUpperCase()}
                  </Text>
                </View>
              </TouchableOpacity>
            );
          })
        ) : (
          <View style={styles.emptyAlertsCard}>
            <ShieldCheck size={20} color={Colors.primary} />
            <Text style={styles.emptyAlertsText}>No incidents recorded today.</Text>
          </View>
        )}

        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 50,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    marginBottom: 10,
  },
  preTitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
  },
  title: {
    color: Colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  badge: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.alert,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
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
    backgroundColor: '#0A120E', // Very dark green tone
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '31%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    marginBottom: 8,
  },
  statVal: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '800',
  },
  statLbl: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
  sectionLink: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
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
  alertPreviewCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    marginBottom: 8,
  },
  alertPreviewLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  alertIconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertPreviewTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  alertPreviewTime: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  alertPreviewBadge: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  alertPreviewBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  emptyAlertsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 200, 83, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.1)',
    borderRadius: 16,
    padding: 16,
    justifyContent: 'center',
  },
  emptyAlertsText: {
    color: Colors.primary,
    fontSize: 13,
    fontWeight: '600',
  },
});
