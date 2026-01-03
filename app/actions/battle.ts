'use server';

import { calculateElo } from '@/lib/elo';
import { fetchAlgorithmConfig } from '@/lib/config';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';

export type BattlePair = {
  battleId: string;
  left: Submission;
  right: Submission;
};

type Submission = {
  id: string;
  image_url: string;
  user_id: string;
  tags: string[];
  arena_id: string;
};

export async function createBattlePair(slug: string) {
  const supabase = createSupabaseServerClient();
  const config = await fetchAlgorithmConfig();
  const { data: arena, error: arenaError } = await supabase.from('arenas').select('id').eq('slug', slug).single();
  if (arenaError) {
    console.error('Failed to fetch arena for battle', arenaError);
  }
  if (!arena?.id) throw new Error('Arena not found');

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('arena_id', arena.id)
    .eq('status', 'active');
  if (error) {
    console.error('Failed to fetch submissions for battle', error);
    throw error;
  }
  if (!submissions || submissions.length < config.minSubmissions)
    throw new Error('Need more submissions before battling.');

  const sessionCookie = cookies();
  const cookieKey = `arena_pairs_${slug}`;
  const seenPairs = new Set<string>(
    sessionCookie
      .get(cookieKey)
      ?.value.split('|')
      .filter(Boolean) ?? []
  );

  const pickRandomPair = () => {
    const shuffled = [...submissions].sort(() => Math.random() - 0.5);
    for (let i = 0; i < shuffled.length - 1; i++) {
      for (let j = i + 1; j < shuffled.length; j++) {
        const left = shuffled[i];
        const right = shuffled[j];
        const pairKey = [left.id, right.id].sort().join('-');
        if (!seenPairs.has(pairKey)) {
          return { left, right, pairKey };
        }
      }
    }
    return null;
  };

  const choice = pickRandomPair();
  if (!choice) throw new Error('No fresh pairs available. Come back soon!');

  const { left, right, pairKey } = choice;
  const { data: battle } = await supabase
    .from('battles')
    .insert({ arena_id: arena.id, left_submission_id: left.id, right_submission_id: right.id })
    .select('id')
    .single();
  if (!battle?.id) throw new Error('Unable to create battle');

  const updatedPairs = Array.from(new Set([...seenPairs, pairKey])).slice(-config.maxPairsPerSession);
  sessionCookie.set(cookieKey, updatedPairs.join('|'), { httpOnly: true, path: '/' });

  return {
    battleId: battle.id as string,
    left,
    right
  } satisfies BattlePair;
}

export async function voteOnBattle({
  battleId,
  winnerSubmissionId
}: {
  battleId: string;
  winnerSubmissionId: string;
}) {
  const supabase = createSupabaseServerClient();
  const config = await fetchAlgorithmConfig();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('You must sign in to vote.');

  const voteCookie = cookies();
  const rateKey = 'vote_history';
  const now = Date.now();
  const history = (voteCookie.get(rateKey)?.value.split(',') ?? [])
    .map((value) => Number(value))
    .filter((value) => Number.isFinite(value) && now - value < 60_000);

  if (history.length >= 20) {
    throw new Error('Too many rapid votes. Take a short breather.');
  }

  const { data: battle, error: battleError } = await supabase
    .from('battles')
    .select('id, arena_id, left_submission_id, right_submission_id, arenas!inner(slug)')
    .eq('id', battleId)
    .single();
  if (battleError) {
    console.error('Failed to load battle', battleError);
  }
  if (!battle) throw new Error('Battle not found');

  const arenaSlug = (battle as unknown as { arenas?: { slug?: string } }).arenas?.slug;

  const loserSubmissionId =
    winnerSubmissionId === battle.left_submission_id ? battle.right_submission_id : battle.left_submission_id;

  const { error: voteError } = await supabase.from('votes').insert({
    battle_id: battle.id,
    voter_user_id: user.id,
    winner_submission_id: winnerSubmissionId
  });
  if (voteError && voteError.code !== '23505') throw voteError;

  const { data: winnerRating } = await supabase
    .from('ratings')
    .select('elo, wins, losses, streak, submission_id')
    .eq('submission_id', winnerSubmissionId)
    .single();
  const { data: loserRating } = await supabase
    .from('ratings')
    .select('elo, wins, losses, streak, submission_id')
    .eq('submission_id', loserSubmissionId)
    .single();

  const winnerElo = winnerRating?.elo ?? 1000;
  const loserElo = loserRating?.elo ?? 1000;
  const { newWinner, newLoser } = calculateElo({ winner: winnerElo, loser: loserElo, k: config.kFactor });

  await supabase.from('ratings').upsert({
    submission_id: winnerSubmissionId,
    arena_id: battle.arena_id,
    elo: newWinner,
    wins: (winnerRating?.wins ?? 0) + 1,
    losses: winnerRating?.losses ?? 0,
    streak: (winnerRating?.streak ?? 0) + 1
  });
  await supabase.from('ratings').upsert({
    submission_id: loserSubmissionId,
    arena_id: battle.arena_id,
    elo: newLoser,
    wins: loserRating?.wins ?? 0,
    losses: (loserRating?.losses ?? 0) + 1,
    streak: -1
  });

  const updatedHistory = [...history, now].slice(-20);
  voteCookie.set(rateKey, updatedHistory.join(','), { httpOnly: true, path: '/' });

  if (arenaSlug) {
    revalidatePath(`/arena/${arenaSlug}/leaderboard`);
  }
}
