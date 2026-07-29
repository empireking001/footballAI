import { Container } from '@/components/ui/Container';

function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={`animate-shimmer rounded-md bg-gradient-to-r from-surface-elevated via-surface to-surface-elevated bg-[length:200%_100%] ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div className="py-16 sm:py-20">
      <Container>
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
          <Skeleton className="h-5 w-64" />
          <Skeleton className="h-12 w-full max-w-xl" />
          <Skeleton className="h-12 w-3/4 max-w-md" />
          <Skeleton className="h-5 w-full max-w-lg" />
        </div>

        <div className="mx-auto mt-14 max-w-2xl">
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>

        <div className="mt-16 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-lg" />
          ))}
        </div>
      </Container>
    </div>
  );
}
