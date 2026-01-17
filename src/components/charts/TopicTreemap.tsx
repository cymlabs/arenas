'use client';

import { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';

export interface TreemapData {
    id: string;
    label: string;
    name?: string; // Alias for label
    value: number;
    category: string;
    velocity: number;
    children?: TreemapData[];
    // Enhanced fields
    audienceSegments?: Record<string, number>; // Breakdown of audience types
    historicalValues?: number[];  // Last 7 periods
    volatility?: number;  // 0-1 stability score
    dominance?: number;   // 0-1 market dominance in category
}

interface TopicTreemapProps {
    data: TreemapData[];
    width?: number;
    height?: number;
    onNodeClick?: (node: TreemapData) => void;
    onNodeHover?: (node: TreemapData | null) => void;
    showHeatOverlay?: boolean;   // Show volatility heat map
    showMicrocells?: boolean;    // Show audience segment mini-cells
    animated?: boolean;          // Enable animations
}

const categoryColors: Record<string, string> = {
    politics: '#ef4444',
    media: '#f97316',
    tech: '#3b82f6',
    culture: '#8b5cf6',
    social: '#22c55e',
    default: '#64748b',
};

// Calculate "solidity" for treemap cells - higher value = more crystalline/defined borders
function calculateCellSolidity(node: TreemapData, maxValue: number): number {
    const valueFactor = node.value / maxValue;
    const velocityBonus = Math.max(0, node.velocity) * 0.2;
    const dominanceFactor = (node.dominance ?? 0.5) * 0.3;
    return Math.min(1, valueFactor * 0.5 + velocityBonus + dominanceFactor);
}

export function TopicTreemap({
    data,
    width = 600,
    height = 400,
    onNodeClick,
    onNodeHover,
    showHeatOverlay = true,
    showMicrocells = true,
    animated = true,
}: TopicTreemapProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredId, setHoveredId] = useState<string | null>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const maxValue = d3.max(data, d => d.value) || 1;

        // Defs for gradients and filters
        const defs = svg.append('defs');

        // Glow filter for high-value cells
        const glow = defs.append('filter')
            .attr('id', 'treemap-glow')
            .attr('x', '-50%')
            .attr('y', '-50%')
            .attr('width', '200%')
            .attr('height', '200%');
        glow.append('feGaussianBlur').attr('stdDeviation', '3').attr('result', 'glow');
        const glowMerge = glow.append('feMerge');
        glowMerge.append('feMergeNode').attr('in', 'glow');
        glowMerge.append('feMergeNode').attr('in', 'SourceGraphic');

        // Heat overlay gradient
        const heatGrad = defs.append('linearGradient')
            .attr('id', 'heat-gradient')
            .attr('x1', '0%').attr('y1', '0%')
            .attr('x2', '100%').attr('y2', '100%');
        heatGrad.append('stop').attr('offset', '0%').attr('stop-color', '#ef4444').attr('stop-opacity', 0.3);
        heatGrad.append('stop').attr('offset', '100%').attr('stop-color', '#f97316').attr('stop-opacity', 0.1);

        // Pattern for volatile cells
        const volatilePattern = defs.append('pattern')
            .attr('id', 'volatile-pattern')
            .attr('patternUnits', 'userSpaceOnUse')
            .attr('width', 6)
            .attr('height', 6)
            .attr('patternTransform', 'rotate(45)');
        volatilePattern.append('line')
            .attr('x1', 0).attr('y1', 0)
            .attr('x2', 0).attr('y2', 6)
            .attr('stroke', 'rgba(255,255,255,0.1)')
            .attr('stroke-width', 1);

        // Create hierarchy with category grouping
        const groupedData = d3.group(data, d => d.category);
        const hierarchyData = {
            name: 'root',
            children: Array.from(groupedData, ([category, items]) => ({
                name: category,
                category,
                children: items
            }))
        };

        const hierarchy = d3.hierarchy(hierarchyData)
            .sum(d => ('value' in d ? (d as TreemapData).value : 0))
            .sort((a, b) => (b.value || 0) - (a.value || 0));

        // Create treemap layout with squarify for better aspect ratios
        const treemap = d3.treemap<typeof hierarchyData>()
            .size([width, height])
            .paddingOuter(4)
            .paddingTop(22)  // Space for category header
            .paddingInner(2)
            .round(true)
            .tile(d3.treemapSquarify.ratio(1.2));

        const root = treemap(hierarchy);

        // Draw category backgrounds first
        const categoryNodes = root.children || [];
        svg.selectAll('.category-bg')
            .data(categoryNodes)
            .join('rect')
            .attr('class', 'category-bg')
            .attr('x', d => d.x0)
            .attr('y', d => d.y0)
            .attr('width', d => d.x1 - d.x0)
            .attr('height', d => d.y1 - d.y0)
            .attr('fill', d => {
                const cat = (d.data as { category?: string }).category || 'default';
                const color = d3.color(categoryColors[cat] || categoryColors.default);
                return color?.darker(2).toString() || 'rgba(0,0,0,0.3)';
            })
            .attr('rx', 8)
            .attr('stroke', d => {
                const cat = (d.data as { category?: string }).category || 'default';
                return categoryColors[cat] || categoryColors.default;
            })
            .attr('stroke-width', 1)
            .attr('stroke-opacity', 0.3);

        // Category labels
        svg.selectAll('.category-label')
            .data(categoryNodes)
            .join('text')
            .attr('class', 'category-label')
            .attr('x', d => d.x0 + 8)
            .attr('y', d => d.y0 + 15)
            .attr('fill', d => {
                const cat = (d.data as { category?: string }).category || 'default';
                return categoryColors[cat] || categoryColors.default;
            })
            .attr('font-size', 11)
            .attr('font-weight', '600')
            .attr('text-transform', 'uppercase')
            .attr('letter-spacing', '0.5px')
            .text(d => (d.data as { category?: string }).category?.toUpperCase() || '');

        // Get leaf nodes (actual data cells)
        const leaves = root.leaves().filter(d => 'id' in d.data);

        // Create cells
        const cells = svg.selectAll('.cell')
            .data(leaves)
            .join('g')
            .attr('class', 'cell')
            .attr('transform', d => `translate(${d.x0},${d.y0})`)
            .style('cursor', 'pointer');

        // Main cell rect with solidity-based styling
        cells.append('rect')
            .attr('class', 'cell-bg')
            .attr('width', d => Math.max(0, d.x1 - d.x0))
            .attr('height', d => Math.max(0, d.y1 - d.y0))
            .attr('fill', d => {
                const node = d.data as TreemapData;
                return categoryColors[node.category] || categoryColors.default;
            })
            .attr('opacity', d => {
                const node = d.data as TreemapData;
                const solidity = calculateCellSolidity(node, maxValue);
                return 0.5 + solidity * 0.45;
            })
            .attr('rx', 4)
            .attr('stroke', d => {
                const node = d.data as TreemapData;
                const solidity = calculateCellSolidity(node, maxValue);
                return `rgba(255,255,255,${0.1 + solidity * 0.4})`;
            })
            .attr('stroke-width', d => {
                const node = d.data as TreemapData;
                const solidity = calculateCellSolidity(node, maxValue);
                return 1 + solidity * 2;
            })
            .attr('filter', d => {
                const node = d.data as TreemapData;
                const solidity = calculateCellSolidity(node, maxValue);
                return solidity > 0.7 ? 'url(#treemap-glow)' : null;
            });

        // Heat overlay for volatile cells
        if (showHeatOverlay) {
            cells.filter(d => {
                const node = d.data as TreemapData;
                return (node.volatility ?? 0) > 0.5;
            }).append('rect')
                .attr('class', 'heat-overlay')
                .attr('width', d => Math.max(0, d.x1 - d.x0))
                .attr('height', d => Math.max(0, d.y1 - d.y0))
                .attr('fill', 'url(#volatile-pattern)')
                .attr('rx', 4)
                .attr('pointer-events', 'none');
        }

        // Microcells showing audience segments
        if (showMicrocells) {
            cells.each(function (d) {
                const node = d.data as TreemapData;
                const cellWidth = d.x1 - d.x0;
                const cellHeight = d.y1 - d.y0;

                if (cellWidth > 80 && cellHeight > 60 && node.audienceSegments) {
                    const segments = Object.entries(node.audienceSegments);
                    const maxSegments = Math.min(4, segments.length);
                    const miniCellSize = Math.min(12, (cellWidth - 16) / maxSegments);

                    const group = d3.select(this);
                    segments.slice(0, maxSegments).forEach(([_name, value], i) => {
                        group.append('rect')
                            .attr('class', 'micro-cell')
                            .attr('x', 4 + i * (miniCellSize + 2))
                            .attr('y', cellHeight - miniCellSize - 4)
                            .attr('width', miniCellSize)
                            .attr('height', miniCellSize * value)
                            .attr('fill', `rgba(255,255,255,${0.2 + value * 0.4})`)
                            .attr('rx', 2);
                    });
                }
            });
        }

        // Sparkline for historical trend
        cells.each(function (d) {
            const node = d.data as TreemapData;
            const cellWidth = d.x1 - d.x0;
            const cellHeight = d.y1 - d.y0;

            if (cellWidth > 60 && cellHeight > 50 && node.historicalValues && node.historicalValues.length > 1) {
                const group = d3.select(this);
                const sparkWidth = Math.min(40, cellWidth - 12);
                const sparkHeight = 12;
                const sparkY = cellHeight - sparkHeight - 20;

                const yExtent = d3.extent(node.historicalValues) as [number, number];
                const xScale = d3.scaleLinear().domain([0, node.historicalValues.length - 1]).range([0, sparkWidth]);
                const yScale = d3.scaleLinear().domain(yExtent).range([sparkHeight, 0]);

                const line = d3.line<number>()
                    .x((_, i) => xScale(i))
                    .y(v => yScale(v))
                    .curve(d3.curveMonotoneX);

                group.append('path')
                    .attr('d', line(node.historicalValues))
                    .attr('transform', `translate(6, ${sparkY})`)
                    .attr('fill', 'none')
                    .attr('stroke', node.velocity > 0 ? '#22c55e' : node.velocity < 0 ? '#ef4444' : '#64748b')
                    .attr('stroke-width', 1.5)
                    .attr('opacity', 0.7);
            }
        });

        // Velocity/momentum bar
        cells.each(function (d) {
            const node = d.data as TreemapData;
            const cellWidth = d.x1 - d.x0;
            const cellHeight = d.y1 - d.y0;

            if (cellWidth > 40 && cellHeight > 30) {
                const barWidth = Math.min(cellWidth - 8, 50);
                const barHeight = 4;
                const velocityWidth = Math.abs(node.velocity) * barWidth;

                d3.select(this).append('rect')
                    .attr('class', 'velocity-bg')
                    .attr('x', cellWidth - barWidth - 4)
                    .attr('y', 4)
                    .attr('width', barWidth)
                    .attr('height', barHeight)
                    .attr('fill', 'rgba(0,0,0,0.4)')
                    .attr('rx', 2);

                d3.select(this).append('rect')
                    .attr('class', 'velocity-bar')
                    .attr('x', cellWidth - barWidth - 4)
                    .attr('y', 4)
                    .attr('width', animated ? 0 : velocityWidth)
                    .attr('height', barHeight)
                    .attr('fill', node.velocity > 0 ? '#22c55e' : '#ef4444')
                    .attr('rx', 2);
            }
        });

        // Animate velocity bars
        if (animated) {
            cells.selectAll<SVGRectElement, d3.HierarchyRectangularNode<typeof hierarchyData>>('.velocity-bar')
                .transition()
                .duration(800)
                .delay((_, i) => i * 50)
                .attr('width', function () {
                    const parentData = d3.select<Element, d3.HierarchyRectangularNode<typeof hierarchyData>>(this.parentNode as Element).datum();
                    const node = parentData.data as TreemapData;
                    const cellWidth = parentData.x1 - parentData.x0;
                    const barWidth = Math.min(cellWidth - 8, 50);
                    return Math.abs(node.velocity) * barWidth;
                });
        }

        // Dominance indicator (corner badge)
        cells.filter(d => {
            const node = d.data as TreemapData;
            return (node.dominance ?? 0) > 0.7;
        }).append('circle')
            .attr('cx', d => d.x1 - d.x0 - 10)
            .attr('cy', d => d.y1 - d.y0 - 10)
            .attr('r', 6)
            .attr('fill', '#fbbf24')
            .attr('opacity', 0.9);

        cells.filter(d => {
            const node = d.data as TreemapData;
            return (node.dominance ?? 0) > 0.7;
        }).append('text')
            .attr('x', d => d.x1 - d.x0 - 10)
            .attr('y', d => d.y1 - d.y0 - 6)
            .attr('text-anchor', 'middle')
            .attr('font-size', 8)
            .attr('fill', '#000')
            .text('★');

        // Labels
        cells.append('text')
            .attr('class', 'cell-label')
            .attr('x', 6)
            .attr('y', 18)
            .attr('fill', '#ffffff')
            .attr('font-size', d => {
                const width = d.x1 - d.x0;
                return Math.max(9, Math.min(13, width / 7));
            })
            .attr('font-weight', d => {
                const node = d.data as TreemapData;
                const solidity = calculateCellSolidity(node, maxValue);
                return solidity > 0.6 ? '700' : '500';
            })
            .attr('filter', 'drop-shadow(0 1px 2px rgba(0,0,0,0.5))')
            .text(d => {
                const node = d.data as TreemapData;
                const width = d.x1 - d.x0;
                const maxLen = Math.floor(width / 6);
                const label = node.label || node.name || node.id;
                return label.length > maxLen ? label.slice(0, maxLen) + '…' : label;
            })
            .attr('opacity', d => (d.x1 - d.x0) > 45 && (d.y1 - d.y0) > 25 ? 1 : 0);

        // Value + percentage labels
        cells.append('text')
            .attr('class', 'cell-value')
            .attr('x', 6)
            .attr('y', 32)
            .attr('fill', 'rgba(255,255,255,0.7)')
            .attr('font-size', 10)
            .attr('font-family', 'monospace')
            .text(d => {
                const node = d.data as TreemapData;
                const solidity = calculateCellSolidity(node, maxValue);
                return `${(node.value / 1000).toFixed(0)}K • ${(solidity * 100).toFixed(0)}%`;
            })
            .attr('opacity', d => (d.x1 - d.x0) > 65 && (d.y1 - d.y0) > 45 ? 1 : 0);

        // Event handlers
        cells
            .on('mouseenter', function (event, d) {
                const node = d.data as TreemapData;
                setHoveredId(node.id);
                onNodeHover?.(node);

                d3.select(this).select('.cell-bg')
                    .transition().duration(150)
                    .attr('opacity', 1)
                    .attr('stroke', 'rgba(255,255,255,0.8)')
                    .attr('stroke-width', 3);

                // Dim other cells
                cells.filter(n => (n.data as TreemapData).id !== node.id)
                    .select('.cell-bg')
                    .transition().duration(150)
                    .attr('opacity', 0.4);
            })
            .on('mouseleave', function () {
                setHoveredId(null);
                onNodeHover?.(null);

                cells.select('.cell-bg')
                    .transition().duration(150)
                    .attr('opacity', d => {
                        const node = d.data as TreemapData;
                        const solidity = calculateCellSolidity(node, maxValue);
                        return 0.5 + solidity * 0.45;
                    })
                    .attr('stroke', d => {
                        const node = d.data as TreemapData;
                        const solidity = calculateCellSolidity(node, maxValue);
                        return `rgba(255,255,255,${0.1 + solidity * 0.4})`;
                    })
                    .attr('stroke-width', d => {
                        const node = d.data as TreemapData;
                        const solidity = calculateCellSolidity(node, maxValue);
                        return 1 + solidity * 2;
                    });
            })
            .on('click', (event, d) => {
                onNodeClick?.(d.data as TreemapData);
            });

    }, [data, width, height, showHeatOverlay, showMicrocells, animated, hoveredId, onNodeClick, onNodeHover]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ overflow: 'visible' }}
        />
    );
}
