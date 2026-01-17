'use client';

import { useRef, useState, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { shockwaveVertexShader, shockwaveFragmentShader } from '@/shaders/fluidShaders';

interface ShockwaveProps {
    position: [number, number];
    color: string;
    duration?: number;
    size?: number;
    intensity?: number;
    onComplete?: () => void;
}

export function Shockwave({
    position,
    color = '#22c55e',
    duration = 2.5,
    size = 4,
    intensity = 1,
    onComplete,
}: ShockwaveProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const startTimeRef = useRef<number | null>(null);
    const [active, setActive] = useState(true);

    const uniforms = useRef({
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uColor: { value: new THREE.Color(color) },
        uIntensity: { value: intensity },
    }).current;

    useFrame((state) => {
        if (!meshRef.current || !active) return;

        if (startTimeRef.current === null) {
            startTimeRef.current = state.clock.elapsedTime;
        }

        const elapsed = state.clock.elapsedTime - startTimeRef.current;
        const progress = Math.min(elapsed / duration, 1);

        uniforms.uTime.value = state.clock.elapsedTime;
        uniforms.uProgress.value = progress;

        // Scale up as it expands
        meshRef.current.scale.setScalar(1 + progress * size);

        if (progress >= 1) {
            setActive(false);
            onComplete?.();
        }
    });

    if (!active) return null;

    return (
        <mesh ref={meshRef} position={[position[0], position[1], 0.02]}>
            <circleGeometry args={[1, 64]} />
            <shaderMaterial
                vertexShader={shockwaveVertexShader}
                fragmentShader={shockwaveFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}

interface ShockwaveSystemProps {
    events: Array<{
        id: string;
        position: [number, number];
        color: string;
        timestamp: number;
    }>;
    onEventComplete?: (id: string) => void;
}

export function ShockwaveSystem({ events, onEventComplete }: ShockwaveSystemProps) {
    const [activeEvents, setActiveEvents] = useState<string[]>([]);

    useEffect(() => {
        events.forEach((event) => {
            if (!activeEvents.includes(event.id)) {
                setActiveEvents((prev) => [...prev, event.id]);
            }
        });
    }, [events, activeEvents]);

    const handleComplete = (id: string) => {
        setActiveEvents((prev) => prev.filter((e) => e !== id));
        onEventComplete?.(id);
    };

    return (
        <group>
            {events.map((event) => (
                activeEvents.includes(event.id) && (
                    <Shockwave
                        key={event.id}
                        position={event.position}
                        color={event.color}
                        onComplete={() => handleComplete(event.id)}
                    />
                )
            ))}
        </group>
    );
}
