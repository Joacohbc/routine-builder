import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';
import { Icon } from '@/components/ui/Icon';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: 'centered' | 'bottom-sheet' | 'fullscreen';
  className?: string;
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  children,
  variant = 'centered',
  className,
  showCloseButton = false,
}: ModalProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Container */}
      <div
        className={cn(
          'relative w-full h-full pointer-events-none flex',
          variant === 'centered' && 'items-center justify-center p-4',
          variant === 'bottom-sheet' && 'items-end justify-center sm:items-center p-0 sm:p-4',
          variant === 'fullscreen' && 'items-stretch justify-stretch'
        )}
      >
        {/* Content */}
        <div
          ref={contentRef}
          className={cn(
            'bg-surface shadow-2xl pointer-events-auto flex flex-col transition-all',
            variant === 'centered' && 'w-full max-w-lg rounded-3xl max-h-[90vh]',
            variant === 'bottom-sheet' &&
              'w-full max-w-lg rounded-t-3xl sm:rounded-3xl max-h-[90vh]',
            variant === 'fullscreen' && 'w-full h-full',
            className
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {showCloseButton && (
            <button
              onClick={onClose}
              className="absolute top-4 right-4 p-2 text-text-muted hover:text-text-secondary z-10"
              aria-label="Close modal"
            >
              <Icon name="close" size={24} />
            </button>
          )}
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
