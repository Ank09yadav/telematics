import React from 'react';
import { View, Text, StyleSheet, Switch } from 'react-native';
import { Bell, MapPin } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useDriveStore } from '../../store/useDriveStore';

export default function PreferencesCard() {
  const notificationsEnabled = useDriveStore((state) => state.notificationsEnabled);
  const locationSharingEnabled = useDriveStore((state) => state.locationSharingEnabled);
  const toggleNotifications = useDriveStore((state) => state.toggleNotifications);
  const toggleLocationSharing = useDriveStore((state) => state.toggleLocationSharing);

  return (
    <View style={styles.menuCard}>
      {/* Notifications Toggle */}
      <View style={styles.menuItemToggle}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(32, 138, 239, 0.08)' }]}>
            <Bell size={18} color={Colors.info} />
          </View>
          <View>
            <Text style={styles.menuItemText}>Safety Notifications</Text>
            <Text style={styles.menuItemSubtext}>Receive warnings for speeding and braking</Text>
          </View>
        </View>
        <Switch
          value={notificationsEnabled}
          onValueChange={toggleNotifications}
          trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
          thumbColor={notificationsEnabled ? Colors.primary : '#64748B'}
        />
      </View>

      <View style={styles.menuDivider} />

      {/* Location Sharing Toggle */}
      <View style={styles.menuItemToggle}>
        <View style={styles.menuItemLeft}>
          <View style={[styles.iconWrapper, { backgroundColor: 'rgba(0, 200, 83, 0.08)' }]}>
            <MapPin size={18} color={Colors.primary} />
          </View>
          <View>
            <Text style={styles.menuItemText}>Location Broadcast</Text>
            <Text style={styles.menuItemSubtext}>Share coordinates during live telemetry</Text>
          </View>
        </View>
        <Switch
          value={locationSharingEnabled}
          onValueChange={toggleLocationSharing}
          trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
          thumbColor={locationSharingEnabled ? Colors.primary : '#64748B'}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    marginBottom: 20,
  },
  menuItemToggle: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
    paddingRight: 8,
  },
  iconWrapper: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.02)',
  },
  menuItemText: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  menuItemSubtext: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '500',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
});
