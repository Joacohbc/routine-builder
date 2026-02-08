export type { MuscleGroup, Muscle } from '@/lib/typesMuscle';
export {
  MUSCLES_BY_GROUP,
  MUSCLE_GROUP_COLORS,
  ALL_MUSCLE_GROUPS,
  ALL_MUSCLES,
} from '@/lib/typesMuscle';

/** Current availability status of equipment */
export type InventoryStatus = 'available' | 'checked_out' | 'maintenance';

/** Physical condition state of equipment */
export type InventoryCondition = 'new' | 'good' | 'worn' | 'poor';

/**
 * How an exercise is tracked by default
 * - weight_reps: Exercise with external weight + repetitions (e.g., Bench Press 100kg x 8 reps)
 * - time: Duration-based exercise (e.g., Plank for 60 seconds, Running for 20 minutes)
 * - bodyweight_reps: Bodyweight exercise tracking only repetitions (e.g., Push-ups, Pull-ups)
 */
export type ExerciseType = 'weight_reps' | 'time' | 'bodyweight_reps';

/**
 * Type of set in a workout to categorize intensity and purpose
 * - warmup: Low weight (30-50% max), prepares muscles/joints, not counted as effective work
 * - working: Moderate-high weight (70-85% max), main training work, generates strength/hypertrophy adaptations
 * - failure: Maximum intensity, performed until muscular failure (unable to complete another rep)
 */
export type SetType = 'warmup' | 'working' | 'failure';

/** How progress is measured in a routine exercise */
export type TrackingType = 'reps' | 'time';

/**
 * How exercises are organized in a series
 * - standard: Traditional single-exercise sets with full rest between sets (Exercise → Rest → Repeat)
 *   Focus: Strength/hypertrophy with complete recovery
 * 
 * - superset: 2-3 exercises performed back-to-back with no rest between them (Exercise A → Exercise B → Rest → Repeat)
 *   Focus: Time efficiency, antagonist muscle groups, high intensity with heavier loads
 */
export type SeriesType = 'standard' | 'superset';

/** Supported media format types */
export type MediaType = 'image' | 'video' | 'youtube';

/**
 * TAGS: Flexible labeling system for categorizing exercises and equipment, allowing users to create custom tags
 * for muscle groups, equipment types, workout styles, or any organizational scheme they prefer.
*/

/**
 * Type of tag:
 * - 'custom': user-created tag
 * - MuscleGroup value (e.g. 'chest', 'back'): system muscle tag belonging to that group
 */
export type TagType = 'custom' | 'muscle_group';

/** Category labels for organizing exercises and equipment */
export interface Tag {
  id?: number;
  name: string;
  color: string;
  type: TagType;

  /**
   * Whether this tag is a system-managed tag (e.g., muscle tags).
   * System tags cannot be deleted or renamed by the user.
   */
  system: boolean;
}

/**
 * INVENTORY: Represents workout equipment/gear owned by the user, with status and 
 * condition tracking for effective workout planning and management.
 */

/** Workout equipment/gear owned by the user */
export interface InventoryItem {
  id?: number;
  name: string;
  icon: string; // Material Symbol name
  tags: Tag[];
  status: InventoryStatus;
  condition: InventoryCondition;
  quantity: number;
}

/**
 * EXERCISES: Core structures for defining workout exercises with associated media, 
 * equipment requirements, and categorization for routine building.
*/

/** Media attachment (image, video, or YouTube link) */
export interface MediaItem {
  id: string;
  type: MediaType;
  url: string; // Base64 Data URI or YouTube link
  thumbnailUrl?: string;
}

/** Definition of a single workout exercise */
export interface Exercise {
  id?: number;
  title: string;
  description?: string;

  /**
   * Tags for categorizing the exercise (e.g., muscle groups, equipment types, workout styles).
   */
  tags: Tag[];

  /**
   * Primary equipment required for the exercise.
   * Empty array for bodyweight exercises.
   */
  primaryEquipment: InventoryItem[];

  media: MediaItem[];
  defaultType: ExerciseType;
}

/** Individual set within an exercise, tracking performance metrics */
export interface WorkoutSet {
  id: string;
  type: SetType;
  weight?: number; // kg/lbs
  reps?: number;
  time?: number; // seconds
  rpe?: number; // 1-10
  completed: boolean;
}

/** Exercise within a routine with set configuration */
export interface RoutineExercise {
  id: string;
  exerciseId: number; // References Exercise.id in the exercises store
  trackingType: TrackingType;
  sets: WorkoutSet[];
  restAfter?: number; // seconds
  notes?: string;
}

/** Group of exercises (standard, superset, or circuit) */
export interface RoutineSeries {
  id: string;
  type: SeriesType;
  exercises: RoutineExercise[];
  restBetweenExercises?: number; // if 0, it's a superset/circuit flow
}

/** Complete workout plan with multiple series */
export interface Routine {
  id?: number;
  name: string;
  description?: string;
  series: RoutineSeries[];
  createdAt: Date;
  updatedAt: Date;
}
