'use client';

import { voteOnBattle, type BattlePair } from '@/app/actions/battle';
import { Button } from '../ui/button';
import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

export function BattleClient({ pair, slug }: { pair: BattlePair; slug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const vote = (submissionId: string) => {
    startTransition(async () => {
      await voteOnBattle({ battleId: pair.battleId, winnerSubmissionId: submissionId });
      router.refresh();
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">Swipe or tap to vote</p>
        <h1 className="text-3xl font-semibold">Battle mode</h1>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[pair.left, pair.right].map((item) => (
          <AnimatePresence key={item.id}>
            <motion.div
              className="group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl"
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            >
              <img src={item.image_url} alt="submission" className="h-96 w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/60" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <Button className="w-full" disabled={pending} onClick={() => vote(item.id)}>
                  Vote for this
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
      <p className="text-center text-xs text-white/50">Pairs refresh instantly after your vote. Unique pairs per session are handled in the database.</p>
    </div>
  );
}
