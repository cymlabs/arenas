'use client';

import { useRef, useState, useMemo, Suspense, useEffect } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Stars, Html, Line } from '@react-three/drei';
import * as THREE from 'three';
import { ExpandIcon, CollapseIcon } from '@/components/ui/Icons';

export interface GlobePoint {
    id: string;
    label: string;
    lat: number;
    lng: number;
    value: number;
    category?: string;
    description?: string;
    trend?: 'up' | 'down' | 'stable';
}

interface HolographicGlobeProps {
    points: GlobePoint[];
    height?: number;
    expanded?: boolean;
    onExpand?: () => void;
    onPointClick?: (point: GlobePoint) => void;
    autoRotate?: boolean;
    className?: string;
}

// Convert lat/lng to 3D position on sphere
function latLngToVector3(lat: number, lng: number, radius: number): THREE.Vector3 {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);

    const x = -radius * Math.sin(phi) * Math.cos(theta);
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);

    return new THREE.Vector3(x, y, z);
}

// Holographic sphere with static/relief effect
function HolographicSphere() {
    const meshRef = useRef<THREE.Mesh>(null);
    const noiseRef = useRef<THREE.Mesh>(null);

    useFrame((state) => {
        if (meshRef.current) {
            meshRef.current.rotation.y = state.clock.elapsedTime * 0.015;
        }
        // Animate noise
        if (noiseRef.current && noiseRef.current.material instanceof THREE.ShaderMaterial) {
            noiseRef.current.material.uniforms.time.value = state.clock.elapsedTime;
        }
    });

    return (
        <group>
            {/* Static noise shell */}
            <mesh ref={noiseRef}>
                <sphereGeometry args={[2.01, 64, 64]} />
                <shaderMaterial
                    transparent
                    uniforms={{
                        time: { value: 0 },
                    }}
                    vertexShader={`
                        varying vec2 vUv;
                        varying vec3 vNormal;
                        void main() {
                            vUv = uv;
                            vNormal = normal;
                            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
                        }
                    `}
                    fragmentShader={`
                        uniform float time;
                        varying vec2 vUv;
                        varying vec3 vNormal;
                        
                        // Noise function
                        float random(vec2 st) {
                            return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
                        }
                        
                        void main() {
                            // TV static effect
                            float noise = random(vUv * 100.0 + time * 10.0);
                            float staticNoise = step(0.97, noise) * 0.3;
                            
                            // Scanlines
                            float scanline = sin(vUv.y * 800.0) * 0.03;
                            
                            // Edge glow (relief effect)
                            float edge = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 2.0);
                            
                            float intensity = staticNoise + scanline + edge * 0.15;
                            gl_FragColor = vec4(vec3(intensity), intensity * 0.5);
                        }
                    `}
                />
            </mesh>

            {/* Main wireframe sphere - white/gray */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[2, 64, 64]} />
                <meshBasicMaterial
                    color="#ffffff"
                    wireframe
                    transparent
                    opacity={0.12}
                />
            </mesh>

            {/* Inner solid for depth */}
            <mesh>
                <sphereGeometry args={[1.98, 32, 32]} />
                <meshBasicMaterial
                    color="#1a1a1a"
                    transparent
                    opacity={0.95}
                />
            </mesh>

            {/* Latitude lines - white */}
            {[-60, -30, 0, 30, 60].map((lat) => (
                <LatitudeLine key={lat} latitude={lat} radius={2.01} />
            ))}

            {/* Longitude lines - every 30 degrees */}
            {Array.from({ length: 12 }, (_, i) => (
                <LongitudeLine key={i} longitude={i * 30} radius={2.01} />
            ))}
        </group>
    );
}

// Latitude circle line - white/gray
function LatitudeLine({ latitude, radius }: { latitude: number; radius: number }) {
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        for (let lng = -180; lng <= 180; lng += 5) {
            pts.push(latLngToVector3(latitude, lng, radius));
        }
        return pts;
    }, [latitude, radius]);

    return (
        <Line
            points={points}
            color="#666666"
            lineWidth={0.5}
            transparent
            opacity={0.3}
        />
    );
}

// Longitude arc line - white/gray
function LongitudeLine({ longitude, radius }: { longitude: number; radius: number }) {
    const points = useMemo(() => {
        const pts: THREE.Vector3[] = [];
        for (let lat = -90; lat <= 90; lat += 5) {
            pts.push(latLngToVector3(lat, longitude, radius));
        }
        return pts;
    }, [longitude, radius]);

    return (
        <Line
            points={points}
            color="#666666"
            lineWidth={0.5}
            transparent
            opacity={0.3}
        />
    );
}

// Data point marker - white with glow
function DataPoint({
    point,
    onClick,
    hovered,
    onHover
}: {
    point: GlobePoint & { position: THREE.Vector3 };
    onClick?: () => void;
    hovered: boolean;
    onHover: (hovered: boolean) => void;
}) {
    const meshRef = useRef<THREE.Mesh>(null);
    const size = Math.min(0.12, Math.max(0.04, Math.log10(point.value + 1) * 0.025));

    useFrame((state) => {
        if (meshRef.current) {
            // Pulsing animation
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2 + point.value) * 0.3;
            meshRef.current.scale.setScalar(hovered ? scale * 1.5 : scale);
        }
    });

    return (
        <group position={point.position}>
            {/* Outer glow ring - white */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <ringGeometry args={[size * 1.8, size * 2.5, 32]} />
                <meshBasicMaterial
                    color="#ffffff"
                    transparent
                    opacity={hovered ? 0.8 : 0.4}
                    side={THREE.DoubleSide}
                />
            </mesh>

            {/* Static noise on point */}
            <mesh>
                <sphereGeometry args={[size * 1.5, 8, 8]} />
                <meshBasicMaterial
                    color="#333333"
                    transparent
                    opacity={0.3}
                />
            </mesh>

            {/* Core sphere - white */}
            <mesh
                ref={meshRef}
                onClick={(e) => {
                    e.stopPropagation();
                    onClick?.();
                }}
                onPointerEnter={(e) => {
                    e.stopPropagation();
                    onHover(true);
                    document.body.style.cursor = 'pointer';
                }}
                onPointerLeave={() => {
                    onHover(false);
                    document.body.style.cursor = 'auto';
                }}
            >
                <sphereGeometry args={[size, 16, 16]} />
                <meshBasicMaterial color="#ffffff" />
            </mesh>

            {/* Tooltip on hover */}
            {hovered && (
                <Html
                    position={[0, size + 0.15, 0]}
                    center
                    style={{ pointerEvents: 'none' }}
                >
                    <div className="px-3 py-2 rounded-lg bg-black/95 border border-white/30 shadow-2xl whitespace-nowrap font-mono">
                        <div className="font-bold text-white text-sm">{point.label}</div>
                        {point.description && (
                            <div className="text-xs text-white/60 mt-1">{point.description}</div>
                        )}
                        <div className="text-xs text-white/40 mt-1">
                            {point.value.toLocaleString()} engagement
                        </div>
                    </div>
                </Html>
            )}
        </group>
    );
}

// Connection arcs between points - white/gray
function ConnectionArcs({ points }: { points: Array<GlobePoint & { position: THREE.Vector3 }> }) {
    const arcs = useMemo(() => {
        const connections: Array<{ start: THREE.Vector3; end: THREE.Vector3 }> = [];

        for (let i = 0; i < Math.min(points.length, 10); i++) {
            for (let j = i + 1; j < Math.min(points.length, 10); j++) {
                const dist = points[i].position.distanceTo(points[j].position);
                if (dist < 2.5) {
                    connections.push({
                        start: points[i].position,
                        end: points[j].position,
                    });
                }
            }
        }
        return connections;
    }, [points]);

    return (
        <>
            {arcs.map((arc, i) => (
                <ArcLine key={i} start={arc.start} end={arc.end} />
            ))}
        </>
    );
}

// Curved arc between two points - white
function ArcLine({ start, end }: { start: THREE.Vector3; end: THREE.Vector3 }) {
    const points = useMemo(() => {
        const midPoint = new THREE.Vector3().addVectors(start, end).multiplyScalar(0.5);
        midPoint.normalize().multiplyScalar(2.8);

        const curve = new THREE.QuadraticBezierCurve3(start, midPoint, end);
        return curve.getPoints(32);
    }, [start, end]);

    return (
        <Line
            points={points}
            color="#ffffff"
            lineWidth={1}
            transparent
            opacity={0.15}
            dashed
            dashSize={0.05}
            gapSize={0.05}
        />
    );
}

// Scene content
function GlobeScene({
    points,
    onPointClick,
    autoRotate
}: {
    points: GlobePoint[];
    onPointClick?: (point: GlobePoint) => void;
    autoRotate: boolean;
}) {
    const [hoveredPoint, setHoveredPoint] = useState<string | null>(null);

    // Convert points to 3D positions
    const pointsWithPositions = useMemo(() =>
        points.map(p => ({
            ...p,
            position: latLngToVector3(p.lat, p.lng, 2.02),
        }))
        , [points]);

    return (
        <>
            {/* Minimal lighting for B&W effect */}
            <ambientLight intensity={0.5} />

            {/* Subtle stars - white/gray */}
            <Stars
                radius={80}
                depth={50}
                count={1500}
                factor={3}
                saturation={0}
                fade
                speed={0.3}
            />

            {/* Globe */}
            <group>
                <HolographicSphere />

                {/* Connection arcs */}
                <ConnectionArcs points={pointsWithPositions} />

                {/* Data points */}
                {pointsWithPositions.map((point) => (
                    <DataPoint
                        key={point.id}
                        point={point}
                        onClick={() => onPointClick?.(point)}
                        hovered={hoveredPoint === point.id}
                        onHover={(h) => setHoveredPoint(h ? point.id : null)}
                    />
                ))}
            </group>

            {/* Controls - closer zoom */}
            <OrbitControls
                enablePan={false}
                enableZoom={true}
                minDistance={2.5}
                maxDistance={6}
                autoRotate={autoRotate}
                autoRotateSpeed={0.3}
            />
        </>
    );
}

// Loading fallback - B&W
function GlobeLoader() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative w-24 h-24">
                <div className="absolute inset-0 rounded-full border border-white/20 animate-ping" />
                <div className="absolute inset-3 rounded-full border border-white/30 animate-pulse" />
                <div className="absolute inset-6 rounded-full border border-white/40" />
                <div className="absolute inset-9 rounded-full bg-white/10" />
            </div>
        </div>
    );
}

// Main component
export function HolographicGlobe({
    points,
    height = 450,
    expanded = false,
    onExpand,
    onPointClick,
    autoRotate = true,
    className = '',
}: HolographicGlobeProps) {
    return (
        <div
            className={`relative overflow-hidden rounded-2xl bg-black border border-white/[0.1] ${className}`}
            style={{ height: expanded ? 650 : height }}
        >
            {/* TV static overlay */}
            <div
                className="absolute inset-0 pointer-events-none z-10 mix-blend-overlay opacity-[0.03]"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
                }}
            />

            {/* Scanlines */}
            <div
                className="absolute inset-0 pointer-events-none z-10 opacity-[0.04]"
                style={{
                    background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.02) 2px, rgba(255,255,255,0.02) 4px)',
                }}
            />

            {/* Vignette */}
            <div
                className="absolute inset-0 pointer-events-none z-10"
                style={{
                    background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
                }}
            />

            {/* Three.js Canvas - closer camera */}
            <Canvas
                camera={{ position: [0, 0, 3.5], fov: 50 }}
                gl={{ antialias: true, alpha: true }}
            >
                <Suspense fallback={null}>
                    <GlobeScene
                        points={points}
                        onPointClick={onPointClick}
                        autoRotate={autoRotate}
                    />
                </Suspense>
            </Canvas>

            {/* Loading overlay */}
            <Suspense fallback={<GlobeLoader />}>
                <div className="hidden" />
            </Suspense>

            {/* Controls overlay - monochrome */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-20">
                <div className="px-3 py-1.5 rounded bg-black/80 border border-white/20 text-xs text-white/60 font-mono">
                    {points.length} nodes
                </div>

                {onExpand && (
                    <button
                        onClick={onExpand}
                        className="p-2 rounded bg-black/80 border border-white/20 text-white/60 hover:text-white hover:border-white/40 transition-all"
                    >
                        {expanded ? <CollapseIcon size={16} /> : <ExpandIcon size={16} />}
                    </button>
                )}
            </div>

            {/* Legend - monochrome */}
            <div className="absolute top-4 left-4 flex flex-col gap-1 z-20">
                <div className="text-[10px] text-white/40 uppercase tracking-widest mb-1 font-mono">Signal</div>
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                    <span className="text-[10px] text-white/50 font-mono">Active Node</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-4 h-px bg-gradient-to-r from-white/0 via-white/50 to-white/0" />
                    <span className="text-[10px] text-white/50 font-mono">Link</span>
                </div>
            </div>
        </div>
    );
}
