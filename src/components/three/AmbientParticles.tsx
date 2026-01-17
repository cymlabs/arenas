'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { particleVertexShader, particleFragmentShader } from '@/shaders/blobShaders';

interface AmbientParticlesProps {
    count?: number;
    spread?: number;
    color?: string;
}

export function AmbientParticles({
    count = 2000,
    spread = 30,
    color = '#4a90d9',
}: AmbientParticlesProps) {
    const pointsRef = useRef<THREE.Points>(null);

    const { positions, scales, randomness } = useMemo(() => {
        const positions = new Float32Array(count * 3);
        const scales = new Float32Array(count);
        const randomness = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            const i3 = i * 3;

            // Distribute in a sphere
            const radius = spread * Math.cbrt(Math.random());
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.acos(2 * Math.random() - 1);

            positions[i3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i3 + 2] = radius * Math.cos(phi);

            scales[i] = Math.random() * 3 + 1;
            randomness[i] = Math.random();
        }

        return { positions, scales, randomness };
    }, [count, spread]);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uPixelRatio: { value: Math.min(window.devicePixelRatio, 2) },
        uColor: { value: new THREE.Color(color) },
    }), [color]);

    useFrame((state) => {
        if (pointsRef.current) {
            const material = pointsRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-aScale"
                    args={[scales, 1]}
                />
                <bufferAttribute
                    attach="attributes-aRandomness"
                    args={[randomness, 1]}
                />
            </bufferGeometry>
            <shaderMaterial
                vertexShader={particleVertexShader}
                fragmentShader={particleFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                blending={THREE.AdditiveBlending}
            />
        </points>
    );
}
