import { Audio } from 'expo-av';

/**
 * Plays a sound based on the telemetry event type.
 * Ensures the audio can play in the background and on silent mode.
 * Automatically unloads the sound when playback completes.
 */
export async function playSound(soundType: 'start' | 'hs' | 'crash') {
  try {
    let soundFile;
    if (soundType === 'start' || soundType === 'hs') {
      soundFile = require('../../assets/audio/hs.mp3');
    } else if (soundType === 'crash') {
      soundFile = require('../../assets/audio/crash.mp3');
    }

    if (soundFile) {
      // Configure audio mode to support silent mode override and background playback
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: true,
        staysActiveInBackground: true,
        playThroughEarpieceAndroid: false,
      });

      const { sound } = await Audio.Sound.createAsync(soundFile);
      await sound.playAsync();

      // Unload from memory after playback finishes to prevent resource leaks
      sound.setOnPlaybackStatusUpdate((status) => {
        if (status.isLoaded && status.didJustFinish) {
          sound.unloadAsync().catch((err) => console.warn('Error unloading sound:', err));
        }
      });
    }
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
}
