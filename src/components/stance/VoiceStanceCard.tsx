'use client';

/**
 * VoiceStanceCard - Time chart showing stance and mindshare over time
 * 
 * Features:
 * - Stance line (-1 to +1) with confidence band
 * - Mindshare area chart as underlay
 * - Flip moment vertical markers
 * - Hover for "receipts" (content that caused stance)
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useStanceStore, filterByTimeWindow } from '@/lib/stanceStore';
import { StanceFlipEvent, stanceToColor, stanceToLabel } from '@/types/stance';

interface VoiceStanceCardProps {
    voiceId: string;
    topicId: string;
    width?: number;
    height?: number;
    showMindshare?: boolean;
    interactive?: boolean;
}

export default function VoiceStanceCard({
    voiceId,
    topicId,
    width = 600,
    height = 300,
    showMindshare = true,
    interactive = true,
}: VoiceStanceCardProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const [hoveredPoint, setHoveredPoint] = useState<{
        x: number;
        y: number;
        stance: number;
        mindshare: number;
        timestamp: string;
        isFlip?: boolean;
    } | null>(null);

    const {
        getVoiceStanceSeries,
        getVoiceMindshareSeries,
        timeWindow,
        customTimeRange,
        voices,
    } = useStanceStore();

    const voice = voices.find(v => v.voice_id === voiceId);
    const stanceSeries = getVoiceStanceSeries(voiceId, topicId);
    const mindshareSeries = getVoiceMindshareSeries(voiceId);

    // Filter by time window
    const stancePoints = useMemo(() => {
        if (!stanceSeries) return [];
        return filterByTimeWindow(
            stanceSeries.points.map(p => ({ ...p, timestamp: p.timestamp })),
            timeWindow,
            customTimeRange
        );
    }, [stanceSeries, timeWindow, customTimeRange]);

    const mindsharePoints = useMemo(() => {
        if (!mindshareSeries) return [];
        return filterByTimeWindow(
            mindshareSeries.points.map(p => ({ ...p, timestamp: p.timestamp })),
            timeWindow,
            customTimeRange
        );
    }, [mindshareSeries, timeWindow, customTimeRange]);

    const flipEvents = stanceSeries?.flip_events || [];

    // D3 rendering
    useEffect(() => {
        if (!svgRef.current || stancePoints.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 20, right: 40, bottom: 40, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // X scale (time)
        const xExtent = d3.extent(stancePoints, d => new Date(d.timestamp)) as [Date, Date];
        const xScale = d3.scaleTime()
            .domain(xExtent)
            .range([0, innerWidth]);

        // Y scale for stance (-1 to 1)
        const yScaleStance = d3.scaleLinear()
            .domain([-1, 1])
            .range([innerHeight, 0]);

        // Y scale for mindshare (0 to max)
        const maxMindshare = d3.max(mindsharePoints, d => d.mindshare) || 10;
        const yScaleMindshare = d3.scaleLinear()
            .domain([0, maxMindshare * 1.2])
            .range([innerHeight, 0]);

        // Draw mindshare area (underlay)
        if (showMindshare && mindsharePoints.length > 0) {
            const mindshareArea = d3.area<typeof mindsharePoints[0]>()
                .x(d => xScale(new Date(d.timestamp)))
                .y0(innerHeight)
                .y1(d => yScaleMindshare(d.mindshare))
                .curve(d3.curveMonotoneX);

            // Gradient for mindshare
            const gradient = svg.append('defs')
                .append('linearGradient')
                .attr('id', `mindshare-gradient-${voiceId}`)
                .attr('x1', '0%')
                .attr('y1', '0%')
                .attr('x2', '0%')
                .attr('y2', '100%');

            gradient.append('stop')
                .attr('offset', '0%')
                .attr('stop-color', 'rgba(59, 130, 246, 0.3)');
            gradient.append('stop')
                .attr('offset', '100%')
                .attr('stop-color', 'rgba(59, 130, 246, 0.05)');

            g.append('path')
                .datum(mindsharePoints)
                .attr('fill', `url(#mindshare-gradient-${voiceId})`)
                .attr('d', mindshareArea);
        }

        // Draw confidence band
        const confBand = d3.area<typeof stancePoints[0]>()
            .x(d => xScale(new Date(d.timestamp)))
            .y0(d => yScaleStance(Math.max(-1, d.stance - (1 - d.conf) * 0.3)))
            .y1(d => yScaleStance(Math.min(1, d.stance + (1 - d.conf) * 0.3)))
            .curve(d3.curveMonotoneX);

        g.append('path')
            .datum(stancePoints)
            .attr('fill', 'rgba(139, 92, 246, 0.2)')
            .attr('d', confBand);

        // Draw stance line with gradient color
        const lineGenerator = d3.line<typeof stancePoints[0]>()
            .x(d => xScale(new Date(d.timestamp)))
            .y(d => yScaleStance(d.stance))
            .curve(d3.curveMonotoneX);

        // Create gradient based on stance
        const stanceGradient = svg.append('defs')
            .append('linearGradient')
            .attr('id', `stance-gradient-${voiceId}`)
            .attr('gradientUnits', 'userSpaceOnUse')
            .attr('x1', 0)
            .attr('y1', yScaleStance(1))
            .attr('x2', 0)
            .attr('y2', yScaleStance(-1));

        stanceGradient.append('stop')
            .attr('offset', '0%')
            .attr('stop-color', '#22c55e'); // Green (for)
        stanceGradient.append('stop')
            .attr('offset', '50%')
            .attr('stop-color', '#6b7280'); // Gray (neutral)
        stanceGradient.append('stop')
            .attr('offset', '100%')
            .attr('stop-color', '#ef4444'); // Red (against)

        g.append('path')
            .datum(stancePoints)
            .attr('fill', 'none')
            .attr('stroke', `url(#stance-gradient-${voiceId})`)
            .attr('stroke-width', 2.5)
            .attr('d', lineGenerator);

        // Draw flip markers
        flipEvents.forEach(flip => {
            const flipTime = new Date(flip.t0);
            if (flipTime >= xExtent[0] && flipTime <= xExtent[1]) {
                const x = xScale(flipTime);

                // Vertical line
                g.append('line')
                    .attr('x1', x)
                    .attr('y1', 0)
                    .attr('x2', x)
                    .attr('y2', innerHeight)
                    .attr('stroke', flip.delta_stance > 0 ? '#22c55e' : '#ef4444')
                    .attr('stroke-width', 2)
                    .attr('stroke-dasharray', '4,4')
                    .attr('opacity', 0.8);

                // Flip indicator
                g.append('circle')
                    .attr('cx', x)
                    .attr('cy', yScaleStance(flip.stance_after))
                    .attr('r', 8)
                    .attr('fill', flip.delta_stance > 0 ? '#22c55e' : '#ef4444')
                    .attr('stroke', '#fff')
                    .attr('stroke-width', 2)
                    .style('cursor', 'pointer')
                    .on('mouseenter', (event) => {
                        setHoveredPoint({
                            x: event.pageX,
                            y: event.pageY,
                            stance: flip.stance_after,
                            mindshare: flip.delta_mindshare,
                            timestamp: flip.t0,
                            isFlip: true,
                        });
                    })
                    .on('mouseleave', () => setHoveredPoint(null));

                // Arrow indicator
                g.append('text')
                    .attr('x', x)
                    .attr('y', -5)
                    .attr('text-anchor', 'middle')
                    .attr('fill', flip.delta_stance > 0 ? '#22c55e' : '#ef4444')
                    .attr('font-size', '14px')
                    .text(flip.delta_stance > 0 ? '↑' : '↓');
            }
        });

        // Neutral line
        g.append('line')
            .attr('x1', 0)
            .attr('y1', yScaleStance(0))
            .attr('x2', innerWidth)
            .attr('y2', yScaleStance(0))
            .attr('stroke', 'rgba(255,255,255,0.2)')
            .attr('stroke-dasharray', '2,2');

        // X axis
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(6).tickFormat(d => {
                const date = d as Date;
                return d3.timeFormat('%b %d')(date);
            }))
            .selectAll('text')
            .attr('fill', 'rgba(255,255,255,0.6)')
            .attr('font-size', '10px');

        g.selectAll('.domain, .tick line').attr('stroke', 'rgba(255,255,255,0.2)');

        // Y axis (stance)
        g.append('g')
            .call(d3.axisLeft(yScaleStance).ticks(5).tickFormat(d => {
                const val = d as number;
                if (val === 1) return 'For';
                if (val === 0) return 'Neutral';
                if (val === -1) return 'Against';
                return val.toFixed(1);
            }))
            .selectAll('text')
            .attr('fill', 'rgba(255,255,255,0.6)')
            .attr('font-size', '10px');

        // Y axis (mindshare) - right side
        if (showMindshare) {
            g.append('g')
                .attr('transform', `translate(${innerWidth},0)`)
                .call(d3.axisRight(yScaleMindshare).ticks(4).tickFormat(d => `${(d as number).toFixed(1)}%`))
                .selectAll('text')
                .attr('fill', 'rgba(59, 130, 246, 0.8)')
                .attr('font-size', '10px');
        }

        // Interactive overlay for hover
        if (interactive) {
            const bisect = d3.bisector<typeof stancePoints[0], Date>(d => new Date(d.timestamp)).left;

            const overlay = g.append('rect')
                .attr('width', innerWidth)
                .attr('height', innerHeight)
                .attr('fill', 'transparent')
                .style('cursor', 'crosshair');

            const focusLine = g.append('line')
                .attr('stroke', 'rgba(255,255,255,0.5)')
                .attr('stroke-width', 1)
                .attr('y1', 0)
                .attr('y2', innerHeight)
                .style('display', 'none');

            const focusDot = g.append('circle')
                .attr('r', 5)
                .attr('fill', '#8b5cf6')
                .attr('stroke', '#fff')
                .attr('stroke-width', 2)
                .style('display', 'none');

            overlay
                .on('mousemove', (event) => {
                    const [mx] = d3.pointer(event);
                    const x0 = xScale.invert(mx);
                    const i = bisect(stancePoints, x0, 1);
                    const d0 = stancePoints[i - 1];
                    const d1 = stancePoints[i];
                    if (!d0 && !d1) return;
                    const d = !d1 || (d0 && x0.getTime() - new Date(d0.timestamp).getTime() < new Date(d1.timestamp).getTime() - x0.getTime()) ? d0 : d1;

                    const xPos = xScale(new Date(d.timestamp));
                    const yPos = yScaleStance(d.stance);

                    focusLine
                        .attr('x1', xPos)
                        .attr('x2', xPos)
                        .style('display', 'block');

                    focusDot
                        .attr('cx', xPos)
                        .attr('cy', yPos)
                        .attr('fill', stanceToColor(d.stance))
                        .style('display', 'block');

                    // Find corresponding mindshare
                    const msPoint = mindsharePoints.find(m =>
                        Math.abs(new Date(m.timestamp).getTime() - new Date(d.timestamp).getTime()) < 3600000
                    );

                    setHoveredPoint({
                        x: event.pageX,
                        y: event.pageY,
                        stance: d.stance,
                        mindshare: msPoint?.mindshare || 0,
                        timestamp: d.timestamp,
                    });
                })
                .on('mouseleave', () => {
                    focusLine.style('display', 'none');
                    focusDot.style('display', 'none');
                    setHoveredPoint(null);
                });
        }

    }, [stancePoints, mindsharePoints, flipEvents, width, height, showMindshare, interactive, voiceId]);

    if (!stanceSeries || stancePoints.length === 0) {
        return (
            <div className="stance-card stance-card--empty">
                <p>No stance data available for this voice/topic combination</p>
            </div>
        );
    }

    return (
        <div className="stance-card">
            <div className="stance-card__header">
                <div className="stance-card__voice">
                    {voice?.avatar_url && (
                        <img
                            src={voice.avatar_url}
                            alt={voice.display_name}
                            className="stance-card__avatar"
                        />
                    )}
                    <div className="stance-card__voice-info">
                        <h3>{voice?.display_name || voiceId}</h3>
                        <span className="stance-card__category">{voice?.category}</span>
                    </div>
                </div>
                {flipEvents.length > 0 && (
                    <div className="stance-card__flip-badge">
                        <span className="flip-count">{flipEvents.length}</span>
                        <span>Flip{flipEvents.length > 1 ? 's' : ''}</span>
                    </div>
                )}
            </div>

            <svg ref={svgRef} width={width} height={height} className="stance-card__chart" />

            {/* Legend */}
            <div className="stance-card__legend">
                <div className="legend-item">
                    <div className="legend-line legend-line--stance" />
                    <span>Stance</span>
                </div>
                <div className="legend-item">
                    <div className="legend-area legend-area--conf" />
                    <span>Confidence</span>
                </div>
                {showMindshare && (
                    <div className="legend-item">
                        <div className="legend-area legend-area--mindshare" />
                        <span>Mindshare</span>
                    </div>
                )}
                <div className="legend-item">
                    <div className="legend-dot legend-dot--flip" />
                    <span>Flip Event</span>
                </div>
            </div>

            {/* Tooltip */}
            {hoveredPoint && (
                <div
                    ref={tooltipRef}
                    className="stance-card__tooltip"
                    style={{
                        position: 'fixed',
                        left: hoveredPoint.x + 15,
                        top: hoveredPoint.y - 10,
                    }}
                >
                    <div className="tooltip-header">
                        {new Date(hoveredPoint.timestamp).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                        })}
                    </div>
                    <div className="tooltip-row">
                        <span className="tooltip-label">Stance:</span>
                        <span
                            className="tooltip-value"
                            style={{ color: stanceToColor(hoveredPoint.stance) }}
                        >
                            {stanceToLabel(hoveredPoint.stance)} ({hoveredPoint.stance.toFixed(2)})
                        </span>
                    </div>
                    {showMindshare && (
                        <div className="tooltip-row">
                            <span className="tooltip-label">Mindshare:</span>
                            <span className="tooltip-value tooltip-value--mindshare">
                                {hoveredPoint.mindshare.toFixed(2)}%
                            </span>
                        </div>
                    )}
                    {hoveredPoint.isFlip && (
                        <div className="tooltip-flip">
                            ⚡ Stance Flip Detected
                        </div>
                    )}
                </div>
            )}

            <style jsx>{`
                .stance-card {
                    background: linear-gradient(145deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 16px;
                    padding: 20px;
                    backdrop-filter: blur(20px);
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
                }

                .stance-card--empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 200px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .stance-card__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .stance-card__voice {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .stance-card__avatar {
                    width: 48px;
                    height: 48px;
                    border-radius: 50%;
                    object-fit: cover;
                    border: 2px solid rgba(139, 92, 246, 0.5);
                }

                .stance-card__voice-info h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }

                .stance-card__category {
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.5);
                    text-transform: capitalize;
                }

                .stance-card__flip-badge {
                    display: flex;
                    align-items: center;
                    gap: 6px;
                    background: rgba(239, 68, 68, 0.2);
                    border: 1px solid rgba(239, 68, 68, 0.4);
                    border-radius: 20px;
                    padding: 6px 12px;
                    font-size: 12px;
                    color: #ef4444;
                }

                .stance-card__flip-badge .flip-count {
                    font-weight: 700;
                    font-size: 14px;
                }

                .stance-card__chart {
                    display: block;
                    margin: 0 auto;
                }

                .stance-card__legend {
                    display: flex;
                    justify-content: center;
                    gap: 24px;
                    margin-top: 16px;
                    padding-top: 16px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .legend-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    color: rgba(255, 255, 255, 0.6);
                }

                .legend-line {
                    width: 20px;
                    height: 3px;
                    border-radius: 2px;
                }

                .legend-line--stance {
                    background: linear-gradient(90deg, #ef4444, #6b7280, #22c55e);
                }

                .legend-area {
                    width: 16px;
                    height: 12px;
                    border-radius: 2px;
                }

                .legend-area--conf {
                    background: rgba(139, 92, 246, 0.3);
                }

                .legend-area--mindshare {
                    background: rgba(59, 130, 246, 0.3);
                }

                .legend-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                }

                .legend-dot--flip {
                    background: #ef4444;
                    border: 2px solid #fff;
                }

                .stance-card__tooltip {
                    background: rgba(20, 20, 30, 0.95);
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    border-radius: 8px;
                    padding: 12px;
                    backdrop-filter: blur(10px);
                    z-index: 1000;
                    pointer-events: none;
                    min-width: 180px;
                }

                .tooltip-header {
                    font-size: 11px;
                    color: rgba(255, 255, 255, 0.5);
                    margin-bottom: 8px;
                    padding-bottom: 8px;
                    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
                }

                .tooltip-row {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 4px;
                    font-size: 12px;
                }

                .tooltip-label {
                    color: rgba(255, 255, 255, 0.6);
                }

                .tooltip-value {
                    font-weight: 600;
                }

                .tooltip-value--mindshare {
                    color: #3b82f6;
                }

                .tooltip-flip {
                    margin-top: 8px;
                    padding-top: 8px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    color: #f59e0b;
                    font-size: 11px;
                    font-weight: 600;
                }
            `}</style>
        </div>
    );
}
