import type { Metadata } from 'next';
import { Trophy, Users2, CalendarCheck, Sparkles } from 'lucide-react';
import { Container } from '@/components/ui/Container';
import { Card, CardContent } from '@/components/ui/Card';
import { fetchApi } from '@/lib/api/server';

interface PublicStats {
  leaguesCovered: number;
  teamsTracked: number;
  matchesAnalyzed: number;
  predictionsGenerated: number;
  accuracy: {
    totalEvaluated: number;
    winnerAccuracy: number;
    bttsAccuracy: number;
    overUnderAccuracy: number;
    correctScoreAccuracy: number;
  };
}

export const metadata: Metadata = {
  title: 'Statistics',
  description: 'Platform-wide coverage and accuracy statistics for Football AI.',
};

export default async function StatisticsPage() {
  const { data } = await fetchApi<PublicStats>('/stats', { revalidate: 1800 });

  const coverageStats = [
    { label: 'Leagues covered', value: data?.leaguesCovered, icon: Trophy },
    { label: 'Teams tracked', value: data?.teamsTracked, icon: Users2 },
    { label: 'Matches analyzed', value: data?.matchesAnalyzed, icon: CalendarCheck },
    { label: 'Predictions generated', value: data?.predictionsGenerated, icon: Sparkles },
  ];

  const accuracyStats = data
    ? [
        { label: 'Match winner', value: data.accuracy.winnerAccuracy },
        { label: 'Both teams to score', value: data.accuracy.bttsAccuracy },
        { label: 'Over/Under 2.5', value: data.accuracy.overUnderAccuracy },
        { label: 'Exact score', value: data.accuracy.correctScoreAccuracy },
      ]
    : [];

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">Statistics</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Platform Coverage &amp; Accuracy
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Real numbers, updated as fixtures and results come in.
          </p>
        </Container>
      </div>

      <Container className="py-10 sm:py-12">
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {coverageStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5 text-center">
                <stat.icon className="mx-auto h-5 w-5 text-primary" />
                <div className="mt-2 font-mono text-2xl font-bold tabular-nums text-foreground">
                  {stat.value?.toLocaleString() ?? '—'}
                </div>
                <div className="mt-1 text-xs text-muted">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        <h2 className="mb-4 mt-12 font-display text-xl font-bold uppercase tracking-tight">
          Prediction accuracy by market
        </h2>
        <p className="mb-6 text-xs text-muted">
          {data
            ? `Measured against ${data.accuracy.totalEvaluated.toLocaleString()} finished, graded matches.`
            : 'Accuracy data is still being gathered.'}
        </p>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {accuracyStats.map((stat) => (
            <Card key={stat.label}>
              <CardContent className="pt-5 text-center">
                <div className="font-mono text-2xl font-bold tabular-nums text-primary">
                  {stat.value}%
                </div>
                <div className="mt-1 text-xs text-muted">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      </Container>
    </>
  );
}
