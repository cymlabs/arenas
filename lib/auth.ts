import { createSupabaseServerClient } from './supabase/server';

export async function getUserSession() {
  const supabase = createSupabaseServerClient();
  const {
    data: { session }
  } = await supabase.auth.getSession();
  return { session, supabase } as const;
}
