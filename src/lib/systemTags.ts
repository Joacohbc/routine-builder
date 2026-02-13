/**
 * Muscle groups with simple, user-friendly names
 * Includes subdivisions where anatomically relevant (e.g., upper/lower abs, front/side/rear shoulders)
 */
export type Muscle =
  // Chest
  | 'chest'
  | 'upper_chest'
  | 'lower_chest'
  
  // Back
  | 'back'
  | 'upper_back'
  | 'lower_back'
  | 'lats'
  | 'traps'
  
  // Shoulders
  | 'shoulders'
  | 'front_shoulders'
  | 'side_shoulders'
  | 'rear_shoulders'
  
  // Arms
  | 'biceps'
  | 'triceps'
  | 'forearms'
  
  // Core
  | 'abs'
  | 'upper_abs'
  | 'lower_abs'
  | 'obliques'
  
  // Legs
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  
  // Full Body
  | 'full_body';

/**
 * Default colors for each muscle
 */
export const MUSCLE_COLORS: Record<Muscle, string> = {
  // Chest - Red tones
  chest: '#EF4444',
  upper_chest: '#DC2626',
  lower_chest: '#F87171',
  
  // Back - Blue tones
  back: '#3B82F6',
  upper_back: '#2563EB',
  lower_back: '#93C5FD',
  lats: '#1D4ED8',
  traps: '#60A5FA',
  
  // Shoulders - Amber tones
  shoulders: '#F59E0B',
  front_shoulders: '#D97706',
  side_shoulders: '#F59E0B',
  rear_shoulders: '#FBBF24',
  
  // Arms - Green tones
  biceps: '#10B981',
  triceps: '#059669',
  forearms: '#34D399',
  
  // Core - Purple tones
  abs: '#8B5CF6',
  upper_abs: '#7C3AED',
  lower_abs: '#A78BFA',
  obliques: '#C4B5FD',
  
  // Legs - Pink/Orange tones
  quadriceps: '#EC4899',
  hamstrings: '#DB2777',
  glutes: '#F472B6',
  calves: '#F97316',
  
  // Full Body
  full_body: '#6B7280',
};

/**
 * Helper to get all muscles as an array
 */
export const ALL_MUSCLES: Muscle[] = [
  'chest',
  'upper_chest',
  'lower_chest',
  'back',
  'upper_back',
  'lower_back',
  'lats',
  'traps',
  'shoulders',
  'front_shoulders',
  'side_shoulders',
  'rear_shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'upper_abs',
  'lower_abs',
  'obliques',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'full_body',
];

/**
 * Exercise Purpose - What the exercise is meant for
 */
export type ExercisePurpose =
  | 'warmup'
  | 'stretching'
  | 'cardio'
  | 'mobility'
  | 'rehab'
  | 'cooldown';

/**
 * Difficulty Level - How challenging the exercise is
 */
export type DifficultyLevel =
  | 'beginner'
  | 'intermediate'
  | 'advanced';

/**
 * Default colors for exercise purposes
 */
export const PURPOSE_COLORS: Record<ExercisePurpose, string> = {
  warmup: '#F59E0B',      // Amber
  stretching: '#8B5CF6',  // Purple
  cardio: '#EF4444',      // Red
  mobility: '#10B981',    // Green
  rehab: '#3B82F6',       // Blue
  cooldown: '#06B6D4',    // Cyan
};

/**
 * Default colors for difficulty levels
 */
export const DIFFICULTY_COLORS: Record<DifficultyLevel, string> = {
  beginner: '#10B981',    // Green
  intermediate: '#F59E0B', // Amber
  advanced: '#EF4444',    // Red
};

/**
 * Helper to get all exercise purposes as an array
 */
export const ALL_PURPOSES: ExercisePurpose[] = [
  'warmup',
  'stretching',
  'cardio',
  'mobility',
  'rehab',
  'cooldown',
];

/**
 * Helper to get all difficulty levels as an array
 */
export const ALL_DIFFICULTIES: DifficultyLevel[] = [
  'beginner',
  'intermediate',
  'advanced',
];
