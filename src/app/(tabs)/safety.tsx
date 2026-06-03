import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { AlertsRepository } from '../../database/alertsRepository';
import { Colors } from '../../constants/theme';
import { Shield } from 'lucide-react-native';

// Import extracted sub-components
import ProtectionActiveBanner from '../../components/safety/ProtectionActiveBanner';
import SosHoldButton from '../../components/safety/SosHoldButton';
import SafetyFeaturesGrid from '../../components/safety/SafetyFeaturesGrid';
import EmergencyContactsList from '../../components/safety/EmergencyContactsList';

export default function SafetyScreen() {
  const db = useSQLiteContext();

  // Contacts list
  const [contacts] = useState([
    { id: '1', name: 'Roadside Assistance', phone: '1-800-555-0199', type: 'dispatch' },
    { id: '2', name: 'Emergency Services (911)', phone: '911', type: 'emergency' },
    { id: '3', name: 'Sarah Carter (Guardian)', phone: '+1 (555) 014-2834', type: 'contact' },
  ]);

  // Callback when hold SOS button completes 2s press
  const handleSosAlertTriggered = async () => {
    const sosAlert = {
      timestamp: Date.now(),
      type: 'sos' as const,
      title: 'Emergency SOS Manually Triggered',
      description: 'Emergency panic alarm was broadcast manually by user via SafeGuard SOS button.',
      severity: 'high' as const,
      status: 'active' as const,
      latitude: 37.7749,
      longitude: -122.4194,
    };

    await AlertsRepository.saveAlert(db, sosAlert);

    Alert.alert(
      'Emergency SOS Triggered',
      'Emergency response services have been notified of your current location.'
    );
  };

  const handleCallContact = (contact: typeof contacts[0]) => {
    Alert.alert(
      'Emergency Dial',
      `Would you like to initiate a call to ${contact.name} (${contact.phone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Call', onPress: () => console.log(`Calling ${contact.phone}`) }
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.preTitle}>Safety Center</Text>
          <Text style={styles.title}>Emergency Center</Text>
        </View>
        <View style={styles.shieldIconContainer}>
          <Shield size={24} color={Colors.primary} />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Protection Active Warning Wave */}
        <ProtectionActiveBanner />

        {/* SOS holds button trigger */}
        <SosHoldButton onTriggered={handleSosAlertTriggered} />

        {/* Safety Switches settings 2x2 grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
        </View>
        <SafetyFeaturesGrid />

        {/* Emergency Contacts card list */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
        </View>
        <EmergencyContactsList contacts={contacts} onCall={handleCallContact} />

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
  shieldIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0, 200, 83, 0.06)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.15)',
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 12,
  },
  sectionTitle: {
    color: Colors.text,
    fontSize: 15,
    fontWeight: '700',
  },
});
