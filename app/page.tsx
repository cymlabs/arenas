import Link from 'next/link';
import { ArrowRight, Plus } from 'lucide-react';
import { CreateArenaButton } from '@/components/sections/create-arena';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Panel } from '@/components/ui/panel';
import { formatDate } from '@/lib/utils';

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

      <section id="arenas" className="grid gap-4 md:grid-cols-2">
        {arenas?.map((arena) => (
          <Link key={arena.id} href={`/arena/${arena.slug}`}>
            <Panel className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-neon">
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">{arena.scope_type}</p>
                  <h3 className="text-xl font-semibold">{arena.name}</h3>
                  <p className="text-sm text-white/60">{arena.description}</p>
                </div>
                <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                  {formatDate(arena.created_at)}
                </span>
              </div>
              <div className="mt-4 flex items-center gap-2 text-sm text-aurora">
                Enter arena <Plus className="h-4 w-4" />
              </div>
            </Panel>
          </Link>
        ))}
      </section>
    </div>
  );
}
