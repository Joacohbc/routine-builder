/**
 * Application route constants
 * Use these instead of hardcoded strings to ensure consistency
 */

// Base routes
export const ROUTES = {
  HOME: '/',
  EXERCISES: '/exercises',
  EXERCISES_NEW: '/exercises/new',
  ROUTINE: '/routine',
  ROUTINE_NEW: '/routine/new',
  SETTINGS: '/settings',
  SETTINGS_TAGS: '/settings/tags',
  SETTINGS_SPEECH_TEST: '/settings/speech-test',
  NOT_FOUND: '/not-found',
} as const;

// Dynamic route patterns (for Route definitions)
export const ROUTE_PATTERNS = {
  EXERCISE_EDIT: '/exercises/:id',
  ROUTINE_EDIT: '/routine/:id',
  WORKOUT_PLAY: '/play/:id',
} as const;

// Helper functions for dynamic routes
export const buildRoute = {
  exerciseEdit: (id: string | number) => `/exercises/${id}`,
  routineEdit: (id: string | number) => `/routine/${id}`,
  workoutPlay: (id: string | number) => `/play/${id}`,
} as const;
