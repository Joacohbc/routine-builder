export type InventoryStatus = 'available' | 'checked_out' | 'maintenance';
export type InventoryCondition = 'new' | 'good' | 'worn' | 'poor';

export interface Tag {
  id?: number;
  name: string;
  color: string;
}

export interface InventoryItem {
  id?: number;
  name: string;
  icon: string; // Material Symbol name
  tagIds: number[];
  status: InventoryStatus;
  condition: InventoryCondition;
  quantity: number;
}

export type MediaType = 'image' | 'video' | 'youtube';

export interface MediaItem {
  id: string;
  type: MediaType;
  url: string; // Base64 Data URI or YouTube link
  thumbnailUrl?: string;
}

export interface Exercise {
  id?: number;
  title: string;
  description?: string;
  muscleGroup: string; // e.g., 'Chest', 'Legs' - Maintained for compatibility, can be derived from tags
  tagIds: number[];
  primaryEquipmentIds: number[]; // Refs to Inventory
  media: MediaItem[];
  defaultType: 'weight_reps' | 'time' | 'bodyweight_reps';
}

export interface WorkoutSet {
  id: string;
  type: 'warmup' | 'working' | 'failure';
  weight?: number; // kg/lbs
  reps?: number;
  time?: number; // seconds
  rpe?: number; // 1-10
  completed: boolean;
}

export interface RoutineExercise {
  id: string;
  exerciseId: number; // Ref to Exercise
  trackingType?: 'reps' | 'time';
  sets: WorkoutSet[];
  restAfter?: number; // seconds
  notes?: string;
}

export interface RoutineSeries {
  id: string;
  type: 'standard' | 'superset' | 'circuit';
  exercises: RoutineExercise[];
  restBetweenExercises?: number; // if 0, it's a superset/circuit flow
}

export interface Routine {
  id?: number;
  name: string;
  description?: string;
  series: RoutineSeries[];
  createdAt: Date;
  updatedAt: Date;
}
