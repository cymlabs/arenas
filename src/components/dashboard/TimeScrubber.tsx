'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';

interface TimeScrubberProps {
    range: '1h' | '6h' | '12h' | '24h' | '7d';
    position: number; // 0-1
    isPlaying: boolean;
    onPositionChange: (position: number) => void;
    onPlayPause: () => void;
    onRangeChange: (range: '1h' | '6h' | '12h' | '24h' | '7d') => void;
}

export function TimeScrubber({
    range,
    position,
    isPlaying,
    onPositionChange,
    onPlayPause,
    onRangeChange,
}: TimeScrubberProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [localPosition, setLocalPosition] = useState(position);

    useEffect(() => {
        setLocalPosition(position);
    }, [position]);

    // Auto-play logic
    useEffect(() => {
        if (!isPlaying) return;

        const interval = setInterval(() => {
            onPositionChange(Math.min(1, position + 0.002));
        }, 50);

        return () => clearInterval(interval);
    }, [isPlaying, position, onPositionChange]);

    const handleMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        setIsDragging(true);
        setLocalPosition(Math.max(0, Math.min(1, x)));
        onPositionChange(Math.max(0, Math.min(1, x)));
    }, [onPositionChange]);

    const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        if (!isDragging) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width;
        setLocalPosition(Math.max(0, Math.min(1, x)));
        onPositionChange(Math.max(0, Math.min(1, x)));
    }, [isDragging, onPositionChange]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(false);
    }, []);

    const rangeLabels: Record<string, string> = {
        '1h': '1 hour',
        '6h': '6 hours',
        '12h': '12 hours',
        '24h': '24 hours',
        '7d': '7 days',
    };

    const getTimeLabel = (pos: number) => {
        if (pos >= 0.98) return 'NOW';
        const hoursAgo = Math.round((1 - pos) * (range === '7d' ? 168 : parseInt(range)));
        if (hoursAgo === 0) return 'NOW';
        if (range === '7d' && hoursAgo >= 24) {
            return `${Math.round(hoursAgo / 24)}d ago`;
        }
        return `${hoursAgo}h ago`;
    };

    return (
        <div className="rounded-2xl bg-white/[0.03] border border-white/[0.06] p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Time Machine
                </h3>
                <div className="flex items-center gap-2">
                    {(['1h', '6h', '12h', '24h', '7d'] as const).map((r) => (
                        <button
                            key={r}
                            onClick={() => onRangeChange(r)}
                            className={`px-2 py-1 rounded text-[10px] font-mono transition-all ${range === r
                                    ? 'bg-white/10 text-white'
                                    : 'text-white/40 hover:text-white/60'
                                }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </div>

            {/* Timeline track */}
            <div
                className="relative h-10 cursor-pointer group"
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Background track */}
                <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-1 bg-white/10 rounded-full" />

                {/* Progress bar */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 left-0 h-1 bg-gradient-to-r from-blue-500/50 via-cyan-400/50 to-blue-500/50 rounded-full"
                    style={{ width: `${localPosition * 100}%` }}
                />

                {/* Tick marks */}
                {[0, 0.25, 0.5, 0.75, 1].map((tick) => (
                    <div
                        key={tick}
                        className="absolute top-1/2 -translate-y-1/2 w-px h-3 bg-white/20"
                        style={{ left: `${tick * 100}%` }}
                    />
                ))}

                {/* Handle */}
                <motion.div
                    className="absolute top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-white shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform"
                    style={{ left: `calc(${localPosition * 100}% - 8px)` }}
                    whileTap={{ scale: 0.95 }}
                />

                {/* Time label */}
                <div
                    className="absolute -top-6 text-[10px] text-white/50 font-mono"
                    style={{ left: `${localPosition * 100}%`, transform: 'translateX(-50%)' }}
                >
                    {getTimeLabel(localPosition)}
                </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-between mt-3">
                <span className="text-white/40 text-[10px] font-mono">
                    -{rangeLabels[range]}
                </span>

                <div className="flex items-center gap-3">
                    <button
                        onClick={() => onPositionChange(Math.max(0, position - 0.1))}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 text-xs"
                    >
                        ◀◀
                    </button>

                    <button
                        onClick={onPlayPause}
                        className={`w-9 h-9 rounded-full transition-colors flex items-center justify-center text-sm ${isPlaying
                                ? 'bg-cyan-500/20 text-cyan-400'
                                : 'bg-white/5 hover:bg-white/10 text-white/60'
                            }`}
                    >
                        {isPlaying ? '❚❚' : '▶'}
                    </button>

                    <button
                        onClick={() => onPositionChange(Math.min(1, position + 0.1))}
                        className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-center text-white/60 text-xs"
                    >
                        ▶▶
                    </button>
                </div>

                <span className={`text-[10px] font-mono ${position >= 0.98 ? 'text-cyan-400' : 'text-white/40'}`}>
                    {position >= 0.98 ? 'LIVE' : 'NOW'}
                </span>
            </div>
        </div>
    );
}
