'use client';

import { useEffect, useState, useTransition } from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';
import { DEFAULT_ALGO_CONFIG, type AlgorithmConfig } from '@/lib/config';
import { getAdminConfig, saveAdminConfig } from '@/app/actions/admin';
import { ToastViewport, useToast } from '@/components/ui/toast';

export default function AdminPage() {
  const [config, setConfig] = useState<AlgorithmConfig>(DEFAULT_ALGO_CONFIG);
  const [loading, setLoading] = useState(true);
  const [pending, startTransition] = useTransition();
  const { toast, push, clear } = useToast();

  useEffect(() => {
    getAdminConfig()
      .then((data) => setConfig(data))
      .catch(() => push({ message: 'Falling back to default algorithm settings.', tone: 'error' }))
      .finally(() => setLoading(false));
  }, [push]);

  const onSave = () => {
    startTransition(async () => {
      try {
        const saved = await saveAdminConfig(config);
        setConfig(saved);
        push({ message: 'Algorithm settings saved.', tone: 'success' });
      } catch (err) {
        push({
          message: err instanceof Error ? err.message : 'Unable to persist settings right now.',
          tone: 'error'
        });
      }
    });
  };

  const update = (partial: Partial<AlgorithmConfig>) => setConfig((prev) => ({ ...prev, ...partial }));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Admin</p>
        <h1 className="text-3xl font-semibold">Algorithm controls</h1>
        <p className="text-white/60">Adjust Elo aggression and battle pacing. Values persist to Supabase.</p>
      </div>
      <Panel className="space-y-4 p-6">
        <div>
          <label className="text-sm text-white/70">Elo K Factor</label>
          <input
            type="range"
            min={8}
            max={64}
            value={config.kFactor}
            disabled={loading}
            onChange={(e) => update({ kFactor: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-white/60">Current: {config.kFactor}</p>
        </div>
        <div>
          <label className="text-sm text-white/70">Minimum submissions to start battles</label>
          <input
            type="range"
            min={2}
            max={10}
            value={config.minSubmissions}
            disabled={loading}
            onChange={(e) => update({ minSubmissions: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-white/60">Current: {config.minSubmissions}</p>
        </div>
        <div>
          <label className="text-sm text-white/70">Max pairs per session</label>
          <input
            type="range"
            min={10}
            max={100}
            value={config.maxPairsPerSession}
            disabled={loading}
            onChange={(e) => update({ maxPairsPerSession: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-white/60">Current: {config.maxPairsPerSession}</p>
        </div>
        <Button className="w-full" onClick={onSave} disabled={pending || loading}>
          {pending ? 'Saving...' : 'Persist to Supabase'}
        </Button>
        <p className="text-center text-xs text-white/50">
          Settings live in the `admin_settings` table under the `algorithm` key. RLS should allow authenticated admins to write.
        </p>
      </Panel>
      <ToastViewport toast={toast} clear={clear} />
    </div>
  );
}
