import { ReactNode } from 'react';
import { cn } from './Icon';

interface StepperProps {
  currentStep: number;
  totalSteps: number;
  leftLabel?: ReactNode;
  rightLabel?: ReactNode;
  className?: string;
}

export function Stepper({ 
  currentStep, 
  totalSteps, 
  leftLabel, 
  rightLabel, 
  className 
}: StepperProps) {
  const progress = Math.min(100, Math.max(0, (currentStep / totalSteps) * 100));

  return (
    <div className={cn("w-full", className)}>
      <div className="h-1 w-full bg-gray-200 dark:bg-surface-highlight rounded-full overflow-hidden">
        <div 
          className="h-full bg-primary transition-all duration-500" 
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <div className="flex justify-between mt-1 text-xs text-gray-400">
         <span>{leftLabel}</span>
         <span>{rightLabel}</span>
      </div>
    </div>
  );
}
