'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your name'),
  email: z.string().trim().email('Enter a valid email address'),
  subject: z.string().trim().min(3, 'Enter a subject'),
  message: z.string().trim().min(10, 'Message must be at least 10 characters'),
  // Honeypot — real users never see this field. Left blank by humans,
  // reliably filled in by simple bots.
  companyWebsite: z.string().optional(),
});
type FormValues = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      await apiClient.post('/contact', values);
      setSent(true);
    } catch {
      setServerError('Something went wrong sending your message — please try again.');
    }
  }

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-surface p-10 text-center">
        <CheckCircle2 className="h-10 w-10 text-live" />
        <p className="text-sm text-foreground">
          Message sent — we&apos;ll get back to you as soon as we can.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input label="Name" autoComplete="name" error={errors.name?.message} {...register('name')} />
      <Input
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...register('email')}
      />
      <Input label="Subject" error={errors.subject?.message} {...register('subject')} />

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="text-sm font-medium text-foreground">
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className="rounded-md border border-border bg-surface-elevated px-4 py-3 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
          {...register('message')}
        />
        {errors.message && <p className="text-xs text-danger">{errors.message.message}</p>}
      </div>

      {/* Honeypot field — hidden from sighted users and screen readers, but present in the DOM for bots to fill. */}
      <div className="absolute h-0 w-0 overflow-hidden" aria-hidden="true">
        <label htmlFor="companyWebsite">Leave this field blank</label>
        <input id="companyWebsite" type="text" tabIndex={-1} autoComplete="off" {...register('companyWebsite')} />
      </div>

      {serverError && <p className="text-sm text-danger">{serverError}</p>}

      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  );
}
