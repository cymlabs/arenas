import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Panel } from '@/components/ui/panel';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { LeaderboardFilters } from '@/components/sections/leaderboard-filters';
import type { ReactNode } from 'react';
import { EmptyState } from '@/components/ui/empty-state';
import Image from 'next/image';

const PLACEHOLDER_IMAGE =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="128" height="128" viewBox="0 0 128 128" role="img" aria-label="placeholder"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%25" stop-color="%236EE7FF" stop-opacity="0.35"/><stop offset="100%25" stop-color="%239E7BFF" stop-opacity="0.35"/></linearGradient></defs><rect width="128" height="128" fill="%230B0F1A"/><rect x="8" y="8" width="112" height="112" rx="18" fill="url(%23g)" opacity="0.65"/><text x="50%25" y="52%25" text-anchor="middle" font-family="Sora,sans-serif" font-size="18" fill="%23FFFFFF" fill-opacity="0.55">ARENA</text><text x="50%25" y="68%25" text-anchor="middle" font-family="Sora,sans-serif" font-size="12" fill="%23FFFFFF" fill-opacity="0.45">preview</text></svg>';

export default async function LeaderboardPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase.from('arenas').select('id, name, status').eq('slug', params.slug).maybeSingle();
  if (!arena) notFound();

  const page = Math.max(1, Number(searchParams.page ?? '1'));
  const tag = typeof searchParams.tag === 'string' ? searchParams.tag.trim() : '';
  const sort = searchParams.sort === 'recent' ? 'recent' : 'elo';
  const pageSize = 10;
  const start = (page - 1) * pageSize;
  const end = start + pageSize - 1;

  let query = supabase
    .from('ratings')
    .select('submission_id, elo, wins, losses, streak, submissions(image_url, user_id, tags, created_at)', { count: 'exact' })
    .eq('arena_id', arena.id);

  if (tag) {
    query = query.contains('tags', [tag], { foreignTable: 'submissions' });
  }

  if (sort === 'recent') {
    query = query.order('created_at', { foreignTable: 'submissions', ascending: false });
  } else {
    query = query.order('elo', { ascending: false });
  }

  const { data: leaderboard, count } = await query.range(start, end);
  const total = count ?? 0;
  const startDisplay = total === 0 ? 0 : start + 1;
  const endDisplay = total === 0 ? 0 : Math.min(end + 1, total);

  return (
    <Panel className="space-y-5 p-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Leaderboard</p>
        <h1 className="text-2xl font-semibold">{arena.name}</h1>
        {arena.status === 'maintenance' && (
          <p className="text-sm text-amber-300/90">Arena is in maintenance; rankings may be delayed.</p>
        )}
      </div>
      <LeaderboardFilters slug={params.slug} />
      <div className="space-y-3">
        {leaderboard?.length ? (
          leaderboard.map((row, index) => (
            <div
              key={row.submission_id}
              className="flex items-center gap-4 rounded-2xl border border-white/5 bg-white/5 p-3"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-aurora/30 to-plasma/30 text-lg font-semibold">
                #{start + index + 1}
              </div>
              <div className="relative h-16 w-16 overflow-hidden rounded-xl">
                <Image
                  src={row.submissions?.image_url || PLACEHOLDER_IMAGE}
                  alt={row.submissions?.tags?.join(', ') || 'Leaderboard preview'}
                  fill
                  className="object-cover"
                  sizes="64px"
                />
              </div>
              <div className="flex flex-1 items-center justify-between">
                <div>
                  <p className="text-sm text-white/60">User {row.submissions?.user_id?.slice(0, 6) ?? 'anon'}</p>
                  <p className="text-lg font-semibold">Elo {row.elo}</p>
                  {row.submissions?.tags?.length ? (
                    <p className="text-xs text-white/50">Tags: {row.submissions.tags.join(', ')}</p>
                  ) : null}
                </div>
                <div className="text-right text-sm text-white/60">
                  <p>Wins {row.wins}</p>
                  <p>Losses {row.losses}</p>
                  <p>Streak {row.streak}</p>
                </div>
              </div>
            </div>
          ))
        ) : (
          <EmptyState
            title="Leaderboard warming up"
            description="No submissions have battled here yet. Upload artwork to start ranking."
            actionHref={`/arena/${params.slug}/submit`}
            actionLabel="Upload now"
          />
        )}
      </div>
      <div className="flex items-center justify-between text-sm text-white/60">
        <span>
          Showing {startDisplay} - {endDisplay} of {total}
        </span>
        <div className="flex gap-2">
          <PaginationLink slug={params.slug} page={page - 1} disabled={page <= 1} searchParams={searchParams}>
            Previous
          </PaginationLink>
          <PaginationLink
            slug={params.slug}
            page={page + 1}
            disabled={!!count && end + 1 >= count}
            searchParams={searchParams}
          >
            Next
          </PaginationLink>
        </div>
      </div>
    </Panel>
  );
}

function PaginationLink({
  slug,
  page,
  disabled,
  searchParams,
  children
}: {
  slug: string;
  page: number;
  disabled?: boolean;
  searchParams: { [key: string]: string | string[] | undefined };
  children: ReactNode;
}) {
  const params = new URLSearchParams();
  Object.entries(searchParams).forEach(([key, value]) => {
    if (typeof value === 'string') params.set(key, value);
  });
  params.set('page', String(page));

  if (disabled) {
    return <span className="rounded-full border border-white/10 px-4 py-2 opacity-40">{children}</span>;
  }

  return (
    <Link href={`/arena/${slug}/leaderboard?${params.toString()}`} className="rounded-full border border-white/10 px-4 py-2">
      {children}
    </Link>
  );
}
