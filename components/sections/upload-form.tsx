'use client';

import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '../ui/button';
import { useState, useTransition } from 'react';
import { createSubmission } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';

export function UploadForm({ arenaSlug }: { arenaSlug: string }) {
  const supabase = useSupabase();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState('');

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) return;
    setStatus('Uploading to Supabase storage...');

    const fileExt = file.name.split('.').pop();
    const path = `${arenaSlug}/${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage.from('images').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadError) {
      setStatus(uploadError.message);
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('images').getPublicUrl(data.path);

    startTransition(async () => {
      await createSubmission({ arenaSlug, imageUrl: publicUrl, tags: tags.split(',').map((t) => t.trim()) });
      router.refresh();
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="block text-sm text-white/70">Image file</label>
        <input
          type="file"
          accept="image/*"
          required
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="mt-2 w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-aurora/20 file:px-4 file:py-2 file:text-white"
        />
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="block text-sm text-white/70">Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          onChange={(e) => setTags(e.target.value)}
          placeholder="cyber, neon, architecture"
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-aurora"
        />
      </div>
      <Button type="submit" disabled={pending || !file} className="w-full">
        {pending ? 'Submitting...' : 'Submit to arena'}
      </Button>
      {status && <p className="text-xs text-white/60">{status}</p>}
    </form>
  );
}
