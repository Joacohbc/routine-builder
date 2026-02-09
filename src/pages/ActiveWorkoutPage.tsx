import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { useMultiTimer } from '@/hooks/useTimers';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Icon } from '@/components/ui/Icon';
import { RestingStep } from '@/components/routine/RestingStep';
import { WorkoutSetDisplay } from '@/components/routine/WorkoutSetDisplay';
import { formatTimeMMSS } from '@/lib/timeUtils';
import { cn } from '@/lib/utils';
import type { Routine } from '@/types';
import type { WorkoutStep, ExerciseStep, RestStep as RestStepType } from '@/pages/WorkoutPageContainer';

interface ActiveWorkoutPageProps {
  routine: Routine;
  steps: WorkoutStep[];
}

function isExerciseStep(step: WorkoutStep): step is ExerciseStep {
  return step.type === 'exercise';
}

function isRestStep(step: WorkoutStep): step is RestStepType {
  return step.type === 'exercise_rest' || step.type === 'serie_rest';
}

export default function ActiveWorkoutPage({ routine, steps }: ActiveWorkoutPageProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { exercises } = useExercises();
  const { timers, start, pause, reset } = useMultiTimer();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showMedia, setShowMedia] = useState(false);

  const currentStep = steps[currentStepIndex];

  // Map RoutineExercise.id → Exercise DB id for lookup
  const routineExerciseMap = useMemo(() => {
    const map = new Map<string, number>();
    routine.series.forEach(s => {
      s.exercises.forEach(ex => {
        map.set(ex.id, ex.exerciseId);
      });
    });
    return map;
  }, [routine]);

  // Find the actual Exercise from DB
  const currentExercise = useMemo(() => {
    const dbId = routineExerciseMap.get(currentStep.exerciseId);
    return exercises.find(e => e.id === dbId);
  }, [exercises, currentStep.exerciseId, routineExerciseMap]);

  // For exercise steps: compute set position within its exercise in this series
  const setProgress = useMemo(() => {
    if (!isExerciseStep(currentStep)) return null;
    const sameExerciseSteps = steps.filter(
      (s): s is ExerciseStep =>
        isExerciseStep(s) &&
        s.exerciseId === currentStep.exerciseId &&
        s.seriesId === currentStep.seriesId
    );
    const setIndex = sameExerciseSteps.findIndex(s => s.stepIndex === currentStep.stepIndex);
    return { current: setIndex + 1, total: sameExerciseSteps.length };
  }, [currentStep, steps]);

  // Count remaining exercise steps (excluding rest steps from the count)
  const stepsRemaining = useMemo(() => {
    const exerciseSteps = steps.filter(isExerciseStep);
    const currentExIdx = exerciseSteps.findIndex(s => s.stepIndex >= currentStep.stepIndex);
    const completed = currentExIdx !== -1 ? currentExIdx : exerciseSteps.length;
    return exerciseSteps.length - completed - (isExerciseStep(currentStep) ? 1 : 0);
  }, [currentStep, steps]);

  // Start global timer on mount
  useEffect(() => {
    start('global');
  }, [start]);

  // Handle timers based on current step type
  useEffect(() => {
    if (isRestStep(currentStep)) {
      pause('exercise');
      reset('rest');
      start('rest');
    } else if (isExerciseStep(currentStep)) {
      pause('rest');
      reset('exercise');
      if (currentStep.trackingType === 'time') {
        start('exercise');
      }
    }
  }, [currentStepIndex, currentStep, start, pause, reset]);

  const handleNext = () => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      navigate('/builder');
    }
  };

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  };

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="flex flex-col h-screen bg-background text-text-main">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 pt-safe-top">
        <button onClick={() => navigate(-1)} className="text-text-muted">
          <Icon name="close" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-sm">{routine.name}</h2>
          <span className="text-xs font-mono text-primary">{formatTimeMMSS(timers['global']?.elapsed || 0)}</span>
        </div>
        <button onClick={() => setShowMedia(true)} className={cn("text-text-muted", !currentExercise?.media.length && "opacity-20")}>
          <Icon name="movie" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <Stepper
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          leftLabel={
            isExerciseStep(currentStep) && setProgress
              ? t('activeWorkout.setProgress', { current: setProgress.current, total: setProgress.total })
              : isRestStep(currentStep)
                ? currentStep.type === 'serie_rest'
                  ? t('activeWorkout.seriesRest')
                  : t('activeWorkout.exerciseRest')
                : ''
          }
          rightLabel={t('activeWorkout.stepsRemaining', { count: stepsRemaining })}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative overflow-hidden">
        {/* Exercise Info */}
        <div className="text-center z-10">
          <h1 className="text-3xl font-bold mb-2 leading-tight">{currentExercise?.title || t('activeWorkout.unknownExercise')}</h1>
          {isExerciseStep(currentStep) && currentStep.isSuperset && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full animate-pulse">
              {t('activeWorkout.supersetFlow')}
            </span>
          )}
        </div>

        {/* Step Content */}
        {isRestStep(currentStep) ? (
          <RestingStep
            restTimer={timers['rest']?.elapsed || 0}
            targetRestTime={currentStep.restTime}
            restType={currentStep.type}
          />
        ) : isExerciseStep(currentStep) ? (
          <WorkoutSetDisplay
            targetWeight={currentStep.targetWeight}
            targetReps={currentStep.setType === 'failure' ? Infinity : currentStep.targetReps}
            time={timers['exercise']?.elapsed || 0}
            targetTime={currentStep.targetTime}
            trackingType={currentStep.trackingType}
          />
        ) : null}
      </div>

      {/* Footer Action */}
      <div className="p-6 pb-safe-bottom">
        <div className="flex gap-3">
          <Button
            onClick={handlePrevious}
            disabled={isFirstStep}
            variant="secondary"
            className="h-14 w-14 p-0 flex items-center justify-center"
          >
            <Icon name="arrow_back" size={24} />
          </Button>
          <Button onClick={handleNext} className="h-14 text-lg flex-1">
            {isRestStep(currentStep)
              ? t('activeWorkout.skipRest')
              : isLastStep
                ? t('activeWorkout.finishWorkout')
                : t('activeWorkout.nextStep')}
          </Button>
        </div>
      </div>

      {/* Media Modal */}
      {showMedia && currentExercise && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <button onClick={() => setShowMedia(false)} className="absolute top-4 right-4 text-white">
            <Icon name="close" size={32} />
          </button>
          <div className="w-full max-w-md aspect-square bg-black rounded-2xl overflow-hidden relative">
            {currentExercise.media.length > 0 ? (
              (() => {
                const m = currentExercise.media[0];
                if (m.type === 'image') return <img src={m.url} className="w-full h-full object-contain" />;
                if (m.type === 'video') return <video src={m.url} controls className="w-full h-full object-contain" />;
                if (m.type === 'youtube') return <iframe src={`https://www.youtube.com/embed/${m.url}`} className="w-full h-full" allowFullScreen />;
                return null;
              })()
            ) : (
              <div className="w-full h-full flex items-center justify-center text-text-muted">{t('activeWorkout.noMedia')}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
