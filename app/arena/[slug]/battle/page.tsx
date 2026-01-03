import { createBattlePair } from '@/app/actions/battle';
import { BattleClient } from '@/components/sections/battle-client';
import { Panel } from '@/components/ui/panel';

export default async function BattlePage({ params }: { params: { slug: string } }) {
  try {
    const pair = await createBattlePair(params.slug);
    return <BattleClient pair={pair} slug={params.slug} />;
  } catch (error) {
    return (
      <Panel className="p-6 text-center">
        <h2 className="text-xl font-semibold">No battles ready</h2>
        <p className="text-white/60">Add at least two submissions to start battling.</p>
      </Panel>
    );
  }
}
