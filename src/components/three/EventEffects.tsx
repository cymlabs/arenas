'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface MergePulseProps {
    position: [number, number, number];
    color?: string;
    duration?: number;
    size?: number;
    onComplete?: () => void;
}

export function MergePulse({
    position,
    color = '#8b5cf6',
    duration = 1.5,
    size = 3,
    onComplete,
}: MergePulseProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const [progress, setProgress] = useState(0);
    const startTimeRef = useRef<number | null>(null);

    useFrame((state) => {
        if (!meshRef.current) return;

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTimeRef.current;
        const newProgress = Math.min(elapsed / duration, 1);
        setProgress(newProgress);

        // Scale up as it expands
        const scale = 1 + newProgress * size;
        meshRef.current.scale.setScalar(scale);

        // Fade out
        const material = meshRef.current.material as THREE.MeshBasicMaterial;
        material.opacity = (1 - newProgress) * 0.8;

        if (newProgress >= 1 && onComplete) {
            onComplete();
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <ringGeometry args={[0.8, 1, 32]} />
            <meshBasicMaterial
                color={color}
                transparent
                opacity={0.8}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

interface SurgeEffectProps {
    position: [number, number, number];
    color?: string;
    duration?: number;
    size?: number;
    onComplete?: () => void;
}

export function SurgeEffect({
    position,
    color = '#22c55e',
    duration = 2,
    size = 4,
    onComplete,
}: SurgeEffectProps) {
    const groupRef = useRef<THREE.Group>(null);
    const [rings, setRings] = useState<{ id: number; delay: number }[]>([
        { id: 1, delay: 0 },
        { id: 2, delay: 0.2 },
        { id: 3, delay: 0.4 },
    ]);
    const startTimeRef = useRef<number | null>(null);

    useFrame((state) => {
        if (!groupRef.current) return;

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTimeRef.current;

        groupRef.current.children.forEach((ring, i) => {
            const delayedElapsed = Math.max(0, elapsed - rings[i].delay);
            const progress = Math.min(delayedElapsed / (duration * 0.7), 1);

            // Expand
            const scale = 1 + progress * size * (1 - i * 0.2);
            ring.scale.setScalar(scale);

            // Fade
            const material = (ring as THREE.Mesh).material as THREE.MeshBasicMaterial;
            material.opacity = (1 - progress) * (0.6 - i * 0.15);
        });

        if (elapsed >= duration && onComplete) {
            onComplete();
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {rings.map((ring, i) => (
                <mesh key={ring.id} rotation={[Math.PI / 2, 0, 0]}>
                    <ringGeometry args={[0.5 + i * 0.1, 0.6 + i * 0.1, 64]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.6}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}

interface SplitEffectProps {
    position: [number, number, number];
    direction?: [number, number, number];
    color?: string;
    duration?: number;
    onComplete?: () => void;
}

export function SplitEffect({
    position,
    direction = [1, 0, 0],
    color = '#f97316',
    duration = 1.5,
    onComplete,
}: SplitEffectProps) {
    const groupRef = useRef<THREE.Group>(null);
    const startTimeRef = useRef<number | null>(null);

    useFrame((state) => {
        if (!groupRef.current) return;

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        // Fracture shimmer effect
        const shimmer = Math.sin(elapsed * 20) * 0.5 + 0.5;

        groupRef.current.children.forEach((child, i) => {
            const mesh = child as THREE.Mesh;
            const material = mesh.material as THREE.MeshBasicMaterial;

            // Move apart
            const offset = (i === 0 ? -1 : 1) * progress * 0.5;
            mesh.position.x = direction[0] * offset;
            mesh.position.y = direction[1] * offset;
            mesh.position.z = direction[2] * offset;

            // Shimmer and fade
            material.opacity = (1 - progress) * shimmer * 0.8;
        });

        if (progress >= 1 && onComplete) {
            onComplete();
        }
    });

    return (
        <group ref={groupRef} position={position}>
            {[0, 1].map((i) => (
                <mesh key={i}>
                    <planeGeometry args={[0.3, 2]} />
                    <meshBasicMaterial
                        color={color}
                        transparent
                        opacity={0.8}
                        side={THREE.DoubleSide}
                        blending={THREE.AdditiveBlending}
                    />
                </mesh>
            ))}
        </group>
    );
}
