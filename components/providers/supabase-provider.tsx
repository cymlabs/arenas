'use client';

import { createContext, useContext, useMemo } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';
import type { SupabaseClient } from '@supabase/supabase-js';

const SupabaseContext = createContext<SupabaseClient | null>(null);

export function SupabaseProvider({ children }: { children: React.ReactNode }) {
  const client = useMemo(() => createSupabaseBrowserClient(), []);
  return <SupabaseContext.Provider value={client}>{children}</SupabaseContext.Provider>;
}

export function useSupabase() {
  const ctx = useContext(SupabaseContext);
  if (!ctx) throw new Error('Supabase client not available');
  return ctx;
}
