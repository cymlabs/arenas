'use client';

import { useState, useEffect, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MainNavigation } from '@/components/layout/MainNavigation';
import type { GlobePoint } from '@/components/visualizations/HolographicGlobe';
import {
    RedditIcon,
    HackerNewsIcon,
    GitHubIcon,
    WikipediaIcon,
    GlobeIcon,
    TrendingUpIcon,
    TrendingDownIcon,
    FilterIcon,
    ChartIcon,
    ZapIcon,
    getPlatformIcon,
    platformColors,
    categoryColors
} from '@/components/ui/Icons';

// Dynamic import for 3D globe (client-side only)
const HolographicGlobe = dynamic(
    () => import('@/components/visualizations/HolographicGlobe').then(mod => mod.HolographicGlobe),
    { ssr: false, loading: () => <GlobeLoader /> }
);

interface UnifiedItem {
    id: string;
    platform: string;
    title: string;
    url: string;
    author?: string;
    authorAvatar?: string;
    thumbnail?: string;
    score: number;
    engagement: number;
    sentiment: number;
    created: string;
    category: string;
    lat?: number;
    lng?: number;
    region?: string;
    metadata?: Record<string, unknown>;
}

interface AggregatedData {
    items: UnifiedItem[];
    platforms: Record<string, {
        count: number;
        avgSentiment: number;
        topItem?: string;
    }>;
    trendingTopics: Array<{ word: string; count: number; platforms: string[] }>;
    geoPoints: Array<{ lat: number; lng: number; label: string; value: number; platform: string }>;
    stats: {
        totalItems: number;
        totalPlatforms: number;
        avgSentiment: number;
        fetchedAt: string;
    };
}

// Globe loader
function GlobeLoader() {
    return (
        <div className="relative overflow-hidden rounded-2xl bg-black border border-white/[0.08]" style={{ height: 400 }}>
            <div className="absolute inset-0 flex items-center justify-center">
                <div className="relative w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-2 border-blue-500/20" />
                    <div className="absolute inset-4 rounded-full border border-blue-500/30 animate-spin" style={{ animationDuration: '3s' }} />
                    <div className="absolute inset-8 rounded-full border border-blue-500/40 animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }} />
                    <div className="absolute inset-12 rounded-full bg-blue-500/10 animate-pulse" />
                </div>
                <div className="absolute bottom-8 text-center">
                    <div className="text-sm text-white/50">Initializing 3D Globe</div>
                    <div className="text-xs text-white/30 mt-1">Loading WebGL...</div>
                </div>
            </div>
        </div>
    );
}

// Skeleton loader
function Skeleton({ className = '', height }: { className?: string; height?: number }) {
    return (
        <div
            className={`animate-pulse bg-white/5 rounded-xl ${className}`}
            style={{ height: height ? `${height}px` : undefined }}
        />
    );
}

export default function TrendsPage() {
    const router = useRouter();
    const [data, setData] = useState<AggregatedData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>([]);
    const [globeExpanded, setGlobeExpanded] = useState(false);

    // Fetch aggregated data
    useEffect(() => {
        async function fetchAggregatedData() {
            setLoading(true);
            try {
                const response = await fetch('/api/aggregator');
                if (!response.ok) throw new Error('Failed to fetch data');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchAggregatedData();

        // Auto-refresh every 3 minutes
        const interval = setInterval(fetchAggregatedData, 180000);
        return () => clearInterval(interval);
    }, []);

    // Filter items by platform
    const filteredItems = useMemo(() => {
        if (!data?.items) return [];
        if (selectedPlatforms.length === 0) return data.items;
        return data.items.filter(item => selectedPlatforms.includes(item.platform));
    }, [data, selectedPlatforms]);

    // Globe points
    const globePoints: GlobePoint[] = useMemo(() => {
        if (!data?.geoPoints) return [];
        return data.geoPoints.map((p, i) => ({
            id: `geo-${i}`,
            label: p.label,
            lat: p.lat,
            lng: p.lng,
            value: p.value,
            category: p.platform,
            description: `${p.platform} • ${p.value.toLocaleString()} engagement`,
        }));
    }, [data]);

    // Cross-platform topics
    const crossPlatformTopics = useMemo(() => {
        if (!data?.trendingTopics) return [];
        return data.trendingTopics.filter(t => t.platforms.length >= 2);
    }, [data]);

    const togglePlatform = (platform: string) => {
        setSelectedPlatforms(prev =>
            prev.includes(platform)
                ? prev.filter(p => p !== platform)
                : [...prev, platform]
        );
    };

    // Get platform icon component
    const renderPlatformIcon = (platform: string, size = 16) => {
        const Icon = getPlatformIcon(platform);
        return <Icon size={size} className="opacity-80" />;
    };

    return (
        <div className="min-h-screen bg-black">
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <nav className="flex items-center gap-2 text-sm text-white/40 mb-4">
                        <button onClick={() => router.push('/dashboard')} className="hover:text-white/60 transition-colors">
                            Dashboard
                        </button>
                        <span>/</span>
                        <span className="text-white/60">Live Intelligence</span>
                    </nav>
                    <h1 className="text-3xl font-bold text-white mb-2">Live Intelligence Feed</h1>
                    <p className="text-white/50">
                        {data?.stats
                            ? `Aggregating ${data.stats.totalItems} items from ${data.stats.totalPlatforms} platforms`
                            : 'Real-time cultural intelligence from across the web'
                        }
                    </p>
                </div>

                {/* Platform Status Bar */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/80 to-slate-950/80 border border-white/[0.08]">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm text-white/70">Multi-Platform Feed</span>
                                <div className="h-4 w-px bg-white/10" />
                                <FilterIcon size={14} className="text-white/40" />
                            </div>

                            {/* Platform filters */}
                            <div className="flex flex-wrap gap-2">
                                {data?.platforms && Object.entries(data.platforms).map(([platform, stats]) => (
                                    <button
                                        key={platform}
                                        onClick={() => togglePlatform(platform)}
                                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedPlatforms.length === 0 || selectedPlatforms.includes(platform)
                                                ? 'bg-white/10 text-white border border-white/20'
                                                : 'bg-white/5 text-white/40 border border-white/5'
                                            }`}
                                        style={{
                                            borderColor: selectedPlatforms.includes(platform)
                                                ? platformColors[platform] + '60'
                                                : undefined
                                        }}
                                    >
                                        {renderPlatformIcon(platform, 14)}
                                        <span className="capitalize">{platform}</span>
                                        <span className="opacity-60">({stats.count})</span>
                                    </button>
                                ))}
                            </div>

                            {data?.stats && (
                                <span className="text-xs text-white/40">
                                    Updated {new Date(data.stats.fetchedAt).toLocaleTimeString()}
                                </span>
                            )}
                        </div>
                    </div>
                </motion.section>

                {/* 3D Holographic Globe */}
                <motion.section
                    className="mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-white">Global Activity</h2>
                            <p className="text-sm text-white/40">{globePoints.length} locations • Interactive 3D Globe</p>
                        </div>
                    </div>
                    <HolographicGlobe
                        points={globePoints}
                        height={globeExpanded ? 600 : 400}
                        expanded={globeExpanded}
                        onExpand={() => setGlobeExpanded(!globeExpanded)}
                        onPointClick={(point) => router.push(`/trends/${encodeURIComponent(point.label.toLowerCase().replace(/\s+/g, '-'))}`)}
                        autoRotate={true}
                    />
                </motion.section>

                {loading ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="lg:col-span-2 space-y-4">
                            <Skeleton height={40} />
                            {[1, 2, 3, 4, 5].map(i => <Skeleton key={i} height={100} />)}
                        </div>
                        <div className="space-y-4">
                            <Skeleton height={300} />
                        </div>
                    </div>
                ) : error ? (
                    <div className="p-8 rounded-2xl bg-slate-900/50 border border-white/10 text-center">
                        <div className="text-red-400 mb-4">Failed to load data: {error}</div>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-4 py-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Main Feed */}
                        <div className="lg:col-span-2">
                            <div className="flex items-center justify-between mb-4">
                                <div>
                                    <h2 className="text-lg font-semibold text-white">Live Feed</h2>
                                    <p className="text-sm text-white/40">{filteredItems.length} items across platforms</p>
                                </div>
                            </div>
                            <div className="space-y-3">
                                {filteredItems.slice(0, 25).map((item, index) => (
                                    <motion.a
                                        key={item.id}
                                        href={item.url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.02 }}
                                        className="group block"
                                    >
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06] hover:border-white/15 transition-all">
                                            <div className="flex items-start gap-4">
                                                {/* Platform indicator */}
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                                    style={{
                                                        backgroundColor: `${platformColors[item.platform] || '#3b82f6'}15`,
                                                        color: platformColors[item.platform] || '#3b82f6'
                                                    }}
                                                >
                                                    {renderPlatformIcon(item.platform, 18)}
                                                </div>

                                                {/* Content */}
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="font-medium text-white text-sm line-clamp-2 mb-1 group-hover:text-white/90">
                                                        {item.title}
                                                    </h4>
                                                    <div className="flex items-center gap-3 text-xs text-white/40">
                                                        <span
                                                            className="capitalize"
                                                            style={{ color: platformColors[item.platform] }}
                                                        >
                                                            {item.platform}
                                                        </span>
                                                        {item.author && <span>by {item.author}</span>}
                                                        <span className="flex items-center gap-1">
                                                            <ChartIcon size={12} />
                                                            {item.engagement.toLocaleString()}
                                                        </span>
                                                        <span className={`flex items-center gap-1 ${item.sentiment > 0.1 ? 'text-green-400' :
                                                                item.sentiment < -0.1 ? 'text-red-400' : ''
                                                            }`}>
                                                            {item.sentiment > 0.1 ? <TrendingUpIcon size={12} /> :
                                                                item.sentiment < -0.1 ? <TrendingDownIcon size={12} /> : null}
                                                            {item.sentiment.toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Category badge */}
                                                <div
                                                    className="px-2 py-1 rounded text-[10px] font-medium capitalize flex-shrink-0"
                                                    style={{
                                                        backgroundColor: `${categoryColors[item.category] || categoryColors.other}20`,
                                                        color: categoryColors[item.category] || categoryColors.other
                                                    }}
                                                >
                                                    {item.category}
                                                </div>
                                            </div>
                                        </div>
                                    </motion.a>
                                ))}
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            {/* Cross-Platform Trends */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <ZapIcon size={16} className="text-amber-400" />
                                    <h3 className="text-lg font-semibold text-white">Cross-Platform</h3>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                                    {crossPlatformTopics.length === 0 ? (
                                        <div className="text-sm text-white/40 text-center py-4">
                                            Analyzing cross-platform patterns...
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {crossPlatformTopics.slice(0, 10).map((topic, i) => (
                                                <button
                                                    key={topic.word}
                                                    onClick={() => router.push(`/trends/${topic.word}`)}
                                                    className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                                                >
                                                    <span className="text-lg font-bold text-white/20 w-6">{i + 1}</span>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-white text-sm capitalize truncate">{topic.word}</div>
                                                        <div className="flex gap-1 mt-1">
                                                            {topic.platforms.map(p => (
                                                                <span
                                                                    key={p}
                                                                    className="w-4 h-4 rounded flex items-center justify-center"
                                                                    style={{
                                                                        backgroundColor: `${platformColors[p]}20`,
                                                                        color: platformColors[p]
                                                                    }}
                                                                >
                                                                    {renderPlatformIcon(p, 10)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <span className="px-2 py-0.5 rounded-full bg-white/5 text-xs text-white/50">
                                                        {topic.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Platform Stats */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <ChartIcon size={16} className="text-blue-400" />
                                    <h3 className="text-lg font-semibold text-white">Platform Stats</h3>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                                    <div className="space-y-3">
                                        {data?.platforms && Object.entries(data.platforms).map(([platform, stats]) => (
                                            <div key={platform} className="flex items-center gap-3">
                                                <div
                                                    className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                    style={{
                                                        backgroundColor: `${platformColors[platform]}15`,
                                                        color: platformColors[platform]
                                                    }}
                                                >
                                                    {renderPlatformIcon(platform, 14)}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="font-medium text-white text-sm capitalize">{platform}</div>
                                                    <div className="text-xs text-white/40">
                                                        {stats.count} items
                                                    </div>
                                                </div>
                                                <div className={`text-sm font-mono ${stats.avgSentiment > 0.1 ? 'text-green-400' :
                                                        stats.avgSentiment < -0.1 ? 'text-red-400' : 'text-white/50'
                                                    }`}>
                                                    {stats.avgSentiment > 0 ? '+' : ''}{stats.avgSentiment.toFixed(2)}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* All Trending Topics */}
                            <div>
                                <div className="flex items-center gap-2 mb-4">
                                    <TrendingUpIcon size={16} className="text-green-400" />
                                    <h3 className="text-lg font-semibold text-white">Trending Topics</h3>
                                </div>
                                <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                                    <div className="flex flex-wrap gap-2">
                                        {data?.trendingTopics?.slice(0, 15).map(topic => (
                                            <button
                                                key={topic.word}
                                                onClick={() => router.push(`/trends/${topic.word}`)}
                                                className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70 hover:bg-white/10 hover:text-white transition-all"
                                            >
                                                {topic.word}
                                                <span className="ml-1 opacity-50">({topic.count})</span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
