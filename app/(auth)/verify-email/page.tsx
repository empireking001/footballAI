'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Loader2, CheckCircle2, XCircle } from 'lucide-react';
import { AuthCard } from '@/components/auth/AuthCard';
import { Button } from '@/components/ui/Button';
import { verifyEmail } from '@/lib/api/auth';
import { useAuthStore } from '@/store/authStore';

type Status = 'verifying' | 'success' | 'error';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const setAuth = useAuthStore((s) => s.setAuth);
  const accessToken = useAuthStore((s) => s.accessToken);
  const [status, setStatus] = useState<Status>('verifying');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      return;
    }
    verifyEmail(token)
      .then((user) => {
        if (accessToken) setAuth(user, accessToken);
        setStatus('success');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  if (status === 'verifying') {
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
    <div className="flex flex-col items-center gap-3 py-4 text-center">
      <XCircle className="h-10 w-10 text-danger" />
      <p className="text-sm text-foreground">
        This verification link is invalid or has expired.
      </p>
      <Button variant="secondary" asChild className="mt-2">
        <Link href="/dashboard/settings">Request a new link</Link>
      </Button>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <AuthCard title="Email verification">
      <Suspense fallback={null}>
        <VerifyEmailContent />
      </Suspense>
    </AuthCard>
  );
}
