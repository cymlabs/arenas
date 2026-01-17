'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { BubbleData } from '@/components/charts/PackedBubbleChart';

interface DataTableProps {
    data: BubbleData[];
    onRowClick?: (item: BubbleData) => void;
}

type SortField = 'rank' | 'value' | 'change24h' | 'change7d' | 'sentiment' | 'volatility' | 'freshness';
type SortDirection = 'asc' | 'desc';

export function DataTable({ data, onRowClick }: DataTableProps) {
    const [sortField, setSortField] = useState<SortField>('value');
    const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

    // Augment data with derived stats for the "cookie.fun" trading look
    // Since we only have some props in BubbleData, we'll generate consistent mock changes
    const tableData = data.map((item, index) => {
        // Deterministic pseudo-random generation based on ID for consistency
        const seed = item.id.charCodeAt(0) + item.id.length;
        const change24h = (Math.sin(seed) * 25); // -25% to +25%
        const change7d = (Math.cos(seed) * 60); // -60% to +60%
        const volume24h = item.value * (0.8 + Math.abs(Math.sin(seed))); // Related to value
        const marketCap = item.value * 1250; // Arbitrary multiplier

        return {
            ...item,
            rank: index + 1, // Initial rank based on input order (usually value)
            change24h,
            change7d,
            volume24h,
            marketCap,
        };
    });

    const handleSort = (field: SortField) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('desc');
        }
    };

    const sortedData = [...tableData].sort((a, b) => {
        const factor = sortDirection === 'asc' ? 1 : -1;

        // Derived values derived on the fly for sorting
        const getVal = (obj: typeof tableData[0], field: SortField) => {
            switch (field) {
                case 'rank': return obj.value; // Rank usually follows value
                case 'value': return obj.value;
                case 'change24h': return obj.change24h;
                case 'change7d': return obj.change7d;
                case 'sentiment': return obj.sentiment;
                case 'volatility': return obj.volatility || 0;
                case 'freshness': return obj.freshness || 0;
                default: return 0;
            }
        };

        return (getVal(a, sortField) - getVal(b, sortField)) * factor;
    });

    const formatLargeNumber = (num: number) => {
        if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + 'M';
        if (num >= 1_000) return (num / 1_000).toFixed(1) + 'K';
        return num.toFixed(0);
    };

    const formatCurrency = (num: number) => {
        return '$' + formatLargeNumber(num);
    };

    const renderHeader = (label: string, field: SortField, align: 'left' | 'right' | 'center' = 'right') => (
        <th
            className={`py-4 px-4 text-[10px] font-mono text-white/40 uppercase tracking-wider cursor-pointer hover:text-white/80 transition-colors text-${align}`}
            onClick={() => handleSort(field)}
        >
            <div className={`flex items-center gap-1 ${align === 'right' ? 'justify-end' : align === 'center' ? 'justify-center' : 'justify-start'}`}>
                {label}
                {sortField === field && (
                    <span className="text-cyan-400">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
            </div>
        </th>
    );

    return (
        <div className="w-full h-full overflow-auto custom-scrollbar">
            <table className="w-full border-collapse">
                <thead className="sticky top-0 bg-[#020617]/95 backdrop-blur-sm z-10 border-b border-white/10">
                    <tr>
                        <th className="py-4 px-4 text-left text-[10px] font-mono text-white/40 w-12">#</th>
                        {renderHeader('Topic / Narrative', 'value', 'left')}
                        {renderHeader('Mindshare', 'value')}
                        {renderHeader('24h Vol', 'value')}
                        {renderHeader('24h %', 'change24h')}
                        {renderHeader('7d %', 'change7d')}
                        {renderHeader('Sentiment', 'sentiment', 'center')}
                        {renderHeader('Volatility', 'volatility', 'center')}
                        {renderHeader('Freshness', 'freshness', 'center')}
                    </tr>
                </thead>
                <tbody>
                    {sortedData.map((item, i) => (
                        <motion.tr
                            key={item.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.03 }}
                            onClick={() => onRowClick?.(item)}
                            className="group border-b border-white/5 hover:bg-white/5 cursor-pointer transition-colors"
                        >
                            <td className="py-3 px-4 text-white/30 font-mono text-xs max-w-12">
                                {i + 1}
                            </td>
                            <td className="py-3 px-4">
                                <div className="flex flex-col">
                                    <span className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">
                                        {item.label}
                                    </span>
                                    <span className="text-[10px] text-white/40 uppercase tracking-wide">
                                        {item.category}
                                    </span>
                                </div>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-white/90">
                                {item.value.toLocaleString()}
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-white/60">
                                {formatCurrency(item.volume24h)}
                            </td>
                            <td className={`py-3 px-4 text-right font-mono font-bold ${item.change24h >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                {item.change24h > 0 ? '+' : ''}{item.change24h.toFixed(1)}%
                            </td>
                            <td className={`py-3 px-4 text-right font-mono ${item.change7d >= 0 ? 'text-emerald-400/70' : 'text-rose-400/70'}`}>
                                {item.change7d > 0 ? '+' : ''}{item.change7d.toFixed(1)}%
                            </td>
                            <td className="py-3 px-4">
                                <div className="w-24 h-1.5 bg-white/10 rounded-full mx-auto overflow-hidden flex">
                                    {/* Sentiment Bar: Left is Red (Neg), Right is Green (Pos) */}
                                    {/* Map -1..1 to 0..100% */}
                                    <div
                                        className="h-full bg-emerald-500"
                                        style={{ width: `${((item.sentiment + 1) / 2) * 100}%` }}
                                    />
                                    <div className="h-full bg-rose-500 flex-1" />
                                </div>
                                <div className="text-[9px] text-center mt-1 text-white/40 font-mono">
                                    {item.sentiment > 0.2 ? 'Bullish' : item.sentiment < -0.2 ? 'Bearish' : 'Neutral'}
                                </div>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${(item.volatility || 0) > 0.7 ? 'bg-purple-500/20 text-purple-400' : 'text-white/30'
                                    }`}>
                                    {(item.volatility || 0).toFixed(2)}
                                </span>
                            </td>
                            <td className="py-3 px-4 text-center">
                                <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono ${(item.freshness || 0) > 0.7 ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/30'
                                    }`}>
                                    {(item.freshness || 0) > 0.8 ? 'NEW' : (item.freshness || 0).toFixed(1)}
                                </span>
                            </td>
                        </motion.tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
