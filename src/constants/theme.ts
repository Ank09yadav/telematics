import { StyleSheet } from 'react-native';

export const Colors = {
  background: '#08090C',        // Pitch Black
  surface: '#14161D',           // Dark slate translucent card
  surfaceLight: '#1C1F2A',      // Lighter card surface
  surfaceHover: '#252836',
  
  primary: '#00C853',           // Vibrant Emerald Green
  primaryLight: '#00E676',
  primaryGlow: 'rgba(0, 200, 83, 0.15)',
  
  alert: '#FF5252',             // Alert Red (SOS / High severity)
  alertLight: '#FF8A80',
  alertGlow: 'rgba(255, 82, 82, 0.15)',
  
  warning: '#FFA000',           // Warning Amber (Medium severity)
  warningGlow: 'rgba(255, 160, 0, 0.15)',
  
  info: '#208AEF',              // Safe Blue (Info / Standard)
  
  text: '#FFFFFF',              // Main text (White)
  textSecondary: '#64748B',     // Subtext (Slate grey)
  textMuted: '#475569',
  
  border: 'rgba(255, 255, 255, 0.06)',
  borderAccent: 'rgba(0, 200, 83, 0.12)',
};

export const GlobalStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 4,
  },
  header: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  subHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 1.0,
  },
  glassPill: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: Colors.border,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
