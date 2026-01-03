import Link from 'next/link';
import { Metadata } from 'next';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { Panel } from '@/components/ui/panel';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import { notFound } from 'next/navigation';
import { ShareButton } from '@/components/ui/share-button';
import Image from 'next/image';

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase
    .from('arenas')
    .select('name, description')
    .eq('slug', params.slug)
    .maybeSingle();

  if (!arena) {
    return {
      title: 'Arena not found | ARENAS'
    };
  }

  return {
    title: `${arena.name} | ARENAS`,
    description: arena.description || 'Battle, submit, and climb the leaderboard.'
  };
}

export default async function ArenaHub({ params }: { params: { slug: string } }) {
  const supabase = createSupabaseServerClient();
  const { data: arena } = await supabase.from('arenas').select('*').eq('slug', params.slug).single();

  if (!arena) {
    notFound();
  }

  const { data: recentSubmissions } = await supabase
    .from('submissions')
    .select('id, image_url, tags, created_at, user_id')
    .eq('arena_id', arena.id)
    .order('created_at', { ascending: false })
    .limit(6);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">{arena?.scope_type}</p>
          <h1 className="text-3xl font-semibold">{arena?.name}</h1>
          <p className="text-white/60">{arena?.description}</p>
          {arena?.status === 'maintenance' && (
            <p className="text-sm text-amber-300/90">This arena is in maintenance mode. Battles are temporarily paused.</p>
          )}
        </div>
        <div className="flex gap-2">
          <Link href={`/arena/${params.slug}/battle`} className={cn(buttonVariants({}))}>
            Enter battle
          </Link>
          <Link
            href={`/arena/${params.slug}/submit`}
            className={cn(buttonVariants({ variant: 'ghost' }))}
          >
            Upload
          </Link>
          <ShareButton url={`${process.env.NEXT_PUBLIC_SITE_URL ?? ''}/arena/${params.slug}`} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3">
        <Panel className="p-5">
          <h3 className="text-lg font-semibold">Battle</h3>
          <p className="text-sm text-white/60">Swipe or tap to vote between two submissions.</p>
          <Link href={`/arena/${params.slug}/battle`} className="mt-3 inline-flex items-center gap-2 text-aurora">
            Launch <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
        <Panel className="p-5">
          <h3 className="text-lg font-semibold">Submit</h3>
          <p className="text-sm text-white/60">Upload your best shot to enter the arena.</p>
          <Link href={`/arena/${params.slug}/submit`} className="mt-3 inline-flex items-center gap-2 text-aurora">
            Upload <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
        <Panel className="p-5">
          <h3 className="text-lg font-semibold">Leaderboard</h3>
          <p className="text-sm text-white/60">Track Elo, wins, losses, and streaks.</p>
          <Link href={`/arena/${params.slug}/leaderboard`} className="mt-3 inline-flex items-center gap-2 text-aurora">
            View <ArrowRight className="h-4 w-4" />
          </Link>
        </Panel>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Fresh submissions</h2>
          <Link href={`/arena/${params.slug}/submit`} className="text-sm text-aurora hover:text-white">
            Add yours
          </Link>
        </div>
        {recentSubmissions?.length ? (
          <div className="grid gap-4 md:grid-cols-3">
            {recentSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/5"
              >
                <div className="relative h-48 w-full">
                  <Image
                    src={submission.image_url}
                    alt={submission.tags?.join(', ') ?? 'Submission preview'}
                    fill
                    className="object-cover"
                    sizes="(min-width: 768px) 33vw, 100vw"
                  />
                </div>
                <div className="flex items-center justify-between px-3 py-2 text-xs text-white/70">
                  <span>By {submission.user_id?.slice(0, 6) ?? 'anon'}</span>
                  {submission.tags?.length ? <span className="text-white/50">{submission.tags.join(', ')}</span> : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Panel className="p-4 text-sm text-white/60">No submissions yet. Be the first to upload.</Panel>
        )}
      </div>
    </div>
  );
}
