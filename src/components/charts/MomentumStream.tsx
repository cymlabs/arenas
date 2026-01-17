'use client';

import { useEffect, useRef } from 'react';
import * as d3 from 'd3';

export interface StreamData {
    date: Date;
    values: Record<string, number>;
}

interface MomentumStreamProps {
    data: StreamData[];
    keys: string[];
    colors: Record<string, string>;
    width?: number;
    height?: number;
    onAreaClick?: (key: string) => void;
}

export function MomentumStream({
    data,
    keys,
    colors,
    width = 600,
    height = 200,
    onAreaClick,
}: MomentumStreamProps) {
    const svgRef = useRef<SVGSVGElement>(null);

    useEffect(() => {
        if (!svgRef.current || data.length === 0) return;

        const svg = d3.select(svgRef.current);
        svg.selectAll('*').remove();

        const margin = { top: 10, right: 10, bottom: 30, left: 40 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const g = svg.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        // Stack the data
        const stack = d3.stack<StreamData>()
            .keys(keys)
            .value((d, key) => d.values[key] || 0)
            .offset(d3.stackOffsetWiggle)
            .order(d3.stackOrderInsideOut);

        const series = stack(data);

        // Scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.date) as [Date, Date])
            .range([0, innerWidth]);

        const yMax = d3.max(series, layer => d3.max(layer, d => Math.abs(d[0]) + Math.abs(d[1]))) || 0;
        const yScale = d3.scaleLinear()
            .domain([-yMax / 2, yMax / 2])
            .range([innerHeight, 0]);

        // Area generator
        const area = d3.area<d3.SeriesPoint<StreamData>>()
            .x(d => xScale(d.data.date))
            .y0(d => yScale(d[0]))
            .y1(d => yScale(d[1]))
            .curve(d3.curveBasis);

        // Draw layers
        g.selectAll('.layer')
            .data(series)
            .join('path')
            .attr('class', 'layer')
            .attr('d', area)
            .attr('fill', d => colors[d.key] || '#64748b')
            .attr('opacity', 0.7)
            .style('cursor', 'pointer')
            .on('mouseenter', function () {
                d3.select(this).attr('opacity', 0.9);
            })
            .on('mouseleave', function () {
                d3.select(this).attr('opacity', 0.7);
            })
            .on('click', (event, d) => {
                onAreaClick?.(d.key);
            });

        // X axis
        const xAxis = d3.axisBottom(xScale)
            .ticks(6)
            .tickFormat(d => d3.timeFormat('%H:%M')(d as Date));

        g.append('g')
            .attr('transform', `translate(0,${innerHeight})`)
            .call(xAxis)
            .selectAll('text')
            .attr('fill', 'rgba(255,255,255,0.4)')
            .attr('font-size', 10);

        g.selectAll('.domain, .tick line')
            .attr('stroke', 'rgba(255,255,255,0.1)');

    }, [data, keys, colors, width, height, onAreaClick]);

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ overflow: 'visible' }}
        />
    );
}

// Generate demo stream data
export function generateStreamData(topics: string[], hours: number = 24): StreamData[] {
    const now = new Date();
    const data: StreamData[] = [];

    for (let i = hours; i >= 0; i--) {
        const date = new Date(now.getTime() - i * 60 * 60 * 1000);
        const values: Record<string, number> = {};

        topics.forEach((topic, index) => {
            // Generate organic-looking variations
            const base = 50 + index * 10;
            const timeVariation = Math.sin(i * 0.3 + index) * 20;
            const noise = (Math.random() - 0.5) * 10;
            values[topic] = Math.max(10, base + timeVariation + noise);
        });

        data.push({ date, values });
    }

    return data;
}
