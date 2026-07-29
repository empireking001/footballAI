import { Container } from '@/components/ui/Container';

export const metadata = { title: 'Under maintenance' };

export default function MaintenancePage() {
  return (
    <Container className="flex min-h-[70vh] flex-col items-center justify-center text-center">
      <span className="font-mono text-xs uppercase tracking-widest text-primary">
        Half-time whistle
      </span>
      <h1 className="mt-3 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
        We&apos;ll be back shortly
      </h1>
      <p className="mt-3 max-w-md text-sm text-muted">
        The site is undergoing scheduled maintenance. Predictions and your account will be back
        online shortly — thanks for your patience.
      </p>
    </Container>
  );
}
