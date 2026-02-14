import { forwardRef, useImperativeHandle, useState, useRef } from 'react';
import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface ToastProps {
  children: ReactNode;
  position?: 'top' | 'bottom';
  className?: string;
}

export interface ToastRef {
  show: (duration?: number) => void;
  hide: () => void;
}

export const Toast = forwardRef<ToastRef, ToastProps>(
  ({ children, position = 'bottom', className }, ref) => {
    const [isVisible, setIsVisible] = useState(false);
    const timeoutRef = useRef<number | null>(null);

    useImperativeHandle(ref, () => ({
      show: (duration = 2000) => {
        // Clear any existing timeout to prevent premature hiding
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }

        setIsVisible(true);

        // Set new timeout for auto-hide
        timeoutRef.current = window.setTimeout(() => {
          setIsVisible(false);
          timeoutRef.current = null;
        }, duration);
      },
      hide: () => {
        // Clear any pending timeout
        if (timeoutRef.current !== null) {
          clearTimeout(timeoutRef.current);
          timeoutRef.current = null;
        }
        setIsVisible(false);
      },
    }));

    if (!isVisible) return null;

    return (
      <div
        className={cn(
          'fixed left-1/2 -translate-x-1/2 z-50 pointer-events-none',
          position === 'top' ? 'top-20' : 'bottom-28',
          'animate-in fade-in duration-300',
          position === 'top' ? 'slide-in-from-top-5' : 'slide-in-from-bottom-5'
        )}
      >
        <div
          className={cn(
            'px-4 py-2 bg-surface border border-border rounded-full shadow-lg',
            className
          )}
        >
          {children}
        </div>
      </div>
    );
  }
);
