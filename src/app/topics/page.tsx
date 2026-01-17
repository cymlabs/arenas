'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { HolographicMap, MapPoint } from '@/components/visualizations/HolographicMap';
import { PremiumCard, PremiumButton, PremiumInput, PremiumBadge, PageHeader, SectionHeader, Skeleton } from '@/components/ui/PremiumComponents';

interface LiveTopic {
    id: string;
    name: string;
    frequency: number;
    mentions: number;
    sentiment: number;
    velocity: number;
    category: string;
    categoryConfidence: number;
    sources: Array<{
        platform: string;
        subreddit: string;
        title: string;
        score: number;
        comments: number;
        url: string;
        sentiment: number;
    }>;
    relatedTopics: string[];
    lastUpdated: string;
}

interface ApiResponse {
    topics: LiveTopic[];
    stats: {
        totalPosts: number;
        topicsExtracted: number;
        avgSentiment: number;
        subreddits: string[];
        fetchedAt: string;
    };
}

const categoryColors: Record<string, string> = {
    politics: '#ef4444',
    media: '#f97316',
    tech: '#3b82f6',
    culture: '#8b5cf6',
    social: '#ec4899',
    science: '#22c55e',
    other: '#64748b',
};

const categoryLabels: Record<string, string> = {
    politics: 'Politics',
    media: 'Media',
    tech: 'Technology',
    culture: 'Culture',
    social: 'Social',
    science: 'Science',
    other: 'Other',
};

export default function TopicsPage() {
    const router = useRouter();
    const [data, setData] = useState<ApiResponse | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [mapExpanded, setMapExpanded] = useState(false);

    // Fetch live data
    useEffect(() => {
        async function fetchLiveData() {
            setLoading(true);
            try {
                const response = await fetch('/api/live');
                if (!response.ok) throw new Error('Failed to fetch live data');
                const result = await response.json();
                setData(result);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchLiveData();

        // Auto-refresh every 5 minutes
        const interval = setInterval(fetchLiveData, 300000);
        return () => clearInterval(interval);
    }, []);

    // Generate map points from topics
    const mapPoints: MapPoint[] = useMemo(() => {
        if (!data?.topics) return [];

        const points: MapPoint[] = [];
        const topTopics = data.topics
            .sort((a, b) => b.mentions - a.mentions)
            .slice(0, 10);

        // Distribute across globe (simulated)
        const locations = [
            { lat: 38.9, lng: -77, region: 'Washington DC' },
            { lat: 40.7, lng: -74, region: 'New York' },
            { lat: 37.8, lng: -122.4, region: 'San Francisco' },
            { lat: 51.5, lng: -0.1, region: 'London' },
            { lat: 48.9, lng: 2.3, region: 'Paris' },
            { lat: 52.5, lng: 13.4, region: 'Berlin' },
            { lat: 35.7, lng: 139.7, region: 'Tokyo' },
            { lat: -33.9, lng: 151.2, region: 'Sydney' },
            { lat: 28.6, lng: 77.2, region: 'Delhi' },
            { lat: -23.5, lng: -46.6, region: 'Sao Paulo' },
        ];

        topTopics.forEach((topic, i) => {
            const loc = locations[i % locations.length];
            points.push({
                id: topic.id,
                label: topic.name,
                lat: loc.lat,
                lng: loc.lng,
                value: topic.mentions,
                category: topic.category,
                description: `${topic.mentions.toLocaleString()} mentions • ${loc.region}`,
                href: `/topics/${topic.id}`,
            });
        });

        return points;
    }, [data]);

    // Filter topics
    const filteredTopics = useMemo(() => {
        if (!data?.topics) return [];

        return data.topics.filter(topic => {
            const matchesSearch = topic.name.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || topic.category === selectedCategory;
            return matchesSearch && matchesCategory;
        }).sort((a, b) => b.mentions - a.mentions);
    }, [data, searchQuery, selectedCategory]);

    // Get unique categories
    const categories = useMemo(() => {
        if (!data?.topics) return [];
        return [...new Set(data.topics.map(t => t.category))];
    }, [data]);

    const handleTopicClick = (topic: LiveTopic) => {
        router.push(`/topics/${topic.id}`);
    };

    return (
        <div className="min-h-screen premium-grid-bg">
            <div className="animated-gradient-mesh" />
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-7xl mx-auto">
                <PageHeader
                    title="Live Topics"
                    description={data?.stats
                        ? `Real-time analysis from ${data.stats.subreddits.length} communities • ${data.stats.topicsExtracted} topics detected`
                        : 'Explore trending discussions shaping the cultural landscape'
                    }
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Topics' }
                    ]}
                />

                {/* Live Status Banner */}
                {data?.stats && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6 flex items-center gap-3 text-sm"
                    >
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                            <span className="text-white/50">Live</span>
                        </div>
                        <span className="text-white/30">•</span>
                        <span className="text-white/50">
                            Updated {new Date(data.stats.fetchedAt).toLocaleTimeString()}
                        </span>
                    </motion.div>
                )}

                {/* Holographic Map */}
                <motion.section
                    className="mb-8"
                    layout
                    transition={{ duration: 0.3 }}
                >
                    <SectionHeader
                        title="Geographic Distribution"
                        subtitle="Topic engagement hotspots worldwide"
                        action={
                            <PremiumButton
                                variant="ghost"
                                size="sm"
                                onClick={() => setMapExpanded(!mapExpanded)}
                            >
                                {mapExpanded ? 'Collapse' : 'Expand'}
                            </PremiumButton>
                        }
                    />
                    {loading ? (
                        <Skeleton height={200} />
                    ) : (
                        <HolographicMap
                            points={mapPoints}
                            height={mapExpanded ? 400 : 200}
                            expanded={mapExpanded}
                            onExpand={() => setMapExpanded(true)}
                            onPointClick={(point) => router.push(`/topics/${point.id}`)}
                        />
                    )}
                </motion.section>

                {/* Search & Filters */}
                <section className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <PremiumInput
                            placeholder="Search topics..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            icon={<span>🔍</span>}
                            className="flex-1"
                        />
                        <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                            <PremiumButton
                                variant={selectedCategory === null ? 'primary' : 'default'}
                                size="sm"
                                onClick={() => setSelectedCategory(null)}
                            >
                                All
                            </PremiumButton>
                            {categories.map(cat => (
                                <PremiumButton
                                    key={cat}
                                    variant={selectedCategory === cat ? 'primary' : 'default'}
                                    size="sm"
                                    onClick={() => setSelectedCategory(cat)}
                                >
                                    <span style={{ color: categoryColors[cat] }}>●</span>
                                    {categoryLabels[cat] || cat}
                                </PremiumButton>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Topics Grid */}
                <section>
                    <SectionHeader
                        title="All Topics"
                        subtitle={`${filteredTopics.length} topics found`}
                    />

                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {[1, 2, 3, 4, 5, 6].map(i => (
                                <Skeleton key={i} height={180} />
                            ))}
                        </div>
                    ) : error ? (
                        <PremiumCard variant="glow" className="p-8 text-center">
                            <div className="text-red-400 mb-4">⚠️ {error}</div>
                            <PremiumButton variant="primary" onClick={() => window.location.reload()}>
                                Retry
                            </PremiumButton>
                        </PremiumCard>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {filteredTopics.map((topic, index) => (
                                <motion.div
                                    key={topic.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.03 }}
                                >
                                    <PremiumCard
                                        variant="interactive"
                                        className="p-5 h-full cursor-pointer"
                                        onClick={() => handleTopicClick(topic)}
                                    >
                                        <div className="flex items-start justify-between mb-3">
                                            <div
                                                className="w-3 h-3 rounded-full"
                                                style={{ backgroundColor: categoryColors[topic.category] || '#64748b' }}
                                            />
                                            <div className="flex gap-1">
                                                {topic.velocity > 0.15 && (
                                                    <PremiumBadge variant="warning" size="sm">
                                                        🔥 Rising
                                                    </PremiumBadge>
                                                )}
                                                {topic.velocity < -0.1 && (
                                                    <PremiumBadge variant="danger" size="sm">
                                                        📉 Declining
                                                    </PremiumBadge>
                                                )}
                                            </div>
                                        </div>

                                        <h3 className="text-lg font-semibold text-white mb-2">
                                            {topic.name}
                                        </h3>
                                        <p className="text-sm text-white/50 mb-4 line-clamp-2">
                                            {topic.sources.length} sources • {categoryLabels[topic.category] || topic.category}
                                        </p>

                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-white/40">
                                                {topic.mentions.toLocaleString()} engagement
                                            </span>
                                            <span className={topic.velocity > 0 ? 'text-green-400' : 'text-red-400'}>
                                                {topic.velocity > 0 ? '↑' : '↓'} {(Math.abs(topic.velocity) * 100).toFixed(0)}%
                                            </span>
                                        </div>

                                        {/* Sentiment bar */}
                                        <div className="mt-3 flex items-center gap-2">
                                            <span className="text-[10px] text-white/30">Sentiment</span>
                                            <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full rounded-full transition-all duration-500"
                                                    style={{
                                                        width: `${(topic.sentiment + 1) * 50}%`,
                                                        backgroundColor: topic.sentiment > 0 ? '#22c55e' : '#ef4444'
                                                    }}
                                                />
                                            </div>
                                            <span className={`text-[10px] ${topic.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {topic.sentiment.toFixed(2)}
                                            </span>
                                        </div>

                                        {/* Click indicator */}
                                        <div className="mt-4 flex items-center justify-end text-xs text-white/30">
                                            View details →
                                        </div>
                                    </PremiumCard>
                                </motion.div>
                            ))}
                        </div>
                    )}
                </section>
            </main>
        </div>
    );
}
