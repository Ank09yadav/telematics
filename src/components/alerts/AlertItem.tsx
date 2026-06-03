import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { CheckCircle, Trash2 } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { SafetyAlert } from '../../database/alertsRepository';

interface AlertItemProps {
  alert: SafetyAlert;
  onResolve: () => void;
  onDelete: () => void;
}

export default function AlertItem({ alert, onResolve, onDelete }: AlertItemProps) {
  const isResolved = alert.status === 'resolved';

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

  const accentColor = getSeverityColor(alert.severity);
  const accentBg = getSeverityBg(alert.severity);

  return (
    <View style={[styles.alertCard, isResolved && styles.alertCardResolved]}>
      {/* Status side strip */}
      <View style={[styles.severityStrip, { backgroundColor: isResolved ? Colors.textSecondary : accentColor }]} />

      <View style={styles.alertCardContent}>
        {/* Title / Severity Header Row */}
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

        {/* Description body */}
        <Text style={[styles.alertDescription, isResolved && styles.textResolved]}>
          {alert.description}
        </Text>

        {/* Coordinate GPS stamp if present */}
        {alert.latitude && alert.longitude && (
          <Text style={styles.gpsStamp}>
            GPS: {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
          </Text>
        )}

        {/* Actions row */}
        <View style={styles.actionRow}>
          {!isResolved ? (
            <TouchableOpacity 
              style={styles.resolveButton} 
              onPress={onResolve}
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
            onPress={onDelete}
            activeOpacity={0.7}
          >
            <Trash2 size={14} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
