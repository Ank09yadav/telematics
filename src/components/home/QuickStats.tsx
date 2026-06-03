import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Activity, Zap, ShieldCheck } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useDriveStore } from '../../store/useDriveStore';

export default function QuickStats() {
  const healthScore = useDriveStore((state) => state.healthScore);
  const responseMs = useDriveStore((state) => state.responseMs);
  const safeDays = useDriveStore((state) => state.safeDays);

  return (
    <View style={styles.statsRow}>
      <View style={styles.statCard}>
        <Activity size={20} color={Colors.primary} style={styles.statIcon} />
        <Text style={styles.statVal}>{healthScore}%</Text>
        <Text style={styles.statLbl}>Health</Text>
      </View>
      <View style={styles.statCard}>
        <Zap size={20} color="#FFA000" style={styles.statIcon} />
        <Text style={styles.statVal}>{responseMs}ms</Text>
        <Text style={styles.statLbl}>Response</Text>
      </View>
      <View style={styles.statCard}>
        <ShieldCheck size={20} color={Colors.primary} style={styles.statIcon} />
        <Text style={styles.statVal}>{safeDays}</Text>
        <Text style={styles.statLbl}>Safe Days</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 12,
  },
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    width: '31%',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  statIcon: {
    marginBottom: 8,
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
});
