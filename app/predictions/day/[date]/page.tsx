import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Container } from '@/components/ui/Container';
import { PredictionsPageHeader } from '@/components/predictions/PageHeader';
import { DateNav, FixtureFeed } from '@/components/predictions/FixtureFeed';
import { fetchApi, getSiteName } from '@/lib/api/server';
import { FixtureFeedItem } from '@/types/api';

function isDateKey(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00.000Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function displayDate(value: string): string {
  return new Date(`${value}T12:00:00.000Z`).toLocaleDateString('en-NG', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    timeZone: 'Africa/Lagos',
  });
}

export async function generateMetadata({ params }: { params: Promise<{ date: string }> }): Promise<Metadata> {
  const { date } = await params;
  const label = isDateKey(date) ? displayDate(date) : 'Daily fixtures';
  const siteName = await getSiteName();
  return {
    title: `${label} | ${siteName} fixtures`,
    description: `All covered football fixtures scheduled for ${label}, with manual prediction availability shown separately.`,
  };
}

export default async function DailyFixturesPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  if (!isDateKey(date)) notFound();
  const label = displayDate(date);
  const { data, error } = await fetchApi<FixtureFeedItem[]>(`/predictions/feed?from=${date}T00:00:00.000Z&to=${date}T23:59:59.999Z&limit=100`, { cache: 'no-store' });

  return (
    <>
      <PredictionsPageHeader eyebrow="Match centre" title={label} subtitle="Every covered fixture scheduled for this day is listed. Manual picks appear only on the matches selected by the administrator." />
      <Container className="py-10 sm:py-12">
        <DateNav activeDate={date} />
        {error ? <div className="mb-6 rounded-lg border border-danger/30 bg-danger/5 p-4 text-sm text-danger">The match feed is temporarily unavailable. Please refresh in a moment.</div> : null}
        <FixtureFeed items={data ?? []} emptyMessage="No covered fixtures are scheduled for this date." />
      </Container>
    </>
  );
}
