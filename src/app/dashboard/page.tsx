'use client';

import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PackedBubbleChart, BubbleData } from '@/components/charts/PackedBubbleChart';
import { TopicTreemap, TreemapData } from '@/components/charts/TopicTreemap';
import { MomentumStream, generateStreamData } from '@/components/charts/MomentumStream';
import { MindshareFlow, demoFlowNodes, demoFlowLinks } from '@/components/charts/MindshareFlow';
import { KPIGrid } from '@/components/dashboard/KPICards';
import { RankedList } from '@/components/dashboard/RankedList';
import { ActivityFeed } from '@/components/dashboard/ActivityFeed';
import { TrendBar } from '@/components/dashboard/TrendBar';
import { ClusterAttractionPanel, generateDemoAttractionData } from '@/components/dashboard/ClusterAttractionPanel';
import { TopicDetailModal } from '@/components/dashboard/TopicDetailModal';
import { MainNavigation } from '@/components/layout/MainNavigation';
import { FixedBottomNav } from '@/components/ui/PremiumComponents';
import { DataTable } from '@/components/dashboard/DataTable';
import { IntelligenceFeed } from '@/components/intelligence/IntelligenceFeed';
import dynamic from 'next/dynamic';

const AttentionFlowScene = dynamic(() => import('@/components/visualizations/3d/AttentionFlowScene'), { ssr: false });

// Demo data with 4th/5th dimensions + audience metrics for overlap calculation
// audienceProfile: [conservative, liberal, young, old, urban, rural, educated, working_class]
// historicalAudience: last 7 days of audience size (normalized)
const topicsData: BubbleData[] = [
  {
    id: 'immigration', label: 'Immigration', value: 125000, velocity: 0.36, sentiment: -0.2,
    category: 'politics', volatility: 0.7, freshness: 0.3,
    audienceProfile: [0.8, 0.2, 0.4, 0.7, 0.4, 0.8, 0.5, 0.7],
    historicalAudience: [0.7, 0.72, 0.75, 0.8, 0.85, 0.92, 1.0]
  },
  {
    id: 'censorship', label: 'Censorship', value: 98000, velocity: 0.35, sentiment: -0.4,
    category: 'tech', volatility: 0.8, freshness: 0.5,
    audienceProfile: [0.6, 0.5, 0.7, 0.4, 0.7, 0.3, 0.8, 0.4],
    historicalAudience: [0.65, 0.7, 0.72, 0.78, 0.85, 0.93, 1.0]
  },
  {
    id: 'ukraine', label: 'Ukraine Aid', value: 88000, velocity: 0.33, sentiment: 0.1,
    category: 'politics', volatility: 0.4, freshness: 0.2,
    audienceProfile: [0.4, 0.7, 0.3, 0.6, 0.6, 0.4, 0.7, 0.4],
    historicalAudience: [0.8, 0.78, 0.82, 0.85, 0.88, 0.95, 1.0]
  },
  {
    id: 'ai', label: 'AI Safety', value: 76000, velocity: 0.28, sentiment: 0.3,
    category: 'tech', volatility: 0.6, freshness: 0.8,
    audienceProfile: [0.4, 0.6, 0.8, 0.2, 0.8, 0.2, 0.9, 0.3],
    historicalAudience: [0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
  },
  {
    id: 'election', label: '2024 Election', value: 145000, velocity: 0.15, sentiment: -0.1,
    category: 'politics', volatility: 0.5, freshness: 0.1,
    audienceProfile: [0.5, 0.5, 0.5, 0.6, 0.5, 0.5, 0.5, 0.5],
    historicalAudience: [0.9, 0.92, 0.93, 0.95, 0.97, 0.98, 1.0]
  },
  {
    id: 'climate', label: 'Climate Policy', value: 54000, velocity: 0.12, sentiment: 0.2,
    category: 'politics', volatility: 0.3, freshness: 0.4,
    audienceProfile: [0.2, 0.8, 0.6, 0.4, 0.7, 0.3, 0.8, 0.4],
    historicalAudience: [0.88, 0.89, 0.90, 0.93, 0.95, 0.97, 1.0]
  },
  {
    id: 'crypto', label: 'Crypto', value: 42000, velocity: -0.08, sentiment: 0.0,
    category: 'tech', volatility: 0.9, freshness: 0.2,
    audienceProfile: [0.5, 0.4, 0.8, 0.2, 0.6, 0.4, 0.6, 0.5],
    historicalAudience: [1.0, 0.98, 0.95, 0.92, 0.88, 0.85, 0.82]
  },
  {
    id: 'tiktok', label: 'TikTok Ban', value: 67000, velocity: 0.22, sentiment: -0.3,
    category: 'media', volatility: 0.6, freshness: 0.7,
    audienceProfile: [0.6, 0.4, 0.9, 0.1, 0.7, 0.4, 0.5, 0.6],
    historicalAudience: [0.5, 0.6, 0.65, 0.75, 0.85, 0.92, 1.0]
  },
  {
    id: 'trans', label: 'Trans Rights', value: 89000, velocity: 0.18, sentiment: -0.5,
    category: 'culture', volatility: 0.85, freshness: 0.15,
    audienceProfile: [0.7, 0.4, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5],
    historicalAudience: [0.85, 0.87, 0.88, 0.90, 0.93, 0.96, 1.0]
  },
  {
    id: 'campus', label: 'Campus Protests', value: 72000, velocity: 0.25, sentiment: -0.3,
    category: 'culture', volatility: 0.75, freshness: 0.9,
    audienceProfile: [0.4, 0.7, 0.9, 0.1, 0.8, 0.2, 0.9, 0.2],
    historicalAudience: [0.3, 0.45, 0.55, 0.7, 0.82, 0.92, 1.0]
  },
];

const voicesData = [
  { id: 'candace', label: 'Candace Owens', value: '212K', change: '+14.8%', changeType: 'positive' as const, color: '#f97316', subtitle: 'Politics, Culture' },
  { id: 'tucker', label: 'Tucker Carlson', value: '198K', change: '+11.2%', changeType: 'positive' as const, color: '#3b82f6', subtitle: 'Politics, Media' },
  { id: 'nick', label: 'Nick Fuentes', value: '180K', change: '+23.2%', changeType: 'positive' as const, color: '#ec4899', subtitle: 'Politics' },
  { id: 'rogan', label: 'Joe Rogan', value: '156K', change: '+8.7%', changeType: 'positive' as const, color: '#ef4444', subtitle: 'Media, Culture' },
  { id: 'charlie', label: 'Charlie Kirk', value: '145K', change: '+11.5%', changeType: 'positive' as const, color: '#fbbf24', subtitle: 'Politics' },
  { id: 'shapiro', label: 'Ben Shapiro', value: '138K', change: '+5.3%', changeType: 'positive' as const, color: '#06b6d4', subtitle: 'Politics, Media' },
  { id: 'alex', label: 'Alex Jones', value: '122K', change: '-2.1%', changeType: 'negative' as const, color: '#22c55e', subtitle: 'Media' },
];

const categoryColors: Record<string, string> = {
  politics: '#ef4444',
  media: '#f97316',
  tech: '#3b82f6',
  culture: '#8b5cf6',
};

// Generate deterministic sparkline based on seed
const generateSparkline = (seed: string) => {
  let h = 0xdeadbeef;
  for (let i = 0; i < seed.length; i++) h = Math.imul(h ^ seed.charCodeAt(i), 2654435761);
  const rand = () => {
    h = Math.imul(h ^ (h >>> 17), 597399067);
    return ((h >>> 0) / 4294967296);
  };
  return Array.from({ length: 12 }, () => rand() * 100);
};

type VizMode = 'bubbles' | 'treemap' | 'stream' | 'flow' | '3d' | 'table';

export default function Dashboard() {
  const [currentTime, setCurrentTime] = useState('');
  const [detailTopic, setDetailTopic] = useState<BubbleData | null>(null);
  const [hoveredTopic, setHoveredTopic] = useState<BubbleData | null>(null);
  const [colorMode, setColorMode] = useState<'sentiment' | 'category'>('category');
  const [vizMode, setVizMode] = useState<VizMode>('flow');
  const [showNoise, setShowNoise] = useState(true);
  const [events, setEvents] = useState<Array<{
    id: string;
    type: 'surge' | 'merge' | 'split' | 'emergence';
    description: string;
    timestamp: number;
  }>>([]);

  // Cluster attraction data
  const attractionData = useMemo(() => generateDemoAttractionData(), []);

  // Update time
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate events
  useEffect(() => {
    const addEvent = () => {
      const types: Array<'surge' | 'merge' | 'split' | 'emergence'> = ['surge', 'merge', 'split', 'emergence'];
      const topic = topicsData[Math.floor(Math.random() * topicsData.length)];
      const type = types[Math.floor(Math.random() * types.length)];

      const descriptions = {
        surge: `"${topic.label}" mentions surging +${Math.floor(Math.random() * 30 + 10)}%`,
        merge: `"${topic.label}" discourse merging with related topics`,
        split: `"${topic.label}" debate fragmenting into subtopics`,
        emergence: `New narrative emerging around "${topic.label}"`,
      };

      const newEvent = {
        id: Date.now().toString(),
        type,
        description: descriptions[type],
        timestamp: Date.now(),
      };

      setEvents(prev => [newEvent, ...prev].slice(0, 50));
    };

    const interval = setInterval(addEvent, 8000);
    return () => clearInterval(interval);
  }, []);

  // Stream data for momentum viz
  const streamData = useMemo(() => {
    // Pass topic IDs first, then hours
    return generateStreamData(topicsData.map(t => t.id), 12);
  }, [topicsData]);

  // Treemap data with enhanced fields
  const treemapData: TreemapData[] = useMemo(() => {
    const maxValue = Math.max(...topicsData.map(t => t.value));
    return topicsData.map(t => ({
      id: t.id,
      name: t.label,
      label: t.label,
      value: t.value,
      category: t.category,
      velocity: t.velocity,
      volatility: t.volatility,
      // Calculate dominance within category
      dominance: t.value / maxValue,
      // Generate historical values from audience profile trend
      historicalValues: t.historicalAudience?.map(v => v * (t.value / 1000)) ||
        Array.from({ length: 7 }, (_, i) => (t.value / 1000) * (0.7 + i * 0.05)),
      // Audience segments from profile
      audienceSegments: t.audienceProfile ? {
        conservative: t.audienceProfile[0],
        liberal: t.audienceProfile[1],
        young: t.audienceProfile[2],
        urban: t.audienceProfile[4],
      } : undefined,
    }));
  }, []);

  // High-level KPI cards
  const kpiData = useMemo(() => [
    {
      label: 'Total Mentions',
      value: '1.24M',
      change: '+12.3% vs yesterday',
      changeType: 'positive' as const,
      sparkline: generateSparkline("total-mentions"),
    },
    {
      label: 'Active Topics',
      value: '24',
      change: '+2 since 6h ago',
      changeType: 'positive' as const,
      sparkline: generateSparkline("active-topics"),
    },
    {
      label: 'Avg Sentiment',
      value: '-0.12',
      change: 'Slightly negative',
      changeType: 'negative' as const,
      sparkline: generateSparkline("avg-sentiment"),
    },
    {
      label: 'Velocity',
      value: '84/min',
      change: 'Accelerating',
      changeType: 'positive' as const,
      sparkline: generateSparkline("velocity"),
    },
  ], []);

  // Topics for ranked list
  const rankedTopics = useMemo(() =>
    [...topicsData]
      .sort((a, b) => b.value - a.value)
      .slice(0, 10)
      .map((t, i) => ({
        id: t.id,
        rank: i + 1,
        label: t.label,
        value: (t.value / 1000).toFixed(0) + 'K',
        change: t.velocity > 0 ? '↑' : '↓',
        color: categoryColors[t.category],
        changeValue: Math.abs(t.velocity * 100).toFixed(0) + '%'
      })),
    []);

  // Trend bar data
  const trendData = useMemo(() =>
    [...topicsData]
      .filter(t => Math.abs(t.velocity) > 0.1)
      .sort((a, b) => b.velocity - a.velocity)
      .slice(0, 6)
      .map((t, i) => {
        // Deterministic trend based on ID
        const seed = t.id.charCodeAt(0);
        const isPos = seed % 2 === 0;
        return {
          id: `trend-${i}`,
          label: t.label,
          change: `${isPos ? '+' : '-'}${Math.floor((seed % 20) + 10)}%`,
          changeType: isPos ? 'positive' as const : 'negative' as const,
          sparkline: generateSparkline(t.id)
        };
      }),
    []);

  // Unused handlers removed


  // Related voices for modal
  const getRelatedVoices = (topicId: string) => {
    // Deterministic random for demo
    return voicesData
      .filter((_, i) => (topicId.length + i) % 2 === 0)
      .slice(0, 3)
      .map(v => ({
        id: v.id,
        name: v.label,
        mentions: parseInt(v.value.replace('K', '000')),
        sentiment: Math.random() * 2 - 1 // Random sentiment -1 to 1
      }));
  };

  // Define Viz Options
  const vizOptions = useMemo<{ id: VizMode; icon: string; label?: string }[]>(() => [
    { id: 'bubbles', icon: '⚪' },
    { id: 'treemap', icon: '🔲' },
    { id: 'stream', icon: '≋' },
    { id: 'flow', icon: '🌊', label: 'Flow' },
    { id: '3d', icon: '🪐', label: '3D' },
    { id: 'table', icon: '📋', label: 'Table' },
  ], []);

  // 3D Viz Data Transformation - Layout nodes by category in clusters
  const vizNodes = useMemo(() => {
    const nodes: Record<string, { label: string; sub: string; x: number; y: number; color: number; value: number; desc: string }> = {};

    // Group topics by category for cluster layout
    const categories = ['politics', 'tech', 'media', 'culture'] as const;
    const categoryPositions: Record<string, { baseX: number; baseY: number }> = {
      politics: { baseX: -15, baseY: 8 },
      tech: { baseX: 15, baseY: 8 },
      media: { baseX: -15, baseY: -8 },
      culture: { baseX: 15, baseY: -8 },
    };

    // Track items per category for offset
    const categoryIndex: Record<string, number> = {};

    topicsData.forEach(t => {
      const catPos = categoryPositions[t.category] || { baseX: 0, baseY: 0 };
      const idx = categoryIndex[t.category] || 0;
      categoryIndex[t.category] = idx + 1;

      // Spread nodes within their cluster area
      const offsetX = (idx % 3) * 6 - 6;
      const offsetY = Math.floor(idx / 3) * 5 - 2.5;

      nodes[t.id] = {
        label: t.label,
        sub: t.category,
        x: catPos.baseX + offsetX,
        y: catPos.baseY + offsetY,
        color: parseInt(categoryColors[t.category].replace('#', '0x')),
        value: t.value > 100000 ? 8 : Math.max(3, t.value / 20000), // Scale value 3-10
        desc: `${t.category.charAt(0).toUpperCase() + t.category.slice(1)} topic with ${t.velocity > 0 ? 'rising' : 'declining'} engagement. ${(t.value / 1000).toFixed(0)}K mentions.`
      };
    });
    return nodes;
  }, []);

  const vizFlows = useMemo(() => {
    const flows: Array<{ from: string, to: string, weight: number }> = [];
    const cats = ['politics', 'tech', 'media', 'culture'];
    cats.forEach(cat => {
      const inCat = topicsData.filter(t => t.category === cat);
      for (let i = 0; i < inCat.length - 1; i++) {
        // Deterministic weight based on ID length
        const weight = (inCat[i].id.length % 3) + 1;
        flows.push({
          from: inCat[i].id,
          to: inCat[i + 1].id,
          weight
        });
      }
      // Connect last back to first for a loop
      if (inCat.length > 1) {
        flows.push({ from: inCat[inCat.length - 1].id, to: inCat[0].id, weight: 2 });
      }
    });
    return flows;
  }, []);

  return (
    <div className="min-h-screen bg-black text-white premium-grid-bg">
      {/* Animated gradient mesh background */}
      <div className="animated-gradient-mesh" />

      {/* Main Navigation */}
      <MainNavigation />

      {/* Fixed Bottom Nav for Visualization Modes */}
      <FixedBottomNav
        items={vizOptions.map(opt => ({
          id: opt.id,
          icon: <span>{opt.icon}</span>,
          label: opt.label || opt.id,
        }))}
        activeId={vizMode}
        onItemClick={(id) => setVizMode(id as VizMode)}
      />

      {/* Main Content */}
      <div className="pt-24 p-6 pb-24">
        {/* Trend Bar */}
        <div className="mb-6">
          <TrendBar trends={trendData} />
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - KPIs */}
          <div className="col-span-12 lg:col-span-2">
            <KPIGrid kpis={kpiData} />
          </div>

          {/* Center - Visualization */}
          <div className="col-span-12 lg:col-span-7">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-4">
                  <h2 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    {vizMode === 'bubbles' && 'Topic Landscape'}
                    {vizMode === 'treemap' && 'Mindshare Distribution'}
                    {vizMode === 'stream' && 'Momentum Over Time'}
                    {vizMode === 'flow' && 'Mindshare Flow'}
                    {vizMode === '3d' && 'Attention Ecology'}
                    {vizMode === 'table' && 'Market Overview'}
                  </h2>

                  {/* Viz Controls */}
                  <div className="flex items-center gap-2">
                    {/* Noise toggle */}
                    <button
                      onClick={() => setShowNoise(!showNoise)}
                      className={`px-2 py-0.5 rounded text-[10px] font-medium transition-all border ${showNoise
                        ? 'bg-purple-500/20 text-purple-400 border-purple-500/30'
                        : 'text-white/40 border-transparent hover:text-white/60'
                        }`}
                      title="Toggle 4D/5D Dimensions"
                    >
                      4D/5D
                    </button>

                    {/* Color mode */}
                    <div className="flex items-center gap-0.5 p-0.5 rounded bg-white/5">
                      <button
                        onClick={() => setColorMode('category')}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${colorMode === 'category' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                      >
                        Category
                      </button>
                      <button
                        onClick={() => setColorMode('sentiment')}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-all ${colorMode === 'sentiment' ? 'bg-white/10 text-white' : 'text-white/40'}`}
                      >
                        Sentiment
                      </button>
                    </div>
                  </div>
                </div>
                {hoveredTopic && (
                  <div className="text-xs text-white/50">
                    <span className="text-white font-medium">{hoveredTopic.label}</span>
                    <span className="mx-2">•</span>
                    <span>{(hoveredTopic.value / 1000).toFixed(0)}K mentions</span>
                    <span className="mx-2">•</span>
                    <span className={hoveredTopic.velocity > 0 ? 'text-green-400' : 'text-red-400'}>
                      {hoveredTopic.velocity > 0 ? '+' : ''}{(hoveredTopic.velocity * 100).toFixed(0)}%
                    </span>
                    {showNoise && hoveredTopic.volatility !== undefined && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="text-purple-400">Vol: {(hoveredTopic.volatility * 100).toFixed(0)}%</span>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-1 w-full relative min-h-[500px]">
                {/* 3D Visualizer */}
                {vizMode === '3d' && (
                  <div className="absolute inset-0 z-10">
                    <AttentionFlowScene nodes={vizNodes} flows={vizFlows} />
                  </div>
                )}

                {/* Data Table */}
                {vizMode === 'table' && (
                  <div className="absolute inset-0 z-10 p-4">
                    <DataTable
                      data={topicsData}
                      onRowClick={(item) => setDetailTopic(item)}
                    />
                  </div>
                )}

                {/* 2D Visualizations */}
                {vizMode !== '3d' && vizMode !== 'table' && (
                  <>
                    <AnimatePresence mode="wait">
                      {vizMode === 'bubbles' && (
                        <motion.div
                          key="bubbles"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <PackedBubbleChart
                            data={topicsData}
                            onBubbleClick={(node) => setDetailTopic(node)}
                            onBubbleHover={setHoveredTopic}
                            showNoise={showNoise}
                            colorMode={colorMode}
                          />
                        </motion.div>
                      )}

                      {vizMode === 'treemap' && (
                        <motion.div
                          key="treemap"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <TopicTreemap
                            data={treemapData}
                            onNodeClick={(node) => setDetailTopic(topicsData.find(t => t.id === node.id) || null)}
                          />
                        </motion.div>
                      )}

                      {vizMode === 'stream' && (
                        <motion.div
                          key="stream"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <MomentumStream
                            data={streamData}
                            keys={topicsData.slice(0, 5).map(t => t.id)}
                            colors={Object.fromEntries(topicsData.map(t => [t.id, categoryColors[t.category] || '#64748b']))}
                            onAreaClick={(key) => {
                              const topic = topicsData.find(t => t.id === key);
                              if (topic) setDetailTopic(topic);
                            }}
                          />
                        </motion.div>
                      )}

                      {vizMode === 'flow' && (
                        <motion.div
                          key="flow"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.3 }}
                          className="h-full"
                        >
                          <MindshareFlow
                            nodes={demoFlowNodes}
                            links={demoFlowLinks}
                            width={1200}
                            height={600}
                          />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </>
                )}
              </div>

              {/* Legend */}
              <div className="flex items-center justify-center gap-6 mt-4 text-xs text-white/40">
                {colorMode === 'category' ? (
                  <>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Politics</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      <span>Tech</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      <span>Media</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-purple-500" />
                      <span>Culture</span>
                    </div>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-red-500" />
                      <span>Negative</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-slate-500" />
                      <span>Neutral</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span>Positive</span>
                    </div>
                  </>
                )}
                {showNoise && vizMode === 'bubbles' && (
                  <>
                    <div className="w-px h-3 bg-white/10 mx-2" />
                    <span className="text-purple-400">〰 = volatile</span>
                    <span className="text-cyan-400">✦ = fresh</span>
                  </>
                )}
              </div>
            </motion.div>

            {/* Cluster Attraction Panel (replaces Time Scrubber) */}
            <div className="mt-4">
              <ClusterAttractionPanel data={attractionData} />
            </div>

            {/* Viz mode legend indicator */}
            <div className="absolute bottom-6 right-6 z-20 text-xs text-white/40 bg-black/40 px-3 py-1.5 rounded-lg">
              {vizOptions.find(v => v.id === vizMode)?.label || vizMode}
            </div>
          </div>

          {/* Right Column - Lists */}
          <div className="col-span-12 lg:col-span-3 space-y-4">
            {/* Intelligence Feed - Core "who said what" component */}
            <div className="p-4 rounded-xl bg-white/[0.02] border border-white/[0.06]">
              <IntelligenceFeed maxItems={4} compact />
            </div>

            <RankedList
              title="Trending Topics"
              items={rankedTopics}
              maxItems={5}
              onItemClick={(item) => {
                const topic = topicsData.find(t => t.id === item.id);
                if (topic) setDetailTopic(topic);
              }}
            />

            <RankedList
              title="Top Voices"
              items={voicesData}
              maxItems={4}
            />

            <ActivityFeed events={events} maxEvents={4} />
          </div>
        </div>
      </div>

      {/* Topic Detail Modal */}
      <TopicDetailModal
        topic={detailTopic}
        onClose={() => setDetailTopic(null)}
        relatedVoices={detailTopic ? getRelatedVoices(detailTopic.id) : []}
      />

      {/* Footer Stats */}
      <div className="fixed bottom-4 left-6 text-[10px] font-mono text-white/30 flex items-center gap-3">
        <span>Topics: {topicsData.length}</span>
        <span>•</span>
        <span>Voices: {voicesData.length}</span>
        <span>•</span>
        <span>Events: {events.length}</span>
        {showNoise && (
          <>
            <span>•</span>
            <span className="text-purple-400/50">4D: Volatility</span>
            <span className="text-cyan-400/50">5D: Freshness</span>
          </>
        )}
      </div>
    </div>
  );
}
