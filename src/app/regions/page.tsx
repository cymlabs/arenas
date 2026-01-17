'use client';

import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { HolographicMap, MapPoint } from '@/components/visualizations/HolographicMap';
import { PremiumCard, PremiumButton, PremiumBadge, PageHeader, SectionHeader } from '@/components/ui/PremiumComponents';

// Region data
const regionsData = [
    {
        id: 'north-america',
        name: 'North America',
        shortName: 'NA',
        centerLat: 40,
        centerLng: -100,
        totalMentions: 2450000,
        topTopics: ['2024 Election', 'Immigration', 'AI Safety'],
        sentiment: -0.15,
        velocity: 0.18,
        countries: ['USA', 'Canada', 'Mexico']
    },
    {
        id: 'europe',
        name: 'Europe',
        shortName: 'EU',
        centerLat: 50,
        centerLng: 10,
        totalMentions: 1850000,
        topTopics: ['Ukraine Aid', 'Climate Policy', 'Immigration'],
        sentiment: 0.05,
        velocity: 0.12,
        countries: ['UK', 'Germany', 'France', 'Italy', 'Spain']
    },
    {
        id: 'asia-pacific',
        name: 'Asia Pacific',
        shortName: 'APAC',
        centerLat: 35,
        centerLng: 120,
        totalMentions: 980000,
        topTopics: ['TikTok Ban', 'AI Safety', 'Tech Regulation'],
        sentiment: 0.1,
        velocity: 0.25,
        countries: ['China', 'Japan', 'South Korea', 'Australia']
    },
    {
        id: 'middle-east',
        name: 'Middle East',
        shortName: 'ME',
        centerLat: 30,
        centerLng: 45,
        totalMentions: 620000,
        topTopics: ['Ukraine Aid', 'Energy Policy', 'Regional Conflict'],
        sentiment: -0.35,
        velocity: 0.08,
        countries: ['Israel', 'Saudi Arabia', 'UAE', 'Qatar']
    },
    {
        id: 'latin-america',
        name: 'Latin America',
        shortName: 'LATAM',
        centerLat: -15,
        centerLng: -60,
        totalMentions: 420000,
        topTopics: ['Immigration', 'Climate Policy', 'Economic Policy'],
        sentiment: -0.1,
        velocity: 0.15,
        countries: ['Brazil', 'Argentina', 'Colombia', 'Chile']
    },
    {
        id: 'africa',
        name: 'Africa',
        shortName: 'AF',
        centerLat: 0,
        centerLng: 20,
        totalMentions: 280000,
        topTopics: ['Climate Policy', 'Economic Development', 'Tech Innovation'],
        sentiment: 0.08,
        velocity: 0.22,
        countries: ['Nigeria', 'South Africa', 'Kenya', 'Egypt']
    },
];

// Map points for regions
const regionMapPoints: MapPoint[] = [
    // North America
    { id: 'na-1', label: 'USA - East Coast', lat: 40.7, lng: -74, value: 850000, category: 'high', description: 'New York, DC corridor' },
    { id: 'na-2', label: 'USA - West Coast', lat: 37, lng: -122, value: 650000, category: 'high', description: 'Silicon Valley, LA' },
    { id: 'na-3', label: 'USA - South', lat: 30, lng: -95, value: 350000, category: 'medium', description: 'Texas, Florida' },
    // Europe
    { id: 'eu-1', label: 'UK', lat: 51.5, lng: -0.1, value: 480000, category: 'high', description: 'London metropolitan' },
    { id: 'eu-2', label: 'Germany', lat: 52.5, lng: 13.4, value: 380000, category: 'high', description: 'Berlin, Munich' },
    { id: 'eu-3', label: 'France', lat: 48.9, lng: 2.3, value: 290000, category: 'medium', description: 'Paris region' },
    // Asia
    { id: 'ap-1', label: 'Japan', lat: 35.7, lng: 139.7, value: 320000, category: 'high', description: 'Tokyo metropolitan' },
    { id: 'ap-2', label: 'Australia', lat: -33.9, lng: 151.2, value: 180000, category: 'medium', description: 'Sydney, Melbourne' },
    // Middle East
    { id: 'me-1', label: 'Israel', lat: 32, lng: 34.8, value: 220000, category: 'high', description: 'Tel Aviv' },
    { id: 'me-2', label: 'UAE', lat: 25.2, lng: 55.3, value: 150000, category: 'medium', description: 'Dubai' },
    // South America
    { id: 'la-1', label: 'Brazil', lat: -23.5, lng: -46.6, value: 180000, category: 'medium', description: 'São Paulo' },
    // Africa
    { id: 'af-1', label: 'South Africa', lat: -33.9, lng: 18.4, value: 95000, category: 'low', description: 'Cape Town' },
];

export default function RegionsPage() {
    const [selectedRegion, setSelectedRegion] = useState<typeof regionsData[0] | null>(null);
    const [mapZoom] = useState(1);

    // Filter map points by selected region
    const filteredMapPoints = useMemo(() => {
        if (!selectedRegion) return regionMapPoints;
        const prefix = selectedRegion.id.slice(0, 2);
        return regionMapPoints.filter(p => p.id.startsWith(prefix));
    }, [selectedRegion]);

    return (
        <div className="min-h-screen premium-grid-bg">
            <div className="animated-gradient-mesh" />
            <MainNavigation />

            <main className="pt-24 px-4 pb-20 max-w-7xl mx-auto">
                <PageHeader
                    title="Regions"
                    description="Explore mindshare and topic engagement across different geographic regions"
                    breadcrumbs={[
                        { label: 'Dashboard', href: '/dashboard' },
                        { label: 'Regions' }
                    ]}
                />

                {/* Full-height Holographic Map */}
                <section className="mb-10">
                    <SectionHeader
                        title="Global Mindshare Map"
                        subtitle={selectedRegion ? `Showing: ${selectedRegion.name}` : 'Click a region for details'}
                        action={
                            selectedRegion && (
                                <PremiumButton
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedRegion(null)}
                                >
                                    Show All Regions
                                </PremiumButton>
                            )
                        }
                    />
                    <HolographicMap
                        points={filteredMapPoints}
                        height={450}
                        expanded={true}
                        showLabels={true}
                        interactive={true}
                        zoom={mapZoom}
                        centerLat={selectedRegion?.centerLat || 20}
                        centerLng={selectedRegion?.centerLng || 0}
                        onPointClick={(point) => {
                            console.log('Point clicked:', point);
                        }}
                        className="transition-all duration-500"
                    />
                </section>

                {/* Region Cards Grid */}
                <section>
                    <SectionHeader
                        title="Regional Overview"
                        subtitle="Select a region to explore"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {regionsData.map((region, index) => (
                            <motion.div
                                key={region.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.08 }}
                            >
                                <PremiumCard
                                    variant="interactive"
                                    className={`p-5 h-full ${selectedRegion?.id === region.id ? 'ring-2 ring-blue-500' : ''}`}
                                    onClick={() => setSelectedRegion(selectedRegion?.id === region.id ? null : region)}
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center text-xl font-bold text-white">
                                            {region.shortName}
                                        </div>
                                        <PremiumBadge
                                            variant={region.velocity > 0.15 ? 'success' : 'default'}
                                            size="sm"
                                        >
                                            {region.velocity > 0 ? '↑' : '↓'} {(region.velocity * 100).toFixed(0)}%
                                        </PremiumBadge>
                                    </div>

                                    <h3 className="text-lg font-semibold text-white mb-1">
                                        {region.name}
                                    </h3>
                                    <p className="text-sm text-white/40 mb-4">
                                        {(region.totalMentions / 1000000).toFixed(2)}M total mentions
                                    </p>

                                    {/* Top Topics */}
                                    <div className="mb-4">
                                        <div className="text-xs text-white/30 mb-2">Top Topics</div>
                                        <div className="flex flex-wrap gap-1">
                                            {region.topTopics.map(topic => (
                                                <span
                                                    key={topic}
                                                    className="px-2 py-0.5 text-xs bg-white/5 rounded text-white/60"
                                                >
                                                    {topic}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Sentiment bar */}
                                    <div className="flex items-center gap-3">
                                        <span className="text-xs text-white/40">Sentiment</span>
                                        <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${(region.sentiment + 1) * 50}%`,
                                                    backgroundColor: region.sentiment > 0 ? '#22c55e' : '#ef4444'
                                                }}
                                            />
                                        </div>
                                        <span className={`text-xs font-medium ${region.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {region.sentiment.toFixed(2)}
                                        </span>
                                    </div>

                                    {/* Countries preview */}
                                    <div className="mt-4 pt-4 border-t border-white/5">
                                        <div className="text-xs text-white/30">
                                            {region.countries.slice(0, 3).join(' • ')}
                                            {region.countries.length > 3 && ` +${region.countries.length - 3} more`}
                                        </div>
                                    </div>
                                </PremiumCard>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Selected Region Detail */}
                {selectedRegion && (
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-10"
                    >
                        <SectionHeader
                            title={`${selectedRegion.name} Details`}
                            subtitle="In-depth regional analysis"
                        />
                        <PremiumCard variant="glow" className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className="text-3xl font-bold text-white mb-1">
                                        {(selectedRegion.totalMentions / 1000000).toFixed(2)}M
                                    </div>
                                    <div className="text-xs text-white/40">Total Mentions</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className={`text-3xl font-bold ${selectedRegion.velocity > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {selectedRegion.velocity > 0 ? '+' : ''}{(selectedRegion.velocity * 100).toFixed(0)}%
                                    </div>
                                    <div className="text-xs text-white/40">Growth Velocity</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className={`text-3xl font-bold ${selectedRegion.sentiment > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {selectedRegion.sentiment.toFixed(2)}
                                    </div>
                                    <div className="text-xs text-white/40">Avg Sentiment</div>
                                </div>
                                <div className="text-center p-4 bg-white/5 rounded-xl">
                                    <div className="text-3xl font-bold text-blue-400">
                                        {selectedRegion.countries.length}
                                    </div>
                                    <div className="text-xs text-white/40">Countries Tracked</div>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <PremiumButton variant="primary">
                                    View Full Report
                                </PremiumButton>
                                <PremiumButton variant="default">
                                    Export Data
                                </PremiumButton>
                            </div>
                        </PremiumCard>
                    </motion.section>
                )}
            </main>
        </div>
    );
}
