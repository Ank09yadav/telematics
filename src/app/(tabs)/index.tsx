import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { router, useFocusEffect } from 'expo-router';
import { useDriveStore } from '../../store/useDriveStore';
import { AlertsRepository, SafetyAlert } from '../../database/alertsRepository';
import { Colors } from '../../constants/theme';
import { Bell } from 'lucide-react-native';

// Import extracted sub-components
import RadarProtection from '../../components/home/RadarProtection';
import QuickStats from '../../components/home/QuickStats';
import SensorMonitoringGrid from '../../components/home/SensorMonitoringGrid';
import RecentAlertsList from '../../components/home/RecentAlertsList';

export default function HomeScreen() {
  const db = useSQLiteContext();
  const isDriving = useDriveStore((state) => state.isDriving);
  const startTrip = useDriveStore((state) => state.startTrip);
  const refreshStats = useDriveStore((state) => state.refreshStats);
  
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Retrieve recent active alerts and refresh safety stats on focus
  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;
      async function fetchData() {
        try {
          setIsLoading(true);
          await refreshStats(db);
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
      fetchData();
      return () => {
        isMounted = false;
      };
    }, [db, refreshStats])
  );

  const handleToggleProtection = () => {
    if (isDriving) {
      router.push('/active-drive' as any);
    } else {
      startTrip();
      router.push('/active-drive' as any);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
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
        {/* Pulsing Radar Circle */}
        <RadarProtection onToggle={handleToggleProtection} />

        {/* Aggregate Driver Stats */}
        <QuickStats />

        {/* Sensors Monitor Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Sensor Monitoring</Text>
          <TouchableOpacity onPress={() => router.push('/safety' as any)}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <SensorMonitoringGrid />

        {/* Recent Alerts List */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Alerts</Text>
          <TouchableOpacity onPress={() => router.push('/alerts' as any)}>
            <Text style={styles.sectionLink}>View all</Text>
          </TouchableOpacity>
        </View>
        <RecentAlertsList 
          alerts={alerts} 
          isLoading={isLoading} 
          onPress={() => router.push('/alerts' as any)} 
        />

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
});
