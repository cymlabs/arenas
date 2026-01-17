'use client';

/**
 * VoiceCompareView - Compare stance trajectories of multiple voices on a topic
 * 
 * Features:
 * - Overlaid stance lines for 2-5 voices
 * - Mindshare underlays (stacked or side-by-side)
 * - Auto-generated annotations
 */

import React, { useRef, useEffect, useState, useMemo } from 'react';
import * as d3 from 'd3';
import { useStanceStore, filterByTimeWindow } from '@/lib/stanceStore';
import { generateCompareAnnotations } from '@/lib/stanceEngine';

interface VoiceCompareViewProps {
    topicId: string;
    voiceIds: string[];
    width?: number;
    height?: number;
}

// Color palette for multiple voices
const VOICE_COLORS = [
    '#8b5cf6', // Purple
    '#22c55e', // Green
    '#f59e0b', // Amber
    '#06b6d4', // Cyan
    '#ec4899', // Pink
];

export default function VoiceCompareView({
    topicId,
    voiceIds,
    width = 800,
    height = 400,
}: VoiceCompareViewProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredVoice, setHoveredVoice] = useState<string | null>(null);

    const {
        getVoiceStanceSeries,
        getVoiceMindshareSeries,
        timeWindow,
        customTimeRange,
        voices,
        flipEvents,
        topics,
    } = useStanceStore();

    const topic = topics.find(t => t.topic_id === topicId);

    // Get filtered series for each voice
    const voiceSeries = useMemo(() => {
        return voiceIds.map((voiceId, index) => {
            const stanceSeries = getVoiceStanceSeries(voiceId, topicId);
            const mindshareSeries = getVoiceMindshareSeries(voiceId);

            const stancePoints = stanceSeries
                ? filterByTimeWindow(
                    stanceSeries.points.map(p => ({ ...p, timestamp: p.timestamp })),
                    timeWindow,
                    customTimeRange
                )
                : [];

            const mindsharePoints = mindshareSeries
                ? filterByTimeWindow(
                    mindshareSeries.points.map(p => ({ ...p, timestamp: p.timestamp })),
                    timeWindow,
                    customTimeRange
                )
                : [];

            return {
                voiceId,
                voice: voices.find(v => v.voice_id === voiceId),
                color: VOICE_COLORS[index % VOICE_COLORS.length],
                stancePoints,
                mindsharePoints,
                flipEvents: stanceSeries?.flip_events || [],
            };
        });
    }, [voiceIds, topicId, timeWindow, customTimeRange, getVoiceStanceSeries, getVoiceMindshareSeries, voices]);

    // Generate annotations
    const annotations = useMemo(() => {
        const relevantFlips = flipEvents.filter(
            f => f.topic_id === topicId && voiceIds.includes(f.voice_id)
        );
        return generateCompareAnnotations(relevantFlips, voiceIds);
    }, [flipEvents, topicId, voiceIds]);

    // D3 rendering
    useEffect(() => {
        if (!svgRef.current || voiceSeries.every(s => s.stancePoints.length === 0)) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 30, right: 120, bottom: 50, left: 50 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Find time extent across all series
        const allTimestamps = voiceSeries.flatMap(s =>
            s.stancePoints.map(p => new Date(p.timestamp))
        );
        const xExtent = d3.extent(allTimestamps) as [Date, Date];

        if (!xExtent[0] || !xExtent[1]) return;

        const xScale = d3.scaleTime()
            .domain(xExtent)
            .range([0, innerWidth]);

        const yScaleStance = d3.scaleLinear()
            .domain([-1, 1])
            .range([innerHeight, 0]);

        // Draw grid lines
        g.append('g')
            .attr('class', 'grid')
            .call(d3.axisLeft(yScaleStance)
                .ticks(5)
                .tickSize(-innerWidth)
                .tickFormat(() => '')
            )
            .selectAll('line')
            .attr('stroke', 'rgba(255,255,255,0.05)');

        // Neutral line
        g.append('line')
            .attr('x1', 0)
            .attr('y1', yScaleStance(0))
            .attr('x2', innerWidth)
            .attr('y2', yScaleStance(0))
            .attr('stroke', 'rgba(255,255,255,0.3)')
            .attr('stroke-dasharray', '4,4');

        // Draw each voice's stance line
        voiceSeries.forEach(({ voiceId, color, stancePoints, flipEvents: voiceFlips }) => {
            if (stancePoints.length === 0) return;

            const lineGenerator = d3.line<typeof stancePoints[0]>()
                .x(d => xScale(new Date(d.timestamp)))
                .y(d => yScaleStance(d.stance))
                .curve(d3.curveMonotoneX);

            // Line with opacity based on hover
            const isHovered = hoveredVoice === voiceId;
            const isOtherHovered = hoveredVoice && hoveredVoice !== voiceId;

            g.append('path')
                .datum(stancePoints)
                .attr('fill', 'none')
                .attr('stroke', color)
                .attr('stroke-width', isHovered ? 4 : 2.5)
                .attr('opacity', isOtherHovered ? 0.3 : 1)
                .attr('d', lineGenerator)
                .style('cursor', 'pointer')
                .on('mouseenter', () => setHoveredVoice(voiceId))
                .on('mouseleave', () => setHoveredVoice(null));

            // Flip markers for this voice
            voiceFlips.forEach(flip => {
                const flipTime = new Date(flip.t0);
                if (flipTime >= xExtent[0] && flipTime <= xExtent[1]) {
                    const x = xScale(flipTime);

                    g.append('circle')
                        .attr('cx', x)
                        .attr('cy', yScaleStance(flip.stance_after))
                        .attr('r', isHovered ? 8 : 6)
                        .attr('fill', color)
                        .attr('stroke', '#fff')
                        .attr('stroke-width', 2)
                        .attr('opacity', isOtherHovered ? 0.3 : 1);
                }
            });
        });

        annotations.forEach((annotation) => {
            const annotationTime = new Date(annotation.timestamp);
            if (annotationTime >= xExtent[0] && annotationTime <= xExtent[1]) {
                const x = xScale(annotationTime);
                const voiceColor = voiceSeries.find(s => annotation.voices.includes(s.voiceId))?.color || '#fff';

                // Annotation line
                g.append('line')
                    .attr('x1', x)
                    .attr('y1', -15)
                    .attr('x2', x)
                    .attr('y2', innerHeight)
                    .attr('stroke', voiceColor)
                    .attr('stroke-width', 1)
                    .attr('stroke-dasharray', '2,2')
                    .attr('opacity', 0.5);

                // Annotation text
                g.append('text')
                    .attr('x', x)
                    .attr('y', -20)
                    .attr('text-anchor', 'middle')
                    .attr('fill', voiceColor)
                    .attr('font-size', '10px')
                    .attr('font-weight', '600')
                    .text(annotation.text);
            }
        });

        // X axis
        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale).ticks(8).tickFormat(d => {
                const date = d as Date;
                return d3.timeFormat('%b %d')(date);
            }))
            .selectAll('text')
            .attr('fill', 'rgba(255,255,255,0.6)')
            .attr('font-size', '10px');

        g.selectAll('.domain').attr('stroke', 'rgba(255,255,255,0.2)');
        g.selectAll('.tick line').attr('stroke', 'rgba(255,255,255,0.2)');

        // Y axis
        g.append('g')
            .call(d3.axisLeft(yScaleStance).ticks(5).tickFormat(d => {
                const val = d as number;
                if (val === 1) return 'For';
                if (val === 0) return 'Neutral';
                if (val === -1) return 'Against';
                return '';
            }))
            .selectAll('text')
            .attr('fill', 'rgba(255,255,255,0.6)')
            .attr('font-size', '10px');

        // Legend (right side)
        const legend = g.append('g')
            .attr('transform', `translate(${innerWidth + 20}, 0)`);

        voiceSeries.forEach(({ voiceId, voice, color }, idx) => {
            const legendItem = legend.append('g')
                .attr('transform', `translate(0, ${idx * 30})`)
                .style('cursor', 'pointer')
                .on('mouseenter', () => setHoveredVoice(voiceId))
                .on('mouseleave', () => setHoveredVoice(null));

            legendItem.append('rect')
                .attr('width', 16)
                .attr('height', 4)
                .attr('y', 6)
                .attr('rx', 2)
                .attr('fill', color);

            legendItem.append('text')
                .attr('x', 22)
                .attr('y', 12)
                .attr('fill', hoveredVoice === voiceId ? '#fff' : 'rgba(255,255,255,0.7)')
                .attr('font-size', '11px')
                .attr('font-weight', hoveredVoice === voiceId ? '600' : '400')
                .text(voice?.display_name || voiceId);
        });

    }, [voiceSeries, annotations, width, height, hoveredVoice]);

    if (voiceIds.length === 0) {
        return (
            <div className="compare-view compare-view--empty">
                <p>Select at least 2 voices to compare</p>
            </div>
        );
    }

    return (
        <div className="compare-view">
            <div className="compare-view__header">
                <h3>Stance Comparison: {topic?.label || topicId}</h3>
                <span className="compare-view__count">{voiceIds.length} voices</span>
            </div>

            <svg ref={svgRef} width={width} height={height} className="compare-view__chart" />

            {/* Annotations summary */}
            {annotations.length > 0 && (
                <div className="compare-view__annotations">
                    <h4>Key Events</h4>
                    <div className="annotations-list">
                        {annotations.map((annotation, i) => (
                            <div key={i} className="annotation-item">
                                <span className="annotation-icon">
                                    {annotation.type === 'flip_first' ? '🔄' :
                                        annotation.type === 'mindshare_surge' ? '📈' : '🔗'}
                                </span>
                                <span className="annotation-text">{annotation.text}</span>
                                <span className="annotation-time">
                                    {new Date(annotation.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <style jsx>{`
                .compare-view {
                    background: linear-gradient(145deg, rgba(30, 30, 40, 0.95), rgba(20, 20, 30, 0.98));
                    border: 1px solid rgba(139, 92, 246, 0.3);
                    border-radius: 16px;
                    padding: 24px;
                    backdrop-filter: blur(20px);
                }

                .compare-view--empty {
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    min-height: 300px;
                    color: rgba(255, 255, 255, 0.5);
                }

                .compare-view__header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 16px;
                }

                .compare-view__header h3 {
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                    color: #fff;
                }

                .compare-view__count {
                    background: rgba(139, 92, 246, 0.2);
                    border: 1px solid rgba(139, 92, 246, 0.4);
                    border-radius: 12px;
                    padding: 4px 12px;
                    font-size: 12px;
                    color: #8b5cf6;
                }

                .compare-view__chart {
                    display: block;
                    margin: 0 auto;
                }

                .compare-view__annotations {
                    margin-top: 20px;
                    padding-top: 20px;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                }

                .compare-view__annotations h4 {
                    margin: 0 0 12px 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: rgba(255, 255, 255, 0.8);
                }

                .annotations-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 12px;
                }

                .annotation-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255, 255, 255, 0.05);
                    border-radius: 8px;
                    padding: 8px 12px;
                    font-size: 12px;
                }

                .annotation-icon {
                    font-size: 14px;
                }

                .annotation-text {
                    color: rgba(255, 255, 255, 0.8);
                }

                .annotation-time {
                    color: rgba(255, 255, 255, 0.4);
                    font-size: 10px;
                }
            `}</style>
        </div>
    );
}
