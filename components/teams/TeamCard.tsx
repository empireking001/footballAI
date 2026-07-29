import Link from 'next/link';
import Image from 'next/image';
import { Card } from '@/components/ui/Card';
import { Team } from '@/types/api';

export function TeamCard({ team }: { team: Team }) {
  return (
    <Link href={`/teams/${team.slug}`}>
      <Card className="flex h-full flex-col items-center gap-3 p-6 text-center transition-colors hover:border-primary/40">
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-surface-elevated">
          {team.logoUrl ? (
            <Image src={team.logoUrl} alt={team.name} width={36} height={36} className="object-contain" />
          ) : (
            <span className="font-display text-lg text-muted">{team.name.slice(0, 2).toUpperCase()}</span>
          )}
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{team.name}</div>
          <div className="mt-0.5 text-xs text-muted">{team.country}</div>
        </div>
      </Card>
    </Link>
  );
}
