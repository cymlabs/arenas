import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { CreateArenaButton } from '@/components/sections/create-arena';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { EmptyState } from '@/components/ui/empty-state';
import { ArenaList } from '@/components/sections/arena-list';

export default async function Home() {
  const supabase = createSupabaseServerClient();
  const { data: arenas } = await supabase
    .from('arenas')
    .select('id, name, slug, scope_type, description, created_at')
    .order('created_at', { ascending: false });

  return (
    <div className="space-y-10">
      <section className="space-y-6 text-center">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-white/60">
          Hyper minimal • Motion crafted • Glassmorphic
        </div>
        <h1 className="text-4xl font-semibold leading-tight text-white sm:text-5xl">
          Build arenas. Swipe. Vote. Crown the sharpest visuals.
        </h1>
        <p className="text-white/60">Upload to the pit, battle head-to-head, and climb the Elo leaderboard.</p>
        <div className="flex justify-center gap-3">
          <CreateArenaButton />
          <Link
            href="#arenas"
            className="inline-flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/70 hover:text-white"
          >
            Explore arenas <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section id="arenas" className="space-y-6">
        {arenas?.length ? (
          <ArenaList arenas={arenas} />
        ) : (
          <div className="md:col-span-2">
            <EmptyState
              title="No arenas yet"
              description="Spin up the first arena to start collecting submissions and battles."
            />
          </div>
        )}
      </section>
    </div>
  );
}
