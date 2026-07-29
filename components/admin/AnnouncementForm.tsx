'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminCreate, adminUpdate } from '@/lib/api/admin';

interface Announcement {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'promo';
  isActive: boolean;
  startAt?: string;
  endAt?: string;
}

const schema = z.object({
  title: z.string().trim().min(1).max(150),
  message: z.string().trim().min(1).max(500),
  type: z.enum(['info', 'success', 'warning', 'promo']),
  isActive: z.boolean(),
  startAt: z.string().optional(),
  endAt: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function AnnouncementForm({ announcement }: { announcement?: Announcement }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: announcement
      ? {
          title: announcement.title,
          message: announcement.message,
          type: announcement.type,
          isActive: announcement.isActive,
          startAt: announcement.startAt?.slice(0, 10),
          endAt: announcement.endAt?.slice(0, 10),
        }
      : { type: 'info', isActive: true },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const body = {
        ...values,
        startAt: values.startAt ? new Date(values.startAt).toISOString() : undefined,
        endAt: values.endAt ? new Date(values.endAt).toISOString() : undefined,
      };
      if (announcement) {
        await adminUpdate('announcements', announcement._id, body);
      } else {
        await adminCreate('announcements', body);
      }
      router.push('/admin/announcements');
      router.refresh();
    } catch {
      setServerError('Something went wrong saving this announcement.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Input label="Message" error={errors.message?.message} {...register('message')} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="type" className="text-sm font-medium text-foreground">
          Type
        </label>
        <select
          id="type"
          {...register('type')}
          className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="promo">Promo</option>
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Input label="Starts (optional)" type="date" {...register('startAt')} />
        <Input label="Ends (optional)" type="date" {...register('endAt')} />
      </div>

      <label className="flex items-center gap-2 text-sm text-foreground">
        <input type="checkbox" {...register('isActive')} className="h-4 w-4 rounded border-border" />
        Active
      </label>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Saving…' : announcement ? 'Save changes' : 'Create announcement'}
      </Button>
    </form>
  );
}
