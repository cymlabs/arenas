'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Plus, Search } from 'lucide-react';
import { Panel } from '@/components/ui/panel';
import { formatDate } from '@/lib/utils';
import { EmptyState } from '@/components/ui/empty-state';

export type ArenaListItem = {
  id: string;
  name: string;
  slug: string;
  scope_type: string | null;
  description: string | null;
  created_at: string;
};

export function ArenaList({ arenas }: { arenas: ArenaListItem[] }) {
  const [query, setQuery] = useState('');
  const [scope, setScope] = useState<string>('all');

  const scopes = useMemo(
    () => ['all', ...Array.from(new Set(arenas.map((arena) => arena.scope_type).filter(Boolean)))] as string[],
    [arenas]
  );

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return arenas.filter((arena) => {
      const matchesScope = scope === 'all' || arena.scope_type === scope;
      const matchesQuery = !normalized
        ? true
        : `${arena.name} ${arena.description ?? ''} ${arena.scope_type ?? ''}`.toLowerCase().includes(normalized);
      return matchesScope && matchesQuery;
    });
  }, [arenas, query, scope]);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-1 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
          <Search className="h-4 w-4 text-white/50" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search arenas by name, description, or scope"
            className="w-full bg-transparent text-sm text-white placeholder:text-white/40 focus:outline-none"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          {scopes.map((option) => (
            <button
              key={option}
              onClick={() => setScope(option)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                scope === option
                  ? 'border-aurora/50 bg-aurora/10 text-white'
                  : 'border-white/10 bg-white/5 text-white/60 hover:text-white'
              }`}
            >
              {option === 'all' ? 'All scopes' : option}
            </button>
          ))}
        </div>
      </div>
      <p className="text-xs uppercase tracking-[0.3em] text-white/50">
        Showing {filtered.length} of {arenas.length} arenas
      </p>
      <div className="grid gap-4 md:grid-cols-2">
        {filtered.length ? (
          filtered.map((arena) => (
            <Link key={arena.id} href={`/arena/${arena.slug}`}>
              <Panel className="h-full p-6 transition-transform hover:-translate-y-1 hover:shadow-neon">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-white/50">{arena.scope_type ?? 'General'}</p>
                    <h3 className="text-xl font-semibold">{arena.name}</h3>
                    <p className="text-sm text-white/60 line-clamp-2">{arena.description}</p>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/60">
                    {formatDate(arena.created_at)}
                  </span>
                </div>
                <div className="mt-4 flex items-center gap-2 text-sm text-aurora">
                  Enter arena <Plus className="h-4 w-4" />
                </div>
              </Panel>
            </Link>
          ))
          ) : (
            <div className="md:col-span-2">
              <EmptyState
                title="No matching arenas"
                description="Try clearing filters or creating a new arena tailored to your vibe."
              />
            </div>
          )}
        </div>
      </div>
  );
}
