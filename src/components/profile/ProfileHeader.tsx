import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Shield, Pencil } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface ProfileHeaderProps {
  name: string;
  email: string;
  onEditPress: () => void;
}

export default function ProfileHeader({ name, email, onEditPress }: ProfileHeaderProps) {
  // Generate user initials dynamically
  const getInitials = (nameString: string) => {
    if (!nameString) return 'U';
    const parts = nameString.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  return (
    <View style={styles.profileCard}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarGlow}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{getInitials(name)}</Text>
          </View>
        </View>
        <View style={styles.badgeContainer}>
          <Shield size={10} color="#0E1711" style={{ marginRight: 3 }} />
          <Text style={styles.badgeText}>PROTECTED</Text>
        </View>
        
        {/* Floating Edit Pencil Button */}
        <TouchableOpacity 
          style={styles.editPenBtn} 
          onPress={onEditPress}
          activeOpacity={0.85}
        >
          <Pencil size={12} color="#0E1711" strokeWidth={2.5} />
        </TouchableOpacity>
      </View>
      
      <Text style={styles.userName}>{name}</Text>
      <Text style={styles.userEmail}>{email}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#0A120E',
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
  editPenBtn: {
    position: 'absolute',
    right: -2,
    bottom: 2,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.surface,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2.5,
    elevation: 5,
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
});
