'use client';

import { useEffect, useRef, useState } from 'react';

// Node types for the Sankey
type NodeType = 'person' | 'group' | 'country' | 'topic' | 'narrative';

interface FlowNode {
    id: string;
    name: string;
    type: NodeType;
    color?: string;
}

interface FlowLink {
    source: string;
    target: string;
    value: number;
    sentiment?: number;
}

interface MindshareFlowProps {
    nodes: FlowNode[];
    links: FlowLink[];
    width?: number;
    height?: number;
    onNodeClick?: (node: FlowNode) => void;
    onLinkClick?: (link: FlowLink) => void;
}

// Colors by node type
const typeColors: Record<NodeType, string> = {
    person: '#f97316',
    group: '#22c55e',
    country: '#3b82f6',
    topic: '#8b5cf6',
    narrative: '#ec4899',
};

// Type icons by node type
const typeIcons: Record<NodeType, string> = {
    person: '👤',
    group: '👥',
    country: '🌍',
    topic: '📌',
    narrative: '📢',
};

export function MindshareFlow({
    nodes,
    links,
    width = 700,
    height = 400,
    onNodeClick,
    onLinkClick,
}: MindshareFlowProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [isClient, setIsClient] = useState(false);

    // Only run on client side
    useEffect(() => {
        setIsClient(true);
    }, []);

    useEffect(() => {
        if (!isClient || !svgRef.current || nodes.length === 0) return;

        // Dynamically import d3 modules to avoid SSR issues
        Promise.all([
            import('d3'),
            import('d3-sankey')
        ]).then(([d3Module, sankeyModule]) => {
            const d3 = d3Module;
            const { sankey, sankeyLinkHorizontal } = sankeyModule;

            const svg = d3.select(svgRef.current);
            svg.selectAll('*').remove();

            const margin = { top: 20, right: 120, bottom: 20, left: 120 };
            const innerWidth = width - margin.left - margin.right;
            const innerHeight = height - margin.top - margin.bottom;

            const g = svg.append('g')
                .attr('transform', `translate(${margin.left},${margin.top})`);

            // Build node map for sankey
            const nodeMap = new Map(nodes.map((n, i) => [n.id, i]));

            // Convert to sankey format
            const sankeyNodes = nodes.map(n => ({
                ...n,
                name: n.name,
            }));

            const sankeyLinks = links.map(l => ({
                source: l.source,
                target: l.target,
                value: l.value,
                sentiment: l.sentiment,
            }));

            // Create sankey generator
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const sankeyGenerator = sankey<any, any>()
                .nodeId((d: { id: string }) => d.id)
                .nodeWidth(20)
                .nodePadding(15)
                .extent([[0, 0], [innerWidth, innerHeight]]);

            // Generate layout
            const { nodes: layoutNodes, links: layoutLinks } = sankeyGenerator({
                nodes: sankeyNodes.map(d => ({ ...d })),
                links: sankeyLinks.map(d => ({ ...d })),
            });

            // Add gradient definitions for links
            const defs = svg.append('defs');

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            layoutLinks.forEach((link: any, i: number) => {
                const sourceNode = link.source;
                const targetNode = link.target;

                const gradient = defs.append('linearGradient')
                    .attr('id', `flow-gradient-${i}`)
                    .attr('gradientUnits', 'userSpaceOnUse')
                    .attr('x1', sourceNode.x1 || 0)
                    .attr('x2', targetNode.x0 || 0);

                const sourceColor = sourceNode.color || typeColors[sourceNode.type as NodeType] || '#64748b';
                const targetColor = targetNode.color || typeColors[targetNode.type as NodeType] || '#64748b';

                gradient.append('stop')
                    .attr('offset', '0%')
                    .attr('stop-color', sourceColor)
                    .attr('stop-opacity', 0.6);

                gradient.append('stop')
                    .attr('offset', '100%')
                    .attr('stop-color', targetColor)
                    .attr('stop-opacity', 0.6);
            });

            // Draw links
            const linkGroup = g.append('g')
                .attr('class', 'links')
                .attr('fill', 'none');

            linkGroup.selectAll('path')
                .data(layoutLinks)
                .join('path')
                .attr('d', sankeyLinkHorizontal())
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('stroke', (d: any, i: number) => `url(#flow-gradient-${i})`)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('stroke-width', (d: any) => Math.max(3, d.width || 0))
                .attr('opacity', 0.7)
                .style('cursor', 'pointer')
                .on('mouseenter', function () {
                    d3.select(this).attr('opacity', 0.95);
                })
                .on('mouseleave', function () {
                    d3.select(this).attr('opacity', 0.7);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on('click', (event: MouseEvent, d: any) => {
                    onLinkClick?.({
                        source: d.source.id,
                        target: d.target.id,
                        value: d.value,
                    });
                });

            // Draw nodes
            const nodeGroup = g.append('g')
                .attr('class', 'nodes');

            const nodeElements = nodeGroup.selectAll('g')
                .data(layoutNodes)
                .join('g')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('transform', (d: any) => `translate(${d.x0},${d.y0})`)
                .style('cursor', 'pointer');

            // Node rectangles
            nodeElements.append('rect')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('width', (d: any) => (d.x1 || 0) - (d.x0 || 0))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('height', (d: any) => (d.y1 || 0) - (d.y0 || 0))
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('fill', (d: any) => d.color || typeColors[d.type as NodeType] || '#64748b')
                .attr('rx', 4)
                .attr('opacity', 0.9)
                .on('mouseenter', function () {
                    d3.select(this).attr('opacity', 1);
                })
                .on('mouseleave', function () {
                    d3.select(this).attr('opacity', 0.9);
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .on('click', (event: MouseEvent, d: any) => {
                    onNodeClick?.(d as FlowNode);
                });

            // Node labels
            nodeElements.append('text')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('x', (d: any) => {
                    const nodeX0 = d.x0 || 0;
                    return nodeX0 < innerWidth / 2 ? -8 : (d.x1 || 0) - (d.x0 || 0) + 8;
                })
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('y', (d: any) => ((d.y1 || 0) - (d.y0 || 0)) / 2)
                .attr('dy', '0.35em')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('text-anchor', (d: any) => {
                    const nodeX0 = d.x0 || 0;
                    return nodeX0 < innerWidth / 2 ? 'end' : 'start';
                })
                .attr('fill', '#ffffff')
                .attr('font-size', 11)
                .attr('font-weight', '500')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .text((d: any) => d.name);

            // Type indicator badges
            nodeElements.append('text')
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('x', (d: any) => ((d.x1 || 0) - (d.x0 || 0)) / 2)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .attr('y', (d: any) => ((d.y1 || 0) - (d.y0 || 0)) / 2)
                .attr('dy', '0.35em')
                .attr('text-anchor', 'middle')
                .attr('fill', 'rgba(255,255,255,0.8)')
                .attr('font-size', 10)
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                .text((d: any) => typeIcons[d.type as NodeType] || '');

        }).catch(err => {
            console.error('Error loading d3-sankey:', err);
        });

    }, [isClient, nodes, links, width, height, onNodeClick, onLinkClick]);

    if (!isClient) {
        return (
            <div
                style={{ width, height }}
                className="flex items-center justify-center text-white/30"
            >
                Loading flow diagram...
            </div>
        );
    }

    return (
        <svg
            ref={svgRef}
            width={width}
            height={height}
            style={{ overflow: 'visible' }}
        />
    );
}

// Demo data for mindshare flow
export const demoFlowNodes: FlowNode[] = [
    // Left side: Entities (people, groups, countries)
    { id: 'candace', name: 'Candace Owens', type: 'person' },
    { id: 'tucker', name: 'Tucker Carlson', type: 'person' },
    { id: 'rogan', name: 'Joe Rogan', type: 'person' },
    { id: 'musk', name: 'Elon Musk', type: 'person' },
    { id: 'dailywire', name: 'Daily Wire', type: 'group' },
    { id: 'tpusa', name: 'TPUSA', type: 'group' },
    { id: 'russia', name: 'Russia', type: 'country' },
    { id: 'israel', name: 'Israel', type: 'country' },

    // Right side: Topics/Narratives
    { id: 'immigration', name: 'Immigration', type: 'topic' },
    { id: 'censorship', name: 'Censorship', type: 'topic' },
    { id: 'ukraine', name: 'Ukraine Aid', type: 'topic' },
    { id: 'ai', name: 'AI Safety', type: 'topic' },
    { id: 'woke', name: 'Anti-Woke', type: 'narrative' },
    { id: 'deepstate', name: 'Deep State', type: 'narrative' },
];

export const demoFlowLinks: FlowLink[] = [
    // Candace → Topics
    { source: 'candace', target: 'immigration', value: 45 },
    { source: 'candace', target: 'woke', value: 38 },
    { source: 'candace', target: 'deepstate', value: 22 },

    // Tucker → Topics
    { source: 'tucker', target: 'ukraine', value: 55 },
    { source: 'tucker', target: 'immigration', value: 42 },
    { source: 'tucker', target: 'deepstate', value: 35 },

    // Rogan → Topics
    { source: 'rogan', target: 'ai', value: 48 },
    { source: 'rogan', target: 'censorship', value: 40 },

    // Musk → Topics
    { source: 'musk', target: 'censorship', value: 65 },
    { source: 'musk', target: 'ai', value: 55 },

    // Groups → Topics
    { source: 'dailywire', target: 'woke', value: 50 },
    { source: 'dailywire', target: 'immigration', value: 30 },
    { source: 'tpusa', target: 'woke', value: 35 },
    { source: 'tpusa', target: 'deepstate', value: 25 },

    // Countries → Topics
    { source: 'russia', target: 'ukraine', value: 40, sentiment: -0.6 },
    { source: 'russia', target: 'deepstate', value: 25, sentiment: -0.3 },
    { source: 'israel', target: 'woke', value: 20 },
];
