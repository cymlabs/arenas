'use client';

import { useState } from 'react';
import { Panel } from '@/components/ui/panel';
import { Button } from '@/components/ui/button';

const defaultConfig = {
  kFactor: 32,
  minSubmissions: 2,
  maxPairsPerSession: 20
};

export default function AdminPage() {
  const [config, setConfig] = useState(defaultConfig);
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.3em] text-white/50">Admin</p>
        <h1 className="text-3xl font-semibold">Algorithm controls</h1>
        <p className="text-white/60">Adjust Elo aggression and battle pacing. Values persist via database hooks later.</p>
      </div>
      <Panel className="p-6 space-y-4">
        <div>
          <label className="text-sm text-white/70">Elo K Factor</label>
          <input
            type="range"
            min={8}
            max={64}
            value={config.kFactor}
            onChange={(e) => setConfig({ ...config, kFactor: Number(e.target.value) })}
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
            onChange={(e) => setConfig({ ...config, minSubmissions: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-white/60">Current: {config.minSubmissions}</p>
        </div>
        <div>
          <label className="text-sm text-white/70">Max pairs per session</label>
          <input
            type="range"
            min={10}
            max={50}
            value={config.maxPairsPerSession}
            onChange={(e) => setConfig({ ...config, maxPairsPerSession: Number(e.target.value) })}
            className="w-full"
          />
          <p className="text-xs text-white/60">Current: {config.maxPairsPerSession}</p>
        </div>
        <Button className="w-full">Persist (coming soon)</Button>
      </Panel>
    </div>
  );
}
