import React, { useState, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert 
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { AlertsRepository, SafetyAlert } from '../../database/alertsRepository';
import { Colors } from '../../constants/theme';
import { PlusCircle, Trash2, ShieldAlert } from 'lucide-react-native';

// Import extracted sub-components
import AlertsAggregates from '../../components/alerts/AlertsAggregates';
import FilterPills from '../../components/alerts/FilterPills';
import AlertItem from '../../components/alerts/AlertItem';

export default function AlertsScreen() {
  const db = useSQLiteContext();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warnings' | 'resolved'>('all');

  const fetchAlerts = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await AlertsRepository.getAlerts(db);
      setAlerts(data);
    } catch (e) {
      console.error('Failed to fetch alerts:', e);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useFocusEffect(
    useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts])
  );

  // Aggregated active counts
  const highCount = alerts.filter(a => a.severity === 'high' && a.status === 'active').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium' && a.status === 'active').length;
  const lowCount = alerts.filter(a => a.severity === 'low' && a.status === 'active').length;

  const filteredAlerts = alerts.filter(alert => {
    if (activeFilter === 'critical') return alert.severity === 'high' && alert.status === 'active';
    if (activeFilter === 'warnings') return alert.severity === 'medium' && alert.status === 'active';
    if (activeFilter === 'resolved') return alert.status === 'resolved';
    return true; // 'all'
  });

  const handleResolveAlert = async (id: number) => {
    try {
      await AlertsRepository.resolveAlert(db, id);
      await fetchAlerts();
    } catch (e) {
      console.error('Failed to resolve alert:', e);
    }
  };

  const handleDeleteAlert = async (id: number) => {
    try {
      await AlertsRepository.deleteAlert(db, id);
      await fetchAlerts();
    } catch (e) {
      console.error('Failed to delete alert:', e);
    }
  };

  const handleClearAll = () => {
    Alert.alert(
      'Clear Logs',
      'Are you sure you want to permanently delete all alerts from the database?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AlertsRepository.clearAll(db);
              await fetchAlerts();
            } catch (e) {
              console.error('Failed to clear alerts:', e);
            }
          }
        }
      ]
    );
  };

  // Seed mock warnings for visual display/testing
  const handleSeedMockAlerts = async () => {
    const mockData: SafetyAlert[] = [
      {
        timestamp: Date.now() - 5 * 60 * 1000,
        type: 'sudden_impact',
        title: 'Sudden Impact Triggered',
        description: 'Sensor magnitude spike (2.42G) exceeded critical collision thresholds.',
        severity: 'high',
        status: 'active',
        latitude: 37.7749,
        longitude: -122.4194
      },
      {
        timestamp: Date.now() - 35 * 60 * 1000,
        type: 'speed_warning',
        title: 'Harsh Acceleration Spike',
        description: 'Forward speed surged over 15.4m/s rapidly on route segment.',
        severity: 'medium',
        status: 'active',
        latitude: 37.7758,
        longitude: -122.4208
      },
      {
        timestamp: Date.now() - 2 * 3600 * 1000,
        type: 'low_battery',
        title: 'Telemetry Low Power',
        description: 'System detects battery voltage drop under 15% threshold while tracking.',
        severity: 'low',
        status: 'resolved',
        latitude: 37.7735,
        longitude: -122.4172
      }
    ];

    try {
      for (const item of mockData) {
        await AlertsRepository.saveAlert(db, item);
      }
      await fetchAlerts();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header Row */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.preTitle}>Monitoring Logs</Text>
          <Text style={styles.title}>Incident Feed</Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={[styles.headerIconBtn, { marginRight: 8 }]} 
            onPress={handleSeedMockAlerts}
            activeOpacity={0.7}
          >
            <PlusCircle size={20} color={Colors.primary} />
          </TouchableOpacity>
          {alerts.length > 0 && (
            <TouchableOpacity 
              style={styles.headerIconBtn} 
              onPress={handleClearAll}
              activeOpacity={0.7}
            >
              <Trash2 size={20} color={Colors.alert} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Aggregate Counts Category Headers */}
      <AlertsAggregates highCount={highCount} mediumCount={mediumCount} lowCount={lowCount} />

      {/* Filter Selection Pills */}
      <FilterPills 
        activeFilter={activeFilter} 
        onFilterChange={setActiveFilter} 
        highCount={highCount} 
        mediumCount={mediumCount} 
      />

      {/* List Feed Logs */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredAlerts.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredAlerts.map((alert) => (
            <AlertItem 
              key={alert.id}
              alert={alert}
              onResolve={() => handleResolveAlert(alert.id!)}
              onDelete={() => handleDeleteAlert(alert.id!)}
            />
          ))}
          <View style={{ height: 100 }} />
        </ScrollView>
      ) : (
        <View style={styles.emptyContainer}>
          <ShieldAlert size={48} color={Colors.textSecondary} style={{ marginBottom: 16, opacity: 0.3 }} />
          <Text style={styles.emptyTitle}>No Incidents Found</Text>
          <Text style={styles.emptySubtitle}>
            {activeFilter === 'all' 
              ? 'Your safety history is clear. All monitored sensors reporting operational limits.' 
              : `No events in status category "${activeFilter}".`}
          </Text>
          {activeFilter === 'all' && (
            <TouchableOpacity style={styles.seedTriggerBtn} onPress={handleSeedMockAlerts} activeOpacity={0.8}>
              <Text style={styles.seedTriggerText}>Simulate Test Alerts</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
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
    marginBottom: 16,
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
  },
  headerIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    color: Colors.text,
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    textAlign: 'center',
    marginBottom: 20,
  },
  seedTriggerBtn: {
    backgroundColor: 'rgba(0, 200, 83, 0.06)',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  seedTriggerText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
});
