import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { League } from '@/types/api';

export function LeagueCard({ league }: { league: League }) {
  return (
    <Link href={`/leagues/${league.slug}`}>
      <Card className="flex h-full flex-col items-center gap-3 p-6 text-center transition-colors hover:border-primary/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
          {league.logoUrl ? (
            <Image src={league.logoUrl} alt={league.name} width={36} height={36} className="object-contain" />
          ) : (
            <span className="font-display text-lg text-muted">{league.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{league.name}</div>
          <div className="mt-0.5 text-xs text-muted">{league.country}</div>
        </div>
      </Card>
    </Link>
  );
}
