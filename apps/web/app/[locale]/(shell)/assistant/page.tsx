import { setRequestLocale } from 'next-intl/server';
import { AssistantView } from '@/components/assistant/AssistantView';

export default async function AssistantPage({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  return <AssistantView />;
}