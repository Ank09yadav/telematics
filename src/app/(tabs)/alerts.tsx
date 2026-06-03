import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert, 
  Platform 
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { AlertsRepository, SafetyAlert } from '../../database/alertsRepository';
import { Colors } from '../../constants/theme';
import { 
  AlertTriangle, 
  CheckCircle, 
  Trash2, 
  ShieldAlert, 
  PlusCircle,
  HelpCircle,
  BellRing
} from 'lucide-react-native';

export default function AlertsScreen() {
  const db = useSQLiteContext();
  const [alerts, setAlerts] = useState<SafetyAlert[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<'all' | 'critical' | 'warnings' | 'resolved'>('all');

  // Load alerts from DB
  const fetchAlerts = React.useCallback(async () => {
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
    React.useCallback(() => {
      fetchAlerts();
    }, [fetchAlerts])
  );

  // Compute aggregated category counts
  const highCount = alerts.filter(a => a.severity === 'high' && a.status === 'active').length;
  const mediumCount = alerts.filter(a => a.severity === 'medium' && a.status === 'active').length;
  const lowCount = alerts.filter(a => a.severity === 'low' && a.status === 'active').length;

  // Filter alerts list based on selection
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

  // Seed mock warnings for visual display and test suite purposes
  const handleSeedMockAlerts = async () => {
    const mockData: SafetyAlert[] = [
      {
        timestamp: Date.now() - 5 * 60 * 1000, // 5 min ago
        type: 'sudden_impact',
        title: 'Sudden Impact Triggered',
        description: 'Sensor magnitude spike (2.42G) exceeded critical collision thresholds.',
        severity: 'high',
        status: 'active',
        latitude: 37.7749,
        longitude: -122.4194
      },
      {
        timestamp: Date.now() - 35 * 60 * 1000, // 35 min ago
        type: 'speed_warning',
        title: 'Harsh Acceleration Spike',
        description: 'Forward speed surged over 15.4m/s rapidly on route segment.',
        severity: 'medium',
        status: 'active',
        latitude: 37.7758,
        longitude: -122.4208
      },
      {
        timestamp: Date.now() - 2 * 3600 * 1000, // 2 hrs ago
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

  const getSeverityColor = (severity: string) => {
    if (severity === 'high') return Colors.alert;
    if (severity === 'medium') return Colors.warning;
    return Colors.info;
  };

  const getSeverityBg = (severity: string) => {
    if (severity === 'high') return Colors.alertGlow;
    if (severity === 'medium') return Colors.warningGlow;
    return 'rgba(32, 138, 239, 0.1)';
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

      {/* Aggregate Counts Header Grid */}
      <View style={styles.aggregateRow}>
        <View style={[styles.aggregateCard, styles.aggBorderHigh]}>
          <Text style={[styles.aggregateVal, { color: Colors.alert }]}>{highCount}</Text>
          <Text style={styles.aggregateLbl}>Critical</Text>
        </View>
        <View style={[styles.aggregateCard, styles.aggBorderMedium]}>
          <Text style={[styles.aggregateVal, { color: Colors.warning }]}>{mediumCount}</Text>
          <Text style={styles.aggregateLbl}>Warnings</Text>
        </View>
        <View style={[styles.aggregateCard, styles.aggBorderLow]}>
          <Text style={[styles.aggregateVal, { color: Colors.info }]}>{lowCount}</Text>
          <Text style={styles.aggregateLbl}>Standard</Text>
        </View>
      </View>

      {/* Filter Pills list */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
            onPress={() => setActiveFilter('all')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>All Logs</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'critical' && styles.filterPillActive]}
            onPress={() => setActiveFilter('critical')}
          >
            <View style={[styles.filterDot, { backgroundColor: Colors.alert }]} />
            <Text style={[styles.filterPillText, activeFilter === 'critical' && styles.filterPillTextActive]}>Critical ({highCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'warnings' && styles.filterPillActive]}
            onPress={() => setActiveFilter('warnings')}
          >
            <View style={[styles.filterDot, { backgroundColor: Colors.warning }]} />
            <Text style={[styles.filterPillText, activeFilter === 'warnings' && styles.filterPillTextActive]}>Warnings ({mediumCount})</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterPill, activeFilter === 'resolved' && styles.filterPillActive]}
            onPress={() => setActiveFilter('resolved')}
          >
            <Text style={[styles.filterPillText, activeFilter === 'resolved' && styles.filterPillTextActive]}>Resolved</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Alerts Logs Feed */}
      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      ) : filteredAlerts.length > 0 ? (
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {filteredAlerts.map((alert) => {
            const isResolved = alert.status === 'resolved';
            const accentColor = getSeverityColor(alert.severity);
            const accentBg = getSeverityBg(alert.severity);

            return (
              <View 
                key={alert.id} 
                style={[
                  styles.alertCard,
                  isResolved && styles.alertCardResolved
                ]}
              >
                {/* Visual Status Indicator side strip */}
                <View style={[styles.severityStrip, { backgroundColor: isResolved ? Colors.textSecondary : accentColor }]} />

                <View style={styles.alertCardContent}>
                  {/* Title & Severity Header Row */}
                  <View style={styles.alertHeaderRow}>
                    <View style={styles.titleWrapper}>
                      <Text style={[styles.alertTitle, isResolved && styles.textResolved]}>
                        {alert.title}
                      </Text>
                      <Text style={styles.alertTimestamp}>
                        {new Date(alert.timestamp).toLocaleString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit', 
                          minute: '2-digit' 
                        })}
                      </Text>
                    </View>
                    <View style={[styles.severityBadge, { backgroundColor: isResolved ? 'rgba(255,255,255,0.05)' : accentBg }]}>
                      <Text style={[styles.severityBadgeText, { color: isResolved ? Colors.textSecondary : accentColor }]}>
                        {isResolved ? 'RESOLVED' : alert.severity.toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  {/* Body description */}
                  <Text style={[styles.alertDescription, isResolved && styles.textResolved]}>
                    {alert.description}
                  </Text>

                  {/* Coordinate GPS stamp if present */}
                  {alert.latitude && alert.longitude && (
                    <Text style={styles.gpsStamp}>
                      GPS: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                    </Text>
                  )}

                  {/* Action row */}
                  <View style={styles.actionRow}>
                    {!isResolved ? (
                      <TouchableOpacity 
                        style={styles.resolveButton} 
                        onPress={() => handleResolveAlert(alert.id!)}
                        activeOpacity={0.7}
                      >
                        <CheckCircle size={14} color="#0E1711" style={{ marginRight: 6 }} />
                        <Text style={styles.resolveButtonText}>Mark Resolved</Text>
                      </TouchableOpacity>
                    ) : (
                      <View style={styles.resolvedLabel}>
                        <CheckCircle size={14} color={Colors.primary} style={{ marginRight: 6 }} />
                        <Text style={styles.resolvedLabelText}>Resolved & Dismissed</Text>
                      </View>
                    )}

                    <TouchableOpacity 
                      style={styles.deleteButton} 
                      onPress={() => handleDeleteAlert(alert.id!)}
                      activeOpacity={0.7}
                    >
                      <Trash2 size={14} color={Colors.textSecondary} />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })}
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
              <BellRing size={16} color={Colors.primary} style={{ marginRight: 8 }} />
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
  aggregateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aggregateCard: {
    backgroundColor: Colors.surface,
    width: '31%',
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aggBorderHigh: {
    borderLeftColor: Colors.alert,
  },
  aggBorderMedium: {
    borderLeftColor: Colors.warning,
  },
  aggBorderLow: {
    borderLeftColor: Colors.info,
  },
  aggregateVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  aggregateLbl: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  filterContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 6,
  },
  filterPillActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
  },
  filterPillText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: Colors.primary,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  alertCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 12,
    overflow: 'hidden',
  },
  alertCardResolved: {
    opacity: 0.6,
  },
  severityStrip: {
    width: 4,
  },
  alertCardContent: {
    flex: 1,
    padding: 16,
  },
  alertHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  titleWrapper: {
    flex: 1,
    paddingRight: 8,
  },
  alertTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '800',
  },
  alertTimestamp: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
  severityBadge: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
  },
  severityBadgeText: {
    fontSize: 8,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  alertDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
    fontWeight: '500',
    marginBottom: 12,
  },
  textResolved: {
    textDecorationLine: 'line-through',
  },
  gpsStamp: {
    color: Colors.textSecondary,
    fontSize: 9,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    marginBottom: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  resolveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  resolveButtonText: {
    color: '#0E1711',
    fontSize: 11,
    fontWeight: '700',
  },
  resolvedLabel: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  resolvedLabelText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
  deleteButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
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
    flexDirection: 'row',
    alignItems: 'center',
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
