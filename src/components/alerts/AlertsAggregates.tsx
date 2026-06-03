import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../../constants/theme';

interface AlertsAggregatesProps {
  highCount: number;
  mediumCount: number;
  lowCount: number;
}

export default function AlertsAggregates({ highCount, mediumCount, lowCount }: AlertsAggregatesProps) {
  return (
    <View style={styles.aggregateRow}>
      <View style={[styles.aggregateCard, styles.aggBorderHigh]}>
        <Text style={[styles.aggregateVal, { color: Colors.alert }]}>{highCount}</Text>
        <Text style={styles.aggregateLbl}>Critical</Text>
      </View>
      <View style={[styles.aggregateCard, styles.aggBorderMedium]}>
        <Text style={[styles.aggregateVal, { color: Colors.warning }]}>{mediumCount}</Text>
        <Text style={styles.aggregateLbl}>Warnings</Text>
      </View>
      <View style={[styles.aggregateCard, styles.aggBorderLow]}>
        <Text style={[styles.aggregateVal, { color: Colors.info }]}>{lowCount}</Text>
        <Text style={styles.aggregateLbl}>Standard</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  aggregateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  aggregateCard: {
    backgroundColor: Colors.surface,
    width: '31%',
    borderRadius: 14,
    padding: 12,
    borderLeftWidth: 3,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  aggBorderHigh: {
    borderLeftColor: Colors.alert,
  },
  aggBorderMedium: {
    borderLeftColor: Colors.warning,
  },
  aggBorderLow: {
    borderLeftColor: Colors.info,
  },
  aggregateVal: {
    fontSize: 18,
    fontWeight: '800',
  },
  aggregateLbl: {
    color: Colors.textSecondary,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2,
  },
});
