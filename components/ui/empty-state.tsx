import Link from 'next/link';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button';

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel
}: {
  title: string;
  description: string;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-white/10 bg-white/5 p-8 text-center">
      <div className="text-sm uppercase tracking-[0.3em] text-white/50">{title}</div>
      <p className="max-w-xl text-sm text-white/60">{description}</p>
      {actionHref && actionLabel ? (
        <Link href={actionHref} className={cn(buttonVariants({ variant: 'ghost' }), 'px-5')}>
          {actionLabel}
        </Link>
      ) : null}
    </div>
  );
}
