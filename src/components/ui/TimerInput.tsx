import { useState, useEffect } from 'react';
import { Button } from './Button';
import { Icon } from './Icon';

interface TimerInputProps {
  value: number;
  onChange: (value: number) => void;
  target?: number;
  label?: string;
  className?: string;
}

export function TimerInput({ 
  value, 
  onChange, 
  target, 
  label = 'Time',
  className
}: TimerInputProps) {
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRunning) {
      interval = setInterval(() => {
        onChange(value + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, value, onChange]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`flex flex-col gap-2 ${className || ''}`}>
      <label className="text-center text-xs font-bold text-gray-400 uppercase">{label}</label>
      <div className="flex flex-col items-center">
        <div 
          className="text-4xl font-bold font-mono py-2 cursor-pointer select-none" 
          onClick={() => setIsRunning(!isRunning)}
        >
          {formatTime(value)}
        </div>
        {target !== undefined && (
           <div className="text-xs text-center text-gray-400 mt-1">Target: {formatTime(target)}</div>
        )}
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2"
          onClick={() => setIsRunning(!isRunning)}
        >
          <Icon name={isRunning ? "pause" : "play_arrow"} />
        </Button>
      </div>
    </div>
  );
}
