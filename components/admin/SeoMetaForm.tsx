'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminCreate, adminUpdate } from '@/lib/api/admin';

interface SeoMeta {
  _id: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  ogImageUrl?: string;
  canonicalUrl?: string;
}

const schema = z.object({
  path: z.string().trim().min(1),
  title: z.string().trim().min(1).max(70),
  description: z.string().trim().min(1).max(160),
  keywords: z.string().optional(),
  ogImageUrl: z.string().url().optional().or(z.literal('')),
  canonicalUrl: z.string().url().optional().or(z.literal('')),
});
type FormValues = z.infer<typeof schema>;

export function SeoMetaForm({ seo }: { seo?: SeoMeta }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: seo
      ? {
          path: seo.path,
          title: seo.title,
          description: seo.description,
          keywords: seo.keywords.join(', '),
          ogImageUrl: seo.ogImageUrl ?? '',
          canonicalUrl: seo.canonicalUrl ?? '',
        }
      : undefined,
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const body = {
        ...values,
        keywords: values.keywords ? values.keywords.split(',').map((k) => k.trim()).filter(Boolean) : [],
        ogImageUrl: values.ogImageUrl || undefined,
        canonicalUrl: values.canonicalUrl || undefined,
      };
      if (seo) {
        await adminUpdate('seo', seo._id, body);
      } else {
        await adminCreate('seo', body);
      }
      router.push('/admin/seo');
      router.refresh();
    } catch {
      setServerError('Something went wrong saving this override.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-lg flex-col gap-4">
      <Input label="Path (e.g. /leagues/premier-league)" error={errors.path?.message} {...register('path')} />
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Input label="Description" error={errors.description?.message} {...register('description')} />
      <Input label="Keywords (comma-separated)" {...register('keywords')} />
      <Input label="OG image URL" error={errors.ogImageUrl?.message} {...register('ogImageUrl')} />
      <Input label="Canonical URL" error={errors.canonicalUrl?.message} {...register('canonicalUrl')} />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Saving…' : seo ? 'Save changes' : 'Create override'}
      </Button>
    </form>
  );
}
