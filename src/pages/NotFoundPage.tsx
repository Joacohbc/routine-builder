import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout } from '@/components/ui/Layout';
import { Button } from '@/components/ui/Button';
import { Icon } from '@/components/ui/Icon';

export default function NotFoundPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  return (
    <Layout title={t('notFound.title')} showBackButton={false}>
      <div className="flex flex-col items-center justify-center min-h-[50vh] px-4 text-center">
        <Icon name="error" className="text-text-muted mx-auto mb-4 text-[4rem]" />
        <h2 className="text-2xl font-bold text-text-main mb-2">
          {t('notFound.title')}
        </h2>
        <p className="text-text-secondary mb-6 max-w-md">
          {t('notFound.description')}
        </p>
        <Button
          onClick={() => navigate('/')}
          variant="primary"
          className="w-full max-w-md"
        >
          <Icon name="home" className="mr-2" />
          {t('notFound.goHome')}
        </Button>
      </div>
    </Layout>
  );
}
