import { useContext } from 'react';
import { ExerciseContext } from '@/contexts/ExerciseContext';

export function useExercises() {
  const context = useContext(ExerciseContext);
  if (!context) {
    throw new Error('useExercises must be used within an ExerciseProvider');
  }
  return context;
}
