'use client';

import { Suspense, useState, useEffect, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';
import { EffectComposer, Bloom, ChromaticAberration, Noise, Vignette } from '@react-three/postprocessing';
import { BlendFunction } from 'postprocessing';
import { OrganicBlob } from './OrganicBlob';
import { AmbientParticles } from './AmbientParticles';
import { FlowingRibbon } from './FlowingRibbon';
import { MergePulse, SurgeEffect, SplitEffect } from './EventEffects';
import { EntityLabels } from './EntityLabels';
import { useVisualizationStore, type Event as VizEvent } from '@/lib/store';

interface ActiveEffect {
    id: string;
    type: 'merge' | 'surge' | 'split';
    position: [number, number, number];
    color: string;
}

function SceneContent() {
    const { entities, connections, showLabels, addEvent } = useVisualizationStore();
    const [activeEffects, setActiveEffects] = useState<ActiveEffect[]>([]);

    const getEntityPosition = useCallback((id: string): [number, number, number] => {
        const entity = entities.find(e => e.id === id);
        return entity?.position || [0, 0, 0];
    }, [entities]);

    // Simulate periodic events
    useEffect(() => {
        const triggerRandomEffect = () => {
            const types: ('merge' | 'surge' | 'split')[] = ['merge', 'surge', 'split'];
            const type = types[Math.floor(Math.random() * types.length)];
            const entity = entities[Math.floor(Math.random() * entities.length)];
            const colors = ['#8b5cf6', '#22c55e', '#f97316', '#3b82f6'];
            const color = colors[Math.floor(Math.random() * colors.length)];

            const effectId = `effect-${Date.now()}`;
            const newEffect: ActiveEffect = {
                id: effectId,
                type,
                position: entity.position,
                color,
            };

            setActiveEffects(prev => [...prev, newEffect]);

            // Add to event log
            const eventDescriptions = {
                merge: `"${entity.label}" merged with nearby cluster`,
                surge: `"${entity.label}" is surging in mentions`,
                split: `"${entity.label}" discourse diverged`,
            };

            const vizEvent: VizEvent = {
                id: effectId,
                type,
                position: entity.position,
                color,
                timestamp: Date.now(),
                description: eventDescriptions[type],
                entities: [entity.id],
            };
            addEvent(vizEvent);

            // Remove effect after animation
            setTimeout(() => {
                setActiveEffects(prev => prev.filter(e => e.id !== effectId));
            }, 2500);
        };

        // Trigger effects periodically
        const interval = setInterval(triggerRandomEffect, 5000);

        // Initial effect after 3 seconds
        const timeout = setTimeout(triggerRandomEffect, 3000);

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }, [entities, addEvent]);

    // Prepare label data
    const labelData = entities.map(e => ({
        id: e.id,
        position: e.position,
        label: e.label,
        type: e.type as 'topic' | 'influencer',
        score: e.mentions ? `${(e.mentions / 1000).toFixed(0)}K` : undefined,
        delta: e.delta,
    }));

    return (
        <>
            {/* Organic blobs - Topics and Influencers */}
            {entities.map((entity) => (
                <OrganicBlob
                    key={entity.id}
                    position={entity.position}
                    size={entity.size}
                    intensity={entity.intensity}
                    noiseScale={entity.type === 'topic' ? 1.2 : 2}
                    noiseStrength={entity.type === 'topic' ? 0.5 : 0.3}
                    pulseSpeed={0.5 + entity.velocity}
                    colorCold={entity.colorCold}
                    colorWarm={entity.colorWarm}
                    colorHot={entity.colorHot}
                />
            ))}

            {/* Floating labels */}
            <EntityLabels entities={labelData} visible={showLabels} />

            {/* Flowing ribbons - Connections */}
            {connections.map((conn) => (
                <FlowingRibbon
                    key={conn.id}
                    start={getEntityPosition(conn.from)}
                    end={getEntityPosition(conn.to)}
                    colorStart={conn.colorStart}
                    colorEnd={conn.colorEnd}
                    thickness={0.02 + conn.strength * 0.02}
                    flowSpeed={0.3 + conn.strength * 0.3}
                    opacity={0.4 + conn.strength * 0.3}
                    curveStrength={0.6 + Math.random() * 0.4}
                />
            ))}

            {/* Dynamic event effects */}
            {activeEffects.map((effect) => {
                switch (effect.type) {
                    case 'merge':
                        return <MergePulse key={effect.id} position={effect.position} color={effect.color} />;
                    case 'surge':
                        return <SurgeEffect key={effect.id} position={effect.position} color={effect.color} />;
                    case 'split':
                        return <SplitEffect key={effect.id} position={effect.position} color={effect.color} />;
                    default:
                        return null;
                }
            })}

            {/* Ambient particles for atmosphere */}
            <AmbientParticles count={4000} spread={30} color="#4a90d9" />
        </>
    );
}

export function Scene() {
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
            <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={50} />

            <color attach="background" args={['#000000']} />

            {/* Subtle ambient light */}
            <ambientLight intensity={0.1} />

            <Suspense fallback={null}>
                <SceneContent />
            </Suspense>

            {/* Camera controls - constrained for dashboard feel */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                enableRotate={true}
                minDistance={6}
                maxDistance={30}
                maxPolarAngle={Math.PI * 0.75}
                minPolarAngle={Math.PI * 0.25}
                autoRotate
                autoRotateSpeed={0.15}
            />

            {/* Premium postprocessing effects */}
            <EffectComposer>
                <Bloom
                    intensity={1.0}
                    luminanceThreshold={0.1}
                    luminanceSmoothing={0.9}
                    radius={0.9}
                />
                <ChromaticAberration
                    blendFunction={BlendFunction.NORMAL}
                    offset={[0.0012, 0.0012]}
                />
                <Noise
                    blendFunction={BlendFunction.SOFT_LIGHT}
                    opacity={0.1}
                />
                <Vignette
                    offset={0.25}
                    darkness={0.7}
                    blendFunction={BlendFunction.NORMAL}
                />
            </EffectComposer>
        </Canvas>
    );
}
