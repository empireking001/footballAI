'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminCreate, adminUpdate } from '@/lib/api/admin';
import { League } from '@/types/api';

const schema = z.object({
  name: z.string().trim().min(2),
  slug: z.string().trim().min(2),
  country: z.string().trim().min(2),
  logoUrl: z.string().url().optional().or(z.literal('')),
  externalId: z.coerce.number().int().positive(),
  season: z.coerce.number().int().min(2000).max(2100),
  type: z.enum(['league', 'cup']),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function LeagueForm({ league }: { league?: League }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: league
      ? {
          name: league.name,
          slug: league.slug,
          country: league.country,
          logoUrl: league.logoUrl ?? '',
          externalId: league.externalId ?? 0,
          season: league.season,
          type: league.type,
          isActive: league.isActive ?? true,
        }
      : { type: 'league', isActive: true },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const body = { ...values, logoUrl: values.logoUrl || undefined };
      if (league) {
        await adminUpdate('leagues', league._id, body);
      } else {
        await adminCreate('leagues', body);
      }
      router.push('/admin/leagues');
      router.refresh();
    } catch {
      setServerError('Something went wrong saving this league.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input label="Slug" error={errors.slug?.message} {...register('slug')} />
      <Input label="Country" error={errors.country?.message} {...register('country')} />
      <Input label="Logo URL" error={errors.logoUrl?.message} {...register('logoUrl')} />
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="API-Football ID"
          type="number"
          error={errors.externalId?.message}
          {...register('externalId')}
        />
        <Input label="Season" type="number" error={errors.season?.message} {...register('season')} />
      </div>
      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className="text-sm font-medium text-foreground">
          Type
        </label>
        <select
          id="type"
          {...register('type')}
          className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"
        >
          <option value="league">League</option>
          <option value="cup">Cup</option>
        </select>
      </div>
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-border" />
        Active (visible on the public site)
      </label>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Saving…' : league ? 'Save changes' : 'Create league'}
      </Button>
    </form>
  );
}
