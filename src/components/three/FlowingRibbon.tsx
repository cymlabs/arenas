'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ribbonVertexShader, ribbonFragmentShader } from '@/shaders/effectShaders';

interface FlowingRibbonProps {
    start: [number, number, number];
    end: [number, number, number];
    colorStart?: string;
    colorEnd?: string;
    thickness?: number;
    flowSpeed?: number;
    opacity?: number;
    curveStrength?: number;
}

export function FlowingRibbon({
    start,
    end,
    colorStart = '#3b82f6',
    colorEnd = '#f97316',
    thickness = 0.03,
    flowSpeed = 0.5,
    opacity = 0.7,
    curveStrength = 1,
}: FlowingRibbonProps) {
    const meshRef = useRef<THREE.Mesh>(null);

    const { geometry, uniforms } = useMemo(() => {
        const startVec = new THREE.Vector3(...start);
        const endVec = new THREE.Vector3(...end);

        // Calculate midpoint with perpendicular offset for curve
        const midpoint = new THREE.Vector3().addVectors(startVec, endVec).multiplyScalar(0.5);
        const direction = new THREE.Vector3().subVectors(endVec, startVec);
        const length = direction.length();

        // Create perpendicular vector for curve
        const up = new THREE.Vector3(0, 1, 0);
        const perpendicular = new THREE.Vector3().crossVectors(direction.normalize(), up).normalize();

        // Add some vertical offset too
        const curveOffset = perpendicular.multiplyScalar(length * 0.2 * curveStrength);
        curveOffset.y += length * 0.15 * curveStrength;

        // Control points for smooth curve
        const control1 = new THREE.Vector3().addVectors(
            startVec,
            direction.clone().multiplyScalar(0.25)
        ).add(curveOffset.clone().multiplyScalar(0.5));

        const control2 = new THREE.Vector3().addVectors(
            startVec,
            direction.clone().multiplyScalar(0.75)
        ).add(curveOffset);

        // Create curve
        const curve = new THREE.CubicBezierCurve3(startVec, control1, control2, endVec);

        // Create tube geometry
        const geometry = new THREE.TubeGeometry(curve, 64, thickness, 8, false);

        const uniforms = {
            uTime: { value: 0 },
            uFlowSpeed: { value: flowSpeed },
            uColorStart: { value: new THREE.Color(colorStart) },
            uColorEnd: { value: new THREE.Color(colorEnd) },
            uOpacity: { value: opacity },
            uGlowIntensity: { value: 1.0 },
            uThickness: { value: thickness },
        };

        return { geometry, uniforms };
    }, [start, end, colorStart, colorEnd, thickness, flowSpeed, opacity, curveStrength]);

    useFrame((state) => {
        if (meshRef.current) {
            const material = meshRef.current.material as THREE.ShaderMaterial;
            material.uniforms.uTime.value = state.clock.elapsedTime;
        }
    });

    return (
        <mesh ref={meshRef} geometry={geometry}>
            <shaderMaterial
                vertexShader={ribbonVertexShader}
                fragmentShader={ribbonFragmentShader}
                uniforms={uniforms}
                transparent
                depthWrite={false}
                side={THREE.DoubleSide}
                blending={THREE.AdditiveBlending}
            />
        </mesh>
    );
}
