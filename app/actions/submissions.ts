'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createSubmission(payload: {
  arenaSlug: string;
  imageUrl: string;
  tags?: string[];
}) {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('You must sign in to submit.');

  const { data: arena } = await supabase.from('arenas').select('id').eq('slug', payload.arenaSlug).single();
  if (!arena?.id) throw new Error('Arena not found');

  const { error } = await supabase.from('submissions').insert({
    arena_id: arena.id,
    user_id: user.id,
    image_url: payload.imageUrl,
    tags: payload.tags || [],
    status: 'active',
    quality_score: 1000
  });
  if (error) throw error;

  revalidatePath(`/arena/${payload.arenaSlug}/submit`);
  redirect(`/arena/${payload.arenaSlug}`);
}
