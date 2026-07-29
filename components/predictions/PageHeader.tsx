import { Container } from '@/components/ui/Container';

export function PredictionsPageHeader({ eyebrow, title, subtitle }: { eyebrow: string; title: string; subtitle: string }) {
  return (
    <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
      <Container>
        <span className="font-mono text-xs uppercase tracking-widest text-primary">{eyebrow}</span>
        <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
          {title}
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">{subtitle}</p>
      </Container>
    </div>
  );
}
