import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useExercises } from '@/hooks/useExercises';
import { useMultiTimer } from '@/hooks/useTimers';
import { Button } from '@/components/ui/Button';
import { Stepper } from '@/components/ui/Stepper';
import { Icon } from '@/components/ui/Icon';
import { RestingStep } from '@/components/routine/RestingStep';
import { WorkoutSetDisplay } from '@/components/routine/WorkoutSetDisplay';
import { cn } from '@/lib/utils';
import type { Routine } from '@/types';
import type { WorkoutStep } from '@/pages/WorkoutPageContainer';

interface ActiveWorkoutPageProps {
  routine: Routine;
  steps: WorkoutStep[];
}

export default function ActiveWorkoutPage({ routine, steps }: ActiveWorkoutPageProps) {
  const navigate = useNavigate();
  const { exercises } = useExercises();
  const { timers, start, pause, reset } = useMultiTimer();

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [showMedia, setShowMedia] = useState(false);

  // Start global timer on mount
  useEffect(() => {
    start('global');
  }, [start]);

  // Manage rest timer
  useEffect(() => {
    if (isResting) {
      start('rest');
    } else {
      reset('rest');
    }
  }, [isResting, start, reset]);

  // Manage exercise timer for time-tracking exercises
  useEffect(() => {
    if (!isResting && steps[currentStepIndex]?.trackingType === 'time') {
      start('exercise');
    } else {
      pause('exercise');
    }
  }, [isResting, currentStepIndex, steps, start, pause]);

  // Reset exercise timer when changing steps
  useEffect(() => {
    if (steps[currentStepIndex]) {
      reset('exercise');
    }
  }, [currentStepIndex, steps, reset]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (isResting) {
      setIsResting(false);
      if (currentStepIndex < steps.length - 1) {
        setCurrentStepIndex(prev => prev + 1);
      } else {
        // Finish
        navigate('/builder');
      }
    } else {
      // Finished set
      const currentStep = steps[currentStepIndex];
      const nextStep = steps[currentStepIndex + 1];

      let shouldRest = true;
      if (currentStep.isSuperset) {
        if (nextStep && nextStep.seriesId === currentStep.seriesId && nextStep.exerciseId !== currentStep.exerciseId) {
          shouldRest = false;
        }
      }

      if (!nextStep) shouldRest = false; // Finished workout

      if (shouldRest && nextStep) {
        setIsResting(true);
      } else {
        if (currentStepIndex < steps.length - 1) {
          setCurrentStepIndex(prev => prev + 1);
        } else {
          // Finish
          navigate('/builder');
        }
      }
    }
  };

  const currentStep = steps[currentStepIndex];
  const currentExercise = exercises.find(e => e.id === currentStep.exerciseId);

  return (
    <div className="flex flex-col h-screen bg-background text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 pt-safe-top">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <Icon name="close" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-sm">{routine.name}</h2>
          <span className="text-xs font-mono text-primary">{formatTime(timers['global']?.elapsed || 0)}</span>
        </div>
        <button onClick={() => setShowMedia(true)} className={cn("text-gray-500", !currentExercise?.media.length && "opacity-20")}>
          <Icon name="movie" />
        </button>
      </div>

      {/* Progress */}
      <div className="px-6 mb-6">
        <Stepper
          currentStep={currentStepIndex + 1}
          totalSteps={steps.length}
          leftLabel={`Set ${currentStep.setIndex + 1} of ${currentStep.totalSets}`}
          rightLabel={`${(steps.length - currentStepIndex - 1)} remaining`}
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8 relative overflow-hidden">
        {/* Exercise Info */}
        <div className="text-center z-10">
          <h1 className="text-3xl font-bold mb-2 leading-tight">{currentExercise?.title || 'Unknown Exercise'}</h1>
          {currentStep.isSuperset && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full animate-pulse">
              SUPERSET FLOW
            </span>
          )}
        </div>

        {/* Inputs */}
        {isResting ? (
          <RestingStep restTimer={timers['rest']?.elapsed || 0} onSkip={handleNext} />
        ) : (
          <WorkoutSetDisplay
            targetWeight={currentStep.targetWeight}
            targetReps={currentStep.targetReps}
            time={timers['exercise']?.elapsed || 0}
            targetTime={currentStep.targetTime}
            trackingType={currentStep.trackingType}
          />
        )}
      </div>

      {/* Footer Action */}
      <div className="p-6 pb-safe-bottom">
        {!isResting && (
          <Button onClick={handleNext} className="w-full h-14 text-lg">
            {currentStepIndex === steps.length - 1 ? 'Finish Workout' : 'Next Set'}
          </Button>
        )}
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
              <div className="w-full h-full flex items-center justify-center text-gray-500">No Media</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
