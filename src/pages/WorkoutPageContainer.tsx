import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useRoutines } from '@/hooks/useRoutines';
import { useSettings } from '@/hooks/useSettings';
import ActiveWorkoutPage from '@/pages/ActiveWorkoutPage';
import { Layout } from '@/components/ui/Layout';
import type { Routine } from '@/types';
import type { TrackingType, SetType } from '@/types';
import { useTranslation } from 'react-i18next';
import { ROUTES } from '@/lib/routes';

/**
 * Type of rest during a workout
 * - set_rest: Rest between sets of the same exercise
 * - exercise_rest: Rest between different exercises within the same series
 * - serie_rest: Rest between series
 */
export type RestType = 'set_rest' | 'exercise_rest' | 'serie_rest';

export type WorkoutStepType = 'exercise' | RestType;

export interface WorkoutStep {
  seriesId: string;
  exerciseId: string;
  setId: string;
  stepIndex: number;
  type: WorkoutStepType;
}

export interface ExerciseStep extends WorkoutStep {
  /**
   * 0-based index of the exercise within the serie.
   * This must to be filled with the index of the Exercise inside the Serie because
   * if the same Exercise is repeated in the same Serie, we need to differentiate them from the
   * previous or next one.
   **/
  exerciseIndexInsideSerie: number;

  type: 'exercise';
  targetWeight: number;
  targetReps?: number;
  targetTime?: number;

  trackingType: TrackingType;
  setType: SetType;
  isSuperset: boolean;
}

export interface RestStep extends WorkoutStep {
  type: RestType;
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
          exerciseIndexInsideSerie: exIdx,

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

        // Add set rest after each set (except the last set of the exercise)
        if (ex.restAfterSet > 0 && !isLastSetFromExercise) {
          const setRestStep: RestStep = {
            type: 'set_rest',

            seriesId: series.id,
            exerciseId: ex.exerciseId.toString(),
            setId: set.id,
            stepIndex: flatSteps.length,

            restTime: ex.restAfterSet,
          };

          flatSteps.push(setRestStep);
        }

        // Add exercise rest after each exercise (except the last exercise of the series)
        if (ex.restAfterSet > 0 && isLastSetFromExercise && !isLastExerciseFromSeries) {
          const exerciseRestStep: RestStep = {
            type: 'exercise_rest',

            seriesId: series.id,
            exerciseId: ex.exerciseId.toString(),
            setId: set.id,
            stepIndex: flatSteps.length,

            restTime: series.restAfterSerie,
          };

          flatSteps.push(exerciseRestStep);
        }

        // Add series rest after the last exercise of the series
        if (series.restAfterSerie > 0 && isLastExerciseFromSeries && isLastSetFromExercise) {
          const serieRestStep: RestStep = {
            type: 'serie_rest',

            seriesId: series.id,
            exerciseId: ex.exerciseId.toString(),
            setId: set.id,
            stepIndex: flatSteps.length,
            restTime: series.restAfterSerie,
          };

          flatSteps.push(serieRestStep);
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
  const navigate = useNavigate();
  const { routines } = useRoutines();
  const { settings } = useSettings();

  const routine = useMemo(() => {
    if (!id) return null;

    const found = routines.find((r) => r.id === Number(id));
    
    if(!found) {
      navigate(ROUTES.NOT_FOUND);
      return null;
    }

    return found;
  }, [id, routines, navigate]);

  const steps = useMemo(() => {
    if (!routine) return [];
    return generateWorkoutSteps(routine);
  }, [routine]);

  if (!routine || steps.length === 0) {
    return (
      <Layout title={t('common.loading')}>
        <div className="p-6 text-center">{t('common.loading')}</div>
      </Layout>
    );
  }

  return <ActiveWorkoutPage routine={routine} steps={steps} settings={settings} />;
}
