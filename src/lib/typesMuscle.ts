/**
 * 1. Primary Muscle Groups
 * (High-level categories)
 */
export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'lats'
  | 'traps'
  | 'lower_back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'abs'
  | 'obliques'
  | 'quadriceps'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'full_body';

/**
 * 2. Specific Muscles
 * (Anatomical breakdown)
 */
export type Muscle =
  // Chest
  | 'pectoralis_major'
  | 'pectoralis_minor'
  | 'serratus_anterior'

  // Back (General/Upper) & Lats
  | 'latissimus_dorsi'
  | 'rhomboids'
  | 'teres_major'
  | 'teres_minor'

  // Traps
  | 'trapezius_upper'
  | 'trapezius_middle'
  | 'trapezius_lower'

  // Lower Back
  | 'erector_spinae'
  | 'quadratus_lumborum'

  // Shoulders
  | 'deltoid_anterior'
  | 'deltoid_lateral'
  | 'deltoid_posterior'
  | 'rotator_cuff' // Includes supraspinatus, infraspinatus, etc.

  // Arms
  | 'biceps_brachii'
  | 'brachialis'
  | 'triceps_brachii' // Can be split into heads if needed, but usually kept as one
  | 'brachioradialis'
  | 'wrist_flexors'
  | 'wrist_extensors'

  // Core
  | 'rectus_abdominis'
  | 'transversus_abdominis'
  | 'obliquus_externus' // External Oblique
  | 'obliquus_internus' // Internal Oblique

  // Legs - Quads
  | 'rectus_femoris'
  | 'vastus_lateralis'
  | 'vastus_medialis'
  | 'vastus_intermedius'

  // Legs - Hamstrings
  | 'biceps_femoris'
  | 'semitendinosus'
  | 'semimembranosus'

  // Legs - Glutes
  | 'gluteus_maximus'
  | 'gluteus_medius'
  | 'gluteus_minimus'

  // Legs - Calves
  | 'gastrocnemius'
  | 'soleus'
  | 'tibialis_anterior' // Shin muscle, often grouped here for simplicity

  // Compound
  | 'composite'; // For full body movements

/**
 * 3. Relationship Mapping
 * Useful for filtering or dropdowns (e.g., Select Group -> Show Muscles)
 */
export const MUSCLES_BY_GROUP: Record<MuscleGroup, Muscle[]> = {
  chest: ['pectoralis_major', 'pectoralis_minor', 'serratus_anterior'],
  back: ['rhomboids', 'teres_major', 'teres_minor'],
  lats: ['latissimus_dorsi'],
  traps: ['trapezius_upper', 'trapezius_middle', 'trapezius_lower'],
  lower_back: ['erector_spinae', 'quadratus_lumborum'],
  shoulders: [
    'deltoid_anterior',
    'deltoid_lateral',
    'deltoid_posterior',
    'rotator_cuff',
  ],
  biceps: ['biceps_brachii', 'brachialis'],
  triceps: ['triceps_brachii'],
  forearms: ['brachioradialis', 'wrist_flexors', 'wrist_extensors'],
  abs: ['rectus_abdominis', 'transversus_abdominis'],
  obliques: ['obliquus_externus', 'obliquus_internus'],
  quadriceps: [
    'rectus_femoris',
    'vastus_lateralis',
    'vastus_medialis',
    'vastus_intermedius',
  ],
  hamstrings: ['biceps_femoris', 'semitendinosus', 'semimembranosus'],
  glutes: ['gluteus_maximus', 'gluteus_medius', 'gluteus_minimus'],
  calves: ['gastrocnemius', 'soleus', 'tibialis_anterior'],
  full_body: ['composite'],
};

/**
 * 4. Default Colors for Muscle Groups
 * Suggested colors for muscle group tags
 */
export const MUSCLE_GROUP_COLORS: Record<MuscleGroup, string> = {
  chest: '#EF4444',        // Red
  back: '#3B82F6',         // Blue
  lats: '#2563EB',         // Dark Blue
  traps: '#60A5FA',        // Light Blue
  lower_back: '#93C5FD',   // Lighter Blue
  shoulders: '#F59E0B',    // Amber
  biceps: '#10B981',       // Green
  triceps: '#059669',      // Dark Green
  forearms: '#34D399',     // Light Green
  abs: '#8B5CF6',          // Purple
  obliques: '#A78BFA',     // Light Purple
  quadriceps: '#EC4899',   // Pink
  hamstrings: '#DB2777',   // Dark Pink
  glutes: '#F472B6',       // Light Pink
  calves: '#F97316',       // Orange
  full_body: '#6B7280',    // Gray
};

/**
 * Helper to get all muscle groups as an array
 */
export const ALL_MUSCLE_GROUPS: MuscleGroup[] = [
  'chest',
  'back',
  'lats',
  'traps',
  'lower_back',
  'shoulders',
  'biceps',
  'triceps',
  'forearms',
  'abs',
  'obliques',
  'quadriceps',
  'hamstrings',
  'glutes',
  'calves',
  'full_body',
];

/**
 * Helper to get all specific muscles as an array
 */
export const ALL_MUSCLES: Muscle[] = [
  'pectoralis_major',
  'pectoralis_minor',
  'serratus_anterior',
  'latissimus_dorsi',
  'rhomboids',
  'teres_major',
  'teres_minor',
  'trapezius_upper',
  'trapezius_middle',
  'trapezius_lower',
  'erector_spinae',
  'quadratus_lumborum',
  'deltoid_anterior',
  'deltoid_lateral',
  'deltoid_posterior',
  'rotator_cuff',
  'biceps_brachii',
  'brachialis',
  'triceps_brachii',
  'brachioradialis',
  'wrist_flexors',
  'wrist_extensors',
  'rectus_abdominis',
  'transversus_abdominis',
  'obliquus_externus',
  'obliquus_internus',
  'rectus_femoris',
  'vastus_lateralis',
  'vastus_medialis',
  'vastus_intermedius',
  'biceps_femoris',
  'semitendinosus',
  'semimembranosus',
  'gluteus_maximus',
  'gluteus_medius',
  'gluteus_minimus',
  'gastrocnemius',
  'soleus',
  'tibialis_anterior',
  'composite',
];
