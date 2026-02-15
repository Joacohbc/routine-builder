import { useState, useRef, useCallback, useEffect } from 'react';

// Define the structure of an individual timer
interface TimerState {
  elapsed: number; // Time in seconds (or milliseconds if you prefer)
  isRunning: boolean;
}

// The type for our timers map
type TimersMap = Record<string, TimerState>;

export const useMultiTimer = () => {
  // Visual state: what React needs to render
  const [timers, setTimers] = useState<TimersMap>({});

  // References: To store interval IDs without triggering re-renders
  const intervalIds = useRef<Record<string, NodeJS.Timeout>>({});

  // Internal function to start the interval
  const startInterval = useCallback((name: string) => {
    // Clear any existing interval first to avoid duplicates
    if (intervalIds.current[name]) {
      clearInterval(intervalIds.current[name]);
      delete intervalIds.current[name];
    }

    intervalIds.current[name] = setInterval(() => {
      setTimers((prev) => {
        const currentTimer = prev[name] || { elapsed: 0, isRunning: false };
        return {
          ...prev,
          [name]: {
            ...currentTimer,
            elapsed: currentTimer.elapsed + 1, // Add 1 second
            isRunning: true,
          },
        };
      });
    }, 1000); // Update every 1 second
  }, []);

  // 1. START: Start or resume a timer
  const start = useCallback(
    (name: string) => {
      // Initialize the timer state if it doesn't exist
      setTimers((prev) => ({
        ...prev,
        [name]: prev[name] || { elapsed: 0, isRunning: true },
      }));
      startInterval(name);
    },
    [startInterval]
  );

  // 2. PAUSE: Stop the interval but keep the time
  const pause = useCallback((name: string) => {
    if (intervalIds.current[name]) {
      clearInterval(intervalIds.current[name]);
      delete intervalIds.current[name];
    }

    setTimers((prev) => ({
      ...prev,
      [name]: { ...prev[name], isRunning: false },
    }));
  }, []);

  // 3. RESET: Stop and return to zero
  const reset = useCallback((name: string) => {
    if (intervalIds.current[name]) {
      clearInterval(intervalIds.current[name]);
      delete intervalIds.current[name];
    }

    setTimers((prev) => ({
      ...prev,
      [name]: { elapsed: 0, isRunning: false },
    }));
  }, []);

  // 4. DELETE: Remove the timer from state completely
  const remove = useCallback((name: string) => {
    if (intervalIds.current[name]) {
      clearInterval(intervalIds.current[name]);
      delete intervalIds.current[name];
    }

    setTimers((prev) => {
      const newTimers = { ...prev };
      delete newTimers[name];
      return newTimers;
    });
  }, []);

  // Cleanup when unmounting the component that uses the hook
  useEffect(() => {
    return () => {
      Object.values(intervalIds.current).forEach(clearInterval);
    };
  }, []);

  return {
    timers,
    start,
    pause,
    reset,
    remove,
  };
};
