import type { Metadata } from 'next';
import { Container } from '@/components/ui/Container';

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Frequently asked questions about Football AI manual picks, VIP access, and accuracy.',
};

const FAQS = [
  {
    q: 'How are picks prepared?',
    a: 'An administrator reviews the available fixture information and types the markets, selections, probabilities, and notes shown on the site. Live fixture, score, league, team, and odds data continue to update automatically.',
  },
  {
    q: 'What does the confidence score mean?',
    a: 'It is an optional confidence assessment entered by the administrator to communicate how strongly the pick is rated. It is not a guarantee of the result.',
  },
  {
    q: 'Is this betting advice?',
    a: 'No. Predictions are statistical estimates provided for informational and entertainment purposes only. Please gamble responsibly and within your means.',
  },
  {
    q: "What's the difference between Free and VIP?",
    a: 'Free picks cover the core markets for a curated set of matches. VIP can unlock administrator-entered picks and expanded market detail across more fixtures, depending on the tier assigned to each pick.',
  },
  {
    q: 'How do I know the accuracy numbers are real?',
    a: 'Every manual pick is compared against the final result once a match finishes. The accuracy stats on our home page are based on graded manual picks, including picks that were incorrect.',
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
