import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useExercises } from '@/hooks/useExercises';
import { useMultiTimer } from '@/hooks/useTimers';
import { useSettings } from '@/hooks/useSettings';
import { useAudio } from '@/hooks/useAudio';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Icon } from '@/components/ui/Icon';
import { Modal } from '@/components/ui/Modal';
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
  
  // Utilities
  const navigate = useNavigate();
  const { timers, start, pause, reset } = useMultiTimer();
  const { playTimerSound } = useAudio();
  const { t } = useTranslation();
  
  // Data
  const { exercises } = useExercises();
  const { settings } = useSettings();

  // State for logical step tracking and UI
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [showMedia, setShowMedia] = useState(false);
  const [isFading, setIsFading] = useState(false);
  
  // Track if we've already triggered sound/auto-next for current step
  const hasTriggeredTargetRef = useRef(false);

  const currentStep = steps[currentStepIndex];

  // Find the actual Exercise from DB
  const currentExercise = useMemo(() => {
    return exercises.find(e => e.id === Number(currentStep.exerciseId));
  }, [exercises, currentStep.exerciseId]);

  // Calculate series progress (which series we're on out of total)
  const seriesProgress = useMemo(() => {
    // Get all unique series IDs in order of appearance
    const uniqueSeriesIds: string[] = [];
    steps.forEach(step => {
      if (!uniqueSeriesIds.includes(step.seriesId)) {
        uniqueSeriesIds.push(step.seriesId);
      }
    });
    const currentSeriesIndex = uniqueSeriesIds.indexOf(currentStep.seriesId);
    return {
      current: currentSeriesIndex + 1,
      total: uniqueSeriesIds.length
    };
  }, [currentStep.seriesId, steps]);

  // For exercise steps:
  // Obtain the count of sets for the current exercise and which set we're on (for display "Set 2 of 4" etc)
  const setProgress = useMemo(() => {
    if (!isExerciseStep(currentStep)) return null;
    const sameExerciseSteps = steps.filter(
      (s): s is ExerciseStep =>
        isExerciseStep(s) &&
        
        // Same exercise
        s.exerciseId === currentStep.exerciseId && 
        // Same series
        s.seriesId === currentStep.seriesId && 

        // Same exercise index inside the exercise (to differentiate if the same exercise is repeated in the same series)
        s.setIndexInsideExercise === currentStep.setIndexInsideExercise 
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
    
    // Reset the trigger flag when step changes
    hasTriggeredTargetRef.current = false;
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
      }, 350);
    }
  };

  // Handle target time reached: play sound and auto-next
  useEffect(() => {
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

      // Auto-next if enabled
      if (settings.autoNext) {
        // Small delay to let sound play
        setTimeout(() => {
          handleNext();
        }, 500);
      }
    }
  }, [
    currentStep, 
    timers, 
    settings.autoNext, 
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
            isExerciseStep(currentStep) && setProgress
              ? t('activeWorkout.seriesAndSetProgress', { 
                  seriesCurrent: seriesProgress.current, 
                  seriesTotal: seriesProgress.total,
                  setCurrent: setProgress.current, 
                  setTotal: setProgress.total 
                })
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
