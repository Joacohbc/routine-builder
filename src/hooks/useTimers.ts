import { useState, useRef, useCallback, useEffect } from 'react';

// Definimos la estructura de un timer individual
interface TimerState {
  elapsed: number; // Tiempo en segundos (o milisegundos si prefieres)
  isRunning: boolean;
}

// El tipo para nuestro mapa de timers
type TimersMap = Record<string, TimerState>;

export const useMultiTimer = () => {
  // Estado visual: lo que React necesita para renderizar
  const [timers, setTimers] = useState<TimersMap>({});

  // Referencias: Para guardar los IDs de los intervalos sin provocar re-renders
  const intervalIds = useRef<Record<string, NodeJS.Timeout>>({});

  // Función interna para iniciar el intervalo
  const startInterval = (name: string) => {
    // Si ya existe un intervalo corriendo para este nombre, no hacer nada
    if (intervalIds.current[name]) return;

    intervalIds.current[name] = setInterval(() => {
      setTimers((prev) => {
        const currentTimer = prev[name] || { elapsed: 0, isRunning: false };
        return {
          ...prev,
          [name]: {
            ...currentTimer,
            elapsed: currentTimer.elapsed + 1, // Sumamos 1 segundo
            isRunning: true,
          },
        };
      });
    }, 1000); // Actualización cada 1 segundo
  };

  // 1. START: Iniciar o reanudar un timer
  const start = useCallback((name: string) => {
    setTimers((prev) => ({
      ...prev,
      [name]: {
        elapsed: prev[name]?.elapsed || 0,
        isRunning: true,
      },
    }));
    startInterval(name);
  }, []);

  // 2. PAUSE: Detener el intervalo pero mantener el tiempo
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

  // 3. RESET: Detener y volver a cero
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

  // 4. DELETE: Eliminar el timer del estado completamente
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

  // Limpieza al desmontar el componente que usa el hook
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