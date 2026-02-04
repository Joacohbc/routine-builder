import { useTranslation } from 'react-i18next';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';

interface ConfirmationDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
}

export function ConfirmationDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText,
  cancelText,
  variant = 'primary'
}: ConfirmationDialogProps) {
  const { t } = useTranslation();

  const effectiveConfirmText = confirmText || t('common.confirm');
  const effectiveCancelText = cancelText || t('common.cancel');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      variant="centered"
      className="w-full max-w-sm rounded-3xl p-6"
    >
      <div className="flex flex-col gap-2 mb-6">
        <h2 className="text-xl font-bold">{title}</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">{description}</p>
      </div>

      <div className="flex gap-3 justify-end">
        <Button
          variant="ghost"
          onClick={onClose}
        >
          {effectiveCancelText}
        </Button>
        <Button
          variant="primary"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          className={variant === 'danger' ? 'bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white' : ''}
        >
          {effectiveConfirmText}
        </Button>
      </div>
    </Modal>
  );
}
