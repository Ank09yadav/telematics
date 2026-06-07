import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Key, FileText, ChevronRight, TrendingUp, HeartHandshake } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface SettingsActionsListProps {
  onCalibrate: () => void;
  onHelpDesk: () => void;
  onTerms: () => void;
}

export default function SettingsActionsList({ onCalibrate, onHelpDesk, onTerms }: SettingsActionsListProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.sectionTitle}>Security & Calibration</Text>
      <View style={styles.menuCard}>
        {/* Sensor Settings Calibration */}
        <TouchableOpacity 
          style={styles.menuItemBtn} 
          onPress={onCalibrate}
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
        <TouchableOpacity 
          style={styles.menuItemBtn} 
          activeOpacity={0.7}
          onPress={() => {
            alert('SOS emergency key is active and linked with local dispatch systems.');
          }}
        >
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
        <TouchableOpacity 
          style={styles.menuItemBtn} 
          onPress={onHelpDesk}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
              <HeartHandshake size={18} color={Colors.text} />
            </View>
            <Text style={styles.menuItemTextOnly}>SafeGuard Help Desk</Text>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>

        <View style={styles.menuDivider} />

        <TouchableOpacity 
          style={styles.menuItemBtn} 
          onPress={onTerms}
          activeOpacity={0.7}
        >
          <View style={styles.menuItemLeft}>
            <View style={[styles.iconWrapper, { backgroundColor: 'rgba(255, 255, 255, 0.03)' }]}>
              <FileText size={18} color={Colors.text} />
            </View>
            <Text style={styles.menuItemTextOnly}>Terms of Protection Policy</Text>
          </View>
          <ChevronRight size={16} color={Colors.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
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
});
