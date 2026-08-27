import Link from 'next/link';
import Image from 'next/image';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ConfidenceBar } from '@/components/ui/ConfidenceBar';
import { Container } from '@/components/ui/Container';
import { formatKickoff } from '@/lib/utils';
import { Prediction } from '@/types/api';

function TeamCrest({ name, logoUrl }: { name: string; logoUrl?: string }) {
  return (
    <div className="flex flex-col items-center gap-3">
      <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-surface-elevated sm:h-24 sm:w-24">
        {logoUrl ? (
          <Image src={logoUrl} alt={name} width={52} height={52} className="object-contain" />
        ) : (
          <span className="font-display text-2xl text-muted">{name.slice(0, 2).toUpperCase()}</span>
        )}
      </div>
      <span className="max-w-[9rem] text-center text-sm font-semibold text-foreground">{name}</span>
    </div>
  );
}

export function Hero({ prediction }: { prediction: Prediction | null }) {
  return (
    <section className="relative overflow-hidden border-b border-border">
      {/* Ambient floodlight glow — the one deliberate atmospheric effect on the page */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[520px] w-[900px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/20 blur-[120px]"
      />

      <Container className="relative py-16 sm:py-20 lg:py-24">
        <div className="mx-auto max-w-3xl text-center">
          <span className="mb-5 inline-block rounded-full border border-border bg-surface-elevated px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">
            Manually entered · Live tracked results
          </span>
          <h1 className="font-display text-4xl font-extrabold uppercase leading-[1.05] tracking-tight text-balance sm:text-5xl lg:text-6xl">
            Predictions built on <span className="text-primary">real numbers</span>, not vibes
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-balance text-base text-muted sm:text-lg">
            Every pick is entered by our administrator team and presented with clear markets, supporting context, and transparent results.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" asChild>
              <Link href="/predictions/today">
                See today&apos;s picks <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/pricing">View VIP plans</Link>
            </Button>
          </div>
        </div>

        {prediction ? (
          <div className="mx-auto mt-14 max-w-2xl">
            <div className="rounded-xl border border-border bg-surface/80 p-6 shadow-card backdrop-blur sm:p-8">
              <div className="mb-6 flex items-center justify-between">
                <span className="truncate text-xs font-medium text-muted">
                  {prediction.match.league.name}
                </span>
                <Badge variant={`risk-${prediction.riskRating}`}>{prediction.riskRating} risk</Badge>
              </div>

              <div className="flex items-center justify-between gap-4">
                <TeamCrest
                  name={prediction.match.homeTeam.name}
                  logoUrl={prediction.match.homeTeam.logoUrl}
                />
                <div className="flex flex-col items-center gap-1">
                  <span className="font-mono text-xs tabular-nums text-muted">
                    {formatKickoff(prediction.match.kickoffAt)}
                  </span>
                  <span className="font-display text-2xl text-muted">VS</span>
                </div>
                <TeamCrest
                  name={prediction.match.awayTeam.name}
                  logoUrl={prediction.match.awayTeam.logoUrl}
                />
              </div>

              <ConfidenceBar
                className="mt-8"
                home={prediction.markets.find((m) => m.market === '1X2' && m.selection === 'Home')?.probability ?? 0}
                draw={prediction.markets.find((m) => m.market === '1X2' && m.selection === 'Draw')?.probability ?? 0}
                away={prediction.markets.find((m) => m.market === '1X2' && m.selection === 'Away')?.probability ?? 0}
              />

              <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
                <span className="text-sm text-muted">Confidence</span>
                <span className="font-mono text-xl font-bold tabular-nums text-primary">
                  {prediction.confidenceScore}%
                </span>
              </div>

              <Link
                href={`/matches/${prediction.match._id}`}
                className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
              >
                See the full breakdown <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        ) : (
          <div className="mx-auto mt-14 max-w-2xl rounded-xl border border-dashed border-border p-10 text-center">
            <p className="text-sm text-muted">
              No manual picks are live yet — browse the upcoming fixtures and check back as picks are entered.
            </p>
            <Button className="mt-4" variant="secondary" asChild>
              <Link href="/leagues">Browse leagues</Link>
            </Button>
          </div>
        )}
      </Container>
    </section>
  );
}
