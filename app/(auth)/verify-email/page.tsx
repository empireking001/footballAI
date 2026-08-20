'use client';

import { FormEvent, Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle2, Loader2, MailCheck, XCircle } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { resendVerification, verifyEmail } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';
import { isAxiosError } from 'axios';

type Status = 'idle' | 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const initialEmail = searchParams.get('email') ?? '';
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState('');
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'idle');
  const [message, setMessage] = useState<string | null>(null);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (!token) return;
    verifyEmail(token)
      .then((user) => {
        if (accessToken) setAuth(user, accessToken);
        setStatus('success');
      })
      .catch(() => {
        setStatus('error');
        setMessage('This verification link is invalid or has expired.');
      });
    // Token links are a backward-compatible path for existing emails.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function submitCode(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage(null);
    setStatus('verifying');
    try {
      const user = await verifyEmail(code.trim());
      if (accessToken) setAuth(user, accessToken);
      setStatus('success');
    } catch (error) {
      const apiMessage = isAxiosError(error) ? error.response?.data?.message : undefined;
      setStatus('error');
      setMessage(apiMessage ?? 'The code is invalid or has expired.');
    }
  }

  async function resendCode() {
    if (!email.trim()) {
      setMessage('Enter your signup email first.');
      return;
    }
    setResending(true);
    setMessage(null);
    try {
      const result = await resendVerification(email.trim());
      setMessage(result.message ?? 'A new verification code has been sent.');
      setStatus('idle');
    } catch (error) {
      const apiMessage = isAxiosError(error) ? error.response?.data?.message : undefined;
      setMessage(apiMessage ?? 'We could not send a new verification code.');
    } finally {
      setResending(false);
    }
  }

  if (status === 'verifying' && token) {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted">Verifying your email…</p>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="flex flex-col items-center gap-3 py-4 text-center">
        <CheckCircle2 className="h-10 w-10 text-live" />
        <p className="text-sm text-foreground">Your email is verified.</p>
        <Button asChild className="mt-2">
          <Link href="/dashboard">Go to dashboard</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center gap-3 text-center">
        {status === 'error' ? <XCircle className="h-10 w-10 text-danger" /> : <MailCheck className="h-10 w-10 text-primary" />}
        <p className="text-sm leading-6 text-muted">Enter the six-digit verification code sent to your email. The code expires in 15 minutes.</p>
      </div>
      <form onSubmit={submitCode} className="flex flex-col gap-4">
        <Input label="Email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
        <Input label="Verification code" inputMode="numeric" pattern="[0-9]{6}" maxLength={6} value={code} onChange={(event) => setCode(event.target.value.replace(/\D/g, '').slice(0, 6))} required />
        {message && <p className="text-sm text-danger">{message}</p>}
        <Button type="submit" size="lg" disabled={status === 'verifying' || code.length !== 6}>
          {status === 'verifying' ? 'Verifying…' : 'Verify email'}
        </Button>
      </form>
      <Button type="button" variant="secondary" onClick={resendCode} disabled={resending}>
        {resending ? 'Sending…' : 'Send a new code'}
      </Button>
      <p className="text-center text-xs text-muted">
        Already verified? <Link href="/login" className="font-semibold text-primary hover:underline">Log in</Link>
      </p>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Verify your email">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  );
}
