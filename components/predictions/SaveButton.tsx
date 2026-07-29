'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/authStore';
import { toggleSavedPrediction } from '@/lib/api/user';

/**
 * Optimistic bookmark toggle. There's no cheap way to know a card's saved
 * state without fetching the user's full saved list, so this starts
 * "unsaved" visually and flips locally on click — the dashboard's Saved
 * page remains the source of truth for what's actually saved.
 */
export function SaveButton({ predictionId }: { predictionId: string }) {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleClick(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      router.push('/login');
      return;
    }

    setPending(true);
    setSaved((prev) => !prev); // optimistic
    try {
      const result = await toggleSavedPrediction(predictionId);
      setSaved(result);
    } catch {
      setSaved((prev) => !prev); // revert on failure
    } finally {
      setPending(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      aria-label={saved ? 'Remove from saved' : 'Save prediction'}
      aria-pressed={saved}
      className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-elevated/80 backdrop-blur transition-colors hover:bg-surface-elevated"
    >
      <Bookmark className={cn('h-4 w-4 transition-colors', saved ? 'fill-primary text-primary' : 'text-muted')} />
    </button>
  );
}
