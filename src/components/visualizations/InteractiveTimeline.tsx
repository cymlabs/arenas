'use client';

import { useState, useRef, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ChartIcon, TrendingUpIcon, TrendingDownIcon } from '@/components/ui/Icons';

export interface TimelineEvent {
    id: string;
    date: Date;
    title: string;
    description?: string;
    value?: number;
    sentiment?: number;
    category?: string;
    platform?: string;
}

interface InteractiveTimelineProps {
    events: TimelineEvent[];
    height?: number;
    onEventClick?: (event: TimelineEvent) => void;
    className?: string;
}

// Format date based on zoom level
function formatDate(date: Date, showTime = false): string {
    if (showTime) {
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// Category colors
const categoryColors: Record<string, string> = {
    politics: '#ef4444',
    tech: '#3b82f6',
    culture: '#8b5cf6',
    media: '#f97316',
    social: '#ec4899',
    science: '#22c55e',
    world: '#06b6d4',
    default: '#6b7280',
};

export function InteractiveTimeline({
    events,
    height = 200,
    onEventClick,
    className = '',
}: InteractiveTimelineProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
    const [scrollPosition, setScrollPosition] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);

    // Sort events by date
    const sortedEvents = useMemo(() =>
        [...events].sort((a, b) => a.date.getTime() - b.date.getTime())
        , [events]);

    // Time range
    const timeRange = useMemo(() => {
        if (sortedEvents.length === 0) return { start: new Date(), end: new Date(), duration: 1 };
        const start = sortedEvents[0].date;
        const end = sortedEvents[sortedEvents.length - 1].date;
        const duration = end.getTime() - start.getTime();
        return { start, end, duration: Math.max(duration, 1) };
    }, [sortedEvents]);

    // Event positions (percentage along timeline)
    const eventPositions = useMemo(() =>
        sortedEvents.map(event => ({
            ...event,
            position: ((event.date.getTime() - timeRange.start.getTime()) / timeRange.duration) * 100,
        }))
        , [sortedEvents, timeRange]);

    // Cluster nearby events
    const clusteredEvents = useMemo(() => {
        const clusters: Array<{ position: number; events: typeof eventPositions }> = [];
        let currentCluster: typeof eventPositions = [];
        let lastPosition = -10;

        eventPositions.forEach(event => {
            if (event.position - lastPosition < 3) {
                currentCluster.push(event);
            } else {
                if (currentCluster.length > 0) {
                    const avgPosition = currentCluster.reduce((a, e) => a + e.position, 0) / currentCluster.length;
                    clusters.push({ position: avgPosition, events: currentCluster });
                }
                currentCluster = [event];
            }
            lastPosition = event.position;
        });

        if (currentCluster.length > 0) {
            const avgPosition = currentCluster.reduce((a, e) => a + e.position, 0) / currentCluster.length;
            clusters.push({ position: avgPosition, events: currentCluster });
        }

        return clusters;
    }, [eventPositions]);

    // Mouse/touch handlers for horizontal scrolling
    const handleMouseDown = (e: React.MouseEvent) => {
        if (!containerRef.current) return;
        setIsDragging(true);
        setStartX(e.pageX - containerRef.current.offsetLeft);
        setScrollLeft(containerRef.current.scrollLeft);
    };

    const handleMouseMove = (e: React.MouseEvent) => {
        if (!isDragging || !containerRef.current) return;
        e.preventDefault();
        const x = e.pageX - containerRef.current.offsetLeft;
        const walk = (x - startX) * 2;
        containerRef.current.scrollLeft = scrollLeft - walk;
    };

    const handleMouseUp = () => {
        setIsDragging(false);
    };

    // Update scroll position
    const handleScroll = () => {
        if (containerRef.current) {
            setScrollPosition(containerRef.current.scrollLeft);
        }
    };

    return (
        <div className={`relative ${className}`}>
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <ChartIcon size={16} className="text-white/50" />
                    <span className="text-sm font-medium text-white">Timeline</span>
                    <span className="text-xs text-white/40 font-mono">
                        {formatDate(timeRange.start)} — {formatDate(timeRange.end)}
                    </span>
                </div>
                <div className="text-xs text-white/40 font-mono">
                    {events.length} events
                </div>
            </div>

            {/* Timeline container */}
            <div
                ref={containerRef}
                className="relative overflow-x-auto overflow-y-hidden cursor-grab active:cursor-grabbing"
                style={{ height }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onScroll={handleScroll}
            >
                {/* Timeline track */}
                <div
                    className="relative"
                    style={{
                        width: `max(100%, ${Math.max(800, events.length * 80)}px)`,
                        height: '100%',
                    }}
                >
                    {/* Background grid */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `
                                linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px),
                                linear-gradient(rgba(255,255,255,0.02) 1px, transparent 1px)
                            `,
                            backgroundSize: '60px 40px',
                        }}
                    />

                    {/* Main axis line */}
                    <div
                        className="absolute left-0 right-0 h-px bg-gradient-to-r from-white/0 via-white/20 to-white/0"
                        style={{ top: '60%' }}
                    />

                    {/* Time markers */}
                    {Array.from({ length: 10 }, (_, i) => {
                        const position = i * 10 + 5;
                        const date = new Date(
                            timeRange.start.getTime() +
                            (position / 100) * timeRange.duration
                        );
                        return (
                            <div
                                key={i}
                                className="absolute text-[10px] text-white/30 font-mono"
                                style={{
                                    left: `${position}%`,
                                    top: '75%',
                                    transform: 'translateX(-50%)',
                                }}
                            >
                                {formatDate(date)}
                            </div>
                        );
                    })}

                    {/* Event clusters */}
                    {clusteredEvents.map((cluster, idx) => (
                        <div
                            key={idx}
                            className="absolute"
                            style={{
                                left: `${cluster.position}%`,
                                top: '60%',
                                transform: 'translate(-50%, -50%)',
                            }}
                        >
                            {cluster.events.length > 1 ? (
                                // Stacked cluster
                                <div className="relative">
                                    {cluster.events.slice(0, 3).map((event, i) => (
                                        <motion.button
                                            key={event.id}
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            transition={{ delay: idx * 0.05 + i * 0.02 }}
                                            className="absolute"
                                            style={{
                                                top: `${-i * 20}px`,
                                                left: `${i * 4}px`,
                                                zIndex: 3 - i,
                                            }}
                                            onClick={() => onEventClick?.(event)}
                                            onMouseEnter={() => setHoveredEvent(event.id)}
                                            onMouseLeave={() => setHoveredEvent(null)}
                                        >
                                            <div
                                                className={`w-4 h-4 rounded-full border-2 transition-all ${hoveredEvent === event.id
                                                        ? 'scale-125 border-white'
                                                        : 'border-white/40'
                                                    }`}
                                                style={{
                                                    backgroundColor: categoryColors[event.category || 'default'] + '40',
                                                    borderColor: hoveredEvent === event.id
                                                        ? categoryColors[event.category || 'default']
                                                        : undefined,
                                                }}
                                            />
                                        </motion.button>
                                    ))}
                                    {cluster.events.length > 3 && (
                                        <div className="absolute -top-12 left-0 px-2 py-0.5 rounded bg-white/10 text-[10px] text-white/60 font-mono">
                                            +{cluster.events.length - 3}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                // Single event
                                <motion.button
                                    initial={{ scale: 0, y: 20 }}
                                    animate={{ scale: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => onEventClick?.(cluster.events[0])}
                                    onMouseEnter={() => setHoveredEvent(cluster.events[0].id)}
                                    onMouseLeave={() => setHoveredEvent(null)}
                                    className="relative"
                                >
                                    {/* Stem line */}
                                    <div
                                        className="absolute left-1/2 w-px bg-white/20"
                                        style={{
                                            height: '40px',
                                            top: '50%',
                                            transform: 'translateX(-50%)',
                                        }}
                                    />

                                    {/* Event node */}
                                    <div
                                        className={`relative w-5 h-5 rounded-full border-2 transition-all ${hoveredEvent === cluster.events[0].id
                                                ? 'scale-150'
                                                : ''
                                            }`}
                                        style={{
                                            backgroundColor: categoryColors[cluster.events[0].category || 'default'],
                                            borderColor: '#ffffff20',
                                            boxShadow: hoveredEvent === cluster.events[0].id
                                                ? `0 0 20px ${categoryColors[cluster.events[0].category || 'default']}80`
                                                : undefined,
                                        }}
                                    >
                                        {/* Sentiment indicator */}
                                        {cluster.events[0].sentiment !== undefined && (
                                            <div className="absolute -top-5 left-1/2 -translate-x-1/2">
                                                {cluster.events[0].sentiment > 0.1 ? (
                                                    <TrendingUpIcon size={10} className="text-green-400" />
                                                ) : cluster.events[0].sentiment < -0.1 ? (
                                                    <TrendingDownIcon size={10} className="text-red-400" />
                                                ) : null}
                                            </div>
                                        )}
                                    </div>

                                    {/* Tooltip */}
                                    {hoveredEvent === cluster.events[0].id && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-6 z-50"
                                        >
                                            <div className="px-3 py-2 rounded-lg bg-black/95 border border-white/20 shadow-xl whitespace-nowrap font-mono text-left">
                                                <div className="text-xs text-white font-semibold mb-1">
                                                    {cluster.events[0].title}
                                                </div>
                                                {cluster.events[0].description && (
                                                    <div className="text-[10px] text-white/50 mb-1 max-w-[200px] truncate">
                                                        {cluster.events[0].description}
                                                    </div>
                                                )}
                                                <div className="text-[10px] text-white/30">
                                                    {formatDate(cluster.events[0].date, true)} • {formatDate(cluster.events[0].date)}
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </motion.button>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Scroll gradient overlays */}
            <div className="absolute left-0 top-0 bottom-0 w-16 pointer-events-none bg-gradient-to-r from-black to-transparent z-10" />
            <div className="absolute right-0 top-0 bottom-0 w-16 pointer-events-none bg-gradient-to-l from-black to-transparent z-10" />
        </div>
    );
}
