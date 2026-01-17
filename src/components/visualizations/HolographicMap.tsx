'use client';

import { useRef, useEffect, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// ================================================================
// TYPES
// ================================================================

export interface MapPoint {
    id: string;
    label: string;
    lat: number;
    lng: number;
    value?: number;
    category?: string;
    description?: string;
    href?: string;
}

interface HolographicMapProps {
    points?: MapPoint[];
    className?: string;
    height?: number;
    expanded?: boolean;
    onExpand?: () => void;
    onPointClick?: (point: MapPoint) => void;
    showLabels?: boolean;
    interactive?: boolean;
    centerLat?: number;
    centerLng?: number;
    zoom?: number;
}

// ================================================================
// HOLOGRAPHIC WORLD MAP COMPONENT
// ================================================================

export function HolographicMap({
    points = [],
    className = '',
    height = 250,
    expanded = false,
    onExpand,
    onPointClick,
    showLabels = true,
    interactive = true,
    centerLat = 30,
    centerLng = 0,
    zoom = 1
}: HolographicMapProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<MapPoint | null>(null);
    const [dimensions, setDimensions] = useState({ width: 800, height: height });
    const animationRef = useRef<number>(0);

    // Update dimensions on resize
    useEffect(() => {
        const updateSize = () => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setDimensions({
                    width: rect.width,
                    height: expanded ? height * 2 : height
                });
            }
        };
        updateSize();
        window.addEventListener('resize', updateSize);
        return () => window.removeEventListener('resize', updateSize);
    }, [expanded, height]);

    // Convert lat/lng to canvas coordinates
    const latLngToXY = useMemo(() => {
        return (lat: number, lng: number) => {
            const x = ((lng - centerLng + 180) / 360) * dimensions.width * zoom;
            const y = ((90 - lat - centerLat + 90) / 180) * dimensions.height * zoom;
            return { x, y };
        };
    }, [dimensions, centerLat, centerLng, zoom]);

    // Draw the holographic map
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        let frame = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Background gradient
            const bgGrad = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, 0,
                canvas.width / 2, canvas.height / 2, canvas.width / 1.5
            );
            bgGrad.addColorStop(0, 'rgba(20, 25, 35, 0.8)');
            bgGrad.addColorStop(1, 'rgba(5, 8, 15, 0.95)');
            ctx.fillStyle = bgGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Draw grid lines (longitude)
            ctx.strokeStyle = 'rgba(100, 150, 200, 0.06)';
            ctx.lineWidth = 1;
            for (let lng = -180; lng <= 180; lng += 30) {
                const { x } = latLngToXY(0, lng);
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, canvas.height);
                ctx.stroke();
            }

            // Draw grid lines (latitude)
            for (let lat = -90; lat <= 90; lat += 30) {
                const { y } = latLngToXY(lat, 0);
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(canvas.width, y);
                ctx.stroke();
            }

            // Draw continent outlines (simplified)
            drawContinentOutlines(ctx, latLngToXY, frame);

            // Draw scan line effect
            const scanY = (frame * 2) % canvas.height;
            const scanGrad = ctx.createLinearGradient(0, scanY - 20, 0, scanY + 20);
            scanGrad.addColorStop(0, 'rgba(100, 200, 255, 0)');
            scanGrad.addColorStop(0.5, 'rgba(100, 200, 255, 0.05)');
            scanGrad.addColorStop(1, 'rgba(100, 200, 255, 0)');
            ctx.fillStyle = scanGrad;
            ctx.fillRect(0, scanY - 20, canvas.width, 40);

            // Draw data points
            points.forEach(point => {
                const { x, y } = latLngToXY(point.lat, point.lng);
                const isHovered = hoveredPoint?.id === point.id;
                const pulseRadius = 4 + Math.sin(frame * 0.05 + points.indexOf(point)) * 2;

                // Outer pulse
                ctx.beginPath();
                ctx.arc(x, y, pulseRadius + (isHovered ? 6 : 3), 0, Math.PI * 2);
                ctx.fillStyle = isHovered
                    ? 'rgba(59, 130, 246, 0.3)'
                    : 'rgba(100, 150, 200, 0.15)';
                ctx.fill();

                // Inner glow
                const pointGrad = ctx.createRadialGradient(x, y, 0, x, y, pulseRadius + 2);
                pointGrad.addColorStop(0, isHovered ? '#60a5fa' : 'rgba(200, 220, 255, 0.9)');
                pointGrad.addColorStop(1, 'transparent');
                ctx.beginPath();
                ctx.arc(x, y, pulseRadius + 2, 0, Math.PI * 2);
                ctx.fillStyle = pointGrad;
                ctx.fill();

                // Core dot
                ctx.beginPath();
                ctx.arc(x, y, 3, 0, Math.PI * 2);
                ctx.fillStyle = isHovered ? '#3b82f6' : 'rgba(200, 220, 255, 0.8)';
                ctx.fill();
            });

            // Vignette overlay
            const vignetteGrad = ctx.createRadialGradient(
                canvas.width / 2, canvas.height / 2, canvas.width * 0.2,
                canvas.width / 2, canvas.height / 2, canvas.width * 0.7
            );
            vignetteGrad.addColorStop(0, 'transparent');
            vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.6)');
            ctx.fillStyle = vignetteGrad;
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Noise overlay (static effect)
            if (frame % 3 === 0) {
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const data = imageData.data;
                for (let i = 0; i < data.length; i += 4) {
                    const noise = (Math.random() - 0.5) * 8;
                    data[i] += noise;
                    data[i + 1] += noise;
                    data[i + 2] += noise;
                }
                ctx.putImageData(imageData, 0, 0);
            }

            frame++;
            animationRef.current = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            cancelAnimationFrame(animationRef.current);
        };
    }, [dimensions, points, hoveredPoint, latLngToXY]);

    // Handle mouse move for point detection
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!interactive) return;
        const rect = canvasRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        let foundPoint: MapPoint | null = null;
        for (const point of points) {
            const { x, y } = latLngToXY(point.lat, point.lng);
            const dist = Math.sqrt((mouseX - x) ** 2 + (mouseY - y) ** 2);
            if (dist < 20) {
                foundPoint = point;
                break;
            }
        }
        setHoveredPoint(foundPoint);
    };

    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (hoveredPoint) {
            onPointClick?.(hoveredPoint);
        } else if (onExpand) {
            onExpand();
        }
    };

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-xl border border-white/5 ${className}`}
        >
            <canvas
                ref={canvasRef}
                className={`w-full ${interactive ? 'cursor-crosshair' : ''} ${hoveredPoint ? 'cursor-pointer' : ''}`}
                style={{ height: dimensions.height }}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHoveredPoint(null)}
                onClick={handleClick}
            />

            {/* Hover tooltip */}
            <AnimatePresence>
                {hoveredPoint && showLabels && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute pointer-events-none z-10 px-3 py-2 bg-black/90 backdrop-blur-md rounded-lg border border-white/10 text-sm"
                        style={{
                            left: latLngToXY(hoveredPoint.lat, hoveredPoint.lng).x + 15,
                            top: latLngToXY(hoveredPoint.lat, hoveredPoint.lng).y - 10
                        }}
                    >
                        <div className="font-medium text-white">{hoveredPoint.label}</div>
                        {hoveredPoint.description && (
                            <div className="text-white/50 text-xs mt-0.5">{hoveredPoint.description}</div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Expand button */}
            {onExpand && !expanded && (
                <button
                    onClick={onExpand}
                    className="absolute bottom-3 right-3 px-3 py-1.5 text-xs text-white/70 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 transition-all"
                >
                    Expand Map
                </button>
            )}

            {/* Map label */}
            <div className="absolute top-3 left-3 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <span className="text-xs text-white/40 uppercase tracking-wider">Holographic View</span>
            </div>
        </div>
    );
}

// ================================================================
// SIMPLIFIED CONTINENT OUTLINES
// ================================================================

function drawContinentOutlines(
    ctx: CanvasRenderingContext2D,
    latLngToXY: (lat: number, lng: number) => { x: number; y: number },
    frame: number
) {
    ctx.strokeStyle = `rgba(100, 150, 200, ${0.15 + Math.sin(frame * 0.01) * 0.05})`;
    ctx.lineWidth = 1;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // North America (simplified)
    drawPath(ctx, latLngToXY, [
        [70, -140], [70, -90], [60, -75], [45, -65], [35, -75],
        [25, -80], [20, -100], [30, -115], [35, -120], [45, -125],
        [55, -130], [60, -140], [70, -140]
    ]);

    // South America (simplified)
    drawPath(ctx, latLngToXY, [
        [10, -75], [0, -80], [-10, -75], [-20, -70], [-35, -60],
        [-55, -70], [-55, -75], [-35, -70], [-25, -50], [-10, -35],
        [0, -50], [10, -75]
    ]);

    // Europe (simplified)
    drawPath(ctx, latLngToXY, [
        [70, 25], [70, 60], [60, 50], [55, 35], [50, 5],
        [45, -5], [40, 0], [35, 30], [45, 45], [55, 40],
        [60, 30], [70, 25]
    ]);

    // Africa (simplified)
    drawPath(ctx, latLngToXY, [
        [35, -5], [35, 35], [30, 35], [15, 42], [5, 40],
        [-5, 40], [-15, 35], [-25, 30], [-35, 25], [-35, 20],
        [-25, 15], [-15, 12], [0, 8], [15, -15], [25, -5],
        [35, -5]
    ]);

    // Asia (simplified)
    drawPath(ctx, latLngToXY, [
        [70, 60], [70, 180], [60, 165], [55, 140], [40, 140],
        [35, 130], [25, 120], [20, 100], [10, 100], [25, 75],
        [35, 75], [45, 70], [55, 60], [70, 60]
    ]);

    // Australia (simplified)
    drawPath(ctx, latLngToXY, [
        [-15, 130], [-12, 145], [-20, 150], [-30, 155],
        [-40, 150], [-38, 140], [-35, 135], [-30, 130],
        [-20, 125], [-15, 130]
    ]);
}

function drawPath(
    ctx: CanvasRenderingContext2D,
    latLngToXY: (lat: number, lng: number) => { x: number; y: number },
    coords: [number, number][]
) {
    if (coords.length < 2) return;
    ctx.beginPath();
    const start = latLngToXY(coords[0][0], coords[0][1]);
    ctx.moveTo(start.x, start.y);
    for (let i = 1; i < coords.length; i++) {
        const { x, y } = latLngToXY(coords[i][0], coords[i][1]);
        ctx.lineTo(x, y);
    }
    ctx.stroke();
}
