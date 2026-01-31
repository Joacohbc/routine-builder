import { Layout } from '../components/ui/Layout';
import { Icon } from '../components/ui/Icon';

export default function WorkInProgressPage() {
  return (
    <Layout
      header={
        <div className="flex items-center justify-between px-6 pb-4 pt-12">
            <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white">Settings</h1>
        </div>
      }
    >
      <div className="flex flex-col items-center justify-center h-[60vh] text-center p-6 gap-6">
        <div className="p-6 rounded-full bg-gray-100 dark:bg-surface-highlight text-primary">
            <Icon name="construction" size={64} />
        </div>
        <div className="space-y-2">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Work In Progress</h2>
            <p className="text-gray-500 dark:text-gray-400 max-w-xs mx-auto">
                This feature is currently being developed. Check back soon for updates!
            </p>
        </div>
      </div>
    </Layout>
  );
}
