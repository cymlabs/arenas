'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { PremiumCard, PremiumButton, PremiumInput, PremiumBadge, PageHeader, SectionHeader } from '@/components/ui/PremiumComponents';

// Voice/Person data
const voicesData = [
    {
        id: 'candace',
        name: 'Candace Owens',
        handle: '@RealCandaceO',
        avatar: '🎭',
        category: 'commentator',
        reach: 212000,
        engagement: 14.8,
        sentiment: -0.3,
        topics: ['Politics', 'Culture', 'Media'],
        bio: 'Conservative commentator and political activist. Former Turning Point USA communications director.',
        trending: true,
        influence: 0.92
    },
    {
        id: 'tucker',
        name: 'Tucker Carlson',
        handle: '@TuckerCarlson',
        avatar: '📺',
        category: 'commentator',
        reach: 198000,
        engagement: 11.2,
        sentiment: -0.2,
        topics: ['Politics', 'Media'],
        bio: 'Host of Tucker Carlson Tonight. Former Fox News primetime anchor.',
        trending: true,
        influence: 0.95
    },
    {
        id: 'rogan',
        name: 'Joe Rogan',
        handle: '@joerogan',
        avatar: '🎙️',
        category: 'influencer',
        reach: 156000,
        engagement: 8.7,
        sentiment: 0.1,
        topics: ['Media', 'Culture', 'Tech'],
        bio: 'Host of The Joe Rogan Experience podcast. UFC commentator.',
        trending: false,
        influence: 0.98
    },
    {
        id: 'shapiro',
        name: 'Ben Shapiro',
        handle: '@benshapiro',
        avatar: '📰',
        category: 'commentator',
        reach: 138000,
        engagement: 5.3,
        sentiment: -0.25,
        topics: ['Politics', 'Media'],
        bio: 'Founder and Editor Emeritus of The Daily Wire. Host of The Ben Shapiro Show.',
        trending: false,
        influence: 0.88
    },
    {
        id: 'charlie',
        name: 'Charlie Kirk',
        handle: '@charliekirk11',
        avatar: '🏛️',
        category: 'commentator',
        reach: 145000,
        engagement: 11.5,
        sentiment: -0.35,
        topics: ['Politics', 'Culture'],
        bio: 'Founder of Turning Point USA. Conservative activist and author.',
        trending: true,
        influence: 0.85
    },
    {
        id: 'aoc',
        name: 'Alexandria Ocasio-Cortez',
        handle: '@AOC',
        avatar: '🏛️',
        category: 'politician',
        reach: 189000,
        engagement: 9.8,
        sentiment: 0.15,
        topics: ['Politics', 'Climate', 'Social'],
        bio: 'U.S. Representative for New York\'s 14th congressional district.',
        trending: false,
        influence: 0.91
    },
    {
        id: 'musk',
        name: 'Elon Musk',
        handle: '@elonmusk',
        avatar: '🚀',
        category: 'influencer',
        reach: 320000,
        engagement: 18.5,
        sentiment: -0.1,
        topics: ['Tech', 'Politics', 'Media'],
        bio: 'CEO of Tesla, SpaceX, and X. Owner of Twitter/X platform.',
        trending: true,
        influence: 0.99
    },
    {
        id: 'trump',
        name: 'Donald Trump',
        handle: '@realDonaldTrump',
        avatar: '🏛️',
        category: 'politician',
        reach: 280000,
        engagement: 22.3,
        sentiment: -0.45,
        topics: ['Politics', 'Media'],
        bio: '45th President of the United States. 2024 Presidential candidate.',
        trending: true,
        influence: 0.97
    },
];

const categoryLabels: Record<string, string> = {
    commentator: 'Commentator',
    politician: 'Politician',
    influencer: 'Influencer',
};

const categoryColors: Record<string, string> = {
    commentator: '#f97316',
    politician: '#3b82f6',
    influencer: '#8b5cf6',
};

export default function VoicesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [sortBy, setSortBy] = useState<'reach' | 'engagement' | 'influence'>('reach');
    const [selectedVoice, setSelectedVoice] = useState<typeof voicesData[0] | null>(null);

    // Filter and sort voices
    const filteredVoices = useMemo(() => {
        let voices = voicesData.filter(voice => {
            const matchesSearch = voice.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                voice.handle.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesCategory = !selectedCategory || voice.category === selectedCategory;
            return matchesSearch && matchesCategory;
        });

        // Sort
        voices.sort((a, b) => {
            if (sortBy === 'reach') return b.reach - a.reach;
            if (sortBy === 'engagement') return b.engagement - a.engagement;
            return b.influence - a.influence;
        });

        return voices;
    }, [searchQuery, selectedCategory, sortBy]);

    const categories = ['commentator', 'politician', 'influencer'];

    return (
        <div className="min-h-screen premium-grid-bg">
            <div className="animated-gradient-mesh" />
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-7xl mx-auto">
                <PageHeader
                    title="Voices"
                    description="Track the most influential voices shaping public discourse"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Voices' }
                    ]}
                />

                {/* Featured Voice Spotlight */}
                <section className="mb-10">
                    <SectionHeader title="Featured Voice" subtitle="Most influential this week" />
                    <PremiumCard variant="glow" className="p-6">
                        <div className="flex flex-col md:flex-row gap-6 items-start">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-4xl">
                                {voicesData[6].avatar}
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h3 className="text-2xl font-bold text-white">{voicesData[6].name}</h3>
                                    <PremiumBadge variant="info">
                                        {categoryLabels[voicesData[6].category]}
                                    </PremiumBadge>
                                    <PremiumBadge variant="warning">
                                        🔥 Hot
                                    </PremiumBadge>
                                </div>
                                <p className="text-white/50 mb-4">{voicesData[6].bio}</p>
                                <div className="flex gap-6 text-sm">
                                    <div>
                                        <span className="text-white/40">Reach</span>
                                        <span className="ml-2 text-white font-semibold">{(voicesData[6].reach / 1000).toFixed(0)}K</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40">Engagement</span>
                                        <span className="ml-2 text-green-400 font-semibold">+{voicesData[6].engagement}%</span>
                                    </div>
                                    <div>
                                        <span className="text-white/40">Influence</span>
                                        <span className="ml-2 text-blue-400 font-semibold">{(voicesData[6].influence * 100).toFixed(0)}%</span>
                                    </div>
                                </div>
                            </div>
                            <PremiumButton variant="primary">
                                View Profile
                            </PremiumButton>
                        </div>
                    </PremiumCard>
                </section>

                {/* Search & Filters */}
                <section className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <PremiumInput
                            placeholder="Search voices..."
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
                                    {categoryLabels[cat]}
                                </PremiumButton>
                            ))}
                        </div>
                    </div>

                    {/* Sort options */}
                    <div className="flex gap-2 mt-4">
                        <span className="text-xs text-white/40 py-2">Sort by:</span>
                        {(['reach', 'engagement', 'influence'] as const).map(sort => (
                            <button
                                key={sort}
                                onClick={() => setSortBy(sort)}
                                className={`px-3 py-1.5 text-xs rounded-lg transition-colors ${sortBy === sort
                                        ? 'bg-white/10 text-white'
                                        : 'text-white/40 hover:text-white/60'
                                    }`}
                            >
                                {sort.charAt(0).toUpperCase() + sort.slice(1)}
                            </button>
                        ))}
                    </div>
                </section>

                {/* Voices Leaderboard */}
                <section>
                    <SectionHeader
                        title="Voice Leaderboard"
                        subtitle={`${filteredVoices.length} voices ranked by ${sortBy}`}
                    />
                    <div className="space-y-3">
                        {filteredVoices.map((voice, index) => (
                            <motion.div
                                key={voice.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.05 }}
                            >
                                <PremiumCard
                                    variant="interactive"
                                    className="p-4"
                                    onClick={() => setSelectedVoice(voice)}
                                >
                                    <div className="flex items-center gap-4">
                                        {/* Rank */}
                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${index === 0 ? 'bg-yellow-500/20 text-yellow-400' :
                                                index === 1 ? 'bg-gray-400/20 text-gray-300' :
                                                    index === 2 ? 'bg-orange-500/20 text-orange-400' :
                                                        'bg-white/5 text-white/40'
                                            }`}>
                                            {index + 1}
                                        </div>

                                        {/* Avatar */}
                                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-2xl">
                                            {voice.avatar}
                                        </div>

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <h3 className="font-semibold text-white truncate">{voice.name}</h3>
                                                {voice.trending && (
                                                    <PremiumBadge variant="warning" size="sm">🔥</PremiumBadge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-white/40">
                                                <span>{voice.handle}</span>
                                                <span>•</span>
                                                <span style={{ color: categoryColors[voice.category] }}>
                                                    {categoryLabels[voice.category]}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Stats */}
                                        <div className="hidden md:flex items-center gap-6 text-sm">
                                            <div className="text-center">
                                                <div className="text-white font-semibold">{(voice.reach / 1000).toFixed(0)}K</div>
                                                <div className="text-xs text-white/40">Reach</div>
                                            </div>
                                            <div className="text-center">
                                                <div className={`font-semibold ${voice.engagement > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                    +{voice.engagement}%
                                                </div>
                                                <div className="text-xs text-white/40">Engagement</div>
                                            </div>
                                            <div className="text-center">
                                                <div className="text-blue-400 font-semibold">{(voice.influence * 100).toFixed(0)}%</div>
                                                <div className="text-xs text-white/40">Influence</div>
                                            </div>
                                        </div>

                                        {/* Topics */}
                                        <div className="hidden lg:flex gap-1">
                                            {voice.topics.slice(0, 2).map(topic => (
                                                <span key={topic} className="px-2 py-1 text-xs bg-white/5 rounded-lg text-white/50">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Arrow */}
                                        <div className="text-white/30">→</div>
                                    </div>
                                </PremiumCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Voice Detail Modal */}
                <AnimatePresence>
                    {selectedVoice && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedVoice(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-lg"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <PremiumCard className="p-6">
                                    <div className="flex items-start gap-4 mb-6">
                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-3xl">
                                            {selectedVoice.avatar}
                                        </div>
                                        <div className="flex-1">
                                            <h2 className="text-xl font-bold text-white">{selectedVoice.name}</h2>
                                            <p className="text-white/50 text-sm">{selectedVoice.handle}</p>
                                            <div className="flex gap-2 mt-2">
                                                <PremiumBadge variant="info" size="sm">
                                                    {categoryLabels[selectedVoice.category]}
                                                </PremiumBadge>
                                                {selectedVoice.trending && (
                                                    <PremiumBadge variant="warning" size="sm">🔥 Trending</PremiumBadge>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setSelectedVoice(null)}
                                            className="text-white/50 hover:text-white text-xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <p className="text-white/60 text-sm mb-6">{selectedVoice.bio}</p>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <div className="text-2xl font-bold text-white">
                                                {(selectedVoice.reach / 1000).toFixed(0)}K
                                            </div>
                                            <div className="text-xs text-white/40">Reach</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <div className="text-2xl font-bold text-green-400">
                                                +{selectedVoice.engagement}%
                                            </div>
                                            <div className="text-xs text-white/40">Engagement</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <div className="text-2xl font-bold text-blue-400">
                                                {(selectedVoice.influence * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-white/40">Influence</div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xs text-white/40 uppercase mb-2">Top Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedVoice.topics.map(topic => (
                                                <span key={topic} className="px-3 py-1.5 text-sm bg-white/5 rounded-lg text-white/70">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <PremiumButton variant="primary" className="flex-1">
                                            View Full Profile
                                        </PremiumButton>
                                        <PremiumButton variant="default">
                                            Follow
                                        </PremiumButton>
                                    </div>
                                </PremiumCard>
                            </motion.div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </main>
        </div>
    );
}
