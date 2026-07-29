'use client';

import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { apiClient } from '@/lib/api/client';

export function SyncLeaguesDialog() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState('England');
  const [season, setSeason] = useState(new Date().getFullYear());
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle');
  const queryClient = useQueryClient();

  async function handleSync() {
    setStatus('loading');
    try {
      await apiClient.post('/admin/leagues/sync', { country, season });
      setStatus('done');
      queryClient.invalidateQueries({ queryKey: ['admin', 'leagues'] });
    } catch {
      setStatus('error');
    }
  }

  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        <RefreshCw className="h-4 w-4" /> Sync from API-Football
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-border bg-surface p-4 sm:flex-row sm:items-end">
      <Input label="Country" value={country} onChange={(e) => setCountry(e.target.value)} />
      <Input
        label="Season"
        type="number"
        value={season}
        onChange={(e) => setSeason(Number(e.target.value))}
      />
      <div className="flex gap-2">
        <Button onClick={handleSync} disabled={status === 'loading'}>
          {status === 'loading' ? 'Syncing…' : 'Sync'}
        </Button>
        <Button variant="ghost" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {status === 'done' && <span className="text-sm text-live">Synced.</span>}
      {status === 'error' && <span className="text-sm text-danger">Sync failed.</span>}
    </div>
  );
}
