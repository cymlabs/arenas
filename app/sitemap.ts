import { MetadataRoute } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://arenas.local';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = createSupabaseServerClient();
  const { data: arenas, error } = await supabase.from('arenas').select('slug, updated_at, created_at');

  if (error) {
    console.error('Failed to build sitemap', error);
  }

  const arenaEntries = (arenas ?? []).flatMap((arena) => {
    const updatedAt = arena.updated_at || arena.created_at || new Date().toISOString();
    return [
      { url: `${siteUrl}/arena/${arena.slug}`, lastModified: updatedAt },
      { url: `${siteUrl}/arena/${arena.slug}/battle`, lastModified: updatedAt },
      { url: `${siteUrl}/arena/${arena.slug}/submit`, lastModified: updatedAt },
      { url: `${siteUrl}/arena/${arena.slug}/leaderboard`, lastModified: updatedAt }
    ];
  });

  return [
    { url: `${siteUrl}/`, lastModified: new Date().toISOString() },
    { url: `${siteUrl}/admin`, lastModified: new Date().toISOString() },
    ...arenaEntries
  ];
}
