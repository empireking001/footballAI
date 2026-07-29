'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { toggleFavoriteTeam, toggleFavoriteLeague } from '@/lib/api/user';

export function FavoriteButton({ id, type }: { id: string; type: 'team' | 'league' }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [favorited, setFavorited] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleClick() {
    if (!user) {
      router.push('/login');
      return;
    }
    setPending(true);
    try {
      const result = type === 'team' ? await toggleFavoriteTeam(id) : await toggleFavoriteLeague(id);
      setFavorited(result);
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-pressed={favorited}
      className="flex items-center gap-2 rounded-md border border-border bg-surface-elevated px-3 py-2 text-sm font-medium text-foreground transition-colors hover:bg-surface-elevated/70"
    >
      {pending ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={cn('h-4 w-4', favorited ? 'fill-danger text-danger' : 'text-muted')} />
      )}
      {favorited ? 'Favorited' : 'Add to favorites'}
    </button>
  );
}
