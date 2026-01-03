import Link from 'next/link';
import { Panel } from '@/components/ui/panel';
import { buttonVariants } from '@/components/ui/button';

export default function ArenaNotFound() {
  return (
    <Panel className="p-8 text-center">
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">Arena</p>
      <h1 className="text-2xl font-semibold">Arena not found</h1>
      <p className="mt-2 text-sm text-white/60">It may have been removed or is temporarily unavailable.</p>
      <div className="mt-4 flex justify-center">
        <Link href="/" className={buttonVariants({})}>
          Return to explorer
        </Link>
      </div>
    </Panel>
  );
}
