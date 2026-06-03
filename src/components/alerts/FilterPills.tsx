import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Colors } from '../../constants/theme';

type FilterType = 'all' | 'critical' | 'warnings' | 'resolved';

interface FilterPillsProps {
  activeFilter: FilterType;
  onFilterChange: (filter: FilterType) => void;
  highCount: number;
  mediumCount: number;
}

export default function FilterPills({ activeFilter, onFilterChange, highCount, mediumCount }: FilterPillsProps) {
  return (
    <View style={styles.filterContainer}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'all' && styles.filterPillActive]}
          onPress={() => onFilterChange('all')}
        >
          <Text style={[styles.filterPillText, activeFilter === 'all' && styles.filterPillTextActive]}>All Logs</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'critical' && styles.filterPillActive]}
          onPress={() => onFilterChange('critical')}
        >
          <View style={[styles.filterDot, { backgroundColor: Colors.alert }]} />
          <Text style={[styles.filterPillText, activeFilter === 'critical' && styles.filterPillTextActive]}>
            Critical ({highCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'warnings' && styles.filterPillActive]}
          onPress={() => onFilterChange('warnings')}
        >
          <View style={[styles.filterDot, { backgroundColor: Colors.warning }]} />
          <Text style={[styles.filterPillText, activeFilter === 'warnings' && styles.filterPillTextActive]}>
            Warnings ({mediumCount})
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.filterPill, activeFilter === 'resolved' && styles.filterPillActive]}
          onPress={() => onFilterChange('resolved')}
        >
          <Text style={[styles.filterPillText, activeFilter === 'resolved' && styles.filterPillTextActive]}>Resolved</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  filterContainer: {
    marginBottom: 12,
  },
  filterScroll: {
    paddingHorizontal: 20,
    gap: 8,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginRight: 6,
  },
  filterPillActive: {
    borderColor: Colors.primary,
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
  },
  filterPillText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '700',
  },
  filterPillTextActive: {
    color: Colors.primary,
  },
  filterDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
});
