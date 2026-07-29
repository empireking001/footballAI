'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { isAxiosError } from 'axios';
import { AuthCard } from '@/components/auth/AuthCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { useAuthStore } from '@/store/authStore';
import { register as registerUser } from '@/lib/api/auth';

// Mirrors the backend's password policy exactly (src/validations/auth.validation.ts)
// so users see the same rule client-side instead of discovering it after submit.
const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number');

const schema = z.object({
  name: z.string().trim().min(2, 'Enter your full name'),
  email: z.string().trim().email('Enter a valid email address'),
  password: passwordSchema,
});
type FormValues = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const referralCode = searchParams.get('ref') ?? undefined;
  const setAuth = useAuthStore((s) => s.setAuth);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register: registerField,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(values: FormValues) {
    setServerError(null);
    try {
      const { user, accessToken } = await registerUser({ ...values, referralCode });
      setAuth(user, accessToken);
      router.push('/dashboard?welcome=1');
    } catch (error) {
      const message = isAxiosError(error) ? error.response?.data?.message : undefined;
      setServerError(message || 'Something went wrong. Please try again.');
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="Free predictions, every day — upgrade to VIP any time."
      footer={
        <span className="text-muted">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </span>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
        <Input label="Full name" autoComplete="name" error={errors.name?.message} {...registerField('name')} />
        <Input
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...registerField('email')}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          {...registerField('password')}
        />
        <p className="-mt-2 text-xs text-muted">
          8+ characters, with an uppercase letter, a lowercase letter, and a number.
        </p>

        {serverError && <p className="text-sm text-danger">{serverError}</p>}

        <Button type="submit" size="lg" disabled={isSubmitting} className="mt-2">
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>

        <p className="text-center text-xs text-muted">
          By signing up you agree to our{' '}
          <Link href="/terms" className="underline hover:text-foreground">
            Terms
          </Link>{' '}
          and{' '}
          <Link href="/privacy" className="underline hover:text-foreground">
            Privacy Policy
          </Link>
          .
        </p>
      </form>
    </AuthCard>
  );
}
