import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Phone, Trash2 } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { Contact } from '../../database/contactsRepository';

interface EmergencyContactsListProps {
  contacts: Contact[];
  onCall: (contact: Contact) => void;
  onDelete?: (contact: Contact) => void;
}

export default function EmergencyContactsList({ contacts, onCall, onDelete }: EmergencyContactsListProps) {
  return (
    <View style={styles.contactsCard}>
      {contacts.map((contact, index) => (
        <View 
          key={contact.id ? contact.id.toString() : index.toString()} 
          style={[
            styles.contactItem,
            index < contacts.length - 1 && styles.contactItemBorder
          ]}
        >
          <View style={{ flex: 1, marginRight: 10 }}>
            <Text style={styles.contactName}>{contact.name}</Text>
            <Text style={styles.contactPhone}>{contact.phone}</Text>
          </View>
          
          <View style={styles.actionsContainer}>
            <TouchableOpacity
              style={[
                styles.contactCallBtn,
                contact.type === 'emergency' ? styles.callBtnRed : styles.callBtnGreen
              ]}
              onPress={() => onCall(contact)}
              activeOpacity={0.7}
            >
              <Phone size={16} color={contact.type === 'emergency' ? Colors.alert : Colors.primary} />
            </TouchableOpacity>

            {onDelete && contact.type === 'contact' && (
              <TouchableOpacity
                style={styles.contactDeleteBtn}
                onPress={() => onDelete(contact)}
                activeOpacity={0.7}
              >
                <Trash2 size={16} color={Colors.alert} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  contactsCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
  },
  contactItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
  },
  contactItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  contactName: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 2,
  },
  contactPhone: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
  },
  contactCallBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  callBtnGreen: {
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
  },
  callBtnRed: {
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
  },
  actionsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactDeleteBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 82, 82, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
