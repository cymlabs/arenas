'use server';

import { createSupabaseServerClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';

const arenaSchema = z.object({
  name: z.string().min(3).max(64),
  scope_type: z.string().min(2).max(32),
  description: z.string().max(240).optional()
});

export async function createArena(formData: FormData) {
  const name = (formData.get('name') as string)?.trim();
  const scope_type = (formData.get('scope_type') as string)?.trim();
  const description = (formData.get('description') as string)?.trim();
  const parsed = arenaSchema.safeParse({ name, scope_type, description });
  if (!parsed.success) throw new Error('Please provide a name and scope between 2-64 characters.');

  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  const user = session?.user;
  if (!user) throw new Error('Please sign in to create arenas');

  const existing = await supabase.from('arenas').select('id').eq('slug', slug).maybeSingle();
  if (existing.data?.id) throw new Error('An arena with this name already exists.');

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
