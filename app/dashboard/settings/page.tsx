'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CheckCircle2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { DashboardPageHeader } from '@/components/dashboard/DashboardPageHeader';
import { useAuthStore } from '@/store/authStore';
import { updateProfile, changePassword } from '@/lib/api/user';
import { resendVerification } from '@/lib/api/auth';

const profileSchema = z.object({ name: z.string().trim().min(2, 'Enter your full name') });
type ProfileValues = z.infer<typeof profileSchema>;

const passwordSchema = z
  .string()
  .min(8, 'At least 8 characters')
  .regex(/[A-Z]/, 'At least one uppercase letter')
  .regex(/[a-z]/, 'At least one lowercase letter')
  .regex(/[0-9]/, 'At least one number');

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: passwordSchema,
});
type PasswordValues = z.infer<typeof passwordFormSchema>;

function ProfileSection() {
  const user = useAuthStore((s) => s.user);
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [saved, setSaved] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ProfileValues>({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name } });

  async function onSubmit(values: ProfileValues) {
    const updated = await updateProfile(values);
    if (accessToken) setAuth(updated, accessToken);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Profile</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <Input label="Full name" error={errors.name?.message} {...register('name')} />
          <Input label="Email" value={user?.email} disabled readOnly />
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? 'Saving…' : 'Save changes'}
            </Button>
            {saved && <span className="text-sm text-live">Saved</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

function EmailVerificationSection() {
  const user = useAuthStore((s) => s.user);
  const [sent, setSent] = useState(false);

  if (user?.isEmailVerified) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 pt-5">
          <CheckCircle2 className="h-5 w-5 text-live" />
          <span className="text-sm text-foreground">Your email is verified.</span>
        </CardContent>
      </Card>
    );
  }

  async function handleResend() {
    if (!user) return;
    await resendVerification(user.email);
    setSent(true);
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Email verification</h2>
        <p className="mt-2 text-sm text-muted">Your email address hasn&apos;t been verified yet.</p>
        {sent ? (
          <p className="mt-3 text-sm text-live">Verification email sent — check your inbox.</p>
        ) : (
          <Button variant="secondary" className="mt-3" onClick={handleResend}>
            Resend verification email
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function PasswordSection() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<PasswordValues>({ resolver: zodResolver(passwordFormSchema) });

  async function onSubmit(values: PasswordValues) {
    setServerError(null);
    try {
      await changePassword(values.currentPassword, values.newPassword);
      setSuccess(true);
      reset();
      setTimeout(() => setSuccess(false), 2500);
    } catch {
      setServerError('Current password is incorrect.');
    }
  }

  return (
    <Card>
      <CardContent className="pt-5">
        <h2 className="font-display text-lg font-bold uppercase tracking-tight">Change password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
          <Input
            label="Current password"
            type="password"
            autoComplete="current-password"
            error={errors.currentPassword?.message}
            {...register('currentPassword')}
          />
          <Input
            label="New password"
            type="password"
            autoComplete="new-password"
            error={errors.newPassword?.message}
            {...register('newPassword')}
          />
          {serverError && <p className="text-sm text-danger">{serverError}</p>}
          <div className="flex items-center gap-3">
            <Button type="submit" disabled={isSubmitting} className="w-fit">
              {isSubmitting ? 'Updating…' : 'Update password'}
            </Button>
            {success && <span className="text-sm text-live">Updated</span>}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <DashboardPageHeader title="Settings" subtitle="Manage your profile, security, and email." />
      <ProfileSection />
      <EmailVerificationSection />
      <PasswordSection />
    </div>
  );
}
