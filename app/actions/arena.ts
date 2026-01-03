'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createArena(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const scope_type = (formData.get('scope_type') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  if (!name || !scope_type) throw new Error('Missing fields');

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('Please sign in to create arenas');

  const { error } = await supabase.from('arenas').insert({
    name,
    slug,
    scope_type,
    description,
    created_by: user.id
  });
  if (error) throw error;

  revalidatePath('/');
  redirect(`/arena/${slug}`);
}
