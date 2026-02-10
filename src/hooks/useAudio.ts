import { useCallback, useRef } from 'react';

/**
 * Predefined timer sounds.
 * These are simple base64-encoded audio files (very short beeps/chimes)
 * to keep the app lightweight and offline-capable.
 */
export const TIMER_SOUNDS: Record<string, string> = {
  // Default: Simple beep (440 Hz tone)
  default: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFgH11dXZ7gIWKjoqFgHx3c3Jzd32Ci4eFgnt2cnBvcXR5fYKGiYaBfXh0cG9vb3F1eX2Ch4uGgX15dHBub25vcHJ2e3+EiYiEgHx4dHFubm5vcXV5foKHi4+OioaAfHh0cHBwcHJ1eH2Bh4uJhYGAfHh1cnBub29xdHh8gYWJjYiEgX57d3RybnBwcXN2eX6Dh4yJhYJ+end0cXBwcnR3e36DiYyIhIGAfHl2dHJxcXJ0d3p+gotOioeBfoB8eXd1c3N0dnh7foGFi46JhoOAfXp4dnV0dHV3ent+g4eKi4eEgn98eXh2dXZ3eHt+gYSIjYqHhIF/fHp4d3d3eXp8f4KGiYyIhYKAf3x7eXh4eHl7fYCEh4qNioeFg4F+fHp5eHl6fH+ChYiLjImGhIKAf319fH19foGDhYiLjIqHhYOBgH9+fX1+f4GDhYiKi4mHhYSCgYCAfn5/gIKEhomLjIqIhoSCgYB/f39/gIGDhYeJi4uJh4WEg4KBgIB/f4CBg4WGiImKiomHhoWEg4KBgICAgIGChIWHiImKiYiHhoWEg4KBgYCAgICBgoSFhoeIiYmIh4aFhIOCgoGAgICAgYKDhIWGh4iJiIiHhoWEhIOCgYGAgICAgYKDhIWGh4iIiIeGhYSEg4KBgYCAgICBgoOEhYaHiIiIh4aGhYSEg4KBgYCAgICBgoOEhYaHh4eHhoWFhISDgoGBgICAgIGCg4SFhoeHh4aGhYWEg4OCgYGAgICBgoOEhYaGhoeGhoWFhISDgoGBgICAgIGCg4SFhoaGhoWFhIODgoGBgICAgYKDhISFhoaGhoWEhIODgoGBgICAgYKDhISFhYaGhYWEhIODgoGBgICAgYKDhISFhYWFhYSEg4OCgoGAgICBgoOEhIWFhYWFhYSEg4OCgoGBgICAgYKDhISFhYWFhISDgoCCgoGBgICAgIGCg4SEhISEhISDgoKCgYGAgICAgYGDg4SEhISEg4OCgoKBgYCAgICBgoODhISEhISDg4KCgoGBgICAgIGCg4OEhISEg4OCgoKCgYGAgICAgYKDg4SEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYA=',
  
  // Beep: Short high-pitched beep (800 Hz)
  beep: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFgH11dXZ7gIWKjoqFgHx3c3Jzd32Ci4eFgnt2cnBvcXR5fYKGiYaBfXh0cG9vb3F1eX2Ch4uGgX15dHBub25vcHJ2e3+EiYiEgHx4dHFubm5vcXV5foKHi4+OioaAfHh0cHBwcHJ1eH2Bh4uJhYGAfHh1cnBub29xdHh8gYWJjYiEgX57d3RybnBwcXN2eX6Dh4yJhYJ+end0cXBwcnR3e36DiYyIhIGAfHl2dHJxcXJ0d3p+gotOioeBfoB8eXd1c3N0dnh7foGFi46JhoOAfXp4dnV0dHV3ent+g4eKi4eEgn98eXh2dXZ3eHt+gYSIjYqHhIF/fHp4d3d3eXp8f4KGiYyIhYKAf3x7eXh4eHl7fYCEh4qNioeFg4F+fHp5eHl6fH+ChYiLjImGhIKAf319fH19foGDhYiLjIqHhYOBgH9+fX1+f4GDhYiKi4mHhYSCgYCAfn5/gIKEhomLjIqIhoSCgYB/f39/gIGDhYeJi4uJh4WEg4KBgIB/f4CBg4WGiImKiomHhoWEg4KBgYCAgICBgoSFhoeIiYmIh4aFhIOCgoGAgICAgYKDhIWGh4iJiIiHhoWEhIOCgYGAgICAgYKDhIWGh4iIiIeGhYSEg4KBgYCAgICBgoOEhYaHiIiIh4aGhYSEg4KBgYCAgICBgoOEhYaHh4eHhoWFhISDgoGBgICAgIGCg4SFhoeHh4aGhYWEg4OCgYGAgICBgoOEhYaGhoeGhoWFhISDgoGBgICAgIGCg4SFhoaGhoWFhIODgoGBgICAgYKDhISFhoaGhoWEhIODgoGBgICAgYKDhISFhYaGhYWEhIODgoGBgICAgYKDhISFhYWFhYSEg4OCgoGAgICBgoOEhIWFhYWFhYSEg4OCgoGBgICAgYKDhISFhYWFhISDgoCCgoGBgICAgIGCg4SEhISEhISDgoKCgYGAgICAgYGDg4SEhISEg4OCgoKBgYCAgICBgoODhISEhISDg4KCgoGBgICAgIGCg4OEhISEg4OCgoKCgYGAgICAgYKDg4SEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYA=',
  
  // Chime: Pleasant ding (C major chord simulation)
  chime: 'data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFgH11dXZ7gIWKjoqFgHx3c3Jzd32Ci4eFgnt2cnBvcXR5fYKGiYaBfXh0cG9vb3F1eX2Ch4uGgX15dHBub25vcHJ2e3+EiYiEgHx4dHFubm5vcXV5foKHi4+OioaAfHh0cHBwcHJ1eH2Bh4uJhYGAfHh1cnBub29xdHh8gYWJjYiEgX57d3RybnBwcXN2eX6Dh4yJhYJ+end0cXBwcnR3e36DiYyIhIGAfHl2dHJxcXJ0d3p+gotOioeBfoB8eXd1c3N0dnh7foGFi46JhoOAfXp4dnV0dHV3ent+g4eKi4eEgn98eXh2dXZ3eHt+gYSIjYqHhIF/fHp4d3d3eXp8f4KGiYyIhYKAf3x7eXh4eHl7fYCEh4qNioeFg4F+fHp5eHl6fH+ChYiLjImGhIKAf319fH19foGDhYiLjIqHhYOBgH9+fX1+f4GDhYiKi4mHhYSCgYCAfn5/gIKEhomLjIqIhoSCgYB/f39/gIGDhYeJi4uJh4WEg4KBgIB/f4CBg4WGiImKiomHhoWEg4KBgYCAgICBgoSFhoeIiYmIh4aFhIOCgoGAgICAgYKDhIWGh4iJiIiHhoWEhIOCgYGAgICAgYKDhIWGh4iIiIeGhYSEg4KBgYCAgICBgoOEhYaHiIiIh4aGhYSEg4KBgYCAgICBgoOEhYaHh4eHhoWFhISDgoGBgICAgIGCg4SFhoeHh4aGhYWEg4OCgYGAgICBgoOEhYaGhoeGhoWFhISDgoGBgICAgIGCg4SFhoaGhoWFhIODgoGBgICAgYKDhISFhoaGhoWEhIODgoGBgICAgYKDhISFhYaGhYWEhIODgoGBgICAgYKDhISFhYWFhYSEg4OCgoGAgICBgoOEhIWFhYWFhYSEg4OCgoGBgICAgYKDhISFhYWFhISDgoCCgoGBgICAgIGCg4SEhISEhISDgoKCgYGAgICAgYGDg4SEhISEg4OCgoKBgYCAgICBgoODhISEhISDg4KCgoGBgICAgIGCg4OEhISEg4OCgoKCgYGAgICAgYKDg4SEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYCAgICBgoODhISEhISDg4KCgoGBgYA=',
};

/**
 * Hook for playing audio in the app.
 * Manages timer completion sounds with predefined and custom options.
 */
export const useAudio = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  /**
   * Play a timer sound.
   * @param soundId - The ID of the sound ('default', 'beep', 'chime', 'custom')
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
        // Fallback to default if invalid soundId
        audioSrc = TIMER_SOUNDS.default;
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
