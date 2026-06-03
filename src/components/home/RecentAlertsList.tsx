import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { AlertTriangle, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { SafetyAlert } from '../../database/alertsRepository';

interface RecentAlertsListProps {
  alerts: SafetyAlert[];
  isLoading: boolean;
  onPress: () => void;
}

export default function RecentAlertsList({ alerts, isLoading, onPress }: RecentAlertsListProps) {
  return (
    <View style={styles.container}>
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
              onPress={onPress}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
