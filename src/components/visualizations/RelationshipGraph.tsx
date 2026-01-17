'use client';

import { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';
import * as d3 from 'd3';
import { ZapIcon, UsersIcon } from '@/components/ui/Icons';

export interface GraphNode {
    id: string;
    label: string;
    value: number;
    category?: string;
    sentiment?: number;
}

export interface GraphLink {
    source: string;
    target: string;
    strength: number;
}

interface RelationshipGraphProps {
    nodes: GraphNode[];
    links: GraphLink[];
    height?: number;
    onNodeClick?: (node: GraphNode) => void;
    className?: string;
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

interface SimNode extends d3.SimulationNodeDatum {
    id: string;
    label: string;
    value: number;
    category?: string;
    sentiment?: number;
    x?: number;
    y?: number;
}

interface SimLink extends d3.SimulationLinkDatum<SimNode> {
    strength: number;
}

export function RelationshipGraph({
    nodes,
    links,
    height = 400,
    onNodeClick,
    className = '',
}: RelationshipGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [dimensions, setDimensions] = useState({ width: 600, height });
    const [hoveredNode, setHoveredNode] = useState<string | null>(null);
    const [simulation, setSimulation] = useState<d3.Simulation<SimNode, SimLink> | null>(null);
    const [simNodes, setSimNodes] = useState<SimNode[]>([]);
    const [simLinks, setSimLinks] = useState<SimLink[]>([]);

    // Resize observer
    useEffect(() => {
        if (!containerRef.current) return;

        const observer = new ResizeObserver((entries) => {
            for (const entry of entries) {
                setDimensions({
                    width: entry.contentRect.width,
                    height,
                });
            }
        });

        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, [height]);

    // Initialize simulation
    useEffect(() => {
        if (nodes.length === 0) return;

        const simNodesData: SimNode[] = nodes.map(n => ({
            ...n,
            x: dimensions.width / 2 + (Math.random() - 0.5) * 100,
            y: dimensions.height / 2 + (Math.random() - 0.5) * 100,
        }));

        const nodeMap = new Map(simNodesData.map(n => [n.id, n]));

        const simLinksData: SimLink[] = links
            .filter(l => nodeMap.has(l.source) && nodeMap.has(l.target))
            .map(l => ({
                source: nodeMap.get(l.source)!,
                target: nodeMap.get(l.target)!,
                strength: l.strength,
            }));

        const sim = d3.forceSimulation<SimNode>(simNodesData)
            .force('link', d3.forceLink<SimNode, SimLink>(simLinksData)
                .id(d => d.id)
                .distance(d => 80 / (d.strength + 0.1))
                .strength(d => d.strength * 0.5)
            )
            .force('charge', d3.forceManyBody().strength(-150))
            .force('center', d3.forceCenter(dimensions.width / 2, dimensions.height / 2))
            .force('collision', d3.forceCollide().radius(d => Math.sqrt((d as SimNode).value) * 0.5 + 20))
            .on('tick', () => {
                setSimNodes([...simNodesData]);
                setSimLinks([...simLinksData]);
            });

        setSimulation(sim);
        setSimNodes(simNodesData);
        setSimLinks(simLinksData);

        return () => {
            sim.stop();
        };
    }, [nodes, links, dimensions]);

    // Calculate node sizes
    const nodeSizes = useMemo(() => {
        const maxValue = Math.max(...nodes.map(n => n.value), 1);
        return new Map(nodes.map(n => [
            n.id,
            Math.max(12, Math.min(40, (n.value / maxValue) * 35 + 10)),
        ]));
    }, [nodes]);

    // Drag handlers
    const handleDragStart = useCallback((event: React.MouseEvent, nodeId: string) => {
        if (!simulation) return;
        simulation.alphaTarget(0.3).restart();

        const node = simNodes.find(n => n.id === nodeId);
        if (node) {
            node.fx = node.x;
            node.fy = node.y;
        }
    }, [simulation, simNodes]);

    const handleDrag = useCallback((event: React.MouseEvent, nodeId: string) => {
        const node = simNodes.find(n => n.id === nodeId);
        if (node && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            node.fx = event.clientX - rect.left;
            node.fy = event.clientY - rect.top;
        }
    }, [simNodes]);

    const handleDragEnd = useCallback((nodeId: string) => {
        if (!simulation) return;
        simulation.alphaTarget(0);

        const node = simNodes.find(n => n.id === nodeId);
        if (node) {
            node.fx = null;
            node.fy = null;
        }
    }, [simulation, simNodes]);

    return (
        <div
            ref={containerRef}
            className={`relative overflow-hidden rounded-2xl bg-black border border-white/[0.08] ${className}`}
            style={{ height }}
        >
            {/* Header */}
            <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                <UsersIcon size={14} className="text-white/40" />
                <span className="text-xs text-white/40 font-mono">
                    {nodes.length} nodes • {links.length} links
                </span>
            </div>

            {/* Grid background */}
            <svg className="absolute inset-0 w-full h-full opacity-20">
                <defs>
                    <pattern id="graph-grid" width="30" height="30" patternUnits="userSpaceOnUse">
                        <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
                    </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#graph-grid)" />
            </svg>

            {/* Main SVG */}
            <svg
                ref={svgRef}
                className="absolute inset-0 w-full h-full"
                style={{ overflow: 'visible' }}
            >
                {/* Links */}
                {simLinks.map((link, i) => {
                    const source = link.source as SimNode;
                    const target = link.target as SimNode;
                    if (!source.x || !source.y || !target.x || !target.y) return null;

                    return (
                        <line
                            key={`link-${i}`}
                            x1={source.x}
                            y1={source.y}
                            x2={target.x}
                            y2={target.y}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={1 + link.strength * 2}
                            strokeDasharray={link.strength < 0.3 ? '4,4' : undefined}
                        />
                    );
                })}

                {/* Nodes */}
                {simNodes.map(node => {
                    if (!node.x || !node.y) return null;
                    const size = nodeSizes.get(node.id) || 20;
                    const color = categoryColors[node.category || 'default'];
                    const isHovered = hoveredNode === node.id;

                    return (
                        <g
                            key={node.id}
                            transform={`translate(${node.x}, ${node.y})`}
                            className="cursor-pointer"
                            onMouseEnter={() => setHoveredNode(node.id)}
                            onMouseLeave={() => setHoveredNode(null)}
                            onClick={() => onNodeClick?.(node)}
                        >
                            {/* Outer glow */}
                            <circle
                                r={size * 1.5}
                                fill={isHovered ? `${color}30` : 'transparent'}
                                className="transition-all duration-200"
                            />

                            {/* Main circle */}
                            <circle
                                r={size}
                                fill={`${color}80`}
                                stroke={isHovered ? '#ffffff' : `${color}`}
                                strokeWidth={isHovered ? 2 : 1}
                                className="transition-all duration-200"
                            />

                            {/* Inner circle */}
                            <circle
                                r={size * 0.5}
                                fill={color}
                            />

                            {/* Label */}
                            {(isHovered || size > 25) && (
                                <text
                                    y={size + 14}
                                    textAnchor="middle"
                                    fill="white"
                                    fontSize="10"
                                    fontFamily="monospace"
                                    opacity={isHovered ? 1 : 0.6}
                                >
                                    {node.label.length > 15
                                        ? node.label.slice(0, 15) + '...'
                                        : node.label
                                    }
                                </text>
                            )}
                        </g>
                    );
                })}
            </svg>

            {/* Tooltip */}
            {hoveredNode && (
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute bottom-4 left-4 z-20"
                >
                    <div className="px-3 py-2 rounded-lg bg-black/95 border border-white/20 shadow-xl font-mono">
                        {(() => {
                            const node = simNodes.find(n => n.id === hoveredNode);
                            if (!node) return null;
                            return (
                                <>
                                    <div className="text-sm text-white font-semibold">{node.label}</div>
                                    <div className="flex items-center gap-3 mt-1">
                                        <span className="text-xs text-white/40">
                                            {node.value.toLocaleString()} mentions
                                        </span>
                                        {node.sentiment !== undefined && (
                                            <span className={`text-xs ${node.sentiment > 0.1 ? 'text-green-400' :
                                                    node.sentiment < -0.1 ? 'text-red-400' : 'text-white/40'
                                                }`}>
                                                {node.sentiment > 0 ? '+' : ''}{(node.sentiment * 100).toFixed(0)}%
                                            </span>
                                        )}
                                    </div>
                                </>
                            );
                        })()}
                    </div>
                </motion.div>
            )}

            {/* Legend */}
            <div className="absolute bottom-4 right-4 z-10 flex items-center gap-4">
                {Object.entries(categoryColors).slice(0, 4).map(([cat, color]) => (
                    <div key={cat} className="flex items-center gap-1">
                        <div
                            className="w-2 h-2 rounded-full"
                            style={{ backgroundColor: color }}
                        />
                        <span className="text-[10px] text-white/40 capitalize font-mono">{cat}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
