'use client';

import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { HolographicMap, MapPoint } from '@/components/visualizations/HolographicMap';
import { PremiumCard, PremiumButton, PremiumBadge, PageHeader, SectionHeader, PremiumInput } from '@/components/ui/PremiumComponents';

// Narrative data
const narrativesData = [
    {
        id: 'deep-state',
        name: 'Deep State',
        description: 'Claims of entrenched government bureaucracy working against elected officials',
        status: 'active',
        reach: 2340000,
        velocity: 0.28,
        sentiment: -0.55,
        keyVoices: ['Tucker Carlson', 'Steve Bannon', 'Charlie Kirk'],
        relatedTopics: ['2024 Election', 'Censorship', 'FBI/DOJ'],
        geoSpread: [
            { lat: 38.9, lng: -77, weight: 0.9 }, // DC
            { lat: 40.7, lng: -74, weight: 0.6 }, // NYC
            { lat: 33, lng: -112, weight: 0.4 }, // Arizona
        ],
        timeline: [0.3, 0.4, 0.5, 0.55, 0.7, 0.85, 1.0]
    },
    {
        id: 'anti-woke',
        name: 'Anti-Woke Movement',
        description: 'Opposition to progressive social policies in education, corporations, and media',
        status: 'active',
        reach: 3120000,
        velocity: 0.35,
        sentiment: -0.4,
        keyVoices: ['Ben Shapiro', 'Matt Walsh', 'Christopher Rufo'],
        relatedTopics: ['Trans Rights', 'Campus Protests', 'DEI Policies'],
        geoSpread: [
            { lat: 28, lng: -82, weight: 0.8 }, // Florida
            { lat: 32, lng: -97, weight: 0.7 }, // Texas
            { lat: 51, lng: -0.1, weight: 0.4 }, // UK
        ],
        timeline: [0.4, 0.5, 0.6, 0.7, 0.75, 0.9, 1.0]
    },
    {
        id: 'great-reset',
        name: 'Great Reset',
        description: 'WEF-driven globalist agenda to restructure world economies and governance',
        status: 'declining',
        reach: 890000,
        velocity: -0.12,
        sentiment: -0.65,
        keyVoices: ['Alex Jones', 'Glenn Beck'],
        relatedTopics: ['Climate Policy', 'Economic Policy', 'WHO'],
        geoSpread: [
            { lat: 47, lng: 8, weight: 0.7 }, // Davos
            { lat: 51, lng: -0.1, weight: 0.5 }, // London
        ],
        timeline: [1.0, 0.9, 0.85, 0.7, 0.6, 0.55, 0.5]
    },
    {
        id: 'election-integrity',
        name: 'Election Integrity',
        description: 'Concerns about voting systems, mail-in ballots, and electoral process security',
        status: 'active',
        reach: 4560000,
        velocity: 0.15,
        sentiment: -0.35,
        keyVoices: ['Donald Trump', 'Mike Lindell', 'Kari Lake'],
        relatedTopics: ['2024 Election', 'Tech Censorship'],
        geoSpread: [
            { lat: 33, lng: -112, weight: 0.9 }, // Arizona
            { lat: 33.7, lng: -84.4, weight: 0.8 }, // Georgia
            { lat: 42.4, lng: -83, weight: 0.6 }, // Michigan
        ],
        timeline: [0.8, 0.75, 0.7, 0.65, 0.7, 0.8, 1.0]
    },
    {
        id: 'border-crisis',
        name: 'Border Crisis',
        description: 'Framing of southern border immigration as national security emergency',
        status: 'active',
        reach: 3890000,
        velocity: 0.42,
        sentiment: -0.45,
        keyVoices: ['Governor Abbott', 'Tom Homan', 'Stephen Miller'],
        relatedTopics: ['Immigration', '2024 Election', 'Crime'],
        geoSpread: [
            { lat: 32, lng: -110, weight: 0.9 }, // Arizona border
            { lat: 31, lng: -106, weight: 0.85 }, // El Paso
            { lat: 26, lng: -98, weight: 0.8 }, // Rio Grande
        ],
        timeline: [0.4, 0.5, 0.6, 0.7, 0.85, 0.95, 1.0]
    },
];

const statusColors: Record<string, string> = {
    active: '#22c55e',
    emerging: '#f59e0b',
    declining: '#ef4444',
    dormant: '#64748b',
};

export default function NarrativesPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [mapExpanded, setMapExpanded] = useState(false);
    const [selectedNarrative, setSelectedNarrative] = useState<typeof narrativesData[0] | null>(null);

    // Generate map points from all narratives
    const mapPoints: MapPoint[] = useMemo(() => {
        const points: MapPoint[] = [];
        narrativesData.forEach(narrative => {
            narrative.geoSpread?.forEach((gp, i) => {
                points.push({
                    id: `${narrative.id}-${i}`,
                    label: narrative.name,
                    lat: gp.lat,
                    lng: gp.lng,
                    value: gp.weight * narrative.reach,
                    description: narrative.description.slice(0, 60) + '...',
                    href: `/narratives/${narrative.id}`
                });
            });
        });
        return points;
    }, []);

    // Filter narratives
    const filteredNarratives = useMemo(() => {
        return narrativesData.filter(n => {
            const matchesSearch = n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                n.description.toLowerCase().includes(searchQuery.toLowerCase());
            const matchesStatus = !selectedStatus || n.status === selectedStatus;
            return matchesSearch && matchesStatus;
        });
    }, [searchQuery, selectedStatus]);

    const statuses = ['active', 'emerging', 'declining', 'dormant'];

    return (
        <div className="min-h-screen premium-grid-bg">
            <div className="animated-gradient-mesh" />
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-7xl mx-auto">
                <PageHeader
                    title="Narratives"
                    description="Track and analyze the dominant narratives shaping public discourse"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Narratives' }
                    ]}
                />

                {/* Holographic Map - Narrative Spread */}
                <section className="mb-10">
                    <SectionHeader
                        title="Narrative Geographic Spread"
                        subtitle="Where narratives are gaining traction"
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
                        onExpand={() => setMapExpanded(true)}
                        onPointClick={(point) => {
                            const narrative = narrativesData.find(n => n.name === point.label);
                            if (narrative) setSelectedNarrative(narrative);
                        }}
                    />
                </section>

                {/* Search & Filters */}
                <section className="mb-8">
                    <div className="flex flex-col md:flex-row gap-4">
                        <PremiumInput
                            placeholder="Search narratives..."
                            value={searchQuery}
                            onChange={setSearchQuery}
                            icon={<span>🔍</span>}
                            className="flex-1"
                        />
                        <div className="flex gap-2">
                            <PremiumButton
                                variant={selectedStatus === null ? 'primary' : 'default'}
                                size="sm"
                                onClick={() => setSelectedStatus(null)}
                            >
                                All
                            </PremiumButton>
                            {statuses.map(status => (
                                <PremiumButton
                                    key={status}
                                    variant={selectedStatus === status ? 'primary' : 'default'}
                                    size="sm"
                                    onClick={() => setSelectedStatus(status)}
                                >
                                    <span style={{ color: statusColors[status] }}>●</span>
                                    {status.charAt(0).toUpperCase() + status.slice(1)}
                                </PremiumButton>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Narratives List */}
                <section>
                    <SectionHeader
                        title="Active Narratives"
                        subtitle={`${filteredNarratives.length} narratives tracked`}
                    />
                    <div className="space-y-4">
                        {filteredNarratives.map((narrative, index) => (
                            <motion.div
                                key={narrative.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <PremiumCard
                                    variant="interactive"
                                    className="p-6"
                                    onClick={() => setSelectedNarrative(narrative)}
                                >
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Left: Info */}
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="text-xl font-semibold text-white">
                                                    {narrative.name}
                                                </h3>
                                                <PremiumBadge
                                                    variant={narrative.status === 'active' ? 'success' :
                                                        narrative.status === 'declining' ? 'danger' : 'default'}
                                                >
                                                    {narrative.status}
                                                </PremiumBadge>
                                            </div>
                                            <p className="text-sm text-white/50 mb-4">{narrative.description}</p>

                                            {/* Key voices */}
                                            <div className="flex items-center gap-4 text-xs text-white/40 mb-4">
                                                <span>Key Voices:</span>
                                                {narrative.keyVoices.slice(0, 3).map(voice => (
                                                    <span key={voice} className="text-white/60">{voice}</span>
                                                ))}
                                            </div>

                                            {/* Related topics */}
                                            <div className="flex flex-wrap gap-2">
                                                {narrative.relatedTopics.map(topic => (
                                                    <span
                                                        key={topic}
                                                        className="px-2 py-1 text-xs bg-white/5 rounded text-white/60"
                                                    >
                                                        {topic}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Right: Stats & Timeline */}
                                        <div className="lg:w-80 space-y-4">
                                            <div className="flex gap-4">
                                                <div className="flex-1 text-center p-3 bg-white/5 rounded-xl">
                                                    <div className="text-lg font-bold text-white">
                                                        {(narrative.reach / 1000000).toFixed(1)}M
                                                    </div>
                                                    <div className="text-xs text-white/40">Reach</div>
                                                </div>
                                                <div className="flex-1 text-center p-3 bg-white/5 rounded-xl">
                                                    <div className={`text-lg font-bold ${narrative.velocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                        {narrative.velocity > 0 ? '+' : ''}{(narrative.velocity * 100).toFixed(0)}%
                                                    </div>
                                                    <div className="text-xs text-white/40">Velocity</div>
                                                </div>
                                            </div>

                                            {/* Mini timeline chart */}
                                            <div className="h-12 flex items-end gap-1">
                                                {narrative.timeline.map((val, i) => (
                                                    <div
                                                        key={i}
                                                        className="flex-1 rounded-t transition-all duration-300"
                                                        style={{
                                                            height: `${val * 100}%`,
                                                            backgroundColor: narrative.velocity > 0
                                                                ? `rgba(34, 197, 94, ${0.3 + val * 0.5})`
                                                                : `rgba(239, 68, 68, ${0.3 + val * 0.5})`
                                                        }}
                                                    />
                                                ))}
                                            </div>
                                            <div className="text-xs text-white/30 text-center">
                                                7-day trend
                                            </div>
                                        </div>
                                    </div>
                                </PremiumCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Narrative Detail Modal */}
                <AnimatePresence>
                    {selectedNarrative && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                            onClick={() => setSelectedNarrative(null)}
                        >
                            <motion.div
                                initial={{ scale: 0.95, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                exit={{ scale: 0.95, opacity: 0 }}
                                className="w-full max-w-2xl max-h-[80vh] overflow-y-auto"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <PremiumCard className="p-6">
                                    <div className="flex items-start justify-between mb-6">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <h2 className="text-2xl font-bold text-white">
                                                    {selectedNarrative.name}
                                                </h2>
                                                <PremiumBadge
                                                    variant={selectedNarrative.status === 'active' ? 'success' :
                                                        selectedNarrative.status === 'declining' ? 'danger' : 'default'}
                                                >
                                                    {selectedNarrative.status}
                                                </PremiumBadge>
                                            </div>
                                            <p className="text-white/50">{selectedNarrative.description}</p>
                                        </div>
                                        <button
                                            onClick={() => setSelectedNarrative(null)}
                                            className="text-white/50 hover:text-white text-2xl"
                                        >
                                            ×
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-4 mb-6">
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <div className="text-2xl font-bold text-white">
                                                {(selectedNarrative.reach / 1000000).toFixed(1)}M
                                            </div>
                                            <div className="text-xs text-white/40">Total Reach</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <div className={`text-2xl font-bold ${selectedNarrative.velocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {selectedNarrative.velocity > 0 ? '+' : ''}{(selectedNarrative.velocity * 100).toFixed(0)}%
                                            </div>
                                            <div className="text-xs text-white/40">Velocity</div>
                                        </div>
                                        <div className="text-center p-4 bg-white/5 rounded-xl">
                                            <div className={`text-2xl font-bold ${selectedNarrative.sentiment > -0.3 ? 'text-yellow-400' : 'text-red-400'}`}>
                                                {selectedNarrative.sentiment.toFixed(2)}
                                            </div>
                                            <div className="text-xs text-white/40">Sentiment</div>
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xs text-white/40 uppercase mb-3">Key Voices</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNarrative.keyVoices.map(voice => (
                                                <span key={voice} className="px-3 py-1.5 bg-white/5 rounded-lg text-white/70 text-sm">
                                                    {voice}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="mb-6">
                                        <h4 className="text-xs text-white/40 uppercase mb-3">Related Topics</h4>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedNarrative.relatedTopics.map(topic => (
                                                <span key={topic} className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-400 text-sm">
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex gap-3">
                                        <PremiumButton variant="primary" className="flex-1">
                                            View Full Analysis
                                        </PremiumButton>
                                        <PremiumButton variant="default">
                                            Track Narrative
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
