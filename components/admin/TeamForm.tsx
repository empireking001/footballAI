'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminUpdate } from '@/lib/api/admin';
import { Team } from '@/types/api';

const schema = z.object({
  name: z.string().trim().min(1),
  shortName: z.string().trim().max(20).optional(),
  country: z.string().trim().min(2),
  logoUrl: z.string().url().optional().or(z.literal('')),
  venueName: z.string().trim().optional(),
  venueCity: z.string().trim().optional(),
  founded: z.coerce.number().int().min(1850).max(2100).optional().or(z.literal('')),
  isActive: z.boolean(),
});
type FormValues = z.infer<typeof schema>;

export function TeamForm({ team }: { team: Team & { shortName?: string; venueCity?: string; founded?: number; isActive: boolean } }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: team.name,
      shortName: team.shortName ?? '',
      country: team.country,
      logoUrl: team.logoUrl ?? '',
      venueName: team.venueName ?? '',
      venueCity: team.venueCity ?? '',
      founded: team.founded,
      isActive: team.isActive,
    },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await adminUpdate('teams', team._id, {
        ...values,
        logoUrl: values.logoUrl || undefined,
        founded: values.founded === '' ? undefined : values.founded,
      });
      router.push('/admin/teams');
      router.refresh();
    } catch {
      setServerError('Something went wrong saving this team.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <Input label="Name" error={errors.name?.message} {...register('name')} />
      <Input label="Short name" {...register('shortName')} />
      <Input label="Country" error={errors.country?.message} {...register('country')} />
      <Input label="Logo URL" error={errors.logoUrl?.message} {...register('logoUrl')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Venue name" {...register('venueName')} />
        <Input label="Venue city" {...register('venueCity')} />
      </div>
      <Input label="Founded (year)" type="number" {...register('founded')} />
      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-border" />
        Active (visible on the public site)
      </label>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Saving…' : 'Save changes'}
      </Button>
    </form>
  );
}
