'use client';

import { voteOnBattle, type BattlePair } from '@/app/actions/battle';
import { Button } from '../ui/button';
import { useCallback, useEffect, useMemo, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ToastViewport, useToast } from '../ui/toast';
import Image from 'next/image';

export function BattleClient({ pair, slug }: { pair: BattlePair; slug: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const { toast, push, clear } = useToast();

  const variants = useMemo(
    () => ({
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      exit: (direction: number) => ({ opacity: 0, x: direction * 120, rotate: direction * 4 })
    }),
    []
  );

  const vote = useCallback(
    (submissionId: string) => {
      startTransition(async () => {
        setError(null);
        setSelectedId(submissionId);
        try {
          await voteOnBattle({ battleId: pair.battleId, winnerSubmissionId: submissionId });
          push({ message: 'Vote locked. Loading the next pair…', tone: 'success' });
          router.refresh();
        } catch (err) {
          const message = err instanceof Error ? err.message : 'Unable to submit vote right now.';
          setError(message);
          push({ message, tone: 'error' });
          setSelectedId(null);
        }
      });
    },
    [pair.battleId, push, router]
  );

  useEffect(() => {
    const handleKey = (event: KeyboardEvent) => {
      if (pending) return;
      if (event.key === 'ArrowLeft') {
        vote(pair.left.id);
      }
      if (event.key === 'ArrowRight') {
        vote(pair.right.id);
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [pair.left.id, pair.right.id, pending, vote]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-white/60">Swipe or tap to vote</p>
        <h1 className="text-3xl font-semibold">Battle mode</h1>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        {[pair.left, pair.right].map((item, index) => (
          <AnimatePresence key={item.id}>
            <motion.div
              custom={selectedId === item.id ? (index === 0 ? -1 : 1) : 0}
              className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-xl ${
                selectedId === item.id ? 'ring-2 ring-aurora/60' : ''
              }`}
              initial="initial"
              animate="animate"
              exit="exit"
              variants={variants}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.2}
              onDragEnd={(_, info) => {
                if (Math.abs(info.offset.x) > 80 && !pending) {
                  vote(item.id);
                }
              }}
              whileHover={{ y: -6 }}
              transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            >
              <div className="relative h-96 w-full">
                <Image
                  src={item.image_url}
                  alt={item.tags?.join(', ') || 'arena submission'}
                  fill
                  className="object-cover"
                  sizes="(min-width: 768px) 50vw, 100vw"
                  priority={index === 0}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/20 to-black/60" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <Button className="w-full" disabled={pending} onClick={() => vote(item.id)}>
                  {pending && selectedId === item.id ? 'Submitting...' : 'Vote for this'}
                </Button>
              </div>
            </motion.div>
          </AnimatePresence>
        ))}
      </div>
      <div className="space-y-2 text-center text-xs text-white/70">
        <p>Pairs refresh instantly after your vote. Unique pairs per session are handled in the database.</p>
        <p>Try arrow keys or swipe left/right on mobile for faster picks.</p>
        {error && <p className="text-rose-300">{error}</p>}
      </div>
      <ToastViewport toast={toast} clear={clear} />
    </div>
  );
}
