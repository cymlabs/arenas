'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { THEME, NODES } from './data';

const GRID_WIDTH = 50;
const GRID_DEPTH = 30;
const SPACING = 1.8;
const HEX_COUNT = Math.floor((GRID_WIDTH / SPACING) * (GRID_DEPTH / SPACING));

export function HexFloor() {
    const meshRef = useRef<THREE.InstancedMesh>(null);
    const dummy = useMemo(() => new THREE.Object3D(), []);

    // Calculate grid positions strictly once
    const hexData = useMemo(() => {
        const data = [];
        for (let x = -GRID_WIDTH / 2; x < GRID_WIDTH / 2; x += SPACING) {
            for (let z = -GRID_DEPTH / 2; z < GRID_DEPTH / 2; z += SPACING * 0.9) {
                const xOffset = (Math.floor(z / (SPACING * 0.9)) % 2) * (SPACING / 2);
                data.push({
                    x: x + xOffset,
                    z,
                    baseH: 0.2 + Math.random() * 0.5
                });
            }
        }
        return data;
    }, []);

    useFrame(({ clock }) => {
        if (!meshRef.current) return;

        const time = clock.getElapsedTime();
        const tempColor = new THREE.Color();
        const baseColor = new THREE.Color(THEME.floorBase);
        const highColor = new THREE.Color(THEME.floorHigh);

        hexData.forEach((data, i) => {
            let influence = 0;

            // Calculate influence from nodes
            Object.values(NODES).forEach(node => {
                const dx = data.x - node.x;
                const dz = data.z - 0; // Nodes at z=0
                const dist = Math.sqrt(dx * dx + dz * dz);

                if (dist < 10) {
                    const factor = Math.exp(-(dist * dist) / 20);
                    influence += factor * node.value;
                }
            });

            // Height
            const wave = Math.sin(data.x * 0.1 + time) * Math.cos(data.z * 0.1 + time) * 0.5;
            const targetHeight = Math.max(0.1, data.baseH + (influence * 0.8) + Math.max(0, wave));

            dummy.position.set(data.x, -15, data.z);
            dummy.scale.set(1, targetHeight, 1);
            dummy.updateMatrix();
            meshRef.current!.setMatrixAt(i, dummy.matrix);

            // Color
            if (influence > 2) {
                tempColor.copy(highColor);
                tempColor.lerp(baseColor, 1 - (influence / 10));
            } else {
                tempColor.copy(baseColor);
                if (data.baseH > 0.6) tempColor.offsetHSL(0, 0, 0.05);
            }
            meshRef.current!.setColorAt(i, tempColor);
        });

        meshRef.current.instanceMatrix.needsUpdate = true;
        if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
    });

    return (
        <instancedMesh ref={meshRef} args={[undefined, undefined, hexData.length]}>
            <cylinderGeometry args={[0.8, 0.8, 1, 6]} />
            <meshPhysicalMaterial
                color={THEME.floorBase}
                metalness={0.6}
                roughness={0.2}
                transparent
                opacity={0.8}
            />
        </instancedMesh>
    );
}
