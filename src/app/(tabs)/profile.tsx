import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Switch, 
  Alert 
} from 'react-native';
import { useDriveStore } from '../../store/useDriveStore';
import { Colors } from '../../constants/theme';
import { 
  User, 
  Shield, 
  Bell, 
  MapPin, 
  Key, 
  FileText, 
  Settings, 
  LogOut, 
  ChevronRight,
  TrendingUp,
  HeartHandshake
} from 'lucide-react-native';

export default function ProfileScreen() {
  const notificationsEnabled = useDriveStore((state) => state.notificationsEnabled);
  const locationSharingEnabled = useDriveStore((state) => state.locationSharingEnabled);
  const toggleNotifications = useDriveStore((state) => state.toggleNotifications);
  const toggleLocationSharing = useDriveStore((state) => state.toggleLocationSharing);

  const healthScore = useDriveStore((state) => state.healthScore);
  const safeDays = useDriveStore((state) => state.safeDays);

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
        
        {/* Profile Card */}
        <View style={styles.profileCard}>
          <View style={styles.avatarSection}>
            <View style={styles.avatarGlow}>
              <View style={styles.avatarCircle}>
                <Text style={styles.avatarText}>DC</Text>
              </View>
            </View>
            <View style={styles.badgeContainer}>
              <Shield size={10} color="#0E1711" style={{ marginRight: 3 }} />
              <Text style={styles.badgeText}>PROTECTED</Text>
            </View>
          </View>
          
          <Text style={styles.userName}>David Carter</Text>
          <Text style={styles.userEmail}>david.carter@safeguard.io</Text>
        </View>

        {/* Safety Stats Row */}
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>{safeDays}</Text>
            <Text style={styles.statLbl}>Days Safe</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={[styles.statVal, { color: Colors.primary }]}>{healthScore}%</Text>
            <Text style={styles.statLbl}>Health score</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statVal}>0</Text>
            <Text style={styles.statLbl}>Crashes</Text>
          </View>
        </View>

        {/* Preferences / Toggles Section */}
        <Text style={styles.sectionTitle}>Privacy & Preferences</Text>
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

        {/* Preferences / Toggles Section */}
        <Text style={styles.sectionTitle}>Security & Calibration</Text>
        <View style={styles.menuCard}>
          {/* Sensor Settings Calibration */}
          <TouchableOpacity 
            style={styles.menuItemBtn} 
            onPress={handleCalibrationInfo}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 160, 0, 0.08)' }]}>
                <TrendingUp size={18} color={Colors.warning} />
              </View>
              <View>
                <Text style={styles.menuItemText}>G-Sensor Calibration</Text>
                <Text style={styles.menuItemSubtext}>Align thresholds for crash detection</Text>
              </View>
            </View>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          {/* Emergency Key */}
          <TouchableOpacity style={styles.menuItemBtn} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 82, 82, 0.08)' }]}>
                <Key size={18} color={Colors.alert} />
              </View>
              <View>
                <Text style={styles.menuItemText}>SOS Responder Token</Text>
                <Text style={styles.menuItemSubtext}>Verify dispatcher access keys</Text>
              </View>
            </View>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Help & Terms */}
        <Text style={styles.sectionTitle}>Support & About</Text>
        <View style={styles.menuCard}>
          <TouchableOpacity style={styles.menuItemBtn} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                <HeartHandshake size={18} color={Colors.text} />
              </View>
              <Text style={styles.menuItemTextOnly}>SafeGuard Help Desk</Text>
            </View>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItemBtn} activeOpacity={0.7}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
                <FileText size={18} color={Colors.text} />
              </View>
              <Text style={styles.menuItemTextOnly}>Terms of Protection Policy</Text>
            </View>
            <ChevronRight size={16} color={Colors.textSecondary} />
          </TouchableOpacity>
        </View>

        {/* Sign Out Action Button */}
        <TouchableOpacity 
          style={styles.signOutButton} 
          onPress={handleSignOut}
          activeOpacity={0.8}
        >
          <LogOut size={18} color={Colors.alert} style={{ marginRight: 8 }} />
          <Text style={styles.signOutText}>Sign Out Account</Text>
        </TouchableOpacity>

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
  profileCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  avatarSection: {
    position: 'relative',
    marginBottom: 16,
  },
  avatarGlow: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.15)',
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#0A120E', // Very dark green tone
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  avatarText: {
    color: Colors.text,
    fontSize: 24,
    fontWeight: '800',
  },
  badgeContainer: {
    position: 'absolute',
    bottom: -6,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.background,
  },
  badgeText: {
    color: '#0E1711',
    fontSize: 8,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  userName: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 2,
  },
  userEmail: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 14,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    alignItems: 'center',
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
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: Colors.border,
  },
  sectionTitle: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1.0,
    marginBottom: 10,
    paddingLeft: 4,
  },
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
  menuItemBtn: {
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
  menuItemTextOnly: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
  },
  menuDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 82, 82, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.12)',
    paddingVertical: 14,
    borderRadius: 16,
    marginTop: 8,
  },
  signOutText: {
    color: Colors.alert,
    fontSize: 13,
    fontWeight: '700',
  },
});
