'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';
import { NODES, NodeData, THEME } from './data';

interface FlowNodesProps {
    nodes?: Record<string, NodeData>;
    flows?: Array<{ from: string; to: string; weight: number }>;
    hoveredNodeId: string | null;
    setHoveredNodeId: (id: string | null) => void;
}

function NodeItem({ id, data, isHovered, isDimmed, setHover }: { id: string, data: NodeData, isHovered: boolean, isDimmed: boolean, setHover: (id: string | null) => void }) {
    const meshRef = useRef<THREE.Mesh>(null);
    const ringRef = useRef<THREE.Mesh>(null);

    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        if (meshRef.current) {
            meshRef.current.position.y = Math.sin(time + id.length) * 0.5; // Float
        }
        if (ringRef.current) {
            ringRef.current.rotation.z -= 0.01;
            // Pulse ring when hovered or not dimmed
            const scale = isHovered ? 1.2 : isDimmed ? 1 : 1.05 + Math.sin(time * 2) * 0.05;
            ringRef.current.scale.lerp(new THREE.Vector3(scale, scale, scale), 0.1);
        }
    });

    return (
        <group position={[data.x, data.y, 0]}>
            {/* Core Sphere */}
            <mesh
                ref={meshRef}
                onPointerOver={() => { document.body.style.cursor = 'pointer'; setHover(id); }}
                onPointerOut={() => { document.body.style.cursor = 'default'; setHover(null); }}
            >
                <icosahedronGeometry args={[0.8, 1]} />
                <meshBasicMaterial
                    color={isDimmed ? THEME.dim : data.color}
                    transparent
                    opacity={isDimmed ? 0.5 : 1}
                />
            </mesh>

            {/* Ring */}
            <mesh ref={ringRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.4, 0.05, 8, 50]} />
                <meshBasicMaterial
                    color={isDimmed ? THEME.dim : data.color}
                    transparent
                    opacity={isHovered ? 1 : isDimmed ? 0.1 : 0.6}
                />
            </mesh>

            {/* Label */}
            <Html position={[0, 1.5, 0]} center distanceFactor={15}>
                <div
                    className={`px-3 py-1.5 rounded-lg border backdrop-blur-md transition-all duration-300 pointer-events-none select-none whitespace-nowrap
            ${isHovered
                            ? 'bg-white/10 border-white scale-110 z-50'
                            : isDimmed
                                ? 'bg-black/40 border-white/5 opacity-40'
                                : 'bg-black/60 border-white/20'
                        }`}
                >
                    <div className="text-xs font-bold text-white">{data.label}</div>
                    <div className="text-[9px] text-white/70">{data.sub}</div>
                </div>
            </Html>
        </group>
    );
}

export function FlowNodes({ nodes = NODES, flows = [], hoveredNodeId, setHoveredNodeId }: FlowNodesProps) {
    const nodeEntries = Object.entries(nodes);

    // Compute related nodes based on flows
    const relatedIds = new Set<string>();
    if (hoveredNodeId) {
        relatedIds.add(hoveredNodeId);
        flows.forEach(f => {
            if (f.from === hoveredNodeId) relatedIds.add(f.to);
            if (f.to === hoveredNodeId) relatedIds.add(f.from);
        });
    }

    return (
        <group>
            {nodeEntries.map(([id, data]) => {
                const isHovered = hoveredNodeId === id;
                const isRelated = relatedIds.has(id);
                const isDimmed = !!hoveredNodeId && !isHovered && !isRelated;

                return (
                    <NodeItem
                        key={id}
                        id={id}
                        data={data}
                        isHovered={isHovered}
                        isDimmed={isDimmed}
                        setHover={setHoveredNodeId}
                    />
                );
            })}
        </group>
    );
}
