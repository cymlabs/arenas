'use client';

/**
 * Stance Demo Page - Showcase all Stance × Mindshare Engine components
 * 
 * This page loads demo data and displays:
 * - Voice Stance Cards
 * - Voice Compare View
 * - Topic Radar View
 * - Stance Ring indicators
 */

import React, { useEffect, useState } from 'react';
import { useStanceStore } from '@/lib/stanceStore';
import { VoiceStanceCard, VoiceCompareView, TopicRadarView } from '@/components/stance';
import GlobeViz from '@/components/visualizations/GlobeViz';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { PageHeader } from '@/components/ui/PremiumComponents';

export default function StanceDemoPage() {
    const [mounted, setMounted] = useState(false);
    const {
        loadDemoData,
        dataLoaded,
        voices,
        topics,
        selectedTopicId,
        setSelectedTopic,
        comparedVoiceIds,
        addToCompare,
        removeFromCompare,
        flipEvents,
        timeWindow,
        setTimeWindow,
    } = useStanceStore();

    // Load demo data on mount
    useEffect(() => {
        setMounted(true);
        if (!dataLoaded) {
            loadDemoData();
        }
    }, [dataLoaded, loadDemoData]);

    if (!mounted || !dataLoaded) {
        return (
            <div className="stance-demo stance-demo--loading">
                <div className="loading-spinner" />
                <p>Loading Stance × Mindshare Engine...</p>
            </div>
        );
    }

    // Get some interesting voices (those with flips)
    const voicesWithFlips = voices.filter(v =>
        flipEvents.some(f => f.voice_id === v.voice_id)
    );
    const featuredVoices = voicesWithFlips.length > 0
        ? voicesWithFlips.slice(0, 3)
        : voices.slice(0, 3);

    return (
        <div className="min-h-screen bg-black text-white premium-grid-bg">
            {/* Animated gradient mesh background */}
            <div className="animated-gradient-mesh" />

            <MainNavigation />

            <main className="pt-24 px-6 pb-24 max-w-7xl mx-auto space-y-12">
                <PageHeader
                    title="Stance × Mindshare Engine"
                    description="Global intelligence platform tracking voice stances, stance flips, and attention shifts in real-time."
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Stance Engine' }
                    ]}
                />

                {/* Premium Globe Visualization - Front and Center */}
                <section className="relative rounded-3xl overflow-hidden border border-white/10 bg-black/40 backdrop-blur-sm shadow-2xl">
                    <div className="absolute top-4 left-6 z-10">
                        <h2 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            Global Monitor
                        </h2>
                    </div>
                    <div className="h-[600px] w-full">
                        <GlobeViz
                            width={1200}
                            height={600}
                            onVoiceClick={(voiceId) => addToCompare(voiceId)}
                        />
                    </div>
                </section>

                {/* Controls & Stats */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                    <div className="lg:col-span-3 p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                        <div className="flex flex-wrap gap-6 items-end">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Target Topic</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                                    value={selectedTopicId || ''}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                >
                                    {topics.map(t => (
                                        <option key={t.topic_id} value={t.topic_id}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Time Window</label>
                                <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
                                    {(['24h', '7d', '30d'] as const).map(tw => (
                                        <button
                                            key={tw}
                                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${timeWindow === tw
                                                ? 'bg-violet-500/20 text-violet-300 shadow-sm'
                                                : 'text-white/40 hover:text-white'
                                                }`}
                                            onClick={() => setTimeWindow(tw)}
                                        >
                                            {tw}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-2 flex-1 min-w-[200px]">
                                <label className="text-xs font-semibold text-white/40 uppercase tracking-wider">Compare Voices</label>
                                <select
                                    className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white focus:ring-2 focus:ring-violet-500/50 outline-none"
                                    onChange={(e) => {
                                        if (e.target.value) addToCompare(e.target.value);
                                        e.target.value = '';
                                    }}
                                >
                                    <option value="">+ Add voice...</option>
                                    {voices.filter(v => !comparedVoiceIds.includes(v.voice_id)).slice(0, 20).map(v => (
                                        <option key={v.voice_id} value={v.voice_id}>{v.display_name}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {comparedVoiceIds.length > 0 && (
                            <div className="mt-4 flex flex-wrap gap-2">
                                {comparedVoiceIds.map(id => {
                                    const voice = voices.find(v => v.voice_id === id);
                                    return (
                                        <span key={id} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-xs text-violet-300">
                                            {voice?.display_name}
                                            <button onClick={() => removeFromCompare(id)} className="hover:text-white transition-colors">×</button>
                                        </span>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Stats */}
                    <div className="lg:col-span-1 grid grid-cols-2 gap-4">
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">{voices.length}</span>
                            <span className="text-xs text-white/40 uppercase">Voices</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center">
                            <span className="text-3xl font-bold text-white">{flipEvents.length}</span>
                            <span className="text-xs text-white/40 uppercase">Flips</span>
                        </div>
                        <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06] flex flex-col items-center justify-center col-span-2">
                            <span className="text-3xl font-bold text-white">{topics.length}</span>
                            <span className="text-xs text-white/40 uppercase">Active Topics</span>
                        </div>
                    </div>
                </div>

                {/* Main Visualization Grid */}
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                    {/* Topic Radar */}
                    {selectedTopicId && (
                        <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-violet-400">●</span> Stance Radar
                            </h2>
                            <TopicRadarView
                                topicId={selectedTopicId}
                                onVoiceClick={(voiceId) => addToCompare(voiceId)}
                            />
                        </section>
                    )}

                    {/* Comparison View */}
                    {comparedVoiceIds.length >= 2 && selectedTopicId && (
                        <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                            <h2 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <span className="text-blue-400">●</span> Trajectory Comparison
                            </h2>
                            <VoiceCompareView
                                topicId={selectedTopicId}
                                voiceIds={comparedVoiceIds}
                                width={600}
                                height={400}
                            />
                        </section>
                    )}
                </div>

                {/* Cards Section */}
                <section>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-bold text-white">Recent Stance Flips</h2>
                        <button className="text-sm text-violet-400 hover:text-violet-300 transition-colors">View All Analysis →</button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {featuredVoices.map(voice => (
                            <div key={voice.voice_id} className="transform hover:-translate-y-1 transition-transform duration-300">
                                <VoiceStanceCard
                                    voiceId={voice.voice_id}
                                    topicId={selectedTopicId || topics[0]?.topic_id || ''}
                                    width={400}
                                    height={280}
                                />
                            </div>
                        ))}
                    </div>
                </section>

                {/* Flip Feed */}
                <section className="p-6 rounded-2xl bg-white/[0.02] border border-white/[0.06]">
                    <h2 className="text-xl font-bold text-white mb-6">Intelligence Feed</h2>
                    <div className="space-y-4">
                        {flipEvents.slice(0, 5).map(flip => {
                            const voice = voices.find(v => v.voice_id === flip.voice_id);
                            const topic = topics.find(t => t.topic_id === flip.topic_id);
                            return (
                                <div key={flip.id} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold ${flip.delta_stance > 0 ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                                        }`}>
                                        {flip.delta_stance > 0 ? '↑' : '↓'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-baseline justify-between mb-1">
                                            <h4 className="font-bold text-white">{voice?.display_name}</h4>
                                            <span className="text-xs text-white/40">{new Date(flip.t0).toLocaleDateString()}</span>
                                        </div>
                                        <p className="text-sm text-white/60">
                                            Significant shift on <span className="text-white font-medium">{topic?.label}</span>
                                            {' '}<span className="text-white/30">•</span>{' '}
                                            <span className="font-mono text-xs opacity-70">{flip.stance_before.toFixed(2)} → {flip.stance_after.toFixed(2)}</span>
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>
            </main>
        </div>
    );
}
