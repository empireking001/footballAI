'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // In production, forward this to an error-logging service (Sentry, etc.).
    // eslint-disable-next-line no-console
    console.error(error);
  }, [error]);

  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="font-display text-8xl font-extrabold text-danger">500</span>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">
        Something went wrong on our end
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The match didn&apos;t finish the way we expected. Try again, or head back to the home
        page.
      </p>
      <div className="mt-6 flex gap-3">
        <Button variant="secondary" onClick={reset}>
          Try again
        </Button>
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </Container>
  );
}
