import Link from 'next/link';
import { Container } from '@/components/ui/Container';

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center overflow-hidden py-12">
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[400px] w-[700px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/15 blur-[110px]"
      />
      <Container className="relative flex justify-center">
        <div className="w-full max-w-md rounded-xl border border-border bg-surface p-8 shadow-card sm:p-10">
          <Link href="/" className="mb-6 inline-block font-display text-xl font-bold">
            FOOTBALL<span className="text-primary">AI</span>
          </Link>
          <h1 className="font-display text-2xl font-bold uppercase tracking-tight">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm text-muted">{subtitle}</p>}
          <div className="mt-6">{children}</div>
          {footer && <div className="mt-6 border-t border-border pt-5 text-center text-sm">{footer}</div>}
        </div>
      </Container>
    </div>
  );
}
