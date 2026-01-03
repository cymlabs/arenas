function required(key: string) {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
}

const allowlist = (process.env.NEXT_PUBLIC_REDIRECT_ALLOWLIST || process.env.NEXT_PUBLIC_SITE_URL || '')
  .split(',')
  .map((entry) => entry.trim())
  .filter(Boolean);

export const env = {
  supabaseUrl: required('NEXT_PUBLIC_SUPABASE_URL'),
  supabaseAnonKey: required('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || '',
  redirectAllowlist: allowlist
};

if (!env.redirectAllowlist.length && env.siteUrl) {
  env.redirectAllowlist.push(env.siteUrl);
}
