import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useRoutines } from '@/hooks/useRoutines';
import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage';
import { Layout } from '@/components/ui/Layout';
import type { Routine } from '@/types';
import type { TrackingType, SetType } from '@/types';
import { useTranslation } from 'react-i18next';

export type WorkoutStepType = 'exercise' | 'exercise_rest' | 'serie_rest';

export interface WorkoutStep {
  seriesId: string;
  exerciseId: string;
  setId: string;

  stepIndex: number;
  type: WorkoutStepType;
}

export interface ExerciseStep extends WorkoutStep {
  type: 'exercise';
  targetWeight: number;
  targetReps?: number;
  targetTime?: number;

  trackingType: TrackingType;
  setType: SetType;
  isSuperset: boolean;
}

export interface RestStep extends WorkoutStep {
  type: 'exercise_rest' | 'serie_rest';
  restTime: number;
}

function generateWorkoutSteps(routine: Routine): WorkoutStep[] {
  const flatSteps: WorkoutStep[] = [];

  // Routine (only 1) -> Series (at least 1) -> Exercise (at least 1) -> Set (at least 1)
  routine.series.forEach((series) => {
    series.exercises.forEach((ex, exIdx) => {
      ex.sets.forEach((set, setIdx) => {
        
        // All exercise steps are added first, then rest steps are added after each exercise (except the last one)
        const exerciseStep: ExerciseStep = {
          type: 'exercise',
          
          seriesId: series.id,
          exerciseId: ex.exerciseId.toString(),
          setId: set.id,
          stepIndex: flatSteps.length,
          
          targetWeight: set.weight || 0,
          targetReps: set.reps,
          targetTime: set.time,
          
          trackingType: ex.trackingType,
          setType: set.type,
          isSuperset: series.type === 'superset',
        };

        flatSteps.push(exerciseStep);

        const isLastSetFromExercise = setIdx === ex.sets.length - 1;
        const isLastExerciseFromSeries = exIdx === series.exercises.length - 1;

        if(ex.restAfterSet > 0 && !isLastSetFromExercise) {
          const restStep: RestStep = {
            type: 'exercise_rest',

            seriesId: series.id,
            exerciseId: ex.exerciseId.toString(),
            setId: set.id,
            stepIndex: flatSteps.length,

            restTime: ex.restAfterSet
          };

          flatSteps.push(restStep);
        }

        // If is the last exercise in the series, add rest step
        if(series.restAfterSerie > 0 
            && isLastExerciseFromSeries
            && isLastSetFromExercise) {
          const finalRestStep: RestStep = {
            type: 'serie_rest',

            seriesId: series.id,
            exerciseId: ex.exerciseId.toString(),
            setId: set.id,
            stepIndex: flatSteps.length,

            restTime: series.restAfterSerie
          };

          flatSteps.push(finalRestStep);
        }
      });
    });
  });

  console.log('Generated workout steps:', flatSteps);
  return flatSteps;
}

export default function WorkoutPageContainer() {
  const { id } = useParams();
  const { t } = useTranslation();
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
        <div className="p-6 text-center">{t('loading')}</div>
      </Layout>
    );
  }

  return <ActiveWorkoutPage routine={routine} steps={steps} />;
}
