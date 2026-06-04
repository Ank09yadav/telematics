import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert, Modal, TextInput } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { AlertsRepository } from '../../database/alertsRepository';
import { ContactsRepository, Contact } from '../../database/contactsRepository';
import { Colors } from '../../constants/theme';
import { Shield, Plus } from 'lucide-react-native';

// Import extracted sub-components
import ProtectionActiveBanner from '../../components/safety/ProtectionActiveBanner';
import SosHoldButton from '../../components/safety/SosHoldButton';
import SafetyFeaturesGrid from '../../components/safety/SafetyFeaturesGrid';
import EmergencyContactsList from '../../components/safety/EmergencyContactsList';

export default function SafetyScreen() {
  const db = useSQLiteContext();

  // Contacts list state
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactType, setNewContactType] = useState<'contact' | 'emergency'>('contact');

  // Load contacts from DB
  const loadContacts = useCallback(async () => {
    try {
      const data = await ContactsRepository.getContacts(db);
      setContacts(data);
    } catch (err) {
      console.error('Error loading contacts:', err);
    }
  }, [db]);

  useEffect(() => {
    loadContacts();
  }, [loadContacts]);

  const resetForm = () => {
    setNewContactName('');
    setNewContactPhone('');
    setNewContactType('contact');
  };

  // Save new contact
  const handleSaveContact = async () => {
    const trimmedName = newContactName.trim();
    const trimmedPhone = newContactPhone.trim();

    if (!trimmedName) {
      Alert.alert('Validation Error', 'Please enter a name for the contact.');
      return;
    }

    if (!trimmedPhone) {
      Alert.alert('Validation Error', 'Please enter a phone number.');
      return;
    }

    // Basic phone pattern check (must have at least 3 digits)
    const digitCount = trimmedPhone.replace(/\D/g, '').length;
    if (digitCount < 3) {
      Alert.alert('Validation Error', 'Please enter a valid phone number.');
      return;
    }

    try {
      await ContactsRepository.saveContact(db, {
        name: trimmedName,
        phone: trimmedPhone,
        type: newContactType,
      });
      await loadContacts();
      setModalVisible(false);
      resetForm();
    } catch (err) {
      console.error('Error saving contact:', err);
      Alert.alert('Error', 'Failed to save the emergency contact.');
    }
  };

  // Delete contact
  const handleDeleteContact = (contact: Contact) => {
    if (!contact.id) return;
    
    Alert.alert(
      'Delete Contact',
      `Are you sure you want to delete ${contact.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await ContactsRepository.deleteContact(db, contact.id!);
              await loadContacts();
            } catch (err) {
              console.error('Error deleting contact:', err);
              Alert.alert('Error', 'Failed to delete the contact.');
            }
          }
        }
      ]
    );
  };

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

  const handleCallContact = (contact: Contact) => {
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
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)} activeOpacity={0.7}>
            <Plus size={14} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add Contact</Text>
          </TouchableOpacity>
        </View>
        <EmergencyContactsList 
          contacts={contacts} 
          onCall={handleCallContact} 
          onDelete={handleDeleteContact}
        />

        <View style={{ height: 110 }} />
      </ScrollView>

      {/* Add Contact Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
          resetForm();
        }}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Emergency Contact</Text>

            <Text style={styles.inputLabel}>Name</Text>
            <TextInput
              style={styles.textInput}
              value={newContactName}
              onChangeText={setNewContactName}
              placeholder="e.g. John Doe"
              placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.textInput}
              value={newContactPhone}
              onChangeText={setNewContactPhone}
              placeholder="e.g. +1 (555) 019-2834"
              placeholderTextColor={Colors.textMuted}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Contact Type</Text>
            <View style={styles.typeRow}>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newContactType === 'contact' && styles.typeButtonSelected
                ]}
                onPress={() => setNewContactType('contact')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.typeButtonText,
                  newContactType === 'contact' && styles.typeButtonTextSelected
                ]}>Standard Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.typeButton,
                  newContactType === 'emergency' && styles.typeButtonSelected,
                  newContactType === 'emergency' && styles.typeButtonEmergencySelected
                ]}
                onPress={() => setNewContactType('emergency')}
                activeOpacity={0.7}
              >
                <Text style={[
                  styles.typeButtonText,
                  newContactType === 'emergency' && styles.typeButtonTextSelected
                ]}>Emergency Service</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setModalVisible(false);
                  resetForm();
                }}
                activeOpacity={0.7}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.saveButton]}
                onPress={handleSaveContact}
                activeOpacity={0.7}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
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
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 200, 83, 0.08)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.15)',
    gap: 4,
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: Colors.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.5,
    shadowRadius: 15,
    elevation: 10,
  },
  modalTitle: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 16,
  },
  inputLabel: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 6,
    marginTop: 12,
  },
  textInput: {
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: Colors.text,
    fontSize: 14,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  typeButton: {
    flex: 1,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  typeButtonSelected: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
  },
  typeButtonEmergencySelected: {
    borderColor: Colors.alert,
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  typeButtonText: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  typeButtonTextSelected: {
    color: Colors.text,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 24,
  },
  modalButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    minWidth: 80,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  cancelButtonText: {
    color: Colors.textSecondary,
    fontSize: 13,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: Colors.primary,
  },
  saveButtonText: {
    color: Colors.background,
    fontSize: 13,
    fontWeight: '700',
  },
});
