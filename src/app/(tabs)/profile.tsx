import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Settings } from 'lucide-react-native';
import { useDriveStore } from '../../store/useDriveStore';

// Import extracted sub-components
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import PreferencesCard from '../../components/profile/PreferencesCard';
import SettingsActionsList from '../../components/profile/SettingsActionsList';

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const refreshStats = useDriveStore((state) => state.refreshStats);

  useFocusEffect(
    React.useCallback(() => {
      refreshStats(db);
    }, [db, refreshStats])
  );
  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out of SafeGuard?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: () => console.log('Signing out...') }
      ]
    );
  };

  const handleCalibrationInfo = () => {
    Alert.alert(
      'Sensor Calibration',
      'SafeGuard uses automatic gyroscope alignment. High G-force monitoring is active and calibrated at 20Hz. Pitch/Yaw adjustments will execute on next vehicle start.',
      [{ text: 'OK' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.preTitle}>User Profile</Text>
          <Text style={styles.title}>Safety Account</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7}>
          <Settings size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header */}
        <ProfileHeader />

        {/* Safety Stats Row */}
        <ProfileStats />

        {/* Preferences Switches */}
        <PreferencesCard />

        {/* Actions Calibration / SOS Token / SignOut list */}
        <SettingsActionsList onCalibrate={handleCalibrationInfo} onSignOut={handleSignOut} />

        <View style={{ height: 110 }} />
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
  settingsBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
});
