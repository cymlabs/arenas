export const env = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
};

if (!env.supabaseUrl || !env.supabaseAnonKey) {
  console.warn('Supabase environment variables are missing.');
}
