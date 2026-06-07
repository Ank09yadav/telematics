import { createAudioPlayer, setAudioModeAsync } from 'expo-audio';

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
      await setAudioModeAsync({
        playsInSilentMode: true,
        shouldPlayInBackground: true,
      });

      const player = createAudioPlayer(soundFile);
      player.play();

      // Listen for playback finished and release resources to prevent memory leaks
      const subscription = player.addListener('playbackStatusUpdate', (status) => {
        if (status && status.didJustFinish) {
          player.release();
          subscription.remove();
        }
      });
    }
  } catch (error) {
    console.warn('Failed to play sound:', error);
  }
}
