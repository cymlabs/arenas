'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Html } from '@react-three/drei';
import * as THREE from 'three';

interface EntityLabelProps {
    position: [number, number, number];
    label: string;
    type?: 'topic' | 'influencer';
    score?: string;
    delta?: string;
}

export function EntityLabel({
    position,
    label,
    type = 'topic',
    score,
    delta,
}: EntityLabelProps) {
    const groupRef = useRef<THREE.Group>(null);

    // Make label always face camera with slight bob
    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.position.y = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
        }
    });

    const bgColor = type === 'topic'
        ? 'rgba(59, 130, 246, 0.15)'
        : 'rgba(249, 115, 22, 0.15)';

    const borderColor = type === 'topic'
        ? 'rgba(59, 130, 246, 0.3)'
        : 'rgba(249, 115, 22, 0.3)';

    return (
        <group ref={groupRef} position={position}>
            <Html
                center
                distanceFactor={10}
                style={{
                    transition: 'all 0.2s',
                    opacity: 1,
                    transform: 'scale(1)',
                    pointerEvents: 'none',
                }}
            >
                <div
                    className="px-3 py-1.5 rounded-lg whitespace-nowrap"
                    style={{
                        background: bgColor,
                        backdropFilter: 'blur(8px)',
                        border: `1px solid ${borderColor}`,
                        boxShadow: type === 'topic'
                            ? '0 0 20px rgba(59, 130, 246, 0.2)'
                            : '0 0 20px rgba(249, 115, 22, 0.2)',
                    }}
                >
                    <div className="flex items-center gap-2">
                        <span
                            className="text-xs font-medium"
                            style={{ color: type === 'topic' ? '#93c5fd' : '#fdba74' }}
                        >
                            {label}
                        </span>
                        {score && (
                            <span className="text-[10px] text-white/50 font-mono">
                                {score}
                            </span>
                        )}
                        {delta && (
                            <span className={`text-[10px] font-mono ${delta.startsWith('+') ? 'text-green-400' : 'text-red-400'
                                }`}>
                                {delta}
                            </span>
                        )}
                    </div>
                </div>
            </Html>
        </group>
    );
}

interface EntityLabelsProps {
    entities: Array<{
        id: string;
        position: [number, number, number];
        label: string;
        type?: 'topic' | 'influencer';
        score?: string;
        delta?: string;
    }>;
    visible?: boolean;
}

export function EntityLabels({ entities, visible = true }: EntityLabelsProps) {
    if (!visible) return null;

    return (
        <>
            {entities.map((entity) => (
                <EntityLabel
                    key={entity.id}
                    position={[
                        entity.position[0],
                        entity.position[1] + 1.2 + (entity.type === 'topic' ? 0.8 : 0.3),
                        entity.position[2],
                    ]}
                    label={entity.label}
                    type={entity.type}
                    score={entity.score}
                    delta={entity.delta}
                />
            ))}
        </>
    );
}
