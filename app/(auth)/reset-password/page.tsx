'use client';

import { Suspense, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { AuthCard } from '@/components/auth/AuthCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resetPassword } from '@/lib/api/auth';

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number');

const schema = z.object({ password: passwordSchema });
type FormValues = z.infer<typeof schema>;

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [serverError, setServerError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    if (!token) {
      setServerError('This reset link is missing its token — please request a new one.');
      return;
    }
    setServerError(null);
    try {
      await resetPassword(token, values.password);
      setDone(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      setServerError(message || 'This link may have expired — please request a new one.');
    }
  }

  if (done) {
    return (
      <p className="text-sm text-live">Password updated — redirecting you to log in…</p>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <Input
        label="New password"
        type="password"
        autoComplete="new-password"
        error={errors.password?.message}
        {...register('password')}
      />
      <p className="-mt-2 text-xs text-muted">
        8+ characters, with an uppercase letter, a lowercase letter, and a number.
      </p>
      {serverError && <p className="text-sm text-danger">{serverError}</p>}
      <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
        {isSubmitting ? 'Updating…' : 'Update password'}
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <AuthCard
      title="Choose a new password"
      footer={
        <Link href="/login" className="font-semibold text-primary hover:underline">
          Back to log in
        </Link>
      }
    >
      <Suspense fallback={null}>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
