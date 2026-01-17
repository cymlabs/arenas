'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrthographicCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { FluidSurface } from './FluidSurface';
import { VortexSystem } from './Vortex';
import { FloatingArtifacts } from './FloatingArtifacts';
import { ShockwaveSystem } from './Shockwave';

// Topic data as vortices
const topicVortices = [
    { id: 'immigration', position: [0, 0] as [number, number], strength: 0.9, depth: 0.7, spinSpeed: 1.2, size: 1.8, color: '#3b82f6', label: 'Immigration' },
    { id: 'censorship', position: [3.5, 1.5] as [number, number], strength: 0.7, depth: 0.5, spinSpeed: 1.5, size: 1.2, color: '#10b981', label: 'Censorship' },
    { id: 'ukraine', position: [-3, -1] as [number, number], strength: 0.5, depth: 0.4, spinSpeed: 0.8, size: 1.0, color: '#06b6d4', label: 'Ukraine Aid' },
    { id: 'crypto', position: [4, -2] as [number, number], strength: 0.4, depth: 0.3, spinSpeed: 2.0, size: 0.8, color: '#f59e0b', label: 'Crypto' },
    { id: 'ai', position: [-4, 2] as [number, number], strength: 0.6, depth: 0.6, spinSpeed: 1.8, size: 1.1, color: '#8b5cf6', label: 'AI Discourse' },
];

// People as floating artifacts
const peopleArtifacts = [
    { id: 'candace', label: 'Candace Owens', position: [-1, 0.5] as [number, number], influence: 0.9, color: '#f97316', velocity: [0, 0] as [number, number] },
    { id: 'nick', label: 'Nick Fuentes', position: [1.5, -0.5] as [number, number], influence: 0.7, color: '#ec4899', velocity: [0, 0] as [number, number] },
    { id: 'charlie', label: 'Charlie Kirk', position: [-2, -1] as [number, number], influence: 0.6, color: '#fbbf24', velocity: [0, 0] as [number, number] },
    { id: 'alex', label: 'Alex Jones', position: [2.5, 1] as [number, number], influence: 0.8, color: '#22c55e', velocity: [0, 0] as [number, number] },
    { id: 'tucker', label: 'Tucker Carlson', position: [-0.5, 2] as [number, number], influence: 0.85, color: '#3b82f6', velocity: [0, 0] as [number, number] },
    { id: 'shapiro', label: 'Ben Shapiro', position: [0.5, -2] as [number, number], influence: 0.75, color: '#06b6d4', velocity: [0, 0] as [number, number] },
    { id: 'rogan', label: 'Joe Rogan', position: [-3, 1] as [number, number], influence: 0.95, color: '#ef4444', velocity: [0, 0] as [number, number] },
    { id: 'musk', label: 'Elon Musk', position: [3, 0] as [number, number], influence: 1.0, color: '#a855f7', velocity: [0, 0] as [number, number] },
];

interface ShockwaveEvent {
    id: string;
    position: [number, number];
    color: string;
    timestamp: number;
}

interface EcologySceneProps {
    showLabels?: boolean;
    turbulence?: number;
}

function EcologyContent({ showLabels = true, turbulence = 1.0 }: EcologySceneProps) {
    const [shockwaves, setShockwaves] = useState<ShockwaveEvent[]>([]);

    // Simulate periodic events
    useEffect(() => {
        const triggerEvent = () => {
            const vortex = topicVortices[Math.floor(Math.random() * topicVortices.length)];
            const colors = ['#22c55e', '#3b82f6', '#f97316', '#8b5cf6'];

            const newEvent: ShockwaveEvent = {
                id: `shock-${Date.now()}`,
                position: [
                    vortex.position[0] + (Math.random() - 0.5) * 2,
                    vortex.position[1] + (Math.random() - 0.5) * 2,
                ],
                color: colors[Math.floor(Math.random() * colors.length)],
                timestamp: Date.now(),
            };

            setShockwaves((prev) => [...prev.slice(-5), newEvent]);
        };

        const interval = setInterval(triggerEvent, 6000);
        const timeout = setTimeout(triggerEvent, 2000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, []);

    const handleEventComplete = useCallback((id: string) => {
        setShockwaves((prev) => prev.filter((e) => e.id !== id));
    }, []);

    return (
        <>
            {/* Dark liquid surface */}
            <FluidSurface turbulence={turbulence} />

            {/* Topic vortices */}
            <VortexSystem topics={topicVortices} />

            {/* Floating people */}
            <FloatingArtifacts
                artifacts={peopleArtifacts}
                vortices={topicVortices}
                showLabels={showLabels}
            />

            {/* Event shockwaves */}
            <ShockwaveSystem
                events={shockwaves}
                onEventComplete={handleEventComplete}
            />
        </>
    );
}

export function EcologyScene({ showLabels = true, turbulence = 1.0 }: EcologySceneProps) {
    return (
        <Canvas
            gl={{
                antialias: true,
                alpha: false,
                powerPreference: 'high-performance',
            }}
            dpr={[1, 2]}
            style={{ background: '#000000' }}
        >
            <OrthographicCamera
                makeDefault
                position={[0, 0, 10]}
                zoom={80}
            />

            <color attach="background" args={['#010204']} />

            <Suspense fallback={null}>
                <EcologyContent showLabels={showLabels} turbulence={turbulence} />
            </Suspense>

            {/* Premium postprocessing */}
            <EffectComposer>
                <Bloom
                    intensity={0.8}
                    luminanceThreshold={0.1}
                    luminanceSmoothing={0.9}
                    radius={0.9}
                />
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={[0.0008, 0.0008]}
                />
                <Noise
                    blendFunction={BlendFunction.SOFT_LIGHT}
                    opacity={0.08}
                />
                <Vignette
                    offset={0.2}
                    darkness={0.6}
                    blendFunction={BlendFunction.NORMAL}
                />
            </EffectComposer>
        </Canvas>
    );
}
