import React, { useState, useRef, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  ScrollView, 
  Animated, 
  Switch, 
  Alert,
  Vibration,
  Platform
} from 'react-native';
import { useSQLiteContext } from 'expo-sqlite';
import { useDriveStore } from '../../store/useDriveStore';
import { AlertsRepository } from '../../database/alertsRepository';
import { Colors } from '../../constants/theme';
import { 
  Shield, 
  Phone, 
  Activity, 
  MapPin, 
  Volume2, 
  Gauge, 
  UserPlus, 
  AlertOctagon, 
  ArrowRight,
  Info
} from 'lucide-react-native';

export default function SafetyScreen() {
  const db = useSQLiteContext();
  
  // State from Zustand
  const crashDetectionEnabled = useDriveStore((state) => state.crashDetectionEnabled);
  const liveLocationEnabled = useDriveStore((state) => state.liveLocationEnabled);
  const soundAlertEnabled = useDriveStore((state) => state.soundAlertEnabled);
  const speedMonitorEnabled = useDriveStore((state) => state.speedMonitorEnabled);

  const toggleCrashDetection = useDriveStore((state) => state.toggleCrashDetection);
  const toggleLiveLocation = useDriveStore((state) => state.toggleLiveLocation);
  const toggleSoundAlert = useDriveStore((state) => state.toggleSoundAlert);
  const toggleSpeedMonitor = useDriveStore((state) => state.toggleSpeedMonitor);

  // SOS hold progress animations
  const [holdPercent, setHoldPercent] = useState(0);
  const [sosTriggered, setSosTriggered] = useState(false);
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const holdStartTime = useRef<number>(0);

  // Contacts mock list
  const [contacts, setContacts] = useState([
    { id: '1', name: 'Roadside Assistance', phone: '1-800-555-0199', type: 'dispatch' },
    { id: '2', name: 'Emergency Services (911)', phone: '911', type: 'emergency' },
    { id: '3', name: 'Sarah Carter (Guardian)', phone: '+1 (555) 014-2834', type: 'contact' },
  ]);

  // Pulse banner animation on mount
  const waveAnim = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 3000,
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 3000,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [waveAnim]);

  // SOS Press Handlers
  const handlePressIn = () => {
    if (sosTriggered) return;
    
    holdStartTime.current = Date.now();
    
    // Scale down button slightly for tactile feedback
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 1,
        duration: 2000, // 2 seconds
        useNativeDriver: false,
      })
    ]).start();

    // Listen to animated progress for textual feedback
    progressAnim.addListener(({ value }) => {
      setHoldPercent(Math.min(Math.round(value * 100), 100));
    });

    // Start timer for 2 seconds
    timerRef.current = setTimeout(async () => {
      try {
        setSosTriggered(true);
        setHoldPercent(100);
        
        // Haptic feedback
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 500, 100, 500]);
        }

        // Trigger alert log in database
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
          'Emergency response services have been notified of your current location.',
          [{ text: 'Dismiss', onPress: () => handleResetSos() }]
        );

        // Visual pop effect
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.4,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1.0,
            duration: 300,
            useNativeDriver: true,
          })
        ]).start();

      } catch (err) {
        console.error('Failed to log SOS alert:', err);
      }
    }, 2000);
  };

  const handlePressOut = () => {
    if (sosTriggered) return;

    // Clear timers
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // Reset progress animation
    progressAnim.removeAllListeners();
    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 1.0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(progressAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      })
    ]).start();

    setHoldPercent(0);
  };

  const handleResetSos = () => {
    setSosTriggered(false);
    setHoldPercent(0);
    progressAnim.setValue(0);
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

  // Interpolate progress to border/width styles
  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

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
        
        {/* Protection Active Wave Banner */}
        <View style={styles.bannerContainer}>
          <Animated.View style={[
            styles.bannerBgGlow,
            { opacity: waveAnim.interpolate({ inputRange: [0, 1], outputRange: [0.03, 0.12] }) }
          ]} />
          <View style={styles.bannerContent}>
            <View style={styles.bannerLeft}>
              <View style={styles.statusDotActive} />
              <View>
                <Text style={styles.bannerTitle}>Protection Active</Text>
                <Text style={styles.bannerText}>Telemetry engine monitoring for sudden impacts</Text>
              </View>
            </View>
            <Shield size={20} color={Colors.primary} />
          </View>
        </View>

        {/* SOS Button Area */}
        <View style={styles.sosCard}>
          <Text style={styles.sosHeader}>Emergency SOS</Text>
          <Text style={styles.sosSubHeader}>Press and hold the button for 2 seconds to alert services</Text>

          <View style={styles.sosButtonContainer}>
            <TouchableOpacity
              activeOpacity={0.9}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={styles.sosPressable}
            >
              <Animated.View style={[
                styles.sosButtonCircle,
                { transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }] }
              ]}>
                {/* Charge Fill Overlay */}
                <Animated.View style={[
                  styles.sosButtonFill,
                  {
                    height: progressWidth,
                    width: progressWidth,
                    opacity: progressAnim.interpolate({ inputRange: [0, 1], outputRange: [0.15, 0.75] })
                  }
                ]} />

                {/* Inner Icon & Text */}
                <AlertOctagon size={42} color={Colors.text} />
                <Text style={styles.sosText}>
                  {sosTriggered ? 'SENT' : holdPercent > 0 ? `${holdPercent}%` : 'SOS'}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            {/* Circular Track Indicator Bar */}
            <View style={styles.progressBarBg}>
              <Animated.View style={[styles.progressBarFill, { width: progressWidth }]} />
            </View>
          </View>

          {holdPercent > 0 && !sosTriggered && (
            <Text style={styles.holdWarning}>Keep holding to broadcast location...</Text>
          )}
          {sosTriggered && (
            <TouchableOpacity onPress={handleResetSos} style={styles.resetButton}>
              <Text style={styles.resetButtonText}>Reset Alarm</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Safety Features 2x2 Grid */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Safety Features</Text>
          <View style={styles.infoRow}>
            <Info size={14} color={Colors.textSecondary} />
            <Text style={styles.infoText}>Auto-triggers on speed violations</Text>
          </View>
        </View>

        <View style={styles.featureGrid}>
          {/* Crash Detection */}
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={[styles.featureIconContainer, crashDetectionEnabled && styles.featureIconActive]}>
                <Activity size={20} color={crashDetectionEnabled ? Colors.primary : Colors.textSecondary} />
              </View>
              <Switch
                value={crashDetectionEnabled}
                onValueChange={toggleCrashDetection}
                trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
                thumbColor={crashDetectionEnabled ? Colors.primary : '#64748B'}
              />
            </View>
            <Text style={styles.featureTitle}>Crash Detection</Text>
            <Text style={styles.featureDesc}>Utilizes G-force thresholds to report sudden decelerations.</Text>
          </View>

          {/* Live Location */}
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={[styles.featureIconContainer, liveLocationEnabled && styles.featureIconActive]}>
                <MapPin size={20} color={liveLocationEnabled ? Colors.primary : Colors.textSecondary} />
              </View>
              <Switch
                value={liveLocationEnabled}
                onValueChange={toggleLiveLocation}
                trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
                thumbColor={liveLocationEnabled ? Colors.primary : '#64748B'}
              />
            </View>
            <Text style={styles.featureTitle}>Live Location</Text>
            <Text style={styles.featureDesc}>Shares active driving coordinates with selected emergency contacts.</Text>
          </View>

          {/* Sound Alert */}
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={[styles.featureIconContainer, soundAlertEnabled && styles.featureIconActive]}>
                <Volume2 size={20} color={soundAlertEnabled ? Colors.primary : Colors.textSecondary} />
              </View>
              <Switch
                value={soundAlertEnabled}
                onValueChange={toggleSoundAlert}
                trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
                thumbColor={soundAlertEnabled ? Colors.primary : '#64748B'}
              />
            </View>
            <Text style={styles.featureTitle}>Sound Alert</Text>
            <Text style={styles.featureDesc}>Provides real-time verbal coaching during dangerous maneuvers.</Text>
          </View>

          {/* Speed Monitor */}
          <View style={styles.featureCard}>
            <View style={styles.featureHeader}>
              <View style={[styles.featureIconContainer, speedMonitorEnabled && styles.featureIconActive]}>
                <Gauge size={20} color={speedMonitorEnabled ? Colors.primary : Colors.textSecondary} />
              </View>
              <Switch
                value={speedMonitorEnabled}
                onValueChange={toggleSpeedMonitor}
                trackColor={{ false: '#2D3142', true: 'rgba(0, 200, 83, 0.2)' }}
                thumbColor={speedMonitorEnabled ? Colors.primary : '#64748B'}
              />
            </View>
            <Text style={styles.featureTitle}>Speed Monitor</Text>
            <Text style={styles.featureDesc}>Warns when vehicle speed exceeds configured limits.</Text>
          </View>
        </View>

        {/* Emergency Contacts List */}
        <View style={styles.contactsHeader}>
          <Text style={styles.sectionTitle}>Emergency Contacts</Text>
          <TouchableOpacity style={styles.addButton} activeOpacity={0.7}>
            <UserPlus size={16} color={Colors.primary} />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactsCard}>
          {contacts.map((contact, index) => (
            <View 
              key={contact.id} 
              style={[
                styles.contactItem,
                index < contacts.length - 1 && styles.contactItemBorder
              ]}
            >
              <View>
                <Text style={styles.contactName}>{contact.name}</Text>
                <Text style={styles.contactPhone}>{contact.phone}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.contactCallBtn,
                  contact.type === 'emergency' ? styles.callBtnRed : styles.callBtnGreen
                ]}
                onPress={() => handleCallContact(contact)}
                activeOpacity={0.7}
              >
                <Phone size={16} color={contact.type === 'emergency' ? Colors.alert : Colors.primary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>

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
  bannerContainer: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.borderAccent,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    overflow: 'hidden',
    position: 'relative',
  },
  bannerBgGlow: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.primary,
  },
  bannerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  statusDotActive: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  bannerTitle: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  bannerText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '500',
    marginTop: 2,
  },
  sosCard: {
    backgroundColor: Colors.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 20,
  },
  sosHeader: {
    color: Colors.text,
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 4,
  },
  sosSubHeader: {
    color: Colors.textSecondary,
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sosButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginVertical: 10,
  },
  sosPressable: {
    borderRadius: 75,
  },
  sosButtonCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: '#1E1215', // Dark velvet red tone
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.alert,
    overflow: 'hidden',
    position: 'relative',
    shadowColor: Colors.alert,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 16,
    elevation: 8,
  },
  sosButtonFill: {
    position: 'absolute',
    borderRadius: 999,
    backgroundColor: Colors.alert,
  },
  sosText: {
    color: Colors.text,
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1.0,
    marginTop: 6,
    zIndex: 2,
  },
  progressBarBg: {
    width: 180,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 2,
    marginTop: 20,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: Colors.alert,
    borderRadius: 2,
  },
  holdWarning: {
    color: Colors.alertLight,
    fontSize: 11,
    fontWeight: '600',
    marginTop: 12,
  },
  resetButton: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    backgroundColor: 'rgba(255, 82, 82, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 82, 82, 0.2)',
  },
  resetButtonText: {
    color: Colors.alert,
    fontSize: 12,
    fontWeight: '700',
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  infoText: {
    color: Colors.textSecondary,
    fontSize: 11,
    fontWeight: '600',
  },
  featureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: 12,
    marginBottom: 24,
  },
  featureCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 14,
    width: '48%',
  },
  featureHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  featureIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  featureIconActive: {
    backgroundColor: 'rgba(0, 200, 83, 0.05)',
    borderColor: 'rgba(0, 200, 83, 0.15)',
  },
  featureTitle: {
    color: Colors.text,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 4,
  },
  featureDesc: {
    color: Colors.textSecondary,
    fontSize: 10,
    lineHeight: 14,
    fontWeight: '500',
  },
  contactsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0, 200, 83, 0.06)',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(0, 200, 83, 0.15)',
  },
  addButtonText: {
    color: Colors.primary,
    fontSize: 11,
    fontWeight: '700',
  },
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
});
