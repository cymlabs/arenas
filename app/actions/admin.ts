'use server';

import { fetchAlgorithmConfig, persistAlgorithmConfig, type AlgorithmConfig } from '@/lib/config';
import { revalidatePath } from 'next/cache';

export async function getAdminConfig() {
  return fetchAlgorithmConfig();
}

export async function saveAdminConfig(config: AlgorithmConfig) {
  const saved = await persistAlgorithmConfig(config);
  revalidatePath('/admin');
  return saved;
}
