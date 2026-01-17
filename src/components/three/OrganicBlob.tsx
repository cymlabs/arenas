'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { blobVertexShader, blobFragmentShader } from '@/shaders/blobShaders';

interface OrganicBlobProps {
    position?: [number, number, number];
    size?: number;
    intensity?: number; // 0-1, affects color temperature
    noiseScale?: number;
    noiseStrength?: number;
    pulseSpeed?: number;
    colorCold?: string;
    colorWarm?: string;
    colorHot?: string;
}

export function OrganicBlob({
    position = [0, 0, 0],
    size = 2,
    intensity = 0.5,
    noiseScale = 1.5,
    noiseStrength = 0.4,
    pulseSpeed = 0.8,
    colorCold = '#3b82f6',
    colorWarm = '#f8fafc',
    colorHot = '#f97316',
}: OrganicBlobProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uNoiseScale: { value: noiseScale },
        uNoiseStrength: { value: noiseStrength },
        uPulseSpeed: { value: pulseSpeed },
        uColorCold: { value: new THREE.Color(colorCold) },
        uColorWarm: { value: new THREE.Color(colorWarm) },
        uColorHot: { value: new THREE.Color(colorHot) },
        uIntensity: { value: intensity },
        uGlowStrength: { value: 0.6 },
    }), [noiseScale, noiseStrength, pulseSpeed, colorCold, colorWarm, colorHot, intensity]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} position={position}>
            <icosahedronGeometry args={[size, 64]} />
            <shaderMaterial
                vertexShader={blobVertexShader}
                fragmentShader={blobFragmentShader}
                uniforms={uniforms}
                transparent
                side={THREE.DoubleSide}
            />
        </mesh>
    );
}
