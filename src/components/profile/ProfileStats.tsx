import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';
import { useDriveStore } from '../../store/useDriveStore';

export default function ProfileStats() {
  const safeDays = useDriveStore((state) => state.safeDays);
  const healthScore = useDriveStore((state) => state.healthScore);
  const crashCount = useDriveStore((state) => state.crashCount);

  return (
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
        <Text style={styles.statVal}>{crashCount}</Text>
        <Text style={styles.statLbl}>Crashes</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
