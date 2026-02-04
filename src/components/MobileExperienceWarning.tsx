import { Icon } from '@/components/ui/Icon';

export function MobileExperienceWarning() {
  return (
    <div className="fixed inset-0 z-[100] bg-surface-light dark:bg-surface-dark hidden md:flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon name="smartphone" size={40} className="text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-4">Solo para Teléfonos</h1>
      <p className="text-gray-500 max-w-sm text-lg">
        Esta aplicación está pensada para el uso en vertical y desde teléfonos.
      </p>
    </div>
  );
}
