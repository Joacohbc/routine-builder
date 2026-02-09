import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRoutines } from '@/hooks/useRoutines';
import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage';
import { Layout } from '@/components/ui/Layout';
import type { Routine } from '@/types';
import type { TrackingType, SetType } from '@/types';

export interface WorkoutStep {
  seriesId: string;
  exerciseId: number;
  setId: string;
  setIndex: number;
  totalSets: number;
  targetWeight: number;
  targetReps: number;
  targetTime: number;
  trackingType: TrackingType;
  type: SetType;
  isSuperset: boolean;
  restTime: number;
}

function generateWorkoutSteps(routine: Routine): WorkoutStep[] {
  const flatSteps: WorkoutStep[] = [];

  routine.series.forEach(series => {
    series.exercises.forEach(ex => {
      ex.sets.forEach((set, idx) => {
        flatSteps.push({
          seriesId: series.id,
          exerciseId: ex.exerciseId,
          setId: set.id,
          setIndex: idx,
          totalSets: ex.sets.length,
          targetWeight: set.weight || 0,
          targetReps: set.reps || 0,
          targetTime: set.time || 0,
          trackingType: ex.trackingType || 'reps',
          type: set.type,
          isSuperset: false,
          restTime: ex.restAfterSet
        });
      });
    });
  });

  return flatSteps;
}

export default function WorkoutPageContainer() {
  const { id } = useParams();
  const { routines } = useRoutines();

  const routine = useMemo(() => {
    if (!id) return null;
    return routines.find(r => r.id === Number(id)) || null;
  }, [ id, routines ]);
  
  const steps = useMemo(() => {
    if (!routine) return [];
    return generateWorkoutSteps(routine);
  }, [ routine ]);

  if (!routine || steps.length === 0) {
    return (
      <Layout>
        <div className="p-6 text-center">Loading...</div>
      </Layout>
    );
  }

  return <ActiveWorkoutPage routine={routine} steps={steps} />;
}
