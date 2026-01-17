'use client';

import { motion } from 'framer-motion';
import { VoiceAttractionSummary, ClusterAttraction, CLUSTER_TYPE_COLORS, getCluster } from '@/types/clusters';

interface ClusterAttractionPanelProps {
    data: VoiceAttractionSummary;
    onClusterClick?: (clusterId: string) => void;
}

export function ClusterAttractionPanel({ data, onClusterClick }: ClusterAttractionPanelProps) {
    const formatPct = (pct: number) => `${Math.round(pct * 100)}%`;
    const formatChange = (change: number) => {
        const pct = Math.round(change * 100);
        if (pct > 0) return `+${pct}%`;
        if (pct < 0) return `${pct}%`;
        return '0%';
    };

    const cluster = getCluster(data.primaryCluster.clusterId);
    const clusterColor = cluster ? CLUSTER_TYPE_COLORS[cluster.type] : '#64748b';

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl bg-white/[0.02] border border-white/[0.06] p-4"
        >
            {/* Header - Main attraction statement */}
            <div className="mb-4">
                <div className="text-white/50 text-xs uppercase tracking-wider mb-2">
                    Cluster Attraction • {data.timeframe}
                </div>
                <div className="text-white text-sm">
                    <span className="font-bold text-lg">{data.voiceName}</span>
                    <span className="text-white/60 mx-2">attracted</span>
                    <span className="font-bold text-xl" style={{ color: clusterColor }}>
                        {formatPct(data.primaryCluster.attractionPct)}
                    </span>
                    <span className="text-white/60 mx-2">of</span>
                    <span className="font-semibold" style={{ color: clusterColor }}>
                        {data.primaryCluster.clusterName}
                    </span>
                </div>
            </div>

            {/* Primary cluster bar */}
            <div className="mb-4">
                <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-white/50">{data.primaryCluster.clusterName}</span>
                    <span className={`font-mono ${data.primaryCluster.netChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatChange(data.primaryCluster.netChange)} from last
                    </span>
                </div>
                <div className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <motion.div
                        className="h-full rounded-full"
                        style={{ backgroundColor: clusterColor }}
                        initial={{ width: 0 }}
                        animate={{ width: `${data.primaryCluster.attractionPct * 100}%` }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                    />
                </div>
            </div>

            {/* Other clusters */}
            <div className="space-y-2">
                {data.otherClusters.slice(0, 4).map((attraction) => {
                    const c = getCluster(attraction.clusterId);
                    const color = c ? CLUSTER_TYPE_COLORS[c.type] : '#64748b';

                    return (
                        <button
                            key={attraction.clusterId}
                            onClick={() => onClusterClick?.(attraction.clusterId)}
                            className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/[0.03] transition-colors group"
                        >
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: color }}
                            />
                            <div className="flex-1 text-left">
                                <span className="text-white/70 text-xs group-hover:text-white/90 transition-colors">
                                    {attraction.clusterName}
                                </span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-20 h-1.5 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full rounded-full"
                                        style={{ backgroundColor: color }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${attraction.attractionPct * 100}%` }}
                                        transition={{ duration: 0.6, delay: 0.1 }}
                                    />
                                </div>
                                <span className="text-white/50 text-xs font-mono w-8 text-right">
                                    {formatPct(attraction.attractionPct)}
                                </span>
                                <span className={`text-xs font-mono w-10 text-right ${attraction.netChange >= 0 ? 'text-green-400/70' : 'text-red-400/70'
                                    }`}>
                                    {formatChange(attraction.netChange)}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Total reach footer */}
            <div className="mt-4 pt-3 border-t border-white/[0.06] flex items-center justify-between">
                <span className="text-white/40 text-xs">Total Reach</span>
                <div className="flex items-center gap-2">
                    <span className="text-white font-mono text-sm">
                        {(data.totalReach / 1000000).toFixed(2)}M
                    </span>
                    <span className={`text-xs font-mono ${data.reachChange >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}>
                        {formatChange(data.reachChange)}
                    </span>
                </div>
            </div>
        </motion.div>
    );
}

// Demo data generator
export function generateDemoAttractionData(): VoiceAttractionSummary {
    return {
        voiceId: 'nick-fuentes',
        voiceName: 'Nick Fuentes',
        timeframe: 'this week',
        primaryCluster: {
            voiceId: 'nick-fuentes',
            voiceName: 'Nick Fuentes',
            clusterId: 'CLU-007',
            clusterName: 'Young Men (18-24)',
            timeframe: 'this week',
            attractionPct: 0.32,
            previousPct: 0.24,
            netChange: 0.08,
            confidence: 0.89,
        },
        otherClusters: [
            { voiceId: 'nick-fuentes', voiceName: 'Nick Fuentes', clusterId: 'CLU-100', clusterName: 'Gaming Community', timeframe: 'this week', attractionPct: 0.25, previousPct: 0.22, netChange: 0.03, confidence: 0.85 },
            { voiceId: 'nick-fuentes', voiceName: 'Nick Fuentes', clusterId: 'CLU-200', clusterName: 'Political Right', timeframe: 'this week', attractionPct: 0.22, previousPct: 0.21, netChange: 0.01, confidence: 0.92 },
            { voiceId: 'nick-fuentes', voiceName: 'Nick Fuentes', clusterId: 'CLU-002', clusterName: 'Young Women (18-24)', timeframe: 'this week', attractionPct: 0.12, previousPct: 0.08, netChange: 0.04, confidence: 0.78 },
            { voiceId: 'nick-fuentes', voiceName: 'Nick Fuentes', clusterId: 'CLU-101', clusterName: 'Crypto/Finance', timeframe: 'this week', attractionPct: 0.09, previousPct: 0.11, netChange: -0.02, confidence: 0.71 },
        ],
        totalReach: 2850000,
        reachChange: 0.14,
    };
}
