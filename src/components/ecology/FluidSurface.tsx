'use client';

import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { fluidSurfaceVertexShader, fluidSurfaceFragmentShader } from '@/shaders/fluidShaders';

interface FluidSurfaceProps {
    turbulence?: number;
}

export function FluidSurface({ turbulence = 1.0 }: FluidSurfaceProps) {
    const meshRef = useRef<THREE.Mesh>(null);
    const { viewport } = useThree();

    const uniforms = useMemo(() => ({
        uTime: { value: 0 },
        uResolution: { value: new THREE.Vector2(viewport.width, viewport.height) },
        uTurbulence: { value: turbulence },
        uFlowMap: { value: null },
    }), [viewport.width, viewport.height, turbulence]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} position={[0, 0, -0.1]} rotation={[0, 0, 0]}>
            <planeGeometry args={[viewport.width * 1.5, viewport.height * 1.5, 1, 1]} />
            <shaderMaterial
                vertexShader={fluidSurfaceVertexShader}
                fragmentShader={fluidSurfaceFragmentShader}
                uniforms={uniforms}
                transparent={false}
            />
        </mesh>
    );
}
