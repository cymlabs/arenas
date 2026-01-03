import { createBattlePair } from '@/app/actions/battle';
import { BattleClient } from '@/components/sections/battle-client';
import { Panel } from '@/components/ui/panel';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';

export default async function BattlePage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase.from('arenas').select('name, status').eq('slug', params.slug).maybeSingle();

  if (!arena) {
    notFound();
  }

  if (arena.status === 'maintenance') {
    return (
      <Panel className="p-6 text-center">
        <h2 className="text-xl font-semibold">{arena.name} is under maintenance</h2>
        <p className="text-white/60">Battles will resume when this arena is re-enabled.</p>
      </Panel>
    );
  }

  try {
    const pair = await createBattlePair(params.slug);
    return <BattleClient pair={pair} slug={params.slug} />;
  } catch (error) {
    if (error instanceof Error && error.message.toLowerCase().includes('arena not found')) {
      notFound();
    }
    return (
      <Panel className="p-6 text-center">
        <h2 className="text-xl font-semibold">No battles ready</h2>
        <p className="text-white/60">Add at least two submissions to start battling.</p>
      </Panel>
    );
  }
}
