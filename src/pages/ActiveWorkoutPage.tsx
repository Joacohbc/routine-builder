import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { useMultiTimer } from '@/hooks/useTimers';
import { useAudio } from '@/hooks/useAudio';
import type { Settings } from '@/hooks/useSettings';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
import { Toast, type ToastRef } from '@/components/ui/Toast';
import { RestingStep } from '@/components/routine/RestingStep';
import { WorkoutSetDisplay } from '@/components/routine/WorkoutSetDisplay';
import { formatTimeMMSS } from '@/lib/timeUtils';
import { cn } from '@/lib/utils';
import type { Routine } from '@/types';
import type { WorkoutStep, ExerciseStep, RestStep as RestStepType } from '@/pages/WorkoutPageContainer';

interface ActiveWorkoutPageProps {
  routine: Routine;
  steps: WorkoutStep[];
  settings: Settings;
}

function isExerciseStep(step: WorkoutStep): step is ExerciseStep {
  return step.type === 'exercise';
}

function isRestStep(step: WorkoutStep): step is RestStepType {
  return step.type === 'set_rest' || step.type === 'exercise_rest' || step.type === 'serie_rest';
}

export default function ActiveWorkoutPage({ routine, steps, settings }: ActiveWorkoutPageProps) {
  
  // Utilities
  const navigate = useNavigate();
  const { timers, start, pause, reset } = useMultiTimer();
  const { playTimerSound } = useAudio();
  const { t } = useTranslation();
  
  // Data
  const { exercises } = useExercises();

  // State for logical step tracking and UI
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showMedia, setShowMedia] = useState(false);
  const [isFading, setIsFading] = useState(false);
  
  // Local auto-next state (initialized from settings, can be toggled during workout)
  const [localAutoNext, setLocalAutoNext] = useState(settings.autoNext);
  
  // Toast ref for auto-next notifications
  const toastRef = useRef<ToastRef>(null);
  
  // Track if we've already triggered sound/auto-next for current step
  const hasTriggeredTargetRef = useRef(false);

  // Guard against stale timer values on step transitions.
  // When step changes, timer reset is async (setState). The auto-next effect
  // would see old elapsed values and re-trigger. This ref skips the first
  // check after a step change, letting the timer state catch up.
  const prevStepForTimerCheckRef = useRef<number>(-1);

  // Pre-calculate progress map for all steps (only depends on steps, not current state)
  const progressMap = useMemo(() => {
    const map = new Map<number, { series: { current: number; total: number }; exercise: { current: number; total: number } | null; set: { current: number; total: number } | null }>();
    
    // 1. Calculate series metadata
    const uniqueSeriesIds: string[] = [];
    steps.forEach(step => {
      if (!uniqueSeriesIds.includes(step.seriesId)) {
        uniqueSeriesIds.push(step.seriesId);
      }
    });
    
    // 2. For each step, calculate its progress
    steps.forEach(step => {
      const currentSeriesIndex = uniqueSeriesIds.indexOf(step.seriesId);
      const series = {
        current: currentSeriesIndex + 1,
        total: uniqueSeriesIds.length
      };

      // Rest steps only have series progress
      if (!isExerciseStep(step)) {
        map.set(step.stepIndex, { series, exercise: null, set: null });
        return;
      }

      // 3. Calculate exercise progress within the series
      const uniqueExerciseIndices: number[] = [];
      steps.forEach(s => {
        if (isExerciseStep(s) && s.seriesId === step.seriesId) {
          if (!uniqueExerciseIndices.includes(s.exerciseIndexInsideSerie)) {
            uniqueExerciseIndices.push(s.exerciseIndexInsideSerie);
          }
        }
      });
      uniqueExerciseIndices.sort((a, b) => a - b);
      
      const exercise = {
        current: uniqueExerciseIndices.indexOf(step.exerciseIndexInsideSerie) + 1,
        total: uniqueExerciseIndices.length
      };

      // 4. Calculate set progress within the exercise
      const setsOfCurrentExercise = steps.filter(
        (s): s is ExerciseStep =>
          isExerciseStep(s) 
          && s.seriesId === step.seriesId
          && s.exerciseIndexInsideSerie === step.exerciseIndexInsideSerie
      );
      
      const currentSetIndex = setsOfCurrentExercise.findIndex(s => s.stepIndex === step.stepIndex);
      const set = {
        current: currentSetIndex + 1,
        total: setsOfCurrentExercise.length
      };

      map.set(step.stepIndex, { series, exercise, set });
    });

    return map;
  }, [steps]);

  const currentStep = steps[currentStepIndex];
  const progress = progressMap.get(currentStepIndex)!;

  // Find the actual Exercise from DB
  const currentExercise = useMemo(() => {
    return exercises.find(e => e.id === Number(currentStep.exerciseId));
  }, [exercises, currentStep.exerciseId]);

  // Count remaining exercise steps (excluding rest steps from the count)
  const stepsRemaining = useMemo(() => {
    const exerciseSteps = steps.filter(isExerciseStep);
    const currentExIdx = exerciseSteps.findIndex(s => s.stepIndex >= currentStep.stepIndex);
    const completed = currentExIdx !== -1 ? currentExIdx : exerciseSteps.length;
    return exerciseSteps.length - completed - (isExerciseStep(currentStep) ? 1 : 0);
  }, [currentStep, steps]);

  // Start totalTime timer on mount
  useEffect(() => {
    start('totalTime');
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

  const handleNext = useCallback(() => {
    setIsFading(true);
    setTimeout(() => {
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        navigate('/builder');
      }
      setIsFading(false);
    }, 150);
  }, [currentStepIndex, steps.length, navigate]);

  const handlePrevious = () => {
    if (currentStepIndex > 0) {
      setIsFading(true);
      setTimeout(() => {
        setCurrentStepIndex(prev => prev - 1);
        setIsFading(false);
      }, 150);
    }
  };

  const handleToggleAutoNext = () => {
    setLocalAutoNext(!localAutoNext);
    toastRef.current?.show(2000);
  };

  // Handle target time reached: play sound and auto-next
  useEffect(() => {
    // When step changes, skip this check cycle. Timer values are stale
    // (reset/start are batched setState calls not yet committed).
    // The next timer tick will re-trigger this effect with fresh values.
    if (prevStepForTimerCheckRef.current !== currentStepIndex) {
      prevStepForTimerCheckRef.current = currentStepIndex;
      hasTriggeredTargetRef.current = false;
      return;
    }

    // Don't trigger if already done for this step
    if (hasTriggeredTargetRef.current) return;

    let targetReached = false;
    let targetTime: number | undefined;

    // Check if target time is reached for rest steps
    if (isRestStep(currentStep)) {
      const restTime = timers['rest']?.elapsed || 0;
      targetTime = currentStep.restTime;
      if (restTime >= targetTime) {
        targetReached = true;
      }
    }
    // Check if target time is reached for exercise time steps
    else if (isExerciseStep(currentStep) && currentStep.trackingType === 'time') {
      const exerciseTime = timers['exercise']?.elapsed || 0;
      targetTime = currentStep.targetTime;
      if (targetTime && exerciseTime >= targetTime) {
        targetReached = true;
      }
    }

    if (targetReached && targetTime) {
      hasTriggeredTargetRef.current = true;

      // Play sound if enabled
      if (settings.timerSoundEnabled) {
        playTimerSound(settings.timerSoundId, settings.customTimerSound);
      }

      // Auto-next if enabled (using local state)
      if (localAutoNext) {
        // Small delay to let sound play
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    }
  }, [
    currentStepIndex,
    currentStep, 
    timers, 
    localAutoNext, 
    settings.timerSoundEnabled, 
    settings.timerSoundId, 
    settings.customTimerSound,
    playTimerSound,
    handleNext,
  ]);

  const isLastStep = currentStepIndex === steps.length - 1;
  const isFirstStep = currentStepIndex === 0;

  return (
    <div className="flex flex-col h-screen bg-background text-text-main">
      {/* Auto-Next Toast */}
      <Toast ref={toastRef} position="bottom">
        <span className="text-sm font-medium">
          {localAutoNext ? t('activeWorkout.autoNextEnabled') : t('activeWorkout.autoNextDisabled')}
        </span>
      </Toast>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 pt-safe-top">
        <button onClick={() => navigate(-1)} className="text-text-muted">
          <Icon name="close" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-sm">{routine.name}</h2>
          <span className="text-xs font-mono text-primary">{formatTimeMMSS(timers['totalTime']?.elapsed)}</span>
        </div>
        <button onClick={() => setShowMedia(true)} className={cn("text-text-muted", !currentExercise?.media.length && "opacity-20")}>
          <Icon name="movie" />
        </button>
      </div>

      {/* Progress */}
      <div className={cn(
        "px-6 mb-6 transition-opacity duration-150"
      )}>
        <Stepper
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          leftLabel={
            isExerciseStep(currentStep) && progress.set && progress.exercise
              ? t('activeWorkout.seriesSetExerciseProgress', { 
                  seriesCurrent: progress.series.current, 
                  seriesTotal: progress.series.total,
                  setCurrent: progress.set.current, 
                  setTotal: progress.set.total,
                  exerciseCurrent: progress.exercise.current,
                  exerciseTotal: progress.exercise.total
                })
              : isRestStep(currentStep)
                ? currentStep.type === 'serie_rest'
                  ? t('activeWorkout.seriesRest')
                  : currentStep.type === 'exercise_rest'
                    ? t('activeWorkout.exerciseRest')
                    : t('activeWorkout.setRest')
                : ''
          }
          rightLabel={t('activeWorkout.stepsRemaining', { count: stepsRemaining })}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative overflow-hidden">
        {/* Exercise Info */}
        { !isRestStep(currentStep) &&         
        <div className={cn(
          "text-center z-10 transition-opacity duration-150",
          isFading ? "opacity-0" : "opacity-100"
        )}>
          <h1 className="text-3xl font-bold mb-2 leading-tight">{currentExercise?.title || t('activeWorkout.unknownExercise')}</h1>
          {isExerciseStep(currentStep) && currentStep.isSuperset && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full animate-pulse">
              {t('activeWorkout.supersetFlow')}
            </span>
          )}
        </div>}

        {/* Step Content */}
        <div className={cn(
          "transition-opacity duration-150",
          isFading ? "opacity-0" : "opacity-100"
        )}>
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
          <button
            onClick={handleToggleAutoNext}
            className={cn(
              "h-14 w-14 rounded-2xl flex items-center justify-center transition-colors",
              localAutoNext
                ? "bg-primary/20 text-primary"
                : "bg-surface-highlight text-text-muted"
            )}
            aria-label={localAutoNext ? t('activeWorkout.autoNextEnabled') : t('activeWorkout.autoNextDisabled')}
          >
            <Icon name="bolt" size={24} />
          </button>
        </div>
      </div>

      {/* Media Modal */}
      <Modal
        isOpen={showMedia && !!currentExercise}
        onClose={() => setShowMedia(false)}
        variant="centered"
        showCloseButton={true}
        className="bg-black rounded-2xl max-w-md aspect-square overflow-hidden p-0"
      >
        {currentExercise && currentExercise.media.length > 0 ? (
          (() => {
            const m = currentExercise.media[0];
            if (m.type === 'image') return <img src={m.url} className="w-full h-full object-contain" alt={currentExercise.title} />;
            if (m.type === 'video') return <video src={m.url} controls className="w-full h-full object-contain" />;
            if (m.type === 'youtube') return <iframe src={`https://www.youtube.com/embed/${m.url}`} className="w-full h-full" allowFullScreen title={currentExercise.title} />;
            return null;
          })()
        ) : (
          <div className="w-full h-full flex items-center justify-center text-text-muted">{t('activeWorkout.noMedia')}</div>
        )}
      </Modal>
    </div>
  );
}
