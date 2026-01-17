'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { HolographicMap, MapPoint } from '@/components/visualizations/HolographicMap';
import { PremiumCard, PremiumButton, PremiumBadge, PageHeader, SectionHeader, Skeleton } from '@/components/ui/PremiumComponents';

interface TopicDetail {
    id: string;
    name: string;
    frequency: number;
    mentions: number;
    sentiment: number;
    velocity: number;
    category: string;
    sources: Array<{
        platform: string;
        subreddit: string;
        title: string;
        score: number;
        comments: number;
        url: string;
        sentiment: number;
        created: string;
    }>;
    relatedTopics: string[];
    lastUpdated: string;
}

export default function TopicDetailPage() {
    const params = useParams();
    const router = useRouter();
    const topicId = params.id as string;

    const [topic, setTopic] = useState<TopicDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [wikiContext, setWikiContext] = useState<{ title: string; extract: string; thumbnail?: string; url?: string } | null>(null);
    const [mapExpanded, setMapExpanded] = useState(false);

    useEffect(() => {
        async function fetchTopic() {
            setLoading(true);
            try {
                const response = await fetch('/api/live');
                if (!response.ok) throw new Error('Failed to fetch topics');

                const data = await response.json();
                const foundTopic = data.topics.find((t: TopicDetail) => t.id === topicId);

                if (foundTopic) {
                    setTopic(foundTopic);

                    // Fetch Wikipedia context
                    try {
                        const wikiResponse = await fetch(
                            `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(foundTopic.name)}`
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
                    setError('Topic not found');
                }
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Unknown error');
            } finally {
                setLoading(false);
            }
        }

        fetchTopic();
    }, [topicId]);

    // Generate map points - simulate global distribution
    const mapPoints: MapPoint[] = topic ? [
        { id: 'na', label: 'North America', lat: 38, lng: -97, value: topic.mentions * 0.45, description: `${Math.floor(topic.mentions * 0.45)} mentions` },
        { id: 'eu', label: 'Europe', lat: 50, lng: 10, value: topic.mentions * 0.25, description: `${Math.floor(topic.mentions * 0.25)} mentions` },
        { id: 'asia', label: 'Asia', lat: 35, lng: 105, value: topic.mentions * 0.15, description: `${Math.floor(topic.mentions * 0.15)} mentions` },
        { id: 'uk', label: 'UK', lat: 52, lng: -1, value: topic.mentions * 0.1, description: `${Math.floor(topic.mentions * 0.1)} mentions` },
        { id: 'au', label: 'Australia', lat: -25, lng: 135, value: topic.mentions * 0.05, description: `${Math.floor(topic.mentions * 0.05)} mentions` },
    ] : [];

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
            <div className="min-h-screen premium-grid-bg">
                <div className="animated-gradient-mesh" />
                <MainNavigation />
                <main className="pt-24 px-4 pb-20 max-w-5xl mx-auto">
                    <Skeleton height={60} className="mb-8" />
                    <div className="grid grid-cols-4 gap-4 mb-8">
                        {[1, 2, 3, 4].map(i => <Skeleton key={i} height={100} />)}
                    </div>
                    <Skeleton height={300} className="mb-8" />
                    <Skeleton height={200} />
                </main>
            </div>
        );
    }

    if (error || !topic) {
        return (
            <div className="min-h-screen premium-grid-bg">
                <div className="animated-gradient-mesh" />
                <MainNavigation />
                <main className="pt-24 px-4 pb-20 max-w-5xl mx-auto">
                    <PageHeader
                        title="Topic Not Found"
                        description={error || 'The requested topic could not be found'}
                        breadcrumbs={[
                            { label: 'Dashboard', href: '/dashboard' },
                            { label: 'Topics', href: '/topics' },
                        ]}
                    />
                    <PremiumButton variant="primary" onClick={() => router.push('/topics')}>
                        Back to Topics
                    </PremiumButton>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen premium-grid-bg">
            <div className="animated-gradient-mesh" />
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-5xl mx-auto">
                <PageHeader
                    title={topic.name}
                    description={`Live analysis • Category: ${topic.category} • Updated ${new Date(topic.lastUpdated).toLocaleTimeString()}`}
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Topics', href: '/topics' },
                        { label: topic.name }
                    ]}
                    actions={
                        <div className="flex items-center gap-2">
                            <div
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: categoryColors[topic.category] || '#64748b' }}
                            />
                            <span className="text-sm text-white/60 capitalize">{topic.category}</span>
                        </div>
                    }
                />

                {/* Key Metrics */}
                <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    <PremiumCard variant="glow" className="p-4 text-center">
                        <div className="text-2xl font-bold text-white">{topic.mentions.toLocaleString()}</div>
                        <div className="text-xs text-white/40">Total Engagement</div>
                    </PremiumCard>
                    <PremiumCard variant="glow" className="p-4 text-center">
                        <div className={`text-2xl font-bold ${topic.velocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {topic.velocity > 0 ? '+' : ''}{(topic.velocity * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/40">Momentum</div>
                    </PremiumCard>
                    <PremiumCard variant="glow" className="p-4 text-center">
                        <div className={`text-2xl font-bold ${topic.sentiment > 0.1 ? 'text-green-400' :
                                topic.sentiment < -0.1 ? 'text-red-400' : 'text-yellow-400'
                            }`}>
                            {topic.sentiment.toFixed(2)}
                        </div>
                        <div className="text-xs text-white/40">Sentiment</div>
                    </PremiumCard>
                    <PremiumCard variant="glow" className="p-4 text-center">
                        <div className="text-2xl font-bold text-blue-400">{topic.sources.length}</div>
                        <div className="text-xs text-white/40">Sources</div>
                    </PremiumCard>
                </section>

                {/* Geographic Distribution Map */}
                <section className="mb-8">
                    <SectionHeader
                        title="Geographic Distribution"
                        subtitle="Where this topic is being discussed"
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
                    <HolographicMap
                        points={mapPoints}
                        height={mapExpanded ? 400 : 200}
                        expanded={mapExpanded}
                        interactive={true}
                    />
                </section>

                {/* Wikipedia Context */}
                {wikiContext && (
                    <section className="mb-8">
                        <SectionHeader title="Background Context" subtitle="From Wikipedia" />
                        <PremiumCard className="p-6">
                            <div className="flex gap-6">
                                {wikiContext.thumbnail && (
                                    <img
                                        src={wikiContext.thumbnail}
                                        alt={wikiContext.title}
                                        className="w-24 h-24 rounded-xl object-cover flex-shrink-0"
                                    />
                                )}
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-white mb-2">{wikiContext.title}</h3>
                                    <p className="text-sm text-white/60 mb-3">{wikiContext.extract}</p>
                                    {wikiContext.url && (
                                        <a
                                            href={wikiContext.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-blue-400 hover:text-blue-300"
                                        >
                                            Read more on Wikipedia →
                                        </a>
                                    )}
                                </div>
                            </div>
                        </PremiumCard>
                    </section>
                )}

                {/* Sentiment Timeline (simulated) */}
                <section className="mb-8">
                    <SectionHeader title="Sentiment Over Time" subtitle="7-day trend" />
                    <PremiumCard className="p-6">
                        <div className="h-32 flex items-end gap-2">
                            {Array.from({ length: 7 }, (_, i) => {
                                const value = topic.sentiment + (Math.random() - 0.5) * 0.4;
                                const normalized = (value + 1) / 2; // 0 to 1
                                return (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-1">
                                        <motion.div
                                            className="w-full rounded-t"
                                            style={{
                                                backgroundColor: value > 0 ? '#22c55e' : '#ef4444',
                                                opacity: 0.5 + normalized * 0.5
                                            }}
                                            initial={{ height: 0 }}
                                            animate={{ height: `${normalized * 100}px` }}
                                            transition={{ delay: i * 0.05, duration: 0.3 }}
                                        />
                                        <span className="text-[10px] text-white/40">
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][i]}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </PremiumCard>
                </section>

                {/* Live Sources */}
                <section className="mb-8">
                    <SectionHeader
                        title="Live Sources"
                        subtitle={`${topic.sources.length} sources from Reddit`}
                    />
                    <div className="space-y-3">
                        {topic.sources.map((source, i) => (
                            <motion.a
                                key={i}
                                href={source.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: i * 0.05 }}
                            >
                                <PremiumCard variant="interactive" className="p-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-lg bg-orange-500/20 flex items-center justify-center text-orange-400 font-bold text-sm flex-shrink-0">
                                            r/
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-white text-sm line-clamp-2 mb-1">
                                                {source.title}
                                            </h4>
                                            <div className="flex items-center gap-4 text-xs text-white/40">
                                                <span>r/{source.subreddit}</span>
                                                <span>⬆ {source.score.toLocaleString()}</span>
                                                <span>💬 {source.comments}</span>
                                                <span className={source.sentiment > 0 ? 'text-green-400' : 'text-red-400'}>
                                                    {source.sentiment.toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                        <span className="text-white/30 flex-shrink-0">→</span>
                                    </div>
                                </PremiumCard>
                            </motion.a>
                        ))}
                    </div>
                </section>

                {/* Related Topics */}
                <section className="mb-8">
                    <SectionHeader title="Related Topics" subtitle="Frequently discussed together" />
                    <div className="flex flex-wrap gap-2">
                        {topic.relatedTopics.map((related, i) => (
                            <PremiumButton
                                key={i}
                                variant="default"
                                size="sm"
                                onClick={() => router.push(`/topics/${related.replace(/\s+/g, '-').toLowerCase()}`)}
                            >
                                {related}
                            </PremiumButton>
                        ))}
                    </div>
                </section>

                {/* Actions */}
                <section className="flex gap-4">
                    <PremiumButton variant="primary" onClick={() => router.push('/topics')}>
                        ← Back to Topics
                    </PremiumButton>
                    <PremiumButton variant="default">
                        🔔 Track Topic
                    </PremiumButton>
                    <PremiumButton variant="default">
                        📊 Export Data
                    </PremiumButton>
                </section>
            </main>
        </div>
    );
}
