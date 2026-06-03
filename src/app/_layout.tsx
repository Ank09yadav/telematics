import { useEffect, Suspense } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SQLiteProvider } from 'expo-sqlite';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { initializeDatabase } from '../database/schema';
import * as SplashScreen from 'expo-splash-screen';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

function DatabaseLoadingFallback() {
  return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#208AEF" />
    </View>
  );
}

export default function RootLayout() {
  useEffect(() => {
    // Hide splash screen after initialization
    SplashScreen.hideAsync();
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      <Suspense fallback={<DatabaseLoadingFallback />}>
        <SQLiteProvider databaseName="telematics.db" onInit={initializeDatabase}>
          <Stack
            screenOptions={{
              headerStyle: {
                backgroundColor: '#0F172A', // Slate 900
              },
              headerTintColor: '#F8FAFC',
              headerTitleStyle: {
                fontWeight: '700',
              },
              headerShadowVisible: false,
              contentStyle: {
                backgroundColor: '#0B0F19', // Custom dark theme background
              },
            }}
          >
            {/* The Tab screens navigator */}
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            
            {/* Active Drive HUD screen */}
            <Stack.Screen
              name="active-drive"
              options={{
                headerShown: false,
                gestureEnabled: false, // Prevent swiping back during active driving
              }}
            />
            
            {/* Post-trip summary detail screen */}
            <Stack.Screen
              name="summary/[id]"
              options={{
                title: 'Drive Summary',
                headerBackTitle: 'History',
              }}
            />

            {/* Route Exception Fallback */}
            <Stack.Screen name="+not-found" options={{ title: 'Oops!' }} />
          </Stack>
        </SQLiteProvider>
      </Suspense>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0B0F19',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
