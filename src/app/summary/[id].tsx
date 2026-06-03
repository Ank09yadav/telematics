import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useLocalSearchParams, router, useFocusEffect } from 'expo-router';
import { DriveRepository } from '../../database/driveRepository';
import { Trip } from '../../types/telemetry';
import { ScoringEngine } from '../../services/ScoringEngine';
import { formatDistance, formatDuration, formatDate, formatTime } from '../../utils/timeFormatter';
import ActiveMap from '../../components/ActiveMap';
import MetricCard from '../../components/MetricCard';
import EventListItem from '../../components/EventListItem';
import { Home, Trash2, Calendar, Navigation, Clock, ShieldAlert, Award } from 'lucide-react-native';

export default function SummaryScreen() {
  const db = useSQLiteContext();
  const { id } = useLocalSearchParams();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useFocusEffect(
    React.useCallback(() => {
      let isMounted = true;

      async function fetchTripDetails() {
        try {
          setIsLoading(true);
          if (id) {
            const data = await DriveRepository.getTripById(db, Number(id));
            if (isMounted) setTrip(data);
          }
        } catch (e) {
          console.error(e);
          Alert.alert('Error', 'Failed to retrieve trip logs.');
        } finally {
          setIsLoading(false);
        }
      }

      fetchTripDetails();
      return () => {
        isMounted = false;
      };
    }, [db, id])
  );

  const handleDelete = () => {
    if (!trip || !trip.id) return;
    
    Alert.alert(
      'Delete Trip Record',
      'Are you sure you want to permanently delete this trip? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              if (trip.id) {
                await DriveRepository.deleteTrip(db, trip.id);
                router.replace('/(tabs)');
              }
            } catch (err) {
              Alert.alert('Error', 'Failed to delete the trip.');
            }
          },
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#208AEF" />
      </View>
    );
  }

  if (!trip) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Trip record not found.</Text>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.replace('/(tabs)')}>
          <Text style={styles.backBtnText}>Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const scoreTier = ScoringEngine.getSafetyTier(trip.score);
  const totalEvents = trip.events.length;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      
      {/* 1. Header meta */}
      <View style={styles.metaRow}>
        <View style={styles.dateGroup}>
          <Calendar size={14} color="#64748B" />
          <Text style={styles.date}>{formatDate(trip.startTime)}</Text>
          <Text style={styles.time}>{formatTime(trip.startTime)}</Text>
        </View>
        <Text style={styles.duration}>Duration: {formatDuration(trip.duration)}</Text>
      </View>

      {/* 2. Visual score card */}
      <View style={styles.scoreRow}>
        <View style={styles.scoreGaugeContainer}>
          <View style={[styles.scoreCircle, { borderColor: scoreTier.color }]}>
            <Text style={styles.scoreNumber}>{trip.score}</Text>
            <Text style={styles.scoreLabel}>Pts</Text>
          </View>
        </View>

        <View style={styles.scoreTierDetails}>
          <Text style={[styles.tierTitle, { color: scoreTier.color }]}>{scoreTier.tier} Drive</Text>
          <Text style={styles.tierDesc}>
            {totalEvents === 0
              ? 'Excellent job! You maintained perfectly smooth operation.'
              : `Safety score impacted by ${totalEvents} flagged driving events.`}
          </Text>
        </View>
      </View>

      {/* 3. Grid Metrics */}
      <View style={styles.metricsGrid}>
        <MetricCard
          title="Distance"
          value={formatDistance(trip.distance).split(' ')[0]}
          unit={formatDistance(trip.distance).split(' ')[1]}
          icon={<Navigation size={14} color="#CBD5E1" />}
          style={styles.gridMetric}
        />
        <MetricCard
          title="Max Speed"
          value={(trip.maxSpeed * 3.6).toFixed(0)}
          unit="km/h"
          icon={<Clock size={14} color="#CBD5E1" />}
          style={styles.gridMetric}
        />
        <MetricCard
          title="Incidents"
          value={totalEvents}
          valueColor={totalEvents > 0 ? '#EF4444' : '#10B981'}
          icon={<ShieldAlert size={14} color={totalEvents > 0 ? '#EF4444' : '#10B981'} />}
          style={styles.gridMetric}
        />
      </View>

      {/* 4. The Route Map */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Route Map</Text>
      </View>
      <ActiveMap gpsPoints={trip.gpsPoints} events={trip.events} height={260} />

      {/* 5. The Event Log Feed */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Incident Log ({totalEvents})</Text>
      </View>

      {totalEvents > 0 ? (
        <View style={styles.eventsList}>
          {trip.events.map((event, idx) => (
            <EventListItem key={idx} event={event} />
          ))}
        </View>
      ) : (
        <View style={styles.emptyEvents}>
          <Award size={24} color="#10B981" />
          <Text style={styles.emptyEventsText}>Clean drive! No incidents detected.</Text>
        </View>
      )}

      {/* 6. Action triggers */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.homeBtn} onPress={() => router.replace('/(tabs)')} activeOpacity={0.8}>
          <Home size={18} color="#FFFFFF" style={styles.btnIcon} />
          <Text style={styles.homeBtnText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} activeOpacity={0.8}>
          <Trash2 size={18} color="#EF4444" style={styles.btnIcon} />
          <Text style={styles.deleteBtnText}>Delete Trip</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 20,
  },
  backBtn: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#208AEF',
    borderRadius: 8,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  dateGroup: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  date: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 6,
  },
  time: {
    color: '#64748B',
    fontSize: 11,
    marginLeft: 6,
  },
  duration: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '600',
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.45)',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    marginBottom: 16,
  },
  scoreGaugeContainer: {
    marginRight: 16,
  },
  scoreCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    borderWidth: 4,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.3)',
  },
  scoreNumber: {
    color: '#F8FAFC',
    fontSize: 24,
    fontWeight: '800',
  },
  scoreLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  scoreTierDetails: {
    flex: 1,
  },
  tierTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 4,
  },
  tierDesc: {
    color: '#94A3B8',
    fontSize: 11,
    lineHeight: 16,
  },
  metricsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  gridMetric: {
    width: '31%',
  },
  sectionHeader: {
    marginBottom: 10,
    marginTop: 10,
  },
  sectionTitle: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  eventsList: {
    marginBottom: 10,
  },
  emptyEvents: {
    backgroundColor: 'rgba(16, 185, 129, 0.04)',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.1)',
    flexDirection: 'row',
    gap: 10,
    marginBottom: 20,
  },
  emptyEventsText: {
    color: '#10B981',
    fontSize: 13,
    fontWeight: '600',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
    gap: 12,
  },
  homeBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#208AEF',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  homeBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  deleteBtn: {
    flex: 1,
    height: 48,
    backgroundColor: 'rgba(239, 68, 68, 0.05)',
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
  },
  deleteBtnText: {
    color: '#EF4444',
    fontWeight: '700',
    fontSize: 14,
  },
  btnIcon: {
    marginRight: 6,
  },
});
