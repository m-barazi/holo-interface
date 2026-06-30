import { setRequestLocale } from 'next-intl/server';
import { DashboardView } from '@/components/pages/DashboardView';

export default async function DashboardPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <DashboardView />;
}