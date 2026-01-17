'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandIcon, CollapseIcon, MapPinIcon } from '@/components/ui/Icons';

export interface MapPoint {
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

interface WorldMapProps {
    points: MapPoint[];
    height?: number;
    expanded?: boolean;
    onExpand?: () => void;
    onPointClick?: (point: MapPoint) => void;
    interactive?: boolean;
    className?: string;
}

// High-quality SVG world map paths (simplified continents)
const WORLD_PATHS = {
    northAmerica: 'M 30 45 Q 35 35 45 30 Q 55 28 65 35 Q 70 40 72 50 Q 68 55 65 60 Q 60 65 55 68 Q 48 70 40 65 Q 35 60 32 55 Q 28 50 30 45 Z',
    southAmerica: 'M 55 68 Q 58 72 60 80 Q 62 88 58 95 Q 54 98 50 95 Q 48 90 49 85 Q 50 78 52 72 Q 53 70 55 68 Z',
    europe: 'M 90 32 Q 95 30 100 32 Q 105 35 108 38 Q 105 42 100 45 Q 95 44 92 42 Q 89 38 90 32 Z',
    africa: 'M 90 50 Q 95 48 102 52 Q 108 58 110 68 Q 108 78 100 82 Q 92 80 88 72 Q 85 64 88 56 Q 89 52 90 50 Z',
    asia: 'M 110 25 Q 120 22 135 25 Q 150 30 160 38 Q 165 45 162 55 Q 155 62 145 58 Q 135 55 125 52 Q 118 48 115 42 Q 112 35 110 25 Z',
    australia: 'M 150 75 Q 158 72 165 75 Q 170 80 168 88 Q 162 92 155 90 Q 148 86 150 75 Z',
};

// Mercator projection
function latLngToXY(lat: number, lng: number, width: number, height: number): { x: number; y: number } {
    const x = ((lng + 180) / 360) * width;
    const latRad = (lat * Math.PI) / 180;
    const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
    const y = height / 2 - (mercN * height) / (2 * Math.PI);
    return { x, y: Math.max(0, Math.min(height, y)) };
}

// Category colors
const categoryColors: Record<string, string> = {
    reddit: '#FF4500',
    hackernews: '#FF6600',
    github: '#6e5494',
    wikipedia: '#636466',
    usgs: '#228B22',
    politics: '#ef4444',
    tech: '#3b82f6',
    culture: '#8b5cf6',
    default: '#3b82f6',
};

export function WorldMap({
    points,
    height = 400,
    expanded = false,
    onExpand,
    onPointClick,
    interactive = true,
    className = '',
}: WorldMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height });
    const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height: expanded ? 500 : height,
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [height, expanded]);

    // Calculate point positions
    const pointPositions = points.map((point) => ({
        ...point,
        ...latLngToXY(point.lat, point.lng, dimensions.width, dimensions.height),
    }));

    // Mouse move handler
    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        setMousePos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    }, []);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-white/[0.08] ${className}`}
            style={{ height: expanded ? 500 : height }}
            onMouseMove={handleMouseMove}
        >
            {/* Grid overlay */}
            <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* World map SVG */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox="0 0 200 120"
                preserveAspectRatio="xMidYMid slice"
            >
                {/* Gradient definitions */}
                <defs>
                    <linearGradient id="continentGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="rgba(59, 130, 246, 0.15)" />
                        <stop offset="100%" stopColor="rgba(139, 92, 246, 0.1)" />
                    </linearGradient>
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="2" result="blur" />
                        <feMerge>
                            <feMergeNode in="blur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>

                {/* Continent shapes */}
                {Object.entries(WORLD_PATHS).map(([continent, path]) => (
                    <path
                        key={continent}
                        d={path}
                        fill="url(#continentGradient)"
                        stroke="rgba(255,255,255,0.1)"
                        strokeWidth="0.3"
                    />
                ))}
            </svg>

            {/* Data points */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
                {/* Connection lines between nearby points */}
                {pointPositions.map((point, i) =>
                    pointPositions.slice(i + 1).map((other, j) => {
                        const dist = Math.hypot(point.x - other.x, point.y - other.y);
                        if (dist < 150) {
                            return (
                                <line
                                    key={`${point.id}-${other.id}`}
                                    x1={point.x}
                                    y1={point.y}
                                    x2={other.x}
                                    y2={other.y}
                                    stroke="rgba(59, 130, 246, 0.1)"
                                    strokeWidth="1"
                                    strokeDasharray="4 4"
                                />
                            );
                        }
                        return null;
                    })
                )}
            </svg>

            {/* Interactive point markers */}
            {pointPositions.map((point, index) => {
                const color = categoryColors[point.category || 'default'] || categoryColors.default;
                const size = Math.min(60, Math.max(20, Math.log10(point.value + 1) * 15));

                return (
                    <motion.div
                        key={point.id}
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: index * 0.05, type: 'spring', stiffness: 200 }}
                        className={`absolute ${interactive ? 'cursor-pointer' : ''}`}
                        style={{
                            left: point.x,
                            top: point.y,
                            transform: 'translate(-50%, -50%)',
                        }}
                        onMouseEnter={() => setHoveredPoint(point)}
                        onMouseLeave={() => setHoveredPoint(null)}
                        onClick={() => onPointClick?.(point)}
                    >
                        {/* Outer pulse ring */}
                        <motion.div
                            className="absolute rounded-full"
                            style={{
                                width: size * 2,
                                height: size * 2,
                                left: -size / 2,
                                top: -size / 2,
                                background: `radial-gradient(circle, ${color}30 0%, transparent 70%)`,
                            }}
                            animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                        />

                        {/* Inner glow */}
                        <div
                            className="absolute rounded-full blur-sm"
                            style={{
                                width: size,
                                height: size,
                                left: -size / 4,
                                top: -size / 4,
                                backgroundColor: color,
                                opacity: 0.4,
                            }}
                        />

                        {/* Core point */}
                        <div
                            className="relative rounded-full transition-transform hover:scale-125"
                            style={{
                                width: size / 2,
                                height: size / 2,
                                backgroundColor: color,
                                boxShadow: `0 0 ${size / 2}px ${color}80`,
                            }}
                        />

                        {/* Value indicator */}
                        {point.value > 1000 && (
                            <div
                                className="absolute -top-6 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/60 backdrop-blur text-[10px] text-white/80 font-mono whitespace-nowrap"
                            >
                                {point.value > 1000000
                                    ? `${(point.value / 1000000).toFixed(1)}M`
                                    : point.value > 1000
                                        ? `${(point.value / 1000).toFixed(0)}K`
                                        : point.value
                                }
                            </div>
                        )}
                    </motion.div>
                );
            })}

            {/* Hover tooltip */}
            <AnimatePresence>
                {hoveredPoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="fixed z-50 pointer-events-none"
                        style={{
                            left: mousePos.x + 20,
                            top: mousePos.y - 10,
                        }}
                    >
                        <div className="p-3 rounded-xl bg-slate-900/95 backdrop-blur-xl border border-white/10 shadow-2xl min-w-[200px]">
                            <div className="flex items-start gap-3">
                                {hoveredPoint.thumbnail && (
                                    <img
                                        src={hoveredPoint.thumbnail}
                                        alt=""
                                        className="w-12 h-12 rounded-lg object-cover"
                                    />
                                )}
                                <div className="flex-1">
                                    <div className="font-semibold text-white text-sm mb-1">
                                        {hoveredPoint.label}
                                    </div>
                                    {hoveredPoint.description && (
                                        <div className="text-xs text-white/50 mb-2">
                                            {hoveredPoint.description}
                                        </div>
                                    )}
                                    <div className="flex items-center gap-3 text-xs">
                                        <span className="text-white/40">
                                            {hoveredPoint.value.toLocaleString()} engagement
                                        </span>
                                        {hoveredPoint.trend && (
                                            <span className={
                                                hoveredPoint.trend === 'up' ? 'text-green-400' :
                                                    hoveredPoint.trend === 'down' ? 'text-red-400' : 'text-white/40'
                                            }>
                                                {hoveredPoint.trend === 'up' ? '↑' : hoveredPoint.trend === 'down' ? '↓' : '→'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                            {interactive && (
                                <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-white/30 text-center">
                                    Click to explore
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Controls */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2">
                {/* Point count */}
                <div className="px-3 py-1.5 rounded-lg bg-black/40 backdrop-blur text-xs text-white/50 font-mono">
                    {points.length} locations
                </div>

                {/* Expand button */}
                {onExpand && (
                    <button
                        onClick={onExpand}
                        className="p-2 rounded-lg bg-black/40 backdrop-blur text-white/50 hover:text-white hover:bg-black/60 transition-all"
                    >
                        {expanded ? <CollapseIcon size={16} /> : <ExpandIcon size={16} />}
                    </button>
                )}
            </div>

            {/* Legend */}
            <div className="absolute top-4 left-4 flex flex-col gap-1">
                <div className="text-[10px] text-white/30 uppercase tracking-wider mb-1">Activity</div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-gradient-to-r from-blue-500/30 to-blue-500" />
                    <span className="text-[10px] text-white/40">High</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-6 h-1 rounded-full bg-gradient-to-r from-blue-500/10 to-blue-500/40" />
                    <span className="text-[10px] text-white/40">Low</span>
                </div>
            </div>
        </div>
    );
}
