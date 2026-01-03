import { createSupabaseServerClient } from './supabase/server';

export type AlgorithmConfig = {
  kFactor: number;
  minSubmissions: number;
  maxPairsPerSession: number;
};

export const DEFAULT_ALGO_CONFIG: AlgorithmConfig = {
  kFactor: 32,
  minSubmissions: 2,
  maxPairsPerSession: 20
};

function sanitizeConfig(config: Partial<AlgorithmConfig>): AlgorithmConfig {
  return {
    kFactor: clamp(config.kFactor ?? DEFAULT_ALGO_CONFIG.kFactor, 8, 64),
    minSubmissions: clamp(config.minSubmissions ?? DEFAULT_ALGO_CONFIG.minSubmissions, 2, 20),
    maxPairsPerSession: clamp(config.maxPairsPerSession ?? DEFAULT_ALGO_CONFIG.maxPairsPerSession, 5, 100)
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export async function fetchAlgorithmConfig(): Promise<AlgorithmConfig> {
  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from('admin_settings')
      .select('value')
      .eq('key', 'algorithm')
      .maybeSingle();

    if (error) {
      console.error('Failed to fetch algorithm config', error);
      return DEFAULT_ALGO_CONFIG;
    }

    if (!data?.value) return DEFAULT_ALGO_CONFIG;
    return sanitizeConfig(data.value as Partial<AlgorithmConfig>);
  } catch (err) {
    console.error('Unexpected config fetch error', err);
    return DEFAULT_ALGO_CONFIG;
  }
}

export async function persistAlgorithmConfig(config: AlgorithmConfig) {
  const supabase = createSupabaseServerClient();
  const sanitized = sanitizeConfig(config);

  const { data: sessionResult } = await supabase.auth.getSession();
  const user = sessionResult.data.session?.user;
  if (!user) throw new Error('Sign in to update configuration.');

  const { error } = await supabase
    .from('admin_settings')
    .upsert({ key: 'algorithm', value: sanitized })
    .eq('key', 'algorithm');

  if (error) {
    console.error('Failed to persist algorithm config', error);
    throw new Error('Unable to save configuration right now.');
  }

  return sanitized;
}
