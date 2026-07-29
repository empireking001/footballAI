'use client';

import { use, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { Loader2 } from 'lucide-react';
import { AdminPageHeader } from '@/components/admin/AdminPageHeader';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminGet, adminUpdate } from '@/lib/api/admin';
import { Match, MatchStatus } from '@/types/api';

const STATUS_OPTIONS: MatchStatus[] = [
  'scheduled',
  'live',
  'halftime',
  'finished',
  'postponed',
  'cancelled',
  'suspended',
];

interface FormValues {
  status: MatchStatus;
  venue: string;
  referee: string;
  isFeatured: boolean;
  homeFullTime: number | '';
  awayFullTime: number | '';
}

export default function EditMatchPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['admin', 'matches', id],
    queryFn: () => adminGet<Match & { venue?: string; referee?: string; isFeatured?: boolean }>('matches', id),
  });

  const { register, handleSubmit, reset, formState: { isSubmitting } } = useForm<FormValues>({
    values: data
      ? {
          status: data.status,
          venue: data.venue ?? '',
          referee: data.referee ?? '',
          isFeatured: data.isFeatured ?? false,
          homeFullTime: data.score.homeFullTime ?? '',
          awayFullTime: data.score.awayFullTime ?? '',
        }
      : undefined,
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await adminUpdate('matches', id, {
        status: values.status,
        venue: values.venue || undefined,
        referee: values.referee || undefined,
        isFeatured: values.isFeatured,
        score: {
          homeFullTime: values.homeFullTime === '' ? undefined : Number(values.homeFullTime),
          awayFullTime: values.awayFullTime === '' ? undefined : Number(values.awayFullTime),
        },
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setServerError('Something went wrong saving this match.');
    }
  }

  if (isLoading || !data) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted" />
      </div>
    );
  }

  return (
    <div>
      <AdminPageHeader title={`${data.homeTeam.name} vs ${data.awayTeam.name}`} />

      <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="status" className="text-sm font-medium text-foreground">
            Status
          </label>
          <select
            id="status"
            {...register('status')}
            className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input label={`${data.homeTeam.name} goals`} type="number" {...register('homeFullTime')} />
          <Input label={`${data.awayTeam.name} goals`} type="number" {...register('awayFullTime')} />
        </div>

        <Input label="Venue" {...register('venue')} />
        <Input label="Referee" {...register('referee')} />

        <label className="flex items-center gap-2 text-sm text-foreground">
          <input type="checkbox" {...register('isFeatured')} className="h-4 w-4 rounded border-border" />
          Featured match
        </label>

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <div className="flex items-center gap-3">
          <Button type="submit" disabled={isSubmitting} className="w-fit">
            {isSubmitting ? 'Saving…' : 'Save changes'}
          </Button>
          {saved && <span className="text-sm text-live">Saved</span>}
        </div>
      </form>
    </div>
  );
}
