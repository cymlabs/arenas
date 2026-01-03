import { cn } from '@/lib/utils';

export function Panel({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('glass-panel relative overflow-hidden rounded-3xl border border-white/10', className)}>{children}</div>;
}
