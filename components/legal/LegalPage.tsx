import { Container } from '@/components/ui/Container';

export function LegalPage({
  title,
  lastUpdated,
  children,
}: {
  title: string;
  lastUpdated: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <h1 className="font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mt-2 text-sm text-muted">Last updated: {lastUpdated}</p>
        </Container>
      </div>
      <Container className="max-w-3xl py-10 sm:py-12">
        <div className="flex flex-col gap-6 text-sm leading-relaxed text-foreground/90 [&_h2]:mt-4 [&_h2]:font-display [&_h2]:text-lg [&_h2]:font-bold [&_h2]:uppercase [&_h2]:tracking-tight [&_h2]:text-foreground [&_p]:text-foreground/90 [&_ul]:list-disc [&_ul]:pl-5 [&_li]:mt-1">
          {children}
        </div>
      </Container>
    </>
  );
}
