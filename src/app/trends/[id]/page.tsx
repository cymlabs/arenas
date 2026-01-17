'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { GeoMap, MapPoint } from '@/components/visualizations/GeoMap';
import { SourceCard } from '@/components/cards/SourceCard';
import { PremiumCard, PremiumButton, PremiumBadge, PageHeader, SectionHeader, Skeleton } from '@/components/ui/PremiumComponents';

interface Source {
    platform: string;
    subreddit: string;
    title: string;
    score: number;
    comments: number;
    url: string;
    sentiment: number;
    created: string;
    thumbnail?: string;
    author?: string;
    domain?: string;
    isVideo?: boolean;
    videoUrl?: string;
}

interface GeoPoint {
    lat: number;
    lng: number;
    region: string;
    value: number;
    label: string;
    thumbnail?: string;
}

interface TrendDetail {
    id: string;
    name: string;
    frequency: number;
    mentions: number;
    sentiment: number;
    velocity: number;
    category: string;
    thumbnail?: string;
    geoPoints?: GeoPoint[];
    sources: Source[];
    relatedTopics: string[];
    lastUpdated: string;
}

export default function TrendDetailPage() {
    const params = useParams();
    const router = useRouter();
    const trendId = params.id as string;

    const [trend, setTrend] = useState<TrendDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wikiContext, setWikiContext] = useState<{ title: string; extract: string; thumbnail?: string; url?: string } | null>(null);
    const [mapExpanded, setMapExpanded] = useState(false);

    useEffect(() => {
        async function fetchTrend() {
            setLoading(true);
            try {
                const response = await fetch('/api/live');
                if (!response.ok) throw new Error('Failed to fetch trends');

                const data = await response.json();
                const foundTrend = data.topics.find((t: TrendDetail) => t.id === trendId);

                if (foundTrend) {
                    setTrend(foundTrend);

                    // Fetch Wikipedia context
                    try {
                        const wikiResponse = await fetch(
                            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(foundTrend.name)}`
                        );
                        if (wikiResponse.ok) {
                            const wikiData = await wikiResponse.json();
                            setWikiContext({
                                title: wikiData.title,
                                extract: wikiData.extract,
                                thumbnail: wikiData.thumbnail?.source,
                                url: wikiData.content_urls?.desktop?.page,
                            });
                        }
                    } catch {
                        console.log('No Wikipedia context found');
                    }
                } else {
                    setError('Trend not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchTrend();
    }, [trendId]);

    // Generate map points from geo data or sources
    const mapPoints: MapPoint[] = trend?.geoPoints?.map((geo, i) => ({
        id: `geo-${i}`,
        label: trend.name,
        lat: geo.lat,
        lng: geo.lng,
        value: geo.value,
        category: trend.category,
        description: `${geo.value.toLocaleString()} engagement in ${geo.region}`,
        thumbnail: geo.thumbnail || trend.thumbnail,
        trend: trend.velocity > 0.1 ? 'up' : trend.velocity < -0.1 ? 'down' : 'stable',
    })) || [];

    const categoryColors: Record<string, string> = {
        politics: '#ef4444',
        tech: '#3b82f6',
        culture: '#8b5cf6',
        media: '#f97316',
        social: '#ec4899',
        science: '#22c55e',
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <MainNavigation />
                <main className="pt-24 px-4 pb-20 max-w-5xl mx-auto">
                    <Skeleton height={80} className="mb-8 rounded-2xl" />
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} height={100} className="rounded-xl" />)}
                    </div>
                    <Skeleton height={300} className="mb-8 rounded-2xl" />
                    <Skeleton height={200} className="rounded-2xl" />
                </main>
            </div>
        );
    }

    if (error || !trend) {
        return (
            <div className="min-h-screen bg-black">
                <MainNavigation />
                <main className="pt-24 px-4 pb-20 max-w-5xl mx-auto">
                    <PageHeader
                        title="Trend Not Found"
                        description={error || 'The requested trend could not be found'}
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Trends', href: '/trends' },
                        ]}
                    />
                    <PremiumButton variant="primary" onClick={() => router.push('/trends')}>
                        ← Back to Trends
                    </PremiumButton>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-5xl mx-auto">
                {/* Header with thumbnail */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-start gap-6">
                        {/* Thumbnail */}
                        {trend.thumbnail && (
                            <div className="flex-shrink-0 w-32 h-32 rounded-2xl overflow-hidden bg-slate-800">
                                <img
                                    src={trend.thumbnail}
                                    alt={trend.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        )}

                        <div className="flex-1 min-w-0">
                            {/* Breadcrumb */}
                            <div className="flex items-center gap-2 text-sm text-white/40 mb-2">
                                <button onClick={() => router.push('/dashboard')} className="hover:text-white/60">Dashboard</button>
                                <span>/</span>
                                <button onClick={() => router.push('/trends')} className="hover:text-white/60">Trends</button>
                                <span>/</span>
                                <span className="text-white/60">{trend.name}</span>
                            </div>

                            <h1 className="text-3xl font-bold text-white mb-2">{trend.name}</h1>

                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-2">
                                    <div
                                        className="w-3 h-3 rounded-full"
                                        style={{ backgroundColor: categoryColors[trend.category] || '#64748b' }}
                                    />
                                    <span className="text-white/50 capitalize">{trend.category}</span>
                                </div>
                                <PremiumBadge
                                    variant={trend.velocity > 0.15 ? 'success' : trend.velocity < -0.1 ? 'danger' : 'default'}
                                >
                                    {trend.velocity > 0.15 ? '🔥 Rising Fast' : trend.velocity > 0 ? '↑ Rising' : trend.velocity < -0.1 ? '↓ Declining' : '○ Stable'}
                                </PremiumBadge>
                                <span className="text-white/30">•</span>
                                <span className="text-white/40">Updated {new Date(trend.lastUpdated).toLocaleTimeString()}</span>
                            </div>
                        </div>
                    </div>
                </motion.div>

                {/* Key Metrics */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                >
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/[0.08]">
                        <div className="text-3xl font-bold text-white mb-1">{trend.mentions.toLocaleString()}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Total Engagement</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/[0.08]">
                        <div className={`text-3xl font-bold ${trend.velocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {trend.velocity > 0 ? '+' : ''}{(trend.velocity * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Momentum</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/[0.08]">
                        <div className={`text-3xl font-bold ${trend.sentiment > 0.1 ? 'text-green-400' :
                                trend.sentiment < -0.1 ? 'text-red-400' : 'text-amber-400'
                            }`}>
                            {trend.sentiment.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Sentiment</div>
                    </div>
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/[0.08]">
                        <div className="text-3xl font-bold text-blue-400">{trend.sources.length}</div>
                        <div className="text-xs text-white/40 uppercase tracking-wide">Live Sources</div>
                    </div>
                </motion.section>

                {/* Geographic Distribution Map */}
                {mapPoints.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-8"
                    >
                        <SectionHeader
                            title="Geographic Distribution"
                            subtitle="Where this topic is being discussed"
                        />
                        <GeoMap
                            points={mapPoints}
                            height={mapExpanded ? 450 : 280}
                            expanded={mapExpanded}
                            showArrows={true}
                            onExpand={() => setMapExpanded(!mapExpanded)}
                            interactive={true}
                        />
                    </motion.section>
                )}

                {/* Wikipedia Context */}
                {wikiContext && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-8"
                    >
                        <SectionHeader title="Background" subtitle="From Wikipedia" />
                        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.08]">
                            <div className="flex gap-6">
                                {wikiContext.thumbnail && (
                                    <img
                                        src={wikiContext.thumbnail}
                                        alt={wikiContext.title}
                                        className="w-28 h-28 rounded-xl object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-xl font-semibold text-white mb-2">{wikiContext.title}</h3>
                                    <p className="text-sm text-white/60 leading-relaxed mb-3">{wikiContext.extract}</p>
                                    {wikiContext.url && (
                                        <a
                                            href={wikiContext.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-400 hover:text-blue-300 font-medium"
                                        >
                                            Read more on Wikipedia →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.section>
                )}

                {/* Live Sources */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.25 }}
                    className="mb-8"
                >
                    <SectionHeader
                        title="Live Sources"
                        subtitle={`${trend.sources.length} sources from across the web`}
                    />
                    <div className="space-y-3">
                        {trend.sources.map((source, i) => (
                            <SourceCard key={`${source.url}-${i}`} source={source} index={i} />
                        ))}
                    </div>
                </motion.section>

                {/* Related Topics */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8"
                >
                    <SectionHeader title="Related Topics" subtitle="Frequently discussed together" />
                    <div className="flex flex-wrap gap-2">
                        {trend.relatedTopics.map((topic, i) => (
                            <button
                                key={i}
                                onClick={() => router.push(`/trends/${topic.replace(/\s+/g, '-').toLowerCase()}`)}
                                className="px-4 py-2 rounded-full bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                            >
                                {topic}
                            </button>
                        ))}
                    </div>
                </motion.section>

                {/* Actions */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.35 }}
                    className="flex flex-wrap gap-3"
                >
                    <PremiumButton variant="primary" onClick={() => router.push('/trends')}>
                        ← Back to Trends
                    </PremiumButton>
                    <PremiumButton variant="default">
                        🔔 Track This Trend
                    </PremiumButton>
                    <PremiumButton variant="default">
                        📊 Export Data
                    </PremiumButton>
                    <PremiumButton variant="default">
                        📤 Share
                    </PremiumButton>
                </motion.section>
            </main>
        </div>
    );
}
