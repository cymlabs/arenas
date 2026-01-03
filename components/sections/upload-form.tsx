'use client';

import { useSupabase } from '@/components/providers/supabase-provider';
import { Button } from '../ui/button';
import { useEffect, useMemo, useState, useTransition } from 'react';
import { createSubmission } from '@/app/actions/submissions';
import { useRouter } from 'next/navigation';
import { ToastViewport, useToast } from '../ui/toast';
import { Spinner } from '../ui/spinner';
import Image from 'next/image';

type UploadFormProps = { arenaSlug: string; disabled?: boolean };

export function UploadForm({ arenaSlug, disabled }: UploadFormProps) {
  const supabase = useSupabase();
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [tags, setTags] = useState('');
  const [pending, startTransition] = useTransition();
  const [status, setStatus] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const { toast, push, clear } = useToast();

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  const canSubmit = useMemo(() => !disabled && !!file && !pending, [disabled, file, pending]);

  const validateFile = async (incoming: File) => {
    if (!incoming.type?.startsWith('image/')) {
      throw new Error('Please choose an image file.');
    }

    if (incoming.size > 5 * 1024 * 1024) {
      throw new Error('Max file size is 5MB.');
    }

    const objectUrl = URL.createObjectURL(incoming);
    const dimensions = await new Promise<{ width: number; height: number }>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.onerror = () => reject(new Error('Unable to read image.'));
      img.src = objectUrl;
    });

    if (dimensions.width < 512 || dimensions.height < 512) {
      URL.revokeObjectURL(objectUrl);
      throw new Error('Image must be at least 512x512.');
    }

    setPreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return objectUrl;
    });
    return incoming;
  };

  const onFileChange = async (incoming: File | null) => {
    setError(null);
    setStatus('');
    if (!incoming) {
      setFile(null);
      setPreview(null);
      return;
    }

    try {
      const validated = await validateFile(incoming);
      setFile(validated);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unable to use this file.';
      setError(message);
      push({ message, tone: 'error' });
      setFile(null);
    }
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file || disabled) return;
    setError(null);
    setStatus('Uploading to Supabase storage...');

    const fileExt = file.name.includes('.') ? file.name.split('.').pop() : 'jpg';
    const path = `${arenaSlug}/${crypto.randomUUID()}.${fileExt}`;
    const { error: uploadError, data } = await supabase.storage.from('images').upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (uploadError) {
      const message = uploadError.message || 'Upload failed';
      setError(message);
      push({ message, tone: 'error' });
      setStatus('');
      return;
    }

    const {
      data: { publicUrl }
    } = supabase.storage.from('images').getPublicUrl(data.path);

    setStatus('Finalizing submission...');

    startTransition(async () => {
      try {
        await createSubmission({ arenaSlug, imageUrl: publicUrl, tags: tags.split(',').map((t) => t.trim()) });
        push({ message: 'Submission created! Redirecting…', tone: 'success' });
        router.refresh();
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unable to create submission';
        setError(message);
        push({ message, tone: 'error' });
        setStatus('');
      }
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
          disabled={disabled}
          onChange={(e) => onFileChange(e.target.files?.[0] ?? null)}
          className="mt-2 w-full text-sm text-white/70 file:mr-3 file:rounded-lg file:border-0 file:bg-aurora/20 file:px-4 file:py-2 file:text-white disabled:cursor-not-allowed disabled:opacity-50"
        />
        {preview && (
          <div className="relative mt-3 h-56 overflow-hidden rounded-xl border border-white/10">
            <Image src={preview} alt="preview" fill className="object-cover" unoptimized />
          </div>
        )}
      </div>
      <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
        <label className="block text-sm text-white/70">Tags (comma separated)</label>
        <input
          type="text"
          value={tags}
          disabled={disabled}
          onChange={(e) => setTags(e.target.value)}
          placeholder="cyber, neon, architecture"
          className="mt-2 w-full rounded-lg border border-white/10 bg-black/20 px-4 py-3 text-sm outline-none focus:border-aurora disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>
      <Button type="submit" disabled={!canSubmit} className="w-full">
        {pending ? (
          <span className="inline-flex items-center justify-center gap-2">
            <Spinner className="h-4 w-4" /> Submitting
          </span>
        ) : disabled ? (
          'Uploads paused'
        ) : (
          'Submit to arena'
        )}
      </Button>
      <div className="space-y-1 text-xs">
        {status && <p className="text-white/60">{status}</p>}
        {error && <p className="text-rose-300">{error}</p>}
        <p className="text-white/50">Max 5MB, minimum 512x512. Use high quality, non-scraped visuals.</p>
      </div>
      <ToastViewport toast={toast} clear={clear} />
    </form>
  );
}
