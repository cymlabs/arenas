'use server';

import { calculateElo } from '@/lib/elo';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

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
  const { data: arena } = await supabase.from('arenas').select('id').eq('slug', slug).single();
  if (!arena?.id) throw new Error('Arena not found');

  const { data: submissions, error } = await supabase
    .from('submissions')
    .select('*')
    .eq('arena_id', arena.id)
    .eq('status', 'active');
  if (error) throw error;
  if (!submissions || submissions.length < 2) throw new Error('Need at least two submissions to battle');

  const shuffled = submissions.sort(() => Math.random() - 0.5).slice(0, 2);
  const [left, right] = shuffled;
  const { data: battle } = await supabase
    .from('battles')
    .insert({ arena_id: arena.id, left_submission_id: left.id, right_submission_id: right.id })
    .select('id')
    .single();
  if (!battle?.id) throw new Error('Unable to create battle');

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
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('You must sign in to vote.');

  const { data: battle } = await supabase
    .from('battles')
    .select('id, arena_id, left_submission_id, right_submission_id')
    .eq('id', battleId)
    .single();
  if (!battle) throw new Error('Battle not found');

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
  const { newWinner, newLoser } = calculateElo({ winner: winnerElo, loser: loserElo });

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

  revalidatePath(`/arena/${battle.arena_id}/leaderboard`);
}
