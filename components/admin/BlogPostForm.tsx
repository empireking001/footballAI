'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { adminCreate, adminUpdate } from '@/lib/api/admin';
import { AdminBlogPost } from '@/types/api';

const schema = z.object({
  title: z.string().trim().min(3).max(200),
  slug: z.string().trim().min(3).max(220),
  excerpt: z.string().trim().min(10).max(300),
  content: z.string().min(20),
  coverImageUrl: z.string().url().optional().or(z.literal('')),
  category: z.string().trim().optional(),
  tags: z.string().optional(), // comma-separated in the form, split into an array on submit
  status: z.enum(['draft', 'published']),
  metaTitle: z.string().max(70).optional(),
  metaDescription: z.string().max(160).optional(),
});
type FormValues = z.infer<typeof schema>;

export function BlogPostForm({ post }: { post?: AdminBlogPost }) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: post
      ? {
          title: post.title,
          slug: post.slug,
          excerpt: post.excerpt,
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? '',
          category: post.category ?? '',
          tags: post.tags.join(', '),
          status: post.status,
          metaTitle: post.metaTitle ?? '',
          metaDescription: post.metaDescription ?? '',
        }
      : { status: 'draft' },
  });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const body = {
        ...values,
        coverImageUrl: values.coverImageUrl || undefined,
        tags: values.tags
          ? values.tags.split(',').map((t) => t.trim()).filter(Boolean)
          : [],
      };
      if (post) {
        await adminUpdate('blog', post._id, body);
      } else {
        await adminCreate('blog', body);
      }
      router.push('/admin/blog');
      router.refresh();
    } catch {
      setServerError('Something went wrong saving this post.');
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex max-w-2xl flex-col gap-4">
      <Input label="Title" error={errors.title?.message} {...register('title')} />
      <Input label="Slug" error={errors.slug?.message} {...register('slug')} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="excerpt" className="text-sm font-medium text-foreground">
          Excerpt
        </label>
        <textarea
          id="excerpt"
          rows={2}
          className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground"
          {...register('excerpt')}
        />
        {errors.excerpt && <p className="text-xs text-danger">{errors.excerpt.message}</p>}
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="content" className="text-sm font-medium text-foreground">
          Content
        </label>
        <textarea
          id="content"
          rows={12}
          className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground"
          {...register('content')}
        />
        {errors.content && <p className="text-xs text-danger">{errors.content.message}</p>}
      </div>

      <Input label="Cover image URL" error={errors.coverImageUrl?.message} {...register('coverImageUrl')} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Category" {...register('category')} />
        <Input label="Tags (comma-separated)" {...register('tags')} />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="status" className="text-sm font-medium text-foreground">
          Status
        </label>
        <select
          id="status"
          {...register('status')}
          className="h-11 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground"
        >
          <option value="draft">Draft</option>
          <option value="published">Published</option>
        </select>
      </div>

      <Input label="Meta title (optional)" error={errors.metaTitle?.message} {...register('metaTitle')} />
      <Input
        label="Meta description (optional)"
        error={errors.metaDescription?.message}
        {...register('metaDescription')}
      />

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" disabled={isSubmitting} className="w-fit">
        {isSubmitting ? 'Saving…' : post ? 'Save changes' : 'Create post'}
      </Button>
    </form>
  );
}
