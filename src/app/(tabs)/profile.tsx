import React from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Alert, 
  Modal, 
  TextInput, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect } from 'expo-router';
import { Colors } from '../../constants/theme';
import { Settings, X, User as UserIcon, Mail, Phone, Heart, Truck, BookOpen, AlertTriangle } from 'lucide-react-native';
import { useDriveStore } from '../../store/useDriveStore';
import { ProfileRepository, UserProfile } from '../../database/profileRepository';

// Import extracted sub-components
import ProfileHeader from '../../components/profile/ProfileHeader';
import ProfileStats from '../../components/profile/ProfileStats';
import PreferencesCard from '../../components/profile/PreferencesCard';
import SettingsActionsList from '../../components/profile/SettingsActionsList';

export default function ProfileScreen() {
  const db = useSQLiteContext();
  const refreshStats = useDriveStore((state) => state.refreshStats);

  // Profile data state
  const [profile, setProfile] = React.useState<UserProfile | null>(null);

  // Modals visibility states
  const [isEditModalVisible, setIsEditModalVisible] = React.useState(false);
  const [isHelpModalVisible, setIsHelpModalVisible] = React.useState(false);
  const [isTermsModalVisible, setIsTermsModalVisible] = React.useState(false);

  // Edit form states
  const [editName, setEditName] = React.useState('');
  const [editEmail, setEditEmail] = React.useState('');
  const [editPhone, setEditPhone] = React.useState('');
  const [editBloodGroup, setEditBloodGroup] = React.useState('');
  const [editVehicleNo, setEditVehicleNo] = React.useState('');

  const fetchProfile = React.useCallback(async () => {
    try {
      const data = await ProfileRepository.getProfile(db);
      setProfile(data);
    } catch (err) {
      console.warn('Failed to load profile from database:', err);
    }
  }, [db]);

  useFocusEffect(
    React.useCallback(() => {
      refreshStats(db);
      fetchProfile();
    }, [db, refreshStats, fetchProfile])
  );

  const handleCalibrationInfo = () => {
    Alert.alert(
      'Sensor Calibration',
      'SafeGuard uses automatic gyroscope alignment. High G-force monitoring is active and calibrated at 20Hz. Pitch/Yaw adjustments will execute on next vehicle start.',
      [{ text: 'OK' }]
    );
  };

  const openEditModal = () => {
    if (profile) {
      setEditName(profile.name);
      setEditEmail(profile.email);
      setEditPhone(profile.phone);
      setEditBloodGroup(profile.bloodGroup);
      setEditVehicleNo(profile.vehicleNo);
    }
    setIsEditModalVisible(true);
  };

  const handleSaveProfile = async () => {
    if (!editName.trim()) {
      Alert.alert('Validation Error', 'Full Name is required.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (editEmail.trim() && !emailRegex.test(editEmail.trim())) {
      Alert.alert('Validation Error', 'Please enter a valid email address.');
      return;
    }

    const updatedProfile: UserProfile = {
      name: editName.trim(),
      email: editEmail.trim(),
      phone: editPhone.trim(),
      bloodGroup: editBloodGroup.trim(),
      vehicleNo: editVehicleNo.trim().toUpperCase(),
    };

    try {
      await ProfileRepository.updateProfile(db, updatedProfile);
      setProfile(updatedProfile);
      setIsEditModalVisible(false);
      Alert.alert('Success', 'Profile details updated successfully.');
    } catch (err) {
      console.error('Failed to save profile details:', err);
      Alert.alert('Error', 'Could not save profile details to local database.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.preTitle}>User Profile</Text>
          <Text style={styles.title}>Safety Account</Text>
        </View>
        <TouchableOpacity style={styles.settingsBtn} activeOpacity={0.7} onPress={openEditModal}>
          <Settings size={20} color={Colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Profile Card Header with floating Pen Option */}
        <ProfileHeader 
          name={profile?.name || 'David Carter'} 
          email={profile?.email || 'david.carter@safeguard.io'} 
          onEditPress={openEditModal} 
        />

        {/* Safety Stats Row */}
        <ProfileStats />

        {/* Real Info Card Display (Indian context) */}
        {profile && (
          <View style={styles.realDataCard}>
            <Text style={styles.cardHeaderTitle}>Emergency & Vehicle Information</Text>
            
            <View style={styles.dataRow}>
              <View style={styles.dataLabelSection}>
                <UserIcon size={16} color={Colors.textSecondary} style={styles.dataIcon} />
                <Text style={styles.dataLabel}>Full Name</Text>
              </View>
              <Text style={styles.dataValue}>{profile.name}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.dataRow}>
              <View style={styles.dataLabelSection}>
                <Mail size={16} color={Colors.textSecondary} style={styles.dataIcon} />
                <Text style={styles.dataLabel}>Email Address</Text>
              </View>
              <Text style={styles.dataValue} numberOfLines={1}>{profile.email || 'Not set'}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.dataRow}>
              <View style={styles.dataLabelSection}>
                <Phone size={16} color={Colors.textSecondary} style={styles.dataIcon} />
                <Text style={styles.dataLabel}>Emergency Mobile</Text>
              </View>
              <Text style={styles.dataValue}>{profile.phone || 'Not set'}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.dataRow}>
              <View style={styles.dataLabelSection}>
                <Heart size={16} color={Colors.textSecondary} style={styles.dataIcon} />
                <Text style={styles.dataLabel}>Blood Group</Text>
              </View>
              <Text style={styles.dataValue}>{profile.bloodGroup || 'Not set'}</Text>
            </View>
            <View style={styles.dataDivider} />

            <View style={styles.dataRow}>
              <View style={styles.dataLabelSection}>
                <Truck size={16} color={Colors.textSecondary} style={styles.dataIcon} />
                <Text style={styles.dataLabel}>Vehicle Register No.</Text>
              </View>
              <Text style={styles.dataValue}>{profile.vehicleNo || 'Not set'}</Text>
            </View>
          </View>
        )}

        {/* Preferences Switches */}
        <PreferencesCard />

        {/* Actions Calibration / SOS Token / SignOut list */}
        <SettingsActionsList 
          onCalibrate={handleCalibrationInfo} 
          onHelpDesk={() => setIsHelpModalVisible(true)} 
          onTerms={() => setIsTermsModalVisible(true)} 
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* ================= EDIT DETAILS MODAL ================= */}
      <Modal
        visible={isEditModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsEditModalVisible(false)}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView 
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              style={styles.modalKeyboardAvoiding}
            >
              <View style={styles.modalContentCard}>
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Edit Safety Profile</Text>
                  <TouchableOpacity 
                    style={styles.modalCloseBtn}
                    onPress={() => setIsEditModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <X size={18} color={Colors.text} />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalFormScroll} showsVerticalScrollIndicator={false}>
                  {/* Full Name */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Full Name</Text>
                    <View style={styles.inputFieldWrapper}>
                      <UserIcon size={16} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={editName}
                        onChangeText={setEditName}
                        placeholder="e.g. David Carter"
                        placeholderTextColor={Colors.textMuted}
                        maxLength={50}
                      />
                    </View>
                  </View>

                  {/* Email */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Email Address</Text>
                    <View style={styles.inputFieldWrapper}>
                      <Mail size={16} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={editEmail}
                        onChangeText={setEditEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        placeholder="e.g. david.carter@safeguard.io"
                        placeholderTextColor={Colors.textMuted}
                        maxLength={60}
                      />
                    </View>
                  </View>

                  {/* Emergency Phone */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Emergency Mobile</Text>
                    <View style={styles.inputFieldWrapper}>
                      <Phone size={16} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={editPhone}
                        onChangeText={setEditPhone}
                        keyboardType="phone-pad"
                        placeholder="e.g. +91 98765 43210"
                        placeholderTextColor={Colors.textMuted}
                        maxLength={20}
                      />
                    </View>
                  </View>

                  {/* Blood Group */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Blood Group</Text>
                    <View style={styles.inputFieldWrapper}>
                      <Heart size={16} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={editBloodGroup}
                        onChangeText={setEditBloodGroup}
                        placeholder="e.g. O+ or AB-"
                        placeholderTextColor={Colors.textMuted}
                        maxLength={5}
                      />
                    </View>
                  </View>

                  {/* Vehicle Number */}
                  <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Vehicle Register Number</Text>
                    <View style={styles.inputFieldWrapper}>
                      <Truck size={16} color={Colors.textSecondary} style={styles.inputIcon} />
                      <TextInput
                        style={styles.textInput}
                        value={editVehicleNo}
                        onChangeText={setEditVehicleNo}
                        autoCapitalize="characters"
                        placeholder="e.g. DL-3C-AB-1234"
                        placeholderTextColor={Colors.textMuted}
                        maxLength={15}
                      />
                    </View>
                  </View>

                  <View style={{ height: 20 }} />
                </ScrollView>

                {/* Form Buttons */}
                <View style={styles.modalButtonsRow}>
                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.modalBtnCancel]} 
                    onPress={() => setIsEditModalVisible(false)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalBtnCancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.modalBtn, styles.modalBtnSave]} 
                    onPress={handleSaveProfile}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.modalBtnSaveText}>Save Changes</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </KeyboardAvoidingView>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

      {/* ================= HELP DESK MODAL ================= */}
      <Modal
        visible={isHelpModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsHelpModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { height: '80%', paddingBottom: 16 }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <BookOpen size={20} color={Colors.primary} />
                <Text style={styles.modalTitle}>SafeGuard Help Desk</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setIsHelpModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContentScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.helpIntro}>
                Welcome to SafeGuard Help Desk. Follow these clear steps to secure your journeys and ensure automatic rescue dispatches operate seamlessly.
              </Text>

              <View style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>1</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Configure Safety Profile</Text>
                  <Text style={styles.stepDescription}>
                    Click the pencil icon on your avatar to fill in your name, contact mobile, blood group, and vehicle registration. Having correct details ensures rescue response agents and highway patrols can identify your vehicle and medical state instantly.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>2</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Add Emergency Contacts</Text>
                  <Text style={styles.stepDescription}>
                    Navigate to the "Safety" tab and register your family or close contacts. If a collision is triggered, they will receive SMS or cellular warnings along with a live map link showcasing your vehicle coordinates.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>3</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Calibrate G-Sensor Thresholds</Text>
                  <Text style={styles.stepDescription}>
                    Once your phone is mounted securely in your car dashboard or bike holder, tap the "G-Sensor Calibration" option on this screen. Calibration aligns the smartphone's gyroscope and accelerometer, enabling high G-force monitoring at 20Hz without false positives from road bumps.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>4</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Activate Shield Monitoring</Text>
                  <Text style={styles.stepDescription}>
                    Before starting your trip, ensure the "Automatic Safety Shield" is enabled. SafeGuard runs dynamic background tracking. Make sure to whitelist SafeGuard from Battery Optimization so iOS/Android do not suspend the accelerometer telemetry during long drives.
                  </Text>
                </View>
              </View>

              <View style={styles.stepCard}>
                <View style={styles.stepBadge}>
                  <Text style={styles.stepBadgeText}>5</Text>
                </View>
                <View style={styles.stepInfo}>
                  <Text style={styles.stepTitle}>Incident Recovery & SOS Countdown</Text>
                  <Text style={styles.stepDescription}>
                    If an impact above threshold (harsh braking or crash) is detected, a 15-second SOS alarm will sound. If you are safe, dismiss the countdown on the screen. If you do not dismiss it, SafeGuard automatically marks the incident as an Emergency, logs the alarm, and sends warnings to emergency contacts.
                  </Text>
                </View>
              </View>

              <View style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity 
              style={styles.modalPrimaryCloseBtn}
              onPress={() => setIsHelpModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.modalPrimaryCloseText}>Got It, Let's Drive</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ================= TERMS & CONDITIONS MODAL ================= */}
      <Modal
        visible={isTermsModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsTermsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContentCard, { height: '80%', paddingBottom: 16 }]}>
            <View style={styles.modalHeaderRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <AlertTriangle size={20} color={Colors.warning} />
                <Text style={styles.modalTitle}>Terms of Protection Policy</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setIsTermsModalVisible(false)}
                activeOpacity={0.7}
              >
                <X size={18} color={Colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalContentScroll} showsVerticalScrollIndicator={false}>
              <Text style={styles.termsDate}>Last Updated: June 2026</Text>
              
              <Text style={styles.termsSectionHeader}>1. Context & Scope</Text>
              <Text style={styles.termsText}>
                This document is a binding legal agreement governing the usage of the SafeGuard Telematics and Crash Alert application, operated under the laws of India. By enabling safety tracking, you agree to these Terms.
              </Text>

              <Text style={styles.termsSectionHeader}>2. Information Collection & DPDP Compliance</Text>
              <Text style={styles.termsText}>
                In strict compliance with the **Digital Personal Data Protection (DPDP) Act, 2023** and **Information Technology Act, 2000**, the application collects, stores, and processes:
                {'\n'}• Real-time location data (via GPS coordinates)
                {'\n'}• Sensor data (accelerometer speed, G-forces at 20Hz, gyroscopic alignment)
                {'\n'}• Vehicle and personal details (Name, vehicle registration plate, blood group, emergency contact list)
                {'\n\n'}All primary tracking data remains stored locally inside your device's SQLite database. It is transmitted to our servers or emergency dispatchers **only** when an anomaly/impact triggers an automated SOS dispatch.
              </Text>

              <Text style={styles.termsSectionHeader}>3. Explicit Location Consent</Text>
              <Text style={styles.termsText}>
                You provide explicit, clear consent to allow the application to track your geographic location in the background. Background transmission is necessary to determine crash sites on national/state highways in India and transmit telemetry during accidents.
              </Text>

              <Text style={styles.termsSectionHeader}>4. Disclaimer of Liability & Road Safety</Text>
              <Text style={styles.termsText}>
                SafeGuard is a safety assist utility and **not** a replacement for government emergency numbers (112 / 108) or standard alert channels.
                {'\n\n'}**Network Limitations:** Automated emergency warnings depend on active internet connection, GPS accuracy, and SMS transmission. SafeGuard is not liable for delayed notifications or failure to transmit alerts caused by telecom network blackout zones (e.g., remote areas, tunnels, mountain passes).
                {'\n\n'}**Calibration Requirements:** The user is solely responsible for proper mounting and calibration of the mobile device. Incorrect calibration may lead to false alerts or missed crash logs.
              </Text>

              <Text style={styles.termsSectionHeader}>5. Whitelist and Operating System Limits</Text>
              <Text style={styles.termsText}>
                Due to aggressive Android/iOS battery-saving algorithms (Doze mode), the user must configure the app manually to "Unrestricted" battery usage. SafeGuard is not responsible for background suspension caused by operating system limitations.
              </Text>

              <Text style={{ height: 20 }} />
            </ScrollView>

            <TouchableOpacity 
              style={[styles.modalPrimaryCloseBtn, { backgroundColor: 'rgba(255,255,255,0.08)', borderWidth: 1, borderColor: Colors.border }]}
              onPress={() => setIsTermsModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={[styles.modalPrimaryCloseText, { color: Colors.text }]}>Close Policy Document</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

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
  
  // Real Info Card styles
  realDataCard: {
    backgroundColor: Colors.surface,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 18,
    marginBottom: 20,
  },
  cardHeaderTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 16,
  },
  dataRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  dataLabelSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  dataIcon: {
    marginRight: 2,
  },
  dataLabel: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  dataValue: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    textAlign: 'right',
    flex: 1,
    marginLeft: 20,
  },
  dataDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },

  // Modal styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(8, 9, 12, 0.85)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalKeyboardAvoiding: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContentCard: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.45,
    shadowRadius: 18,
    elevation: 8,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    paddingBottom: 12,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.surfaceLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFormScroll: {
    maxHeight: 320,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputFieldWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  textInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 14,
    fontWeight: '600',
  },
  modalButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  modalBtn: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalBtnCancel: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalBtnCancelText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '700',
  },
  modalBtnSave: {
    backgroundColor: Colors.primary,
  },
  modalBtnSaveText: {
    color: '#0E1711',
    fontSize: 13,
    fontWeight: '800',
  },

  // Help Modal & Terms Modal inner styling
  modalContentScroll: {
    flex: 1,
    marginBottom: 16,
  },
  helpIntro: {
    color: Colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 20,
  },
  stepCard: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  stepBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primaryGlow,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBadgeText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '800',
  },
  stepInfo: {
    flex: 1,
  },
  stepTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  stepDescription: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 16,
  },
  modalPrimaryCloseBtn: {
    height: 48,
    backgroundColor: Colors.primary,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  modalPrimaryCloseText: {
    color: '#0E1711',
    fontSize: 13,
    fontWeight: '800',
  },
  
  // Terms & Conditions inner styling
  termsDate: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginBottom: 16,
  },
  termsSectionHeader: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginTop: 16,
    marginBottom: 6,
  },
  termsText: {
    color: Colors.textSecondary,
    fontSize: 11,
    lineHeight: 17,
  },
});
