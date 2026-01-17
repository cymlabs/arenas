'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import * as d3 from 'd3';

export interface BubbleData {
    id: string;
    label: string;
    value: number;          // Size (mentions, mindshare %)
    velocity: number;       // Growth rate (-1 to 1)
    sentiment: number;      // -1 (negative) to 1 (positive)
    category: string;       // For color grouping
    volatility?: number;    // 4th dimension: 0-1, discourse stability
    freshness?: number;     // 5th dimension: 0-1, how new the topic is
    platform?: string;
    // NEW: Audience metrics for overlap calculation
    audienceProfile?: number[];  // Array of audience segment weights
    historicalAudience?: number[]; // Past audience sizes for inflow/outflow
}

// Audience overlap calculation - shared audience between two topics
export interface AudienceOverlap {
    source: string;
    target: string;
    overlap: number;        // 0-1 similarity score
    direction: 'inflow' | 'outflow' | 'bidirectional';
    magnitude: number;      // Flow strength
    trend: 'growing' | 'stable' | 'declining';
}

interface PackedBubbleChartProps {
    data: BubbleData[];
    overlaps?: AudienceOverlap[];   // Pre-calculated overlaps
    width?: number;
    height?: number;
    onBubbleClick?: (bubble: BubbleData) => void;
    onBubbleHover?: (bubble: BubbleData | null) => void;
    selectedId?: string | null;
    colorMode?: 'sentiment' | 'category';
    showNoise?: boolean;
    showConnections?: boolean;  // Show audience overlap connections
    showFlowParticles?: boolean; // Show inflow/outflow particles
}

// Category colors
const categoryColors: Record<string, string> = {
    politics: '#ef4444',
    media: '#f97316',
    tech: '#3b82f6',
    culture: '#8b5cf6',
    social: '#22c55e',
    default: '#64748b',
};

// Sentiment color scale
const sentimentColorScale = d3.scaleLinear<string>()
    .domain([-1, 0, 1])
    .range(['#ef4444', '#64748b', '#22c55e']);

// Calculate audience overlap between all topic pairs
function calculateAudienceOverlaps(data: BubbleData[]): AudienceOverlap[] {
    const overlaps: AudienceOverlap[] = [];

    for (let i = 0; i < data.length; i++) {
        for (let j = i + 1; j < data.length; j++) {
            const a = data[i];
            const b = data[j];

            // Use audience profile if available, otherwise use category similarity + value correlation
            let overlap = 0;

            if (a.audienceProfile && b.audienceProfile) {
                // Cosine similarity between audience profiles
                const dotProduct = a.audienceProfile.reduce((sum, val, idx) =>
                    sum + val * (b.audienceProfile?.[idx] || 0), 0);
                const magA = Math.sqrt(a.audienceProfile.reduce((sum, val) => sum + val * val, 0));
                const magB = Math.sqrt(b.audienceProfile.reduce((sum, val) => sum + val * val, 0));
                overlap = magA && magB ? dotProduct / (magA * magB) : 0;
            } else {
                // Fallback: category similarity + sentiment correlation
                const categorySim = a.category === b.category ? 0.5 : 0.1;
                const sentimentSim = 1 - Math.abs(a.sentiment - b.sentiment) / 2;
                const valueSim = 1 - Math.abs(Math.log(a.value) - Math.log(b.value)) / 10;
                overlap = (categorySim * 0.4 + sentimentSim * 0.3 + valueSim * 0.3);
            }

            // Only include significant overlaps
            if (overlap > 0.25) {
                // Calculate flow direction based on velocity difference
                let direction: 'inflow' | 'outflow' | 'bidirectional' = 'bidirectional';
                const velocityDiff = a.velocity - b.velocity;
                if (Math.abs(velocityDiff) > 0.1) {
                    direction = velocityDiff > 0 ? 'inflow' : 'outflow';
                }

                // Determine trend from historical data
                let trend: 'growing' | 'stable' | 'declining' = 'stable';
                if (a.historicalAudience && b.historicalAudience) {
                    const aChange = a.historicalAudience[a.historicalAudience.length - 1] - a.historicalAudience[0];
                    const bChange = b.historicalAudience[b.historicalAudience.length - 1] - b.historicalAudience[0];
                    const avgChange = (aChange + bChange) / 2;
                    if (avgChange > 0.1) trend = 'growing';
                    else if (avgChange < -0.1) trend = 'declining';
                }

                overlaps.push({
                    source: a.id,
                    target: b.id,
                    overlap,
                    direction,
                    magnitude: overlap * Math.max(a.value, b.value) / 100000,
                    trend
                });
            }
        }
    }

    return overlaps;
}

// Calculate "solidity" score based on mindshare dominance
function calculateSolidity(value: number, maxValue: number, velocity: number): number {
    // Higher mindshare = more solid (0.3 - 1.0 range)
    const basesolidity = 0.3 + (value / maxValue) * 0.7;
    // Positive velocity increases solidity (momentum = crystallization)
    const momentumBonus = Math.max(0, velocity) * 0.2;
    return Math.min(1, basesolidity + momentumBonus);
}

export function PackedBubbleChart({
    data,
    overlaps,
    width = 600,
    height = 400,
    onBubbleClick,
    onBubbleHover,
    selectedId,
    colorMode = 'category',
    showNoise = true,
    showConnections = true,
    showFlowParticles = true,
}: PackedBubbleChartProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);
    const animationRef = useRef<number>(0);

    // Calculate overlaps if not provided
    const calculatedOverlaps = useMemo(() =>
        overlaps || calculateAudienceOverlaps(data), [data, overlaps]);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const maxValue = d3.max(data, d => d.value) || 1;

        // Create defs for filters and patterns
        const defs = svg.append('defs');

        // Noise filter for volatility (4th dimension)
        const noiseFilter = defs.append('filter')
            .attr('id', 'noiseFilter')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');

        noiseFilter.append('feTurbulence')
            .attr('type', 'fractalNoise')
            .attr('baseFrequency', '0.9')
            .attr('numOctaves', '4')
            .attr('result', 'noise');

        noiseFilter.append('feDisplacementMap')
            .attr('in', 'SourceGraphic')
            .attr('in2', 'noise')
            .attr('scale', '3')
            .attr('xChannelSelector', 'R')
            .attr('yChannelSelector', 'G');

        // Crystalline gradient for high-solidity bubbles
        const crystalGrad = defs.append('radialGradient')
            .attr('id', 'crystalGradient')
            .attr('cx', '30%')
            .attr('cy', '30%');
        crystalGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(255,255,255,0.8)');
        crystalGrad.append('stop').attr('offset', '40%').attr('stop-color', 'rgba(255,255,255,0.1)');
        crystalGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(255,255,255,0)');

        // Ethereal gradient for low-solidity bubbles
        const etherealGrad = defs.append('radialGradient')
            .attr('id', 'etherealGradient')
            .attr('cx', '50%')
            .attr('cy', '50%');
        etherealGrad.append('stop').attr('offset', '0%').attr('stop-color', 'rgba(255,255,255,0.05)');
        etherealGrad.append('stop').attr('offset', '100%').attr('stop-color', 'rgba(0,0,0,0.3)');

        // Glow filter
        const glowFilter = defs.append('filter')
            .attr('id', 'glow')
            .attr('x', '-100%')
            .attr('y', '-100%')
            .attr('width', '300%')
            .attr('height', '300%');
        glowFilter.append('feGaussianBlur').attr('stdDeviation', '6').attr('result', 'coloredBlur');
        const feMerge = glowFilter.append('feMerge');
        feMerge.append('feMergeNode').attr('in', 'coloredBlur');
        feMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Inner shadow for depth
        const innerShadow = defs.append('filter')
            .attr('id', 'innerShadow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        innerShadow.append('feGaussianBlur').attr('in', 'SourceAlpha').attr('stdDeviation', '4').attr('result', 'blur');
        innerShadow.append('feOffset').attr('in', 'blur').attr('dx', '2').attr('dy', '2').attr('result', 'offsetBlur');
        const innerMerge = innerShadow.append('feMerge');
        innerMerge.append('feMergeNode').attr('in', 'offsetBlur');
        innerMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Arrow marker for flow direction
        defs.append('marker')
            .attr('id', 'flowArrow')
            .attr('viewBox', '0 -5 10 10')
            .attr('refX', 8)
            .attr('refY', 0)
            .attr('markerWidth', 4)
            .attr('markerHeight', 4)
            .attr('orient', 'auto')
            .append('path')
            .attr('d', 'M0,-5L10,0L0,5')
            .attr('fill', 'rgba(255,255,255,0.5)');

        // Create container group
        const g = svg.append('g')
            .attr('transform', `translate(${width / 2}, ${height / 2})`);

        // Scale for bubble radius
        const radiusScale = d3.scaleSqrt()
            .domain([0, maxValue])
            .range([18, Math.min(width, height) / 4.5]);

        // Create simulation nodes with enhanced properties
        const nodes = data.map(d => ({
            ...d,
            radius: radiusScale(d.value),
            x: (Math.random() - 0.5) * width * 0.3,
            y: (Math.random() - 0.5) * height * 0.3,
            volatility: d.volatility ?? Math.random() * 0.5 + 0.2,
            freshness: d.freshness ?? Math.random() * 0.7 + 0.1,
            solidity: calculateSolidity(d.value, maxValue, d.velocity),
        }));

        // Create lookup for node positions
        const nodeMap = new Map(nodes.map(n => [n.id, n]));

        // Force simulation with enhanced physics
        const simulation = d3.forceSimulation(nodes)
            .force('charge', d3.forceManyBody().strength(d =>
                // Higher solidity = stronger attraction
                8 + (d as typeof nodes[0]).solidity * 15
            ))
            .force('center', d3.forceCenter(0, 0))
            .force('collision', d3.forceCollide<typeof nodes[0]>()
                .radius(d => d.radius + 6)
                .strength(0.95))
            .force('x', d3.forceX(0).strength(0.04))
            .force('y', d3.forceY(0).strength(0.04));

        // Layer group for connections (behind bubbles)
        const connectionLayer = g.append('g').attr('class', 'connection-layer');

        // Layer for bubbles
        const bubbleLayer = g.append('g').attr('class', 'bubble-layer');

        // Layer for flow particles (on top)
        const particleLayer = g.append('g').attr('class', 'particle-layer');

        // Draw audience overlap connections
        if (showConnections) {
            const connectionLines = connectionLayer.selectAll('.connection')
                .data(calculatedOverlaps)
                .join('g')
                .attr('class', 'connection');

            // Connection line
            connectionLines.append('path')
                .attr('class', 'connection-line')
                .attr('fill', 'none')
                .attr('stroke', d => {
                    if (d.trend === 'growing') return 'rgba(34, 197, 94, 0.3)';
                    if (d.trend === 'declining') return 'rgba(239, 68, 68, 0.3)';
                    return 'rgba(255, 255, 255, 0.15)';
                })
                .attr('stroke-width', d => 1 + d.overlap * 3)
                .attr('stroke-dasharray', d => d.direction === 'bidirectional' ? 'none' : '4,4')
                .attr('marker-end', d => d.direction !== 'bidirectional' ? 'url(#flowArrow)' : null);

            // Overlap strength indicator (pulsing circle at midpoint)
            connectionLines.append('circle')
                .attr('class', 'overlap-indicator')
                .attr('r', d => 3 + d.overlap * 5)
                .attr('fill', d => {
                    if (d.trend === 'growing') return 'rgba(34, 197, 94, 0.6)';
                    if (d.trend === 'declining') return 'rgba(239, 68, 68, 0.6)';
                    return 'rgba(255, 255, 255, 0.4)';
                })
                .attr('opacity', 0.6);
        }

        // Create bubble groups
        const bubbleGroups = bubbleLayer.selectAll('.bubble-group')
            .data(nodes)
            .join('g')
            .attr('class', 'bubble-group')
            .style('cursor', 'pointer');

        // Outer aura (stronger for high solidity)
        bubbleGroups.append('circle')
            .attr('class', 'bubble-aura')
            .attr('r', d => d.radius + 12 + d.solidity * 8)
            .attr('fill', d => {
                const color = colorMode === 'sentiment'
                    ? sentimentColorScale(d.sentiment)
                    : categoryColors[d.category] || categoryColors.default;
                return color;
            })
            .attr('opacity', d => 0.05 + d.solidity * 0.15)
            .attr('filter', 'url(#glow)');

        // Main bubble with solidity-based appearance
        bubbleGroups.append('circle')
            .attr('class', 'bubble-main')
            .attr('r', d => d.radius)
            .attr('fill', d => {
                const color = colorMode === 'sentiment'
                    ? sentimentColorScale(d.sentiment)
                    : categoryColors[d.category] || categoryColors.default;
                return color;
            })
            .attr('opacity', d => 0.4 + d.solidity * 0.55)  // Solidity affects opacity
            .attr('stroke', d => {
                if (d.id === selectedId) return '#ffffff';
                if (d.id === hoveredId) return 'rgba(255,255,255,0.8)';
                // More solid = sharper border
                return `rgba(255,255,255,${0.1 + d.solidity * 0.4})`;
            })
            .attr('stroke-width', d => 1 + d.solidity * 2)
            .attr('filter', d => {
                if (showNoise && d.volatility > 0.5) return 'url(#noiseFilter)';
                if (d.solidity > 0.7) return 'url(#innerShadow)';
                return null;
            });

        // Crystal/ethereal overlay based on solidity
        bubbleGroups.append('circle')
            .attr('class', 'bubble-overlay')
            .attr('r', d => d.radius)
            .attr('fill', d => d.solidity > 0.6 ? 'url(#crystalGradient)' : 'url(#etherealGradient)')
            .attr('opacity', d => d.solidity > 0.6 ? 0.6 : 0.3)
            .attr('pointer-events', 'none');

        // Inner core (crystalline center for high solidity)
        bubbleGroups.filter(d => d.solidity > 0.5)
            .append('circle')
            .attr('class', 'bubble-core')
            .attr('r', d => d.radius * 0.3 * d.solidity)
            .attr('fill', d => {
                const color = colorMode === 'sentiment'
                    ? sentimentColorScale(d.sentiment)
                    : categoryColors[d.category] || categoryColors.default;
                return d3.color(color)?.brighter(1.5)?.toString() || color;
            })
            .attr('opacity', d => 0.4 + d.solidity * 0.4)
            .attr('pointer-events', 'none');

        // Velocity ring indicator (pulsing for trending)
        bubbleGroups.each(function (d) {
            if (Math.abs(d.velocity) > 0.15) {
                const group = d3.select(this);
                group.append('circle')
                    .attr('class', 'pulse-ring')
                    .attr('r', d.radius)
                    .attr('fill', 'none')
                    .attr('stroke', d.velocity > 0 ? '#22c55e' : '#ef4444')
                    .attr('stroke-width', 2)
                    .attr('opacity', 0);
            }
        });

        // Inflow/Outflow indicators (arrows around edge)
        bubbleGroups.each(function (d) {
            const nodeOverlaps = calculatedOverlaps.filter(
                o => (o.source === d.id || o.target === d.id) && o.direction !== 'bidirectional'
            );

            if (nodeOverlaps.length > 0) {
                const group = d3.select(this);
                const inflowCount = nodeOverlaps.filter(o =>
                    (o.target === d.id && o.direction === 'inflow') ||
                    (o.source === d.id && o.direction === 'outflow')
                ).length;
                const outflowCount = nodeOverlaps.length - inflowCount;

                // Inflow indicator (arrows pointing in)
                if (inflowCount > 0) {
                    group.append('text')
                        .attr('class', 'flow-indicator inflow')
                        .attr('x', -d.radius - 12)
                        .attr('y', 4)
                        .attr('font-size', 12)
                        .attr('fill', '#22c55e')
                        .attr('opacity', 0.7)
                        .text(`→${inflowCount}`);
                }

                // Outflow indicator (arrows pointing out)
                if (outflowCount > 0) {
                    group.append('text')
                        .attr('class', 'flow-indicator outflow')
                        .attr('x', d.radius + 4)
                        .attr('y', 4)
                        .attr('font-size', 12)
                        .attr('fill', '#ef4444')
                        .attr('opacity', 0.7)
                        .text(`${outflowCount}→`);
                }
            }
        });

        // Label with solidity-based styling
        bubbleGroups.append('text')
            .attr('class', 'bubble-label')
            .attr('text-anchor', 'middle')
            .attr('dy', '-0.1em')
            .attr('fill', '#ffffff')
            .attr('font-size', d => Math.max(10, Math.min(14, d.radius / 3.5)))
            .attr('font-weight', d => d.solidity > 0.7 ? '700' : '600')
            .attr('pointer-events', 'none')
            .attr('filter', 'drop-shadow(0 1px 3px rgba(0,0,0,0.8))')
            .text(d => {
                const maxLen = Math.floor(d.radius / 4);
                return d.label.length > maxLen ? d.label.slice(0, maxLen) + '…' : d.label;
            })
            .attr('opacity', d => d.radius > 28 ? 1 : 0);

        // Mindshare percentage sublabel
        bubbleGroups.filter(d => d.radius > 40)
            .append('text')
            .attr('class', 'bubble-sublabel')
            .attr('text-anchor', 'middle')
            .attr('dy', '1.2em')
            .attr('fill', 'rgba(255,255,255,0.6)')
            .attr('font-size', 10)
            .attr('pointer-events', 'none')
            .text(d => `${(d.value / 1000).toFixed(0)}K • ${(d.solidity * 100).toFixed(0)}%`);

        // 4th/5th dimension indicators
        if (showNoise) {
            bubbleGroups.each(function (d) {
                if (d.radius > 35) {
                    const group = d3.select(this);

                    // Volatility indicator
                    if (d.volatility > 0.4) {
                        group.append('text')
                            .attr('x', 0)
                            .attr('y', d.radius * 0.6 + 15)
                            .attr('text-anchor', 'middle')
                            .attr('font-size', 10)
                            .attr('fill', 'rgba(255,255,255,0.5)')
                            .attr('pointer-events', 'none')
                            .text('〰');
                    }

                    // Freshness indicator
                    if (d.freshness > 0.6) {
                        group.append('text')
                            .attr('x', d.radius * 0.5)
                            .attr('y', -d.radius * 0.5)
                            .attr('font-size', 10)
                            .attr('fill', 'rgba(255,255,255,0.7)')
                            .attr('pointer-events', 'none')
                            .text('✦');
                    }
                }
            });
        }

        // Event handlers with connection highlighting
        bubbleGroups
            .on('mouseenter', function (event, d) {
                setHoveredId(d.id);
                onBubbleHover?.(d);

                // Highlight this bubble
                d3.select(this).select('.bubble-main')
                    .transition().duration(150)
                    .attr('opacity', 1)
                    .attr('stroke', 'rgba(255,255,255,0.9)')
                    .attr('stroke-width', 3);

                d3.select(this).select('.bubble-aura')
                    .transition().duration(150)
                    .attr('opacity', 0.4);

                // Highlight connected overlaps
                if (showConnections) {
                    connectionLayer.selectAll<SVGGElement, AudienceOverlap>('.connection')
                        .transition().duration(150)
                        .attr('opacity', o => o.source === d.id || o.target === d.id ? 1 : 0.2);
                }

                // Dim unrelated bubbles
                bubbleGroups.filter(n => n.id !== d.id)
                    .select('.bubble-main')
                    .transition().duration(150)
                    .attr('opacity', n => {
                        const isConnected = calculatedOverlaps.some(
                            o => (o.source === d.id && o.target === n.id) ||
                                (o.target === d.id && o.source === n.id)
                        );
                        return isConnected ? 0.8 : 0.3;
                    });
            })
            .on('mouseleave', function (event, d) {
                setHoveredId(null);
                onBubbleHover?.(null);

                // Reset all bubbles
                bubbleGroups.select('.bubble-main')
                    .transition().duration(150)
                    .attr('opacity', n => 0.4 + (n as typeof nodes[0]).solidity * 0.55)
                    .attr('stroke', n =>
                        (n as typeof nodes[0]).id === selectedId
                            ? '#ffffff'
                            : `rgba(255,255,255,${0.1 + (n as typeof nodes[0]).solidity * 0.4})`
                    )
                    .attr('stroke-width', n => 1 + (n as typeof nodes[0]).solidity * 2);

                d3.select(this).select('.bubble-aura')
                    .transition().duration(150)
                    .attr('opacity', 0.05 + d.solidity * 0.15);

                // Reset connections
                if (showConnections) {
                    connectionLayer.selectAll('.connection')
                        .transition().duration(150)
                        .attr('opacity', 1);
                }
            })
            .on('click', (event, d) => {
                onBubbleClick?.(d);
            });

        // Update positions on simulation tick
        simulation.on('tick', () => {
            bubbleGroups.attr('transform', d => `translate(${d.x}, ${d.y})`);

            // Update connection lines
            if (showConnections) {
                connectionLayer.selectAll<SVGPathElement, AudienceOverlap>('.connection-line')
                    .attr('d', d => {
                        const source = nodeMap.get(d.source);
                        const target = nodeMap.get(d.target);
                        if (!source || !target) return '';

                        // Curved path with control point
                        const dx = target.x! - source.x!;
                        const dy = target.y! - source.y!;

                        return `M${source.x},${source.y} Q${(source.x! + target.x!) / 2 + dy * 0.2},${(source.y! + target.y!) / 2 - dx * 0.2} ${target.x},${target.y}`;
                    });

                connectionLayer.selectAll<SVGCircleElement, AudienceOverlap>('.overlap-indicator')
                    .attr('cx', d => {
                        const source = nodeMap.get(d.source);
                        const target = nodeMap.get(d.target);
                        return source && target ? (source.x! + target.x!) / 2 : 0;
                    })
                    .attr('cy', d => {
                        const source = nodeMap.get(d.source);
                        const target = nodeMap.get(d.target);
                        return source && target ? (source.y! + target.y!) / 2 : 0;
                    });
            }
        });

        // Run simulation
        simulation.alpha(0.8).restart();

        // Animate pulse rings
        const animatePulse = () => {
            bubbleGroups.selectAll<SVGCircleElement, typeof nodes[0]>('.pulse-ring')
                .transition()
                .duration(2000)
                .ease(d3.easeQuadOut)
                .attr('r', d => d.radius * 1.6)
                .attr('opacity', 0)
                .transition()
                .duration(0)
                .attr('r', d => d.radius)
                .on('end', animatePulse);
        };

        setTimeout(animatePulse, 500);

        // Animate flow particles along connections
        if (showFlowParticles && showConnections) {
            const animateParticles = () => {
                calculatedOverlaps.forEach(overlap => {
                    const source = nodeMap.get(overlap.source);
                    const target = nodeMap.get(overlap.target);
                    if (!source || !target || overlap.direction === 'bidirectional') return;

                    const particle = particleLayer.append('circle')
                        .attr('r', 2 + overlap.magnitude * 2)
                        .attr('fill', overlap.direction === 'inflow' ? '#22c55e' : '#ef4444')
                        .attr('opacity', 0.8)
                        .attr('cx', source.x!)
                        .attr('cy', source.y!);

                    particle.transition()
                        .duration(1500 + Math.random() * 1000)
                        .ease(d3.easeQuadInOut)
                        .attr('cx', target.x!)
                        .attr('cy', target.y!)
                        .attr('opacity', 0)
                        .remove();
                });
            };

            const particleInterval = setInterval(animateParticles, 800);
            animationRef.current = particleInterval as unknown as number;
        }

        return () => {
            simulation.stop();
            if (animationRef.current) {
                clearInterval(animationRef.current);
            }
        };
    }, [data, calculatedOverlaps, width, height, selectedId, hoveredId, colorMode, showNoise, showConnections, showFlowParticles, onBubbleClick, onBubbleHover]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{
                overflow: 'visible',
                background: 'transparent',
            }}
        />
    );
}
