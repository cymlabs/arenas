import { Skeleton } from '@/components/ui/skeleton';

export default function RootLoading() {
  return (
    <div className="space-y-10">
      <section className="space-y-6 text-center">
        <div className="mx-auto flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-6 py-3">
          <Skeleton className="h-3 w-48 rounded-full" />
        </div>
        <div className="space-y-3">
          <Skeleton className="mx-auto h-8 w-3/4 rounded-full" />
          <Skeleton className="mx-auto h-4 w-1/2 rounded-full" />
        </div>
        <div className="flex justify-center gap-3">
          <Skeleton className="h-11 w-36 rounded-full" />
          <Skeleton className="h-11 w-36 rounded-full" />
        </div>
      </section>
      <section className="grid gap-4 md:grid-cols-2">
        {Array.from({ length: 4 }).map((_, idx) => (
          <div key={idx} className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-start justify-between">
              <div className="space-y-3">
                <Skeleton className="h-3 w-28" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-4 w-56" />
              </div>
              <Skeleton className="h-8 w-20 rounded-full" />
            </div>
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </section>
    </div>
  );
}
