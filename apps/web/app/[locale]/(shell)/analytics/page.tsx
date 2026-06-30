import { setRequestLocale } from 'next-intl/server';
import { getTranslations } from 'next-intl/server';
import { PlaceholderView } from '@/components/pages/PlaceholderView';

export default async function AnalyticsPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = await getTranslations('nav');
  return <PlaceholderView title={t('analytics')} />;
}