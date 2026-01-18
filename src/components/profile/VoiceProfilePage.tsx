'use client';

import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { PageHeader, SectionHeader } from '@/components/ui/PremiumComponents';
import { GlowingCard, AceternityCard, StatCard } from '@/components/ui/GlowingCard';
import { CLUSTER_TAXONOMY, ClusterType, CLUSTER_TYPE_COLORS } from '@/types/clusters';

// Demo voice data
interface VoiceProfile {
    id: string;
    name: string;
    subtitle: string;
    description: string;
    avatar?: string;
    accentColor: string;
    stats: {
        followers: string;
        reach: string;
        engagement: string;
        velocity: string;
    };
    clusterBreakdown: {
        clusterId: string;
        clusterName: string;
        percentage: number;
        change: number;
    }[];
    topTopics: {
        id: string;
        name: string;
        mentions: number;
        sentiment: number;
    }[];
    relatedVoices: {
        id: string;
        name: string;
        overlap: number;
        color: string;
    }[];
}

const demoVoices: Record<string, VoiceProfile> = {
    'nick-fuentes': {
        id: 'nick-fuentes',
        name: 'Nick Fuentes',
        subtitle: 'Political Commentator',
        description: 'America First host and political commentator. Known for coverage of immigration, political establishment criticism, and youth outreach.',
        accentColor: '#ec4899',
        stats: { followers: '1.2M', reach: '2.85M', engagement: '8.4%', velocity: '+23%' },
        clusterBreakdown: [
            { clusterId: 'CLU-007', clusterName: 'Young Men (18-24)', percentage: 32, change: 8 },
            { clusterId: 'CLU-100', clusterName: 'Gaming Community', percentage: 25, change: 3 },
            { clusterId: 'CLU-200', clusterName: 'Political Right', percentage: 22, change: 1 },
            { clusterId: 'CLU-002', clusterName: 'Young Women (18-24)', percentage: 12, change: 4 },
            { clusterId: 'CLU-101', clusterName: 'Crypto/Finance', percentage: 9, change: -2 },
        ],
        topTopics: [
            { id: 'immigration', name: 'Immigration', mentions: 145, sentiment: -0.3 },
            { id: 'election', name: '2024 Election', mentions: 120, sentiment: -0.1 },
            { id: 'deepstate', name: 'Deep State', mentions: 98, sentiment: -0.5 },
            { id: 'censorship', name: 'Censorship', mentions: 87, sentiment: -0.4 },
        ],
        relatedVoices: [
            { id: 'candace', name: 'Candace Owens', overlap: 42, color: '#f97316' },
            { id: 'charlie', name: 'Charlie Kirk', overlap: 38, color: '#fbbf24' },
            { id: 'tucker', name: 'Tucker Carlson', overlap: 35, color: '#3b82f6' },
        ],
    },
    'candace': {
        id: 'candace',
        name: 'Candace Owens',
        subtitle: 'Political Commentator, Daily Wire',
        description: 'Conservative commentator and author. Known for outreach to Black Americans, culture war commentary, and anti-establishment content.',
        accentColor: '#f97316',
        stats: { followers: '5.2M', reach: '8.4M', engagement: '6.2%', velocity: '+14%' },
        clusterBreakdown: [
            { clusterId: 'CLU-003', clusterName: 'Women (25-34)', percentage: 28, change: 5 },
            { clusterId: 'CLU-200', clusterName: 'Political Right', percentage: 25, change: 2 },
            { clusterId: 'CLU-203', clusterName: 'Religious/Spiritual', percentage: 18, change: 3 },
            { clusterId: 'CLU-008', clusterName: 'Men (25-34)', percentage: 15, change: 1 },
            { clusterId: 'CLU-104', clusterName: 'Pop Culture', percentage: 14, change: -1 },
        ],
        topTopics: [
            { id: 'woke', name: 'Anti-Woke', mentions: 210, sentiment: -0.4 },
            { id: 'immigration', name: 'Immigration', mentions: 145, sentiment: -0.2 },
            { id: 'israel', name: 'Israel/Gaza', mentions: 130, sentiment: -0.6 },
            { id: 'election', name: '2024 Election', mentions: 98, sentiment: 0.1 },
        ],
        relatedVoices: [
            { id: 'shapiro', name: 'Ben Shapiro', overlap: 48, color: '#06b6d4' },
            { id: 'charlie', name: 'Charlie Kirk', overlap: 45, color: '#fbbf24' },
            { id: 'tucker', name: 'Tucker Carlson', overlap: 40, color: '#3b82f6' },
        ],
    },
};

interface VoiceProfilePageProps {
    voiceId: string;
}

export default function VoiceProfilePage({ voiceId }: VoiceProfilePageProps) {
    const voice = demoVoices[voiceId] || demoVoices['nick-fuentes'];

    const getClusterColor = (clusterId: string): string => {
        const cluster = CLUSTER_TAXONOMY.find(c => c.id === clusterId);
        return cluster ? CLUSTER_TYPE_COLORS[cluster.type] : '#64748b';
    };

    return (
        <div className="min-h-screen premium-grid-bg text-white">
            <div className="animated-gradient-mesh" />
            <MainNavigation />

            {/* Profile Hero */}
            <section className="relative pt-24">
                {/* Gradient backdrop */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        background: `radial-gradient(ellipse at top, ${voice.accentColor}40, transparent 60%)`,
                    }}
                />

                <div className="relative max-w-7xl mx-auto px-6 py-12">
                    <div className="flex items-start gap-8">
                        {/* Avatar */}
                        <motion.div
                            className="w-32 h-32 rounded-2xl flex items-center justify-center text-5xl font-bold shadow-2xl"
                            style={{
                                background: `linear-gradient(135deg, ${voice.accentColor}, ${voice.accentColor}80)`,
                                boxShadow: `0 20px 40px ${voice.accentColor}30`,
                            }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {voice.name.charAt(0)}
                        </motion.div>

                        <div className="flex-1">
                            <motion.h1
                                className="text-4xl font-bold mb-2"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                {voice.name}
                            </motion.h1>
                            <motion.p
                                className="text-white/50 text-lg mb-4"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {voice.subtitle}
                            </motion.p>
                            <motion.p
                                className="text-white/70 max-w-2xl"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {voice.description}
                            </motion.p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <motion.div
                        className="grid grid-cols-4 gap-4 mt-8"
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                    >
                        <StatCard label="Followers" value={voice.stats.followers} icon="👥" accentColor={voice.accentColor} />
                        <StatCard label="Weekly Reach" value={voice.stats.reach} change="+14% this week" changeType="positive" icon="📢" accentColor="#22c55e" />
                        <StatCard label="Engagement" value={voice.stats.engagement} icon="💬" accentColor="#3b82f6" />
                        <StatCard label="Velocity" value={voice.stats.velocity} changeType="positive" icon="📈" accentColor="#f97316" />
                    </motion.div>
                </div>
            </section>

            {/* Main Content */}
            <section className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-12 gap-6">
                    {/* Cluster Breakdown */}
                    <div className="col-span-8">
                        <GlowingCard glowColor={voice.accentColor}>
                            <h2 className="text-lg font-semibold mb-4">Cluster Attraction</h2>
                            <p className="text-white/50 text-sm mb-6">
                                Audience segments this voice is attracting (this week)
                            </p>

                            <div className="space-y-4">
                                {voice.clusterBreakdown.map((cluster, i) => (
                                    <motion.div
                                        key={cluster.clusterId}
                                        className="flex items-center gap-4"
                                        initial={{ x: -20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * i }}
                                    >
                                        <div
                                            className="w-3 h-3 rounded-full flex-shrink-0"
                                            style={{ backgroundColor: getClusterColor(cluster.clusterId) }}
                                        />
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between mb-1">
                                                <span className="text-white/80 text-sm truncate">{cluster.clusterName}</span>
                                                <div className="flex items-center gap-3">
                                                    <span className="text-white font-mono text-sm">{cluster.percentage}%</span>
                                                    <span className={`text-xs font-mono ${cluster.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {cluster.change >= 0 ? '+' : ''}{cluster.change}%
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                                <motion.div
                                                    className="h-full rounded-full"
                                                    style={{ backgroundColor: getClusterColor(cluster.clusterId) }}
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${cluster.percentage}%` }}
                                                    transition={{ duration: 0.8, delay: 0.1 * i }}
                                                />
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </GlowingCard>

                        {/* Top Topics */}
                        <div className="mt-6">
                            <GlowingCard glowColor="#3b82f6">
                                <h2 className="text-lg font-semibold mb-4">Top Topics</h2>
                                <div className="grid grid-cols-2 gap-4">
                                    {voice.topTopics.map((topic, i) => (
                                        <motion.div
                                            key={topic.id}
                                            className="p-4 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-colors cursor-pointer"
                                            initial={{ scale: 0.95, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.1 * i }}
                                            whileHover={{ scale: 1.02 }}
                                        >
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium">{topic.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full ${topic.sentiment > 0 ? 'bg-green-500/20 text-green-400' :
                                                    topic.sentiment < -0.3 ? 'bg-red-500/20 text-red-400' :
                                                        'bg-yellow-500/20 text-yellow-400'
                                                    }`}>
                                                    {topic.sentiment > 0 ? 'Positive' : topic.sentiment < -0.3 ? 'Negative' : 'Mixed'}
                                                </span>
                                            </div>
                                            <p className="text-white/40 text-sm">{topic.mentions} mentions this week</p>
                                        </motion.div>
                                    ))}
                                </div>
                            </GlowingCard>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="col-span-4 space-y-6">
                        {/* Related Voices */}
                        <GlowingCard glowColor="#8b5cf6">
                            <h2 className="text-lg font-semibold mb-4">Related Voices</h2>
                            <p className="text-white/50 text-sm mb-4">
                                Highest audience overlap
                            </p>

                            <div className="space-y-3">
                                {voice.relatedVoices.map((related, i) => (
                                    <motion.a
                                        key={related.id}
                                        href={`/profile/${related.id}`}
                                        className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.02] border border-white/[0.06] hover:border-white/[0.12] transition-all group"
                                        initial={{ x: 20, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        transition={{ delay: 0.1 * i }}
                                        whileHover={{ x: 4 }}
                                    >
                                        <div
                                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                                            style={{ background: `linear-gradient(135deg, ${related.color}, ${related.color}80)` }}
                                        >
                                            {related.name.charAt(0)}
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-white/80 font-medium group-hover:text-white transition-colors">{related.name}</p>
                                            <p className="text-white/40 text-sm">{related.overlap}% overlap</p>
                                        </div>
                                        <span className="text-white/30 group-hover:text-white/60 transition-colors">→</span>
                                    </motion.a>
                                ))}
                            </div>
                        </GlowingCard>

                        {/* Quick Actions */}
                        <AceternityCard
                            title="Track This Voice"
                            description="Get notified when this voice gains significant traction in new clusters"
                            icon="🔔"
                            accentColor={voice.accentColor}
                        >
                            <button className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                                Set Up Alerts
                            </button>
                        </AceternityCard>

                        <AceternityCard
                            title="Export Data"
                            description="Download cluster data and engagement metrics for this voice"
                            icon="📊"
                            accentColor="#22c55e"
                        >
                            <button className="mt-4 w-full py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm font-medium">
                                Export CSV
                            </button>
                        </AceternityCard>
                    </div>
                </div>
            </section>
        </div>
    );
}
