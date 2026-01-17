'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { MainNavigation } from '@/components/layout/MainNavigation';

// import { WorldMap, MapPoint } from '@/components/visualizations/WorldMap';
import GlobeViz from '@/components/visualizations/GlobeViz';
interface MapPoint {
    id: string;
    label: string;
    lat: number;
    lng: number;
    value: number;
    category?: string;
    description?: string;
    thumbnail?: string;
    trend?: 'up' | 'down' | 'stable';
}
import {
    ExternalLinkIcon,
    ArrowRightIcon,
    TrendingUpIcon,
    UsersIcon,
    MessageIcon,
    ChartIcon
} from '@/components/ui/Icons';

interface ProfileData {
    id: string;
    name: string;
    title?: string;
    description?: string;
    bio?: string;
    thumbnail?: string;
    wikiUrl?: string;
    categories?: string[];
    relatedTopics?: string[];
}

interface RelatedContent {
    topics: Array<{ name: string; sentiment: number; mentions: number }>;
    geoPoints: MapPoint[];
}

// Skeleton loader
function Skeleton({ className = '' }: { className?: string }) {
    return <div className={`animate-pulse bg-white/5 rounded ${className}`} />;
}

export default function VoiceDetailPage() {
    const params = useParams();
    const router = useRouter();
    const voiceId = params.id as string;

    const [profile, setProfile] = useState<ProfileData | null>(null);
    const [relatedContent, setRelatedContent] = useState<RelatedContent | null>(null);
    const [loading, setLoading] = useState(true);
    const [mapExpanded, setMapExpanded] = useState(false);

    // Decode the voice name from URL
    const voiceName = decodeURIComponent(voiceId).replace(/-/g, ' ');

    useEffect(() => {
        async function fetchData() {
            setLoading(true);

            try {
                // Fetch Wikipedia profile
                const profileRes = await fetch(`/api/profile?name=${encodeURIComponent(voiceName)}`);
                if (profileRes.ok) {
                    const profileData = await profileRes.json();
                    setProfile(profileData);
                }

                // Fetch related content from aggregator
                const contentRes = await fetch('/api/aggregator');
                if (contentRes.ok) {
                    const data = await contentRes.json();

                    // Find topics related to this voice
                    const relatedTopics = data.items
                        ?.filter((item: { title: string }) =>
                            item.title.toLowerCase().includes(voiceName.toLowerCase())
                        )
                        .slice(0, 5)
                        .map((item: { title: string; sentiment: number; engagement: number }) => ({
                            name: item.title,
                            sentiment: item.sentiment,
                            mentions: item.engagement,
                        })) || [];

                    setRelatedContent({
                        topics: relatedTopics,
                        geoPoints: data.geoPoints?.slice(0, 10) || [],
                    });
                }
            } catch (err) {
                console.error('Error fetching voice data:', err);
            } finally {
                setLoading(false);
            }
        }

        fetchData();
    }, [voiceName]);

    if (loading) {
        return (
            <div className="min-h-screen bg-black">
                <MainNavigation />
                <main className="pt-24 px-4 pb-20 max-w-4xl mx-auto">
                    <div className="flex gap-8 mb-8">
                        <Skeleton className="w-40 h-40 rounded-2xl" />
                        <div className="flex-1 space-y-4">
                            <Skeleton className="h-8 w-64" />
                            <Skeleton className="h-4 w-48" />
                            <Skeleton className="h-20 w-full" />
                        </div>
                    </div>
                    <Skeleton className="h-64 w-full rounded-2xl" />
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black">
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-4xl mx-auto">
                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-sm text-white/40 mb-6">
                    <button onClick={() => router.push('/dashboard')} className="hover:text-white/60 transition-colors">
                        Dashboard
                    </button>
                    <span>/</span>
                    <button onClick={() => router.push('/voices')} className="hover:text-white/60 transition-colors">
                        Voices
                    </button>
                    <span>/</span>
                    <span className="text-white/60">{profile?.name || voiceName}</span>
                </nav>

                {/* Profile Header */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-10"
                >
                    <div className="flex flex-col md:flex-row gap-8">
                        {/* Profile Image */}
                        <div className="flex-shrink-0">
                            <div className="relative w-40 h-40 rounded-2xl overflow-hidden bg-gradient-to-br from-slate-800 to-slate-900 border border-white/10">
                                {profile?.thumbnail ? (
                                    <Image
                                        src={profile.thumbnail}
                                        alt={profile.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-5xl font-bold text-white/20">
                                        {voiceName.charAt(0).toUpperCase()}
                                    </div>
                                )}

                                {/* Glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                            </div>
                        </div>

                        {/* Profile Info */}
                        <div className="flex-1 min-w-0">
                            <h1 className="text-3xl font-bold text-white mb-2">
                                {profile?.name || voiceName}
                            </h1>

                            {profile?.title && (
                                <p className="text-lg text-white/50 mb-4">{profile.title}</p>
                            )}

                            {profile?.bio && (
                                <p className="text-sm text-white/60 leading-relaxed mb-4 line-clamp-4">
                                    {profile.bio}
                                </p>
                            )}

                            {/* Categories */}
                            {profile?.categories && profile.categories.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {profile.categories.slice(0, 5).map((cat, i) => (
                                        <span
                                            key={i}
                                            className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-white/60"
                                        >
                                            {cat}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                {profile?.wikiUrl && (
                                    <a
                                        href={profile.wikiUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-white/70 hover:bg-white/10 hover:text-white transition-all"
                                    >
                                        <ExternalLinkIcon size={14} />
                                        View on Wikipedia
                                    </a>
                                )}
                                <button className="px-4 py-2 rounded-lg bg-blue-500/20 border border-blue-500/30 text-sm text-blue-400 hover:bg-blue-500/30 transition-all">
                                    Track This Voice
                                </button>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Stats Cards */}
                <motion.section
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10"
                >
                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-blue-500/10">
                                <MessageIcon size={16} className="text-blue-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-0.5">
                            {relatedContent?.topics?.reduce((a, t) => a + t.mentions, 0)?.toLocaleString() || '0'}
                        </div>
                        <div className="text-xs text-white/40">Total Mentions</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-green-500/10">
                                <TrendingUpIcon size={16} className="text-green-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-0.5">
                            +24%
                        </div>
                        <div className="text-xs text-white/40">Weekly Growth</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-purple-500/10">
                                <UsersIcon size={16} className="text-purple-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-0.5">
                            {profile?.relatedTopics?.length || 0}
                        </div>
                        <div className="text-xs text-white/40">Related Topics</div>
                    </div>

                    <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="p-2 rounded-lg bg-orange-500/10">
                                <ChartIcon size={16} className="text-orange-400" />
                            </div>
                        </div>
                        <div className="text-2xl font-bold text-white mb-0.5">
                            {((relatedContent?.topics?.[0]?.sentiment || 0) * 100).toFixed(0)}%
                        </div>
                        <div className="text-xs text-white/40">Sentiment</div>
                    </div>
                </motion.section>

                {/* Geographic Activity */}
                {relatedContent?.geoPoints && relatedContent.geoPoints.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.15 }}
                        className="mb-10"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4">Geographic Reach</h2>

                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/40">
                            <GlobeViz
                                width={800}
                                height={mapExpanded ? 500 : 300}
                                markers={relatedContent.geoPoints.map(p => ({
                                    id: p.id,
                                    lat: p.lat,
                                    lng: p.lng,
                                    label: p.label,
                                    size: Math.min(30, Math.max(10, Math.log10(p.value + 1) * 8)),
                                    color: p.category === 'politics' ? '#ef4444' : '#3b82f6', // Simple color mapping
                                    onClick: () => { } // No-op or open modal
                                }))}
                            />
                        </div>
                    </motion.section>
                )}

                {/* Related Topics */}
                {profile?.relatedTopics && profile.relatedTopics.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-10"
                    >
                        <h2 className="text-lg font-semibold text-white mb-4">Related Topics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                            {profile.relatedTopics.slice(0, 9).map((topic, i) => (
                                <button
                                    key={i}
                                    onClick={() => router.push(`/trends/${encodeURIComponent(topic.toLowerCase().replace(/\s+/g, '-'))}`)}
                                    className="group p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06] hover:border-white/15 text-left transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm text-white/70 group-hover:text-white transition-colors">
                                            {topic}
                                        </span>
                                        <ArrowRightIcon size={14} className="text-white/20 group-hover:text-white/50 transition-colors" />
                                    </div>
                                </button>
                            ))}
                        </div>
                    </motion.section>
                )}

                {/* Recent Mentions */}
                {relatedContent?.topics && relatedContent.topics.length > 0 && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.25 }}
                    >
                        <h2 className="text-lg font-semibold text-white mb-4">Recent Mentions</h2>
                        <div className="space-y-3">
                            {relatedContent.topics.map((topic, i) => (
                                <div
                                    key={i}
                                    className="p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-950/60 border border-white/[0.06]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="text-sm text-white mb-1">{topic.name}</div>
                                            <div className="text-xs text-white/40">
                                                {topic.mentions.toLocaleString()} engagement
                                            </div>
                                        </div>
                                        <div className={`text-sm font-medium ${topic.sentiment > 0.1 ? 'text-green-400' :
                                            topic.sentiment < -0.1 ? 'text-red-400' : 'text-white/50'
                                            }`}>
                                            {topic.sentiment > 0 ? '+' : ''}{(topic.sentiment * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.section>
                )}
            </main>
        </div>
    );
}
