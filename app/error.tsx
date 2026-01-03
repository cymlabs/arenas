'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error('App error boundary caught:', error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[70vh] max-w-3xl flex-col items-center justify-center space-y-6 text-center">
      <div className="space-y-2">
        <p className="text-xs uppercase tracking-[0.2em] text-white/50">System notice</p>
        <h1 className="text-3xl font-semibold">Something glitched.</h1>
        <p className="text-white/60">
          We hit a snag while rendering this view. You can retry the last action or head back to the arenas lobby.
        </p>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset}>Retry</Button>
        <Button asChild variant="ghost">
          <Link href="/">Return home</Link>
        </Button>
      </div>
    </div>
  );
}
