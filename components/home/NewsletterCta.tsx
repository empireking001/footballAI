'use client';

import { useState } from 'react';
import { Container } from '@/components/ui/Container';
import { Button } from '@/components/ui/Button';
import { apiClient } from '@/lib/api/client';

export function NewsletterCta() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('loading');
    try {
      await apiClient.post('/newsletter/subscribe', { email });
      setStatus('success');
      setEmail('');
    } catch {
      setStatus('error');
    }
  }

  return (
    <section className="py-14 sm:py-16">
      <Container>
        <div className="mx-auto max-w-xl rounded-xl border border-border bg-surface p-8 text-center sm:p-10">
          <h2 className="font-display text-2xl font-bold uppercase tracking-tight sm:text-3xl">
            Get tomorrow&apos;s picks in your inbox
          </h2>
          <p className="mt-2 text-sm text-muted">
            One email a day, free predictions only. Unsubscribe any time.
          </p>

          {status === 'success' ? (
            <p className="mt-6 text-sm font-medium text-live">
              You&apos;re subscribed — check your inbox tomorrow.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
              <label htmlFor="newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="newsletter-email"
                type="email"
                required
                placeholder="you@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 flex-1 rounded-md border border-border bg-surface-elevated px-4 text-sm text-foreground placeholder:text-muted focus-visible:outline-none"
              />
              <Button type="submit" disabled={status === 'loading'}>
                {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
              </Button>
            </form>
          )}
          {status === 'error' && (
            <p className="mt-3 text-sm text-danger">
              Something went wrong — please try again in a moment.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
