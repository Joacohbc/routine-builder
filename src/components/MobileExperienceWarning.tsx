import { Icon } from '@/components/ui/Icon';
import { useTranslation } from 'react-i18next';

export function MobileExperienceWarning() {
  const { t } = useTranslation();

  return (
    <div className="fixed inset-0 z-100 bg-background hidden lg:flex flex-col items-center justify-center p-8 text-center">
      <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6">
        <Icon name="smartphone" size={40} className="text-primary" />
      </div>
      <h1 className="text-2xl font-bold mb-4">{t('mobileWarning.title')}</h1>
      <p className="text-text-secondary max-w-sm text-lg">
        {t('mobileWarning.description')}
      </p>
    </div>
  );
}
