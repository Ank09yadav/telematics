import { Tabs } from 'expo-router';
import { View, StyleSheet } from 'react-native';
import { Home, Shield, AlertTriangle, User } from 'lucide-react-native';
import { Colors } from '../../constants/theme';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabHeight = 62 + insets.bottom;

  return (
    <Tabs
      screenOptions={{
        headerStyle: {
          backgroundColor: '#0F172A',
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '800',
          fontSize: 18,
        },
        headerShadowVisible: false,
        tabBarStyle: [
          styles.tabBar,
          {
            height: tabHeight,
            paddingBottom: insets.bottom > 0 ? insets.bottom : 8,
          }
        ],
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textSecondary,
        tabBarLabelStyle: styles.tabLabel,
        tabBarBackground: () => <View style={styles.tabBackground} />,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          headerShown: false,
          title: 'Home',
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size }) => <Home size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="safety"
        options={{
          headerShown: false,
          title: 'Safety',
          tabBarLabel: 'Safety',
          tabBarIcon: ({ color, size }) => <Shield size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="alerts"
        options={{
          headerShown: false,
          title: 'Alerts',
          tabBarLabel: 'Alerts',
          tabBarIcon: ({ color, size }) => <AlertTriangle size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          headerShown: false,
          title: 'Profile',
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size }) => <User size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    height: 62,
    paddingBottom: 8,
    paddingTop: 8,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
  },
  tabLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2,
  },
  tabBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.surface,
  },
});
