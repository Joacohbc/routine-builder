import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useRoutines } from '../hooks/useRoutines';
import { useExercises } from '../hooks/useExercises';
import { Layout } from '../components/ui/Layout';
import { Button } from '../components/ui/Button';
import { TimerInput } from '../components/ui/TimerInput';
import { Stepper } from '../components/ui/Stepper';
import { Icon } from '../components/ui/Icon';
import { cn } from '../lib/utils';
import type { Routine, WorkoutSet } from '../types';

interface WorkoutStep {
  seriesId: string;
  exerciseId: number;
  setId: string;
  setIndex: number;
  totalSets: number;
  targetWeight: number;
  targetReps: number;
  targetTime: number;
  trackingType: 'reps' | 'time';
  type: WorkoutSet['type'];
  isSuperset: boolean;
}

export default function ActiveWorkoutPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { routines } = useRoutines();
  const { exercises } = useExercises();

  const [routine, setRoutine] = useState<Routine | null>(null);
  const [steps, setSteps] = useState<WorkoutStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isResting, setIsResting] = useState(false);
  const [restTimer, setRestTimer] = useState(0);
  const [showMedia, setShowMedia] = useState(false);

  // Inputs for the current set
  const [actualWeight, setActualWeight] = useState<number>(0);
  const [actualReps, setActualReps] = useState<number>(0);
  const [actualTime, setActualTime] = useState<number>(0);


  useEffect(() => {
    if (id && routines.length > 0) {
      const r = routines.find(r => r.id === Number(id));
      if (r) {
        setRoutine(r);
        // Flatten routine into steps
        const flatSteps: WorkoutStep[] = [];
        r.series.forEach(series => {
          if (series.type === 'standard') {
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
                  isSuperset: false
                });
              });
            });
          } else {
            const maxSets = Math.max(...series.exercises.map(e => e.sets.length));
            for (let i = 0; i < maxSets; i++) {
              series.exercises.forEach(ex => {
                if (ex.sets[i]) {
                  flatSteps.push({
                    seriesId: series.id,
                    exerciseId: ex.exerciseId,
                    setId: ex.sets[i].id,
                    setIndex: i,
                    totalSets: ex.sets.length,
                    targetWeight: ex.sets[i].weight || 0,
                    targetReps: ex.sets[i].reps || 0,
                    targetTime: ex.sets[i].time || 0,
                    trackingType: ex.trackingType || 'reps',
                    type: ex.sets[i].type,
                    isSuperset: true
                  });
                }
              });
            }
          }
        });
        setSteps(flatSteps);
      }
    }
  }, [id, routines]);

  // Global Timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimer(t => t + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Rest Timer
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isResting) {
      interval = setInterval(() => {
        setRestTimer(t => t + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isResting]);


  useEffect(() => {
    if (steps[currentStepIndex]) {
      setActualWeight(steps[currentStepIndex].targetWeight);
      setActualReps(steps[currentStepIndex].targetReps);
      setActualTime(0);
    }
  }, [currentStepIndex, steps]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleNext = () => {
    if (isResting) {
      setIsResting(false);
      setRestTimer(0);
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

  if (!routine || steps.length === 0) return <Layout><div className="p-6 text-center">Loading...</div></Layout>;

  const currentStep = steps[currentStepIndex];
  const currentExercise = exercises.find(e => e.id === currentStep.exerciseId);

  return (
    <div className="flex flex-col h-screen bg-background-light dark:bg-background-dark text-gray-900 dark:text-white">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 pt-safe-top">
        <button onClick={() => navigate(-1)} className="text-gray-500">
          <Icon name="close" />
        </button>
        <div className="flex flex-col items-center">
          <h2 className="font-bold text-sm">{routine.name}</h2>
          <span className="text-xs font-mono text-primary">{formatTime(timer)}</span>
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
          <p className="text-lg text-gray-500">{currentExercise?.muscleGroup}</p>
          {currentStep.isSuperset && (
            <span className="inline-block mt-2 px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full animate-pulse">
              SUPERSET FLOW
            </span>
          )}
        </div>

        {/* Inputs */}
        {isResting ? (
          <div className="flex flex-col items-center justify-center py-10 animate-fade-in">
            <span className="text-gray-400 text-sm uppercase tracking-widest font-bold mb-4">Resting</span>
            <div className="text-6xl font-mono font-bold text-primary mb-8">{formatTime(restTimer)}</div>
            <Button onClick={handleNext} variant="secondary">Skip Rest</Button>
          </div>
        ) : (
          <div className="w-full max-w-xs flex flex-col gap-6">
            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-center text-xs font-bold text-gray-400 uppercase">KG</label>
                <div className="relative">
                  <input
                    type="number"
                    value={actualWeight}
                    onChange={e => setActualWeight(Number(e.target.value))}
                    className="w-full text-center text-4xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none py-2"
                  />
                  <div className="text-xs text-center text-gray-400 mt-1">Target: {currentStep.targetWeight}</div>
                </div>
              </div>
              {currentStep.trackingType === 'time' ? (
                <TimerInput
                  value={actualTime}
                  onChange={setActualTime}
                  target={currentStep.targetTime}
                />
              ) : (
                <div className="flex flex-col gap-2">
                  <label className="text-center text-xs font-bold text-gray-400 uppercase">Reps</label>
                  <div className="relative">
                    <input
                      type="number"
                      value={actualReps}
                      onChange={e => setActualReps(Number(e.target.value))}
                      className="w-full text-center text-4xl font-bold bg-transparent border-b-2 border-gray-200 dark:border-gray-700 focus:border-primary focus:outline-none py-2"
                    />
                    <div className="text-xs text-center text-gray-400 mt-1">Target: {currentStep.targetReps}</div>
                  </div>
                </div>
              )}
            </div>
          </div>
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
