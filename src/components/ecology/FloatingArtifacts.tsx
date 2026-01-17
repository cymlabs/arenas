'use client';

import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { Html } from '@react-three/drei';

interface FloatingArtifact {
    id: string;
    label: string;
    position: [number, number];
    influence: number;  // 0-1, how much they create ripples
    color: string;
    velocity: [number, number];
    targetVortex?: string;  // ID of vortex they're being pulled toward
}

interface FloatingArtifactsProps {
    artifacts: FloatingArtifact[];
    vortices: Array<{
        id: string;
        position: [number, number];
        strength: number;
    }>;
    showLabels?: boolean;
}

export function FloatingArtifacts({ artifacts, vortices, showLabels = true }: FloatingArtifactsProps) {
    const groupRef = useRef<THREE.Group>(null);
    const positionsRef = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map());

    // Initialize positions
    useEffect(() => {
        artifacts.forEach((artifact) => {
            if (!positionsRef.current.has(artifact.id)) {
                positionsRef.current.set(artifact.id, {
                    x: artifact.position[0],
                    y: artifact.position[1],
                    vx: 0,
                    vy: 0,
                });
            }
        });
    }, [artifacts]);

    useFrame((state, delta) => {
        if (!groupRef.current) return;

        const children = groupRef.current.children;

        artifacts.forEach((artifact, index) => {
            const pos = positionsRef.current.get(artifact.id);
            if (!pos || index >= children.length) return;

            // Find nearest vortex and calculate pull
            let pullX = 0;
            let pullY = 0;

            vortices.forEach((vortex) => {
                const dx = vortex.position[0] - pos.x;
                const dy = vortex.position[1] - pos.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 0.1 && dist < 5) {
                    const pullStrength = vortex.strength * 0.3 / (dist * dist);
                    pullX += (dx / dist) * pullStrength;
                    pullY += (dy / dist) * pullStrength;

                    // Add orbital motion (perpendicular to pull)
                    const orbitStrength = vortex.strength * 0.2 / dist;
                    pullX += (-dy / dist) * orbitStrength;
                    pullY += (dx / dist) * orbitStrength;
                }
            });

            // Add some random drift
            const noise = Math.sin(state.clock.elapsedTime * 0.5 + index) * 0.01;
            pullX += noise;
            pullY += Math.cos(state.clock.elapsedTime * 0.3 + index) * 0.01;

            // Apply velocity with damping
            pos.vx = pos.vx * 0.98 + pullX * delta;
            pos.vy = pos.vy * 0.98 + pullY * delta;

            // Clamp velocity
            const speed = Math.sqrt(pos.vx * pos.vx + pos.vy * pos.vy);
            if (speed > 0.5) {
                pos.vx = (pos.vx / speed) * 0.5;
                pos.vy = (pos.vy / speed) * 0.5;
            }

            // Update position
            pos.x += pos.vx;
            pos.y += pos.vy;

            // Boundary constraints
            pos.x = Math.max(-8, Math.min(8, pos.x));
            pos.y = Math.max(-4, Math.min(4, pos.y));

            // Update mesh position
            const child = children[index] as THREE.Group;
            if (child) {
                child.position.x = pos.x;
                child.position.y = pos.y;

                // Subtle bob
                child.position.z = 0.05 + Math.sin(state.clock.elapsedTime * 2 + index) * 0.02;
            }
        });
    });

    return (
        <group ref={groupRef}>
            {artifacts.map((artifact) => (
                <group key={artifact.id} position={[artifact.position[0], artifact.position[1], 0.05]}>
                    {/* Glass bead */}
                    <mesh>
                        <circleGeometry args={[0.15 + artifact.influence * 0.1, 32]} />
                        <meshBasicMaterial
                            color={artifact.color}
                            transparent
                            opacity={0.8}
                        />
                    </mesh>

                    {/* Inner highlight */}
                    <mesh position={[-0.03, 0.03, 0.01]}>
                        <circleGeometry args={[0.05, 16]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.4}
                        />
                    </mesh>

                    {/* Influence ripple ring */}
                    {artifact.influence > 0.5 && (
                        <mesh>
                            <ringGeometry args={[0.2, 0.25, 32]} />
                            <meshBasicMaterial
                                color={artifact.color}
                                transparent
                                opacity={0.3}
                                blending={THREE.AdditiveBlending}
                            />
                        </mesh>
                    )}

                    {/* Label */}
                    {showLabels && (
                        <Html
                            center
                            position={[0, 0.35, 0]}
                            style={{
                                pointerEvents: 'none',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            <div
                                className="px-2 py-0.5 rounded-full text-[10px] font-medium"
                                style={{
                                    background: 'rgba(0,0,0,0.6)',
                                    backdropFilter: 'blur(4px)',
                                    color: artifact.color,
                                    border: `1px solid ${artifact.color}33`,
                                }}
                            >
                                {artifact.label}
                            </div>
                        </Html>
                    )}
                </group>
            ))}
        </group>
    );
}
