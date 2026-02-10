import { useCallback, useRef } from 'react';

/**
 * Predefined timer sounds.
 * These are audio files stored in the public/audios folder.
 */
export const TIMER_SOUNDS: Record<string, string> = {
  ring: 'audios/bell-www.mp3',
  level: 'audios/next-level.mp3',
  next: 'audios/simple-next.mp3',
  bell: 'audios/simplebell-ring.mp3',
};

/**
 * Hook for playing audio in the app.
 * Manages timer completion sounds with predefined and custom options.
 */
export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Play a timer sound.
   * @param soundId - The ID of the sound ('bell', 'level', 'next', 'ring', 'custom')
   * @param customSound - Base64 Data URI for custom audio (required if soundId is 'custom')
   */
  const playTimerSound = useCallback((soundId: string, customSound?: string) => {
    try {
      // Get the audio source
      let audioSrc: string | undefined;
      
      if (soundId === 'custom' && customSound) {
        audioSrc = customSound;
      } else if (TIMER_SOUNDS[soundId]) {
        audioSrc = TIMER_SOUNDS[soundId];
      } else {
        // Fallback to bell if invalid soundId
        audioSrc = TIMER_SOUNDS.bell;
      }

      if (!audioSrc) return;

      // Clean up previous audio if exists
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }

      // Create and play new audio
      const audio = new Audio(audioSrc);
      audioRef.current = audio;
      
      audio.play().catch(error => {
        console.error('Failed to play timer sound:', error);
      });

      // Clean up when finished
      audio.onended = () => {
        audioRef.current = null;
      };
    } catch (error) {
      console.error('Error playing timer sound:', error);
    }
  }, []);

  /**
   * Stop any currently playing audio.
   */
  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return {
    playTimerSound,
    stopAudio,
    availableSounds: Object.keys(TIMER_SOUNDS),
  };
};
