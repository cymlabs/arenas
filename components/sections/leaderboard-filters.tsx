'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

export function LeaderboardFilters({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tag, setTag] = useState(searchParams.get('tag') ?? '');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'elo');

  useEffect(() => {
    setTag(searchParams.get('tag') ?? '');
    setSort(searchParams.get('sort') ?? 'elo');
  }, [searchParams]);

  const applyFilters = () => {
    const params = new URLSearchParams(searchParams.toString());
    tag ? params.set('tag', tag) : params.delete('tag');
    sort ? params.set('sort', sort) : params.delete('sort');
    params.delete('page');
    router.push(`/arena/${slug}/leaderboard?${params.toString()}`);
  };

  return (
    <div className="flex flex-col gap-3 md:flex-row md:items-end">
      <div className="flex-1">
        <label className="text-xs uppercase tracking-[0.2em] text-white/60">Filter by tag</label>
        <input
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm outline-none focus:border-aurora"
          placeholder="cyber, neon, architecture"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
      </div>
      <div>
        <label className="text-xs uppercase tracking-[0.2em] text-white/60">Sort</label>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm"
        >
          <option value="elo">Elo (desc)</option>
          <option value="recent">Most recent</option>
        </select>
      </div>
      <div>
        <Button onClick={applyFilters} className="w-full md:w-auto">
          Apply
        </Button>
      </div>
    </div>
  );
}
