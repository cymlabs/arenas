import { Skeleton } from '@/components/ui/skeleton';

export default function SubmitLoading() {
  return (
    <div className="space-y-4">
      <Skeleton className="h-6 w-52" />
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-56 w-full" />
      </div>
      <div className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-4">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  );
}
