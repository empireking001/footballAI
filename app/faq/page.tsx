import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Football AI predictions, VIP, and accuracy.',
};

const FAQS = [
  {
    q: 'How are predictions generated?',
    a: 'Each match gets an expected-goals rate (Poisson model) built from recent form, home/away splits, and head-to-head history. Every market — winner, BTTS, over/under, correct score — is derived from that single statistical grid, so the numbers are internally consistent.',
  },
  {
    q: 'What does the confidence score mean?',
    a: "It blends how decisive the model's own probabilities are with how much real match data backed the calculation. A 90% confidence pick had both a clear statistical favorite and a solid sample of recent matches to draw on.",
  },
  {
    q: 'Is this betting advice?',
    a: 'No. Predictions are statistical estimates provided for informational and entertainment purposes only. Please gamble responsibly and within your means.',
  },
  {
    q: "What's the difference between Free and VIP?",
    a: 'Free predictions cover the core markets for a curated set of matches daily. VIP unlocks the full market breakdown — correct score, cards, corners — across more fixtures, generated from the same underlying model.',
  },
  {
    q: 'How do I know the accuracy numbers are real?',
    a: 'Every prediction is automatically compared against the final result once a match finishes. The accuracy stats on our home page are a live, unfiltered average across every graded prediction — including ones the model got wrong.',
  },
  {
    q: 'Can I cancel my VIP subscription?',
    a: "Any time, from your dashboard. Cancelling stops future renewal — you'll keep VIP access until your current billing period ends.",
  },
];

export default function FaqPage() {
  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">FAQ</span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Frequently Asked Questions
          </h1>
        </Container>
      </div>

      <Container className="max-w-2xl py-10 sm:py-12">
        <div className="flex flex-col divide-y divide-border rounded-lg border border-border bg-surface">
          {FAQS.map((item) => (
            <details key={item.q} className="group px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-semibold text-foreground">
                {item.q}
                <span className="ml-4 text-muted transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </>
  );
}
