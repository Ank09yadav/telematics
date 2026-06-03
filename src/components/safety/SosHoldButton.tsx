import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Animated, 
  Vibration,
  Platform,
  Alert
} from 'react-native';
import { AlertOctagon } from 'lucide-react-native';
import { Colors } from '../../constants/theme';

interface SosHoldButtonProps {
  onTriggered: () => Promise<void>;
}

export default function SosHoldButton({ onTriggered }: SosHoldButtonProps) {
  const [holdPercent, setHoldPercent] = useState(0);
  const [sosTriggered, setSosTriggered] = useState(false);
  
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const handlePressIn = () => {
    if (sosTriggered) return;
    
    // Scale down button slightly for tactile feedback and start 2-second timing
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

    // Listen to progress for percentage updates
    progressAnim.addListener(({ value }) => {
      setHoldPercent(Math.min(Math.round(value * 100), 100));
    });

    timerRef.current = setTimeout(async () => {
      try {
        setSosTriggered(true);
        setHoldPercent(100);
        
        // Haptics
        if (Platform.OS !== 'web') {
          Vibration.vibrate([0, 500, 100, 500]);
        }

        // Call the parent trigger action (e.g., save DB alert)
        await onTriggered();

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
        console.error('Failed to trigger SOS action:', err);
      }
    }, 2000);
  };

  const handlePressOut = () => {
    if (sosTriggered) return;

    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }

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

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  return (
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
  );
}

const styles = StyleSheet.create({
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
    backgroundColor: '#1E1215',
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
});
