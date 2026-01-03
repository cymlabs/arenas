import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Panel } from '@/components/ui/panel';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="placeholder"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%236EE7FF" stop-opacity="0.35"/><stop offset="100%25" stop-color="%239E7BFF" stop-opacity="0.35"/></linearGradient></defs><rect width="128" height="128" fill="%230B0F1A"/><rect x="8" y="8" width="112" height="112" rx="18" fill="url(%23g)" opacity="0.65"/><text x="50%25" y="52%25" text-anchor="middle" font-family="Sora,sans-serif" font-size="18" fill="%23FFFFFF" fill-opacity="0.55">ARENA</text><text x="50%25" y="68%25" text-anchor="middle" font-family="Sora,sans-serif" font-size="12" fill="%23FFFFFF" fill-opacity="0.45">preview</text></svg>';

export default async function LeaderboardPage({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase.from('arenas').select('id, name').eq('slug', params.slug).single();
  if (!arena) return null;

  const { data: leaderboard } = await supabase
    .from('ratings')
    .select('submission_id, elo, wins, losses, streak, submissions(image_url, user_id)')
    .eq('arena_id', arena.id)
    .order('elo', { ascending: false });

  return (
    <Panel className="p-6 space-y-4">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Leaderboard</p>
        <h1 className="text-2xl font-semibold">{arena.name}</h1>
      </div>
      <div className="space-y-3">
        {leaderboard?.map((row, index) => (
          <div
            key={row.submission_id}
            className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aurora/30 to-plasma/30 text-lg font-semibold">
              #{index + 1}
            </div>
            <img
              src={row.submissions?.image_url || PLACEHOLDER_IMAGE}
              alt="thumb"
              className="h-16 w-16 rounded-xl object-cover"
            />
            <div className="flex flex-1 items-center justify-between">
              <div>
                <p className="text-sm text-white/60">User {row.submissions?.user_id?.slice(0, 6) ?? 'anon'}</p>
                <p className="text-lg font-semibold">Elo {row.elo}</p>
              </div>
              <div className="text-right text-sm text-white/60">
                <p>Wins {row.wins}</p>
                <p>Losses {row.losses}</p>
                <p>Streak {row.streak}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}
