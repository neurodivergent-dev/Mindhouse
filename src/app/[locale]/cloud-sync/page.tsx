'use client';

import { CloudSyncManager } from '@/components/cloud-sync-manager';
import { useTranslations } from 'next-intl';

export default function CloudSyncPage() {
  const t = useTranslations('CloudSync');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black mb-4 tracking-tight">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              🔄 {t('pageTitle')}
            </span>
          </h1>
          <p className="text-lg text-muted-foreground">
            {t('pageDescription')}
          </p>
        </div>

        <CloudSyncManager />
      </div>
    </div>
  );
}
