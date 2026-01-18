import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Panel } from '@/components/ui/panel';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';

export default async function ArenaHub({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase.from('arenas').select('*').eq('slug', params.slug).single();

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{arena?.scope_type}</p>
          <h1 className="text-3xl font-semibold">{arena?.name}</h1>
          <p className="text-white/60">{arena?.description}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/arena/${params.slug}/battle`} className={cn(buttonVariants({}))}>
            Enter battle
          </Link>
          <Link
            href={`/arena/${params.slug}/submit`}
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            Upload
          </Link>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <h3 className="text-lg font-semibold">Battle</h3>
          <p className="text-sm text-white/60">Swipe or tap to vote between two submissions.</p>
          <Link href={`/arena/${params.slug}/battle`} className="mt-3 inline-flex items-center gap-2 text-aurora">
            Launch <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
        <Panel className="p-5">
          <h3 className="text-lg font-semibold">Submit</h3>
          <p className="text-sm text-white/60">Upload your best shot to enter the arena.</p>
          <Link href={`/arena/${params.slug}/submit`} className="mt-3 inline-flex items-center gap-2 text-aurora">
            Upload <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
        <Panel className="p-5">
          <h3 className="text-lg font-semibold">Leaderboard</h3>
          <p className="text-sm text-white/60">Track Elo, wins, losses, and streaks.</p>
          <Link href={`/arena/${params.slug}/leaderboard`} className="mt-3 inline-flex items-center gap-2 text-aurora">
            View <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
      </div>
    </div>
  );
}
