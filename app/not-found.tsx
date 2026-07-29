import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Container } from '@/components/ui/Container';

export default function NotFound() {
  return (
    <Container className="flex min-h-[60vh] flex-col items-center justify-center text-center">
      <span className="font-display text-8xl font-extrabold text-primary">404</span>
      <h1 className="mt-4 font-display text-2xl font-bold uppercase tracking-tight">
        Offside — this page doesn&apos;t exist
      </h1>
      <p className="mt-2 max-w-sm text-sm text-muted">
        The page you&apos;re looking for was moved, renamed, or never existed.
      </p>
      <Button className="mt-6" asChild>
        <Link href="/">Back to home</Link>
      </Button>
    </Container>
  );
}
