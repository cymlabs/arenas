import { Skeleton } from '@/components/ui/skeleton';

export default function BattleLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-40" />
        <Skeleton className="h-10 w-24 rounded-full" />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {[0, 1].map((key) => (
          <div key={key} className="space-y-3 rounded-3xl border border-white/10 bg-white/5 p-4">
            <Skeleton className="h-64 w-full rounded-2xl" />
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-14" />
            </div>
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}
