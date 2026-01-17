'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface MapPoint {
    id: string;
    label: string;
    lat: number;
    lng: number;
    value: number;
    category?: string;
    description?: string;
    href?: string;
    thumbnail?: string;
    trend?: 'up' | 'down' | 'stable';
}

interface GeoMapProps {
    points: MapPoint[];
    height?: number;
    expanded?: boolean;
    interactive?: boolean;
    showArrows?: boolean;
    onPointClick?: (point: MapPoint) => void;
    onExpand?: () => void;
    className?: string;
}

// Accurate world map coordinates for major cities
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
    'washington': { lat: 38.9, lng: -77.0 },
    'new york': { lat: 40.7, lng: -74.0 },
    'los angeles': { lat: 34.0, lng: -118.2 },
    'san francisco': { lat: 37.8, lng: -122.4 },
    'chicago': { lat: 41.9, lng: -87.6 },
    'miami': { lat: 25.8, lng: -80.2 },
    'london': { lat: 51.5, lng: -0.1 },
    'paris': { lat: 48.9, lng: 2.3 },
    'berlin': { lat: 52.5, lng: 13.4 },
    'moscow': { lat: 55.8, lng: 37.6 },
    'tokyo': { lat: 35.7, lng: 139.7 },
    'beijing': { lat: 39.9, lng: 116.4 },
    'sydney': { lat: -33.9, lng: 151.2 },
    'delhi': { lat: 28.6, lng: 77.2 },
    'mumbai': { lat: 19.1, lng: 72.9 },
    'dubai': { lat: 25.3, lng: 55.3 },
    'singapore': { lat: 1.3, lng: 103.8 },
    'hong kong': { lat: 22.3, lng: 114.2 },
    'toronto': { lat: 43.7, lng: -79.4 },
    'mexico city': { lat: 19.4, lng: -99.1 },
    'sao paulo': { lat: -23.5, lng: -46.6 },
    'buenos aires': { lat: -34.6, lng: -58.4 },
    'cairo': { lat: 30.0, lng: 31.2 },
    'johannesburg': { lat: -26.2, lng: 28.0 },
    'lagos': { lat: 6.5, lng: 3.4 },
};

// SVG path for accurate world map
const WORLD_MAP_PATH = `M 2,70 L 5,68 L 8,65 L 12,63 L 18,60 L 25,58 L 30,55 L 35,52 L 40,50 L 45,48 L 48,45 L 50,42 L 52,38 L 55,35 L 58,32 L 62,30 L 68,28 L 75,25 L 82,23 L 88,22 L 95,20 L 102,19 L 108,18 L 115,17 L 122,17 L 128,18 L 135,19 L 140,21 L 145,24 L 150,28 L 155,32 L 160,36 L 165,40 L 170,45 L 175,50 L 180,55 L 185,60 L 190,65 L 195,70 L 198,75`;

export function GeoMap({
    points,
    height = 300,
    expanded = false,
    interactive = true,
    showArrows = true,
    onPointClick,
    onExpand,
    className = '',
}: GeoMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: 400 });

    useEffect(() => {
        const updateDimensions = () => {
            if (containerRef.current) {
                setDimensions({
                    width: containerRef.current.offsetWidth,
                    height: expanded ? 500 : height,
                });
            }
        };
        updateDimensions();
        window.addEventListener('resize', updateDimensions);
        return () => window.removeEventListener('resize', updateDimensions);
    }, [expanded, height]);

    // Convert lat/lng to SVG coordinates
    const latLngToXY = useCallback((lat: number, lng: number) => {
        // Mercator projection
        const x = ((lng + 180) / 360) * dimensions.width;
        const latRad = (lat * Math.PI) / 180;
        const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
        const y = (dimensions.height / 2) - (dimensions.width * mercN) / (2 * Math.PI);
        return { x, y: Math.max(20, Math.min(dimensions.height - 40, y)) };
    }, [dimensions]);

    // Get color based on value intensity
    const getPointColor = (point: MapPoint) => {
        if (point.category) {
            const colors: Record<string, string> = {
                politics: '#ef4444',
                tech: '#3b82f6',
                culture: '#8b5cf6',
                media: '#f97316',
                social: '#ec4899',
                science: '#22c55e',
            };
            return colors[point.category] || '#60a5fa';
        }
        return '#60a5fa';
    };

    // Get point size based on value
    const getPointSize = (value: number, maxValue: number) => {
        const normalized = Math.min(1, value / maxValue);
        return 8 + normalized * 16;
    };

    const maxValue = Math.max(...points.map(p => p.value), 1);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 to-slate-950/90 border border-white/10 ${className}`}
            style={{ height: expanded ? 500 : height }}
        >
            {/* Background grid */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(100,150,255,0.3)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>

            {/* World map outline */}
            <svg
                className="absolute inset-0 w-full h-full"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                preserveAspectRatio="xMidYMid meet"
            >
                {/* Simplified continent outlines */}
                <g opacity="0.3" fill="none" stroke="rgba(100,150,255,0.5)" strokeWidth="1">
                    {/* North America */}
                    <path d={`
                        M ${dimensions.width * 0.08} ${dimensions.height * 0.35}
                        Q ${dimensions.width * 0.12} ${dimensions.height * 0.25} ${dimensions.width * 0.18} ${dimensions.height * 0.2}
                        Q ${dimensions.width * 0.25} ${dimensions.height * 0.15} ${dimensions.width * 0.28} ${dimensions.height * 0.25}
                        L ${dimensions.width * 0.25} ${dimensions.height * 0.45}
                        Q ${dimensions.width * 0.22} ${dimensions.height * 0.55} ${dimensions.width * 0.15} ${dimensions.height * 0.55}
                        Q ${dimensions.width * 0.1} ${dimensions.height * 0.5} ${dimensions.width * 0.08} ${dimensions.height * 0.35}
                    `} fill="rgba(100,150,255,0.05)" />

                    {/* South America */}
                    <path d={`
                        M ${dimensions.width * 0.2} ${dimensions.height * 0.55}
                        Q ${dimensions.width * 0.25} ${dimensions.height * 0.6} ${dimensions.width * 0.24} ${dimensions.height * 0.75}
                        Q ${dimensions.width * 0.22} ${dimensions.height * 0.9} ${dimensions.width * 0.18} ${dimensions.height * 0.95}
                        Q ${dimensions.width * 0.15} ${dimensions.height * 0.85} ${dimensions.width * 0.17} ${dimensions.height * 0.65}
                        Q ${dimensions.width * 0.18} ${dimensions.height * 0.55} ${dimensions.width * 0.2} ${dimensions.height * 0.55}
                    `} fill="rgba(100,150,255,0.05)" />

                    {/* Europe */}
                    <path d={`
                        M ${dimensions.width * 0.42} ${dimensions.height * 0.2}
                        Q ${dimensions.width * 0.48} ${dimensions.height * 0.18} ${dimensions.width * 0.52} ${dimensions.height * 0.22}
                        Q ${dimensions.width * 0.55} ${dimensions.height * 0.28} ${dimensions.width * 0.52} ${dimensions.height * 0.35}
                        Q ${dimensions.width * 0.48} ${dimensions.height * 0.38} ${dimensions.width * 0.42} ${dimensions.height * 0.35}
                        Q ${dimensions.width * 0.4} ${dimensions.height * 0.28} ${dimensions.width * 0.42} ${dimensions.height * 0.2}
                    `} fill="rgba(100,150,255,0.05)" />

                    {/* Africa */}
                    <path d={`
                        M ${dimensions.width * 0.42} ${dimensions.height * 0.4}
                        Q ${dimensions.width * 0.5} ${dimensions.height * 0.42} ${dimensions.width * 0.52} ${dimensions.height * 0.55}
                        Q ${dimensions.width * 0.51} ${dimensions.height * 0.75} ${dimensions.width * 0.47} ${dimensions.height * 0.85}
                        Q ${dimensions.width * 0.42} ${dimensions.height * 0.8} ${dimensions.width * 0.4} ${dimensions.height * 0.65}
                        Q ${dimensions.width * 0.38} ${dimensions.height * 0.5} ${dimensions.width * 0.42} ${dimensions.height * 0.4}
                    `} fill="rgba(100,150,255,0.05)" />

                    {/* Asia */}
                    <path d={`
                        M ${dimensions.width * 0.55} ${dimensions.height * 0.15}
                        Q ${dimensions.width * 0.7} ${dimensions.height * 0.12} ${dimensions.width * 0.85} ${dimensions.height * 0.2}
                        Q ${dimensions.width * 0.9} ${dimensions.height * 0.35} ${dimensions.width * 0.85} ${dimensions.height * 0.5}
                        Q ${dimensions.width * 0.75} ${dimensions.height * 0.55} ${dimensions.width * 0.6} ${dimensions.height * 0.5}
                        Q ${dimensions.width * 0.55} ${dimensions.height * 0.4} ${dimensions.width * 0.55} ${dimensions.height * 0.15}
                    `} fill="rgba(100,150,255,0.05)" />

                    {/* Australia */}
                    <path d={`
                        M ${dimensions.width * 0.78} ${dimensions.height * 0.7}
                        Q ${dimensions.width * 0.88} ${dimensions.height * 0.68} ${dimensions.width * 0.9} ${dimensions.height * 0.78}
                        Q ${dimensions.width * 0.88} ${dimensions.height * 0.88} ${dimensions.width * 0.8} ${dimensions.height * 0.85}
                        Q ${dimensions.width * 0.75} ${dimensions.height * 0.78} ${dimensions.width * 0.78} ${dimensions.height * 0.7}
                    `} fill="rgba(100,150,255,0.05)" />
                </g>

                {/* Data points with arrows */}
                {points.map((point, index) => {
                    const { x, y } = latLngToXY(point.lat, point.lng);
                    const size = getPointSize(point.value, maxValue);
                    const color = getPointColor(point);
                    const isHovered = hoveredPoint?.id === point.id;

                    return (
                        <g
                            key={point.id}
                            className={`cursor-pointer transition-all duration-300 ${isHovered ? 'filter drop-shadow-lg' : ''}`}
                            onMouseEnter={() => setHoveredPoint(point)}
                            onMouseLeave={() => setHoveredPoint(null)}
                            onClick={() => onPointClick?.(point)}
                            style={{ transform: isHovered ? 'scale(1.2)' : 'scale(1)', transformOrigin: `${x}px ${y}px` }}
                        >
                            {/* Pulse ring */}
                            <circle
                                cx={x}
                                cy={y}
                                r={size + 8}
                                fill="none"
                                stroke={color}
                                strokeWidth="1"
                                opacity="0.3"
                            >
                                <animate
                                    attributeName="r"
                                    values={`${size};${size + 15};${size}`}
                                    dur="2s"
                                    repeatCount="indefinite"
                                    begin={`${index * 0.3}s`}
                                />
                                <animate
                                    attributeName="opacity"
                                    values="0.4;0;0.4"
                                    dur="2s"
                                    repeatCount="indefinite"
                                    begin={`${index * 0.3}s`}
                                />
                            </circle>

                            {/* Main point */}
                            <circle
                                cx={x}
                                cy={y}
                                r={size}
                                fill={color}
                                opacity="0.8"
                                stroke="white"
                                strokeWidth="2"
                            />

                            {/* Arrow marker pointing down to location */}
                            {showArrows && (
                                <g>
                                    {/* Arrow line */}
                                    <line
                                        x1={x}
                                        y1={y - size - 35}
                                        x2={x}
                                        y2={y - size - 8}
                                        stroke={color}
                                        strokeWidth="2"
                                    />
                                    {/* Arrow head */}
                                    <polygon
                                        points={`${x},${y - size - 5} ${x - 5},${y - size - 12} ${x + 5},${y - size - 12}`}
                                        fill={color}
                                    />
                                    {/* Data label above arrow */}
                                    <rect
                                        x={x - 50}
                                        y={y - size - 70}
                                        width="100"
                                        height="32"
                                        rx="6"
                                        fill="rgba(0,0,0,0.85)"
                                        stroke={color}
                                        strokeWidth="1"
                                    />
                                    <text
                                        x={x}
                                        y={y - size - 52}
                                        textAnchor="middle"
                                        fill="white"
                                        fontSize="11"
                                        fontWeight="600"
                                    >
                                        {point.label.length > 12 ? point.label.slice(0, 12) + '...' : point.label}
                                    </text>
                                    <text
                                        x={x}
                                        y={y - size - 40}
                                        textAnchor="middle"
                                        fill={color}
                                        fontSize="10"
                                    >
                                        {point.value.toLocaleString()} {point.trend === 'up' ? '↑' : point.trend === 'down' ? '↓' : ''}
                                    </text>
                                </g>
                            )}

                            {/* Thumbnail on hover */}
                            {isHovered && point.thumbnail && (
                                <image
                                    x={x + size + 10}
                                    y={y - 30}
                                    width="60"
                                    height="60"
                                    href={point.thumbnail}
                                    clipPath="inset(0 round 8px)"
                                />
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Hover tooltip */}
            <AnimatePresence>
                {hoveredPoint && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute bottom-4 left-4 right-4 p-4 bg-black/90 backdrop-blur-lg rounded-xl border border-white/20 z-20"
                    >
                        <div className="flex items-center gap-4">
                            {hoveredPoint.thumbnail && (
                                <img
                                    src={hoveredPoint.thumbnail}
                                    alt={hoveredPoint.label}
                                    className="w-16 h-16 rounded-lg object-cover"
                                />
                            )}
                            <div className="flex-1">
                                <h4 className="font-semibold text-white">{hoveredPoint.label}</h4>
                                <p className="text-sm text-white/60">{hoveredPoint.description}</p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-white/40">
                                        Engagement: {hoveredPoint.value.toLocaleString()}
                                    </span>
                                    {hoveredPoint.trend && (
                                        <span className={`text-xs ${hoveredPoint.trend === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                                            {hoveredPoint.trend === 'up' ? '↑ Rising' : '↓ Declining'}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <span className="text-white/30 text-sm">Click to explore →</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Map controls */}
            <div className="absolute top-4 right-4 flex gap-2">
                <button
                    onClick={onExpand}
                    className="px-3 py-1.5 text-xs bg-black/60 backdrop-blur border border-white/20 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                    {expanded ? 'Collapse' : 'Expand'}
                </button>
            </div>

            {/* Legend */}
            <div className="absolute bottom-4 right-4 flex items-center gap-3 text-xs text-white/40">
                <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                    <span>Live Data</span>
                </div>
                <span className="text-white/20">|</span>
                <span>{points.length} locations</span>
            </div>
        </div>
    );
}
