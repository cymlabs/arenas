'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { NODES, FLOWS, NodeData } from './data';

interface FlowParticlesProps {
    nodes?: Record<string, NodeData>;
    flows?: Array<{ from: string; to: string; weight: number }>;
    hoveredNodeId: string | null;
}

export function FlowParticles({ nodes = NODES, flows = FLOWS, hoveredNodeId }: FlowParticlesProps) {
    const containerRef = useRef<THREE.Group>(null);

    // Create particle systems for each flow
    const systems = useMemo(() => {
        return flows.map(flow => {
            const start = nodes[flow.from];
            const end = nodes[flow.to];

            if (!start || !end) return null;

            // Generate curve points
            const p0 = new THREE.Vector3(start.x, start.y, 0);
            const p3 = new THREE.Vector3(end.x, end.y, 0);
            const p1 = new THREE.Vector3(start.x + (end.x - start.x) * 0.5, start.y, 5);
            const p2 = new THREE.Vector3(end.x - (end.x - start.x) * 0.5, end.y, -5);
            const curve = new THREE.CubicBezierCurve3(p0, p1, p2, p3);

            const particleCount = flow.weight * 40;
            const initialPos = new Float32Array(particleCount * 3);
            const progress = new Float32Array(particleCount);
            const speed = new Float32Array(particleCount);

            for (let i = 0; i < particleCount; i++) {
                // Deterministic pseudo-random based on index
                const seed = (i + 1) * (flow.weight * 100);
                const rand1 = Math.abs(Math.sin(seed));
                const rand2 = Math.abs(Math.cos(seed));

                progress[i] = rand1;
                speed[i] = 0.002 + rand2 * 0.004;
                const pt = curve.getPoint(progress[i]);
                initialPos[i * 3] = pt.x;
                initialPos[i * 3 + 1] = pt.y;
                initialPos[i * 3 + 2] = pt.z;
            }

            return {
                ...flow,
                curve,
                count: particleCount,
                progress,
                speed,
                startColor: new THREE.Color(start.color),
                linePoints: curve.getPoints(40)
            };
        }).filter((sys): sys is NonNullable<typeof sys> => sys !== null);
    }, [flows, nodes]);

    useFrame(() => {
        if (!containerRef.current) return;

        systems.forEach((sys, i) => {
            const particles = containerRef.current!.children[i * 2 + 1] as THREE.Points; // +1 because we have Line + Points pairs
            if (!particles || !particles.geometry || !particles.geometry.attributes.position) return;

            const positions = particles.geometry.attributes.position.array as Float32Array;

            for (let j = 0; j < sys.count; j++) {
                sys.progress[j] += sys.speed[j];
                if (sys.progress[j] > 1) sys.progress[j] = 0;

                const pt = sys.curve.getPoint(sys.progress[j]);
                // Add jitter
                positions[j * 3] = pt.x + (Math.random() - 0.5) * 0.2;
                positions[j * 3 + 1] = pt.y + (Math.random() - 0.5) * 0.2;
                positions[j * 3 + 2] = pt.z + (Math.random() - 0.5) * 0.2;
            }
            particles.geometry.attributes.position.needsUpdate = true;
        });
    });

    return (
        <group ref={containerRef}>
            {systems.map((sys, i) => {
                const isRelated = !hoveredNodeId || hoveredNodeId === sys.from || hoveredNodeId === sys.to;

                return (
                    <group key={i}>
                        {/* Flow Line */}
                        <line>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[new Float32Array(sys.linePoints.flatMap(p => [p.x, p.y, p.z])), 3]}
                                />
                            </bufferGeometry>
                            <lineBasicMaterial
                                color={sys.startColor}
                                transparent
                                opacity={isRelated ? 0.2 : 0.02}
                            />
                        </line>

                        {/* Particles */}
                        <points>
                            <bufferGeometry>
                                <bufferAttribute
                                    attach="attributes-position"
                                    args={[new Float32Array(sys.count * 3), 3]}
                                />
                            </bufferGeometry>
                            <pointsMaterial
                                color={sys.startColor}
                                size={0.4}
                                transparent
                                opacity={isRelated ? 0.8 : 0.1}
                                blending={THREE.AdditiveBlending}
                            />
                        </points>
                    </group>
                );
            })}
        </group>
    );
}
