import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing } from 'react-native';

interface SpeedometerProps {
  value: number; // Speed in m/s
  maxSpeedLimit?: number; // Speed value at maximum gauge (e.g. 180 km/h)
  useImperial?: boolean;
}

export const Speedometer: React.FC<SpeedometerProps> = ({
  value,
  maxSpeedLimit = 160, // km/h or mph
  useImperial = false,
}) => {
  // Convert m/s to display speed (km/h or mph)
  const displaySpeed = useImperial ? value * 2.23694 : value * 3.6;
  const speedRounded = Math.round(displaySpeed);

  // Animated value for smooth transitions
  const animatedSpeed = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedSpeed, {
      toValue: Math.min(displaySpeed, maxSpeedLimit),
      duration: 350,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  }, [displaySpeed, maxSpeedLimit]);

  // Map speed value to rotation angles: 0 speed = -120 deg, max speed = 120 deg
  const needleRotation = animatedSpeed.interpolate({
    inputRange: [0, maxSpeedLimit],
    outputRange: ['-120deg', '120deg'],
    extrapolate: 'clamp',
  });

  // Generate tick marks (e.g. 9 ticks around the gauge)
  const tickCount = 9;
  const ticks = Array.from({ length: tickCount }).map((_, index) => {
    const angle = -120 + (index * 240) / (tickCount - 1);
    const tickValue = Math.round((index * maxSpeedLimit) / (tickCount - 1));
    return { angle, value: tickValue };
  });

  return (
    <View style={styles.container}>
      {/* Outer Rim */}
      <View style={styles.gaugeOuter}>
        <View style={styles.gaugeInner}>
          
          {/* Ticks and Numbers */}
          {ticks.map((tick, index) => {
            const isHigh = tick.value > maxSpeedLimit * 0.75;
            const tickRotation = tick.angle + 'deg';
            const labelRotation = (-tick.angle) + 'deg';
            return (
              <View
                key={index}
                style={[
                  styles.tickWrapper,
                  { transform: [{ rotate: tickRotation as any }] },
                ]}
              >
                <View style={[styles.tickMark, isHigh && styles.tickMarkHigh]} />
                <Text
                  style={[
                    styles.tickLabel,
                    isHigh && styles.tickLabelHigh,
                    { transform: [{ rotate: labelRotation as any }] },
                  ]}
                >
                  {tick.value}
                </Text>
              </View>
            );
          })}

          {/* Speed Value Text (Center) */}
          <View style={styles.centerDisplay}>
            <Text style={styles.speedText}>{speedRounded}</Text>
            <Text style={styles.unitText}>{useImperial ? 'MPH' : 'KM/H'}</Text>
          </View>

          {/* Gauge Needle Pin */}
          <Animated.View
            style={[
              styles.needleContainer,
              { transform: [{ rotate: needleRotation as any }] },
            ]}
          >
            {/* The actual visible needle line */}
            <View style={styles.needle} />
          </Animated.View>

          {/* Needle Cap (Center Circle Cover) */}
          <View style={styles.needleCap} />
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 12,
  },
  gaugeOuter: {
    width: 220,
    height: 220,
    borderRadius: 110,
    backgroundColor: 'rgba(15, 23, 42, 0.8)', // slate-900
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  gaugeInner: {
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: '#0B0F19',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tickWrapper: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: 8,
  },
  tickMark: {
    width: 2,
    height: 10,
    backgroundColor: '#64748B', // default slate ticks
    borderRadius: 1,
  },
  tickMarkHigh: {
    backgroundColor: '#EF4444', // red warning ticks
  },
  tickLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '600',
    marginTop: 4,
    width: 24,
    textAlign: 'center',
  },
  tickLabelHigh: {
    color: '#EF4444',
  },
  centerDisplay: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
    top: 110, // lowered to leave room for the needle pivot
  },
  speedText: {
    color: '#FFFFFF',
    fontSize: 48,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    letterSpacing: -1,
  },
  unitText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginTop: -2,
  },
  needleContainer: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  needle: {
    width: 4,
    height: 90,
    backgroundColor: '#208AEF', // safety electric blue
    borderRadius: 2,
    marginTop: 15,
    shadowColor: '#208AEF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.8,
    shadowRadius: 5,
  },
  needleCap: {
    position: 'absolute',
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#208AEF',
    borderWidth: 4,
    borderColor: '#0B0F19',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.5,
    shadowRadius: 3,
    elevation: 3,
  },
});
export default Speedometer;
