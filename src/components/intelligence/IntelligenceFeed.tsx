'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

/**
 * IntelligenceFeed - Shows real-time source attribution chain
 * Format: [Platform] → [Voice] → [Topic] → [Impact]
 * 
 * This is the core identity of CULTMINDS:
 * "Polymarket, MSNBC, Twitter users are discussing [topic] because [voice] said [thing]"
 */

interface FeedItem {
    id: string;
    timestamp: Date;
    platform: 'twitter' | 'youtube' | 'rumble' | 'reddit' | 'podcast' | 'news';
    voice: {
        id: string;
        name: string;
        handle?: string;
    };
    topic: {
        id: string;
        name: string;
    };
    action: 'discussed' | 'mentioned' | 'debated' | 'amplified' | 'criticized';
    impact: {
        type: 'surge' | 'flip' | 'viral' | 'emerging';
        value: string;
        sentiment?: number;
    };
    subject?: {
        type: 'person' | 'event' | 'place';
        name: string;
        id?: string;
    };
}

// Platform icons/colors
const platformConfig: Record<string, { icon: string; color: string; label: string }> = {
    twitter: { icon: '𝕏', color: '#1DA1F2', label: 'X/Twitter' },
    youtube: { icon: '▶', color: '#FF0000', label: 'YouTube' },
    rumble: { icon: 'R', color: '#85C742', label: 'Rumble' },
    reddit: { icon: '◎', color: '#FF4500', label: 'Reddit' },
    podcast: { icon: '🎙', color: '#9B59B6', label: 'Podcast' },
    news: { icon: '📰', color: '#E74C3C', label: 'News' },
};

// Demo data generator
function generateDemoFeedItems(): FeedItem[] {
    const voices = [
        { id: 'tucker', name: 'Tucker Carlson', handle: '@TuckerCarlson' },
        { id: 'candace', name: 'Candace Owens', handle: '@RealCandaceO' },
        { id: 'rogan', name: 'Joe Rogan', handle: '@joerogan' },
        { id: 'shapiro', name: 'Ben Shapiro', handle: '@benshapiro' },
        { id: 'musk', name: 'Elon Musk', handle: '@elonmusk' },
    ];

    const topics = [
        { id: 'immigration', name: 'Immigration' },
        { id: 'ai', name: 'AI Safety' },
        { id: 'ukraine', name: 'Ukraine Aid' },
        { id: 'election', name: '2024 Election' },
        { id: 'tiktok', name: 'TikTok Ban' },
    ];

    const subjects = [
        { type: 'person' as const, name: 'Trump', id: 'trump' },
        { type: 'person' as const, name: 'Biden', id: 'biden' },
        { type: 'event' as const, name: 'Border Crisis', id: 'border' },
        { type: 'place' as const, name: 'Washington DC', id: 'dc' },
    ];

    const platforms: Array<FeedItem['platform']> = ['twitter', 'youtube', 'rumble', 'reddit', 'podcast', 'news'];
    const actions: FeedItem['action'][] = ['discussed', 'mentioned', 'debated', 'amplified', 'criticized'];
    const impactTypes: FeedItem['impact']['type'][] = ['surge', 'flip', 'viral', 'emerging'];

    return Array.from({ length: 10 }, (_, i) => ({
        id: `feed-${i}`,
        timestamp: new Date(Date.now() - i * 120000), // 2 min apart
        platform: platforms[i % platforms.length],
        voice: voices[i % voices.length],
        topic: topics[i % topics.length],
        action: actions[i % actions.length],
        impact: {
            type: impactTypes[i % impactTypes.length],
            value: `+${Math.floor(Math.random() * 30 + 5)}%`,
            sentiment: Math.random() * 2 - 1,
        },
        subject: i % 2 === 0 ? subjects[i % subjects.length] : undefined,
    }));
}

interface IntelligenceFeedProps {
    className?: string;
    maxItems?: number;
    compact?: boolean;
    showHeader?: boolean;
}

export function IntelligenceFeed({
    className = '',
    maxItems = 5,
    compact = false,
    showHeader = true,
}: IntelligenceFeedProps) {
    const [items, setItems] = useState<FeedItem[]>([]);
    const [isLive, setIsLive] = useState(true);

    // Initialize with demo data
    useEffect(() => {
        setItems(generateDemoFeedItems());

        // Simulate live updates
        if (!isLive) return;

        const interval = setInterval(() => {
            setItems(prev => {
                const newItem: FeedItem = {
                    ...generateDemoFeedItems()[0],
                    id: `feed-${Date.now()}`,
                    timestamp: new Date(),
                };
                return [newItem, ...prev].slice(0, 20);
            });
        }, 15000); // New item every 15 seconds

        return () => clearInterval(interval);
    }, [isLive]);

    const displayItems = useMemo(() => items.slice(0, maxItems), [items, maxItems]);

    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Update current time every 30 seconds for relative timestamps
    useEffect(() => {
        const interval = setInterval(() => setCurrentTime(Date.now()), 30000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (date: Date) => {
        const seconds = Math.floor((currentTime - date.getTime()) / 1000);
        if (seconds < 60) return `${seconds}s ago`;
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        return `${Math.floor(seconds / 3600)}h ago`;
    };

    const getImpactColor = (type: string) => {
        switch (type) {
            case 'surge': return 'text-green-400';
            case 'flip': return 'text-amber-400';
            case 'viral': return 'text-red-400';
            case 'emerging': return 'text-blue-400';
            default: return 'text-white/50';
        }
    };

    const getImpactIcon = (type: string) => {
        switch (type) {
            case 'surge': return '📈';
            case 'flip': return '🔄';
            case 'viral': return '🔥';
            case 'emerging': return '✨';
            default: return '•';
        }
    };

    return (
        <div className={`${className}`}>
            {showHeader && (
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                        <h3 className="text-sm font-semibold text-white uppercase tracking-wider">
                            Intelligence Feed
                        </h3>
                        <div className="flex items-center gap-1.5">
                            <div className={`w-2 h-2 rounded-full ${isLive ? 'bg-green-500 animate-pulse' : 'bg-white/20'}`} />
                            <span className="text-[10px] text-white/40">{isLive ? 'LIVE' : 'PAUSED'}</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setIsLive(!isLive)}
                        className="text-xs text-white/40 hover:text-white/60 transition-colors"
                    >
                        {isLive ? 'Pause' : 'Resume'}
                    </button>
                </div>
            )}

            <div className="space-y-2">
                <AnimatePresence mode="popLayout">
                    {displayItems.map((item) => (
                        <motion.div
                            key={item.id}
                            initial={{ opacity: 0, x: -20, height: 0 }}
                            animate={{ opacity: 1, x: 0, height: 'auto' }}
                            exit={{ opacity: 0, x: 20, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className={`
                                group p-3 rounded-lg bg-white/[0.02] border border-white/[0.06]
                                hover:bg-white/[0.04] hover:border-white/[0.1] transition-all cursor-pointer
                            `}
                        >
                            {/* Chain visualization */}
                            <div className={`flex items-center flex-wrap gap-2 ${compact ? 'text-xs' : 'text-sm'}`}>
                                {/* Platform */}
                                <span
                                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold"
                                    style={{
                                        backgroundColor: `${platformConfig[item.platform].color}15`,
                                        color: platformConfig[item.platform].color,
                                    }}
                                >
                                    <span>{platformConfig[item.platform].icon}</span>
                                    {!compact && platformConfig[item.platform].label}
                                </span>

                                <span className="text-white/20">→</span>

                                {/* Voice */}
                                <Link
                                    href={`/profile/${item.voice.id}`}
                                    className="font-medium text-white hover:text-blue-400 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {item.voice.name}
                                </Link>

                                <span className="text-white/30">{item.action}</span>

                                {/* Topic */}
                                <Link
                                    href={`/topics/${item.topic.id}`}
                                    className="font-medium text-violet-400 hover:text-violet-300 transition-colors"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    {item.topic.name}
                                </Link>

                                {/* Subject (if present) */}
                                {item.subject && (
                                    <>
                                        <span className="text-white/30">re:</span>
                                        <span className="text-cyan-400">{item.subject.name}</span>
                                    </>
                                )}
                            </div>

                            {/* Impact row */}
                            <div className="flex items-center justify-between mt-2 text-xs">
                                <div className={`flex items-center gap-1 ${getImpactColor(item.impact.type)}`}>
                                    <span>{getImpactIcon(item.impact.type)}</span>
                                    <span className="font-mono">{item.impact.value}</span>
                                    <span className="capitalize">{item.impact.type}</span>
                                </div>
                                <span className="text-white/30">{formatTime(item.timestamp)}</span>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* View All link */}
            {items.length > maxItems && (
                <div className="mt-3 text-center">
                    <button className="text-xs text-white/40 hover:text-white/60 transition-colors">
                        View all {items.length} updates →
                    </button>
                </div>
            )}
        </div>
    );
}

export default IntelligenceFeed;
