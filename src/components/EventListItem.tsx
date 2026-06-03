import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { TelemetryEvent } from '../types/telemetry';
import { formatTime } from '../utils/timeFormatter';
import { AlertTriangle, TrendingUp, Compass } from 'lucide-react-native';

interface EventListItemProps {
  event: TelemetryEvent;
}

export const EventListItem: React.FC<EventListItemProps> = ({ event }) => {
  // Determine styling and icon based on event type
  let icon = <AlertTriangle size={18} color="#EF4444" />;
  let color = '#EF4444';
  let title = 'Harsh Event';

  if (event.type === 'harsh_acceleration') {
    icon = <TrendingUp size={18} color="#F59E0B" />;
    color = '#F59E0B'; // Amber
    title = 'Harsh Acceleration';
  } else if (event.type === 'harsh_braking') {
    icon = <AlertTriangle size={18} color="#EF4444" />;
    color = '#EF4444'; // Red
    title = 'Harsh Braking';
  } else if (event.type === 'harsh_cornering') {
    icon = <Compass size={18} color="#8B5CF6" />;
    color = '#8B5CF6'; // Violet
    title = 'Harsh Cornering';
  }

  return (
    <View style={styles.container}>
      <View style={[styles.indicatorBar, { backgroundColor: color }]} />
      <View style={styles.content}>
        <View style={styles.header}>
          <View style={styles.titleRow}>
            <View style={[styles.iconWrapper, { backgroundColor: `${color}15` }]}>
              {icon}
            </View>
            <Text style={styles.title}>{title}</Text>
          </View>
          <Text style={styles.time}>{formatTime(event.timestamp)}</Text>
        </View>
        <Text style={styles.description}>{event.description}</Text>
        <View style={styles.footer}>
          <Text style={styles.magnitudeLabel}>
            Magnitude:{' '}
            <Text style={[styles.magnitudeValue, { color }]}>
              {event.magnitude} {event.type === 'harsh_cornering' && event.magnitude > 1 ? 'rad/s' : 'G'}
            </Text>
          </Text>
          <Text style={styles.coords}>
            {event.latitude.toFixed(5)}, {event.longitude.toFixed(5)}
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    marginVertical: 6,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    overflow: 'hidden',
  },
  indicatorBar: {
    width: 4,
    height: '100%',
  },
  content: {
    flex: 1,
    padding: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconWrapper: {
    padding: 6,
    borderRadius: 6,
    marginRight: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 14,
    fontWeight: '600',
  },
  time: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '500',
  },
  description: {
    color: '#CBD5E1',
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 8,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.03)',
    paddingTop: 6,
  },
  magnitudeLabel: {
    color: '#64748B',
    fontSize: 11,
  },
  magnitudeValue: {
    fontWeight: '700',
  },
  coords: {
    color: '#475569',
    fontSize: 10,
    fontFamily: 'monospace',
  },
});
export default EventListItem;
