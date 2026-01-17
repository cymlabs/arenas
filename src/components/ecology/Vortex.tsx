'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { vortexVertexShader, vortexFragmentShader } from '@/shaders/fluidShaders';

interface VortexProps {
    position: [number, number];
    strength: number;      // 0-1, importance/volume
    depth: number;         // 0-1, persistence
    spinSpeed: number;     // velocity
    size: number;          // visual size
    color: string;
    label?: string;
}

export function Vortex({
    position,
    strength = 0.5,
    depth = 0.3,
    spinSpeed = 1,
    size = 2,
    color = '#3b82f6',
}: VortexProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uStrength: { value: strength },
        uSize: { value: size },
        uDepth: { value: depth },
        uSpinSpeed: { value: spinSpeed },
        uColor: { value: new THREE.Color(color) },
    }), [strength, size, depth, spinSpeed, color]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;

            // Subtle size pulse based on strength
            const pulse = 1 + Math.sin(state.clock.elapsedTime * spinSpeed * 0.5) * 0.05 * strength;
            meshRef.current.scale.setScalar(pulse);
        }
    });

    return (
        <mesh ref={meshRef} position={[position[0], position[1], 0.01]}>
            <circleGeometry args={[size, 64]} />
            <shaderMaterial
                vertexShader={vortexVertexShader}
                fragmentShader={vortexFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

interface VortexSystemProps {
    topics: Array<{
        id: string;
        position: [number, number];
        strength: number;
        depth: number;
        spinSpeed: number;
        size: number;
        color: string;
        label: string;
    }>;
}

export function VortexSystem({ topics }: VortexSystemProps) {
    return (
        <group>
            {topics.map((topic) => (
                <Vortex
                    key={topic.id}
                    position={topic.position}
                    strength={topic.strength}
                    depth={topic.depth}
                    spinSpeed={topic.spinSpeed}
                    size={topic.size}
                    color={topic.color}
                />
            ))}
        </group>
    );
}
