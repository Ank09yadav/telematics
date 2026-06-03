import React from 'react';
import { View, Text, StyleSheet, Platform, Dimensions } from 'react-native';
import { GPSPoint, TelemetryEvent } from '../types/telemetry';

// Conditionally import native maps to avoid web compilation failures
let MapView: any = null;
let Polyline: any = null;
let Marker: any = null;

if (Platform.OS !== 'web') {
  try {
    const NativeMaps = require('react-native-maps');
    MapView = NativeMaps.default || NativeMaps;
    Polyline = NativeMaps.Polyline;
    Marker = NativeMaps.Marker;
  } catch (e) {
    console.warn('Native maps could not be imported:', e);
  }
}

interface ActiveMapProps {
  gpsPoints: GPSPoint[];
  events: TelemetryEvent[];
  height?: number;
  interactive?: boolean;
}

export const ActiveMap: React.FC<ActiveMapProps> = ({
  gpsPoints = [],
  events = [],
  height = 250,
  interactive = true,
}) => {
  const hasRoute = gpsPoints.length > 0;

  // 1. Native Render: react-native-maps
  if (Platform.OS !== 'web' && MapView) {
    // Determine default center region
    let region = {
      latitude: 37.78825,
      longitude: -122.4324,
      latitudeDelta: 0.01,
      longitudeDelta: 0.01,
    };

    if (hasRoute) {
      const latest = gpsPoints[gpsPoints.length - 1];
      region = {
        latitude: latest.latitude,
        longitude: latest.longitude,
        latitudeDelta: 0.015,
        longitudeDelta: 0.015,
      };
    }

    return (
      <View style={[styles.container, { height }]}>
        <MapView
          style={styles.map}
          initialRegion={region}
          showsUserLocation={true}
          scrollEnabled={interactive}
          zoomEnabled={interactive}
        >
          {hasRoute && (
            <Polyline
              coordinates={gpsPoints.map((p) => ({
                latitude: p.latitude,
                longitude: p.longitude,
              }))}
              strokeColor="#208AEF"
              strokeWidth={4}
            />
          )}

          {events.map((event, index) => {
            let pinColor = '#F59E0B'; // accel
            if (event.type === 'harsh_braking') pinColor = '#EF4444';
            if (event.type === 'harsh_cornering') pinColor = '#8B5CF6';

            return (
              <Marker
                key={index}
                coordinate={{
                  latitude: event.latitude,
                  longitude: event.longitude,
                }}
                title={event.type.replace('_', ' ').toUpperCase()}
                description={event.description}
                pinColor={pinColor}
              />
            );
          })}
        </MapView>
      </View>
    );
  }

  // 2. Web / Fallback Render: Custom SVG-based Coordinate Path Visualizer
  let svgContent = null;
  const padding = 30;
  const svgWidth = 500;
  const svgHeight = height;

  if (hasRoute) {
    const latitudes = gpsPoints.map((p) => p.latitude);
    const longitudes = gpsPoints.map((p) => p.longitude);

    const latMin = Math.min(...latitudes);
    const latMax = Math.max(...latitudes);
    const lonMin = Math.min(...longitudes);
    const lonMax = Math.max(...longitudes);

    const latRange = latMax - latMin || 0.0001;
    const lonRange = lonMax - lonMin || 0.0001;

    // Convert GPS (Lat, Lon) to SVG screen coordinates (X, Y)
    const getX = (lon: number) => {
      return padding + ((lon - lonMin) / lonRange) * (svgWidth - 2 * padding);
    };

    const getY = (lat: number) => {
      // Larger latitude is north (up), SVG y-coord goes down (0 is top), so invert
      return svgHeight - (padding + ((lat - latMin) / latRange) * (svgHeight - 2 * padding));
    };

    // Construct SVG polyline points string
    const pointsString = gpsPoints
      .map((p) => `${getX(p.longitude).toFixed(1)},${getY(p.latitude).toFixed(1)}`)
      .join(' ');

    const startX = getX(gpsPoints[0].longitude);
    const startY = getY(gpsPoints[0].latitude);
    const endX = getX(gpsPoints[gpsPoints.length - 1].longitude);
    const endY = getY(gpsPoints[gpsPoints.length - 1].latitude);

    svgContent = (
      <svg width="100%" height="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ backgroundColor: '#0B0F19' }}>
        {/* Grid lines */}
        <defs>
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid)" />

        {/* Route Line */}
        <polyline points={pointsString} fill="none" stroke="#208AEF" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />

        {/* Start Point Dot */}
        <circle cx={startX} cy={startY} r="6" fill="#10B981" />
        <circle cx={startX} cy={startY} r="12" fill="none" stroke="#10B981" strokeWidth="2" opacity="0.5" />

        {/* End / Current Point Dot */}
        <circle cx={endX} cy={endY} r="6" fill="#3B82F6" />
        <circle cx={endX} cy={endY} r="12" fill="none" stroke="#3B82F6" strokeWidth="2" opacity="0.5" />

        {/* Event Markers */}
        {events.map((event, index) => {
          const ex = getX(event.longitude);
          const ey = getY(event.latitude);
          let eventColor = '#F59E0B'; // accel
          if (event.type === 'harsh_braking') eventColor = '#EF4444';
          if (event.type === 'harsh_cornering') eventColor = '#8B5CF6';

          return (
            <g key={index}>
              <circle cx={ex} cy={ey} r="5" fill={eventColor} />
              <circle cx={ex} cy={ey} r="10" fill="none" stroke={eventColor} strokeWidth="1.5" opacity="0.8" />
              <text x={ex + 8} y={ey + 4} fill="#94A3B8" fontSize="8" fontWeight="bold" fontFamily="sans-serif">
                {event.type === 'harsh_braking' ? 'BRAKE' : event.type === 'harsh_acceleration' ? 'ACCEL' : 'TURN'}
              </text>
            </g>
          );
        })}
      </svg>
    );
  } else {
    // Empty state
    svgContent = (
      <View style={styles.emptyState}>
        <Text style={styles.emptyText}>Waiting for GPS data...</Text>
        <Text style={styles.subtext}>Coordinates will plot dynamically once you start driving.</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height }]}>
      {Platform.OS === 'web' ? (
        svgContent
      ) : (
        // fallback if react-native-maps fails to load on native
        <View style={styles.nativeFallback}>
          <Text style={styles.emptyText}>Map Navigation View</Text>
          <Text style={styles.subtext}>Device Map module active. {gpsPoints.length} points logged.</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    backgroundColor: '#0B0F19',
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#0F172A',
  },
  emptyText: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  subtext: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
  },
  nativeFallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E293B',
    padding: 16,
  },
});
export default ActiveMap;
