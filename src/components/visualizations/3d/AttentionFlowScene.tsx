'use client';

import { useState, useMemo } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import { HexFloor } from './HexFloor';
import { FlowNodes } from './FlowNodes';
import { FlowParticles } from './FlowParticles';
import { NODES as DEFAULT_NODES, FLOWS as DEFAULT_FLOWS, NodeData } from './data';
import { AnimatePresence, motion } from 'framer-motion';

interface Props {
    nodes?: Record<string, NodeData>;
    flows?: Array<{ from: string; to: string; weight: number }>;
}

export default function AttentionFlowScene({ nodes = DEFAULT_NODES, flows = DEFAULT_FLOWS }: Props) {
    const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

    // Logic to determine dimmed state in children
    // We can pass `relatedIds` down or just let particles handle their own opacity
    // Nodes can check if they are related to `hoveredNodeId` via flows
    const relatedNodeIds = useMemo(() => {
        if (!hoveredNodeId) return new Set<string>();
        const related = new Set<string>([hoveredNodeId]);
        flows.forEach(f => {
            if (f.from === hoveredNodeId) related.add(f.to);
            if (f.to === hoveredNodeId) related.add(f.from);
        });
        return related;
    }, [hoveredNodeId, flows]);

    const hoveredData = hoveredNodeId ? nodes[hoveredNodeId] : null;

    return (
        <div className="w-full h-full relative bg-slate-950 rounded-xl overflow-hidden border border-white/5">
            <Canvas
                camera={{ position: [0, 10, 55], fov: 40 }}
                dpr={[1, 2]}
            >
                <color attach="background" args={['#020617']} />
                <fog attach="fog" args={['#020617', 20, 100]} />

                <ambientLight intensity={0.5} />
                <directionalLight position={[10, 20, 10]} intensity={0.5} />

                <OrbitControls
                    enableDamping
                    maxDistance={80}
                    minDistance={20}
                    maxPolarAngle={Math.PI / 2 - 0.1}
                />

                <group position={[0, 5, 0]}>
                    <FlowNodes nodes={nodes} flows={flows} hoveredNodeId={hoveredNodeId} setHoveredNodeId={setHoveredNodeId} />
                    <FlowParticles nodes={nodes} flows={flows} hoveredNodeId={hoveredNodeId} />
                </group>

                <HexFloor />

                <EffectComposer>
                    <Bloom luminanceThreshold={0.1} luminanceSmoothing={0.9} height={300} intensity={1.2} radius={0.5} />
                </EffectComposer>
            </Canvas>

            {/* Info Panel Overlay */}
            <AnimatePresence>
                {hoveredData && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, x: 20 }}
                        animate={{ opacity: 1, y: 0, x: 0 }}
                        exit={{ opacity: 0, y: 20, x: 20 }}
                        className="absolute bottom-6 right-6 w-72 bg-slate-900/90 backdrop-blur-md p-6 rounded-xl border-l-4 border-cyan-400 text-white shadow-2xl z-10"
                    >
                        <h3 className="text-lg font-bold mb-2">{hoveredData.label}</h3>
                        <p className="text-white/70 text-sm mb-4 leading-relaxed">{hoveredData.desc}</p>

                        <div className="flex justify-between items-center text-xs border-t border-white/10 pt-3 text-white/50">
                            <span>Economic Impact</span>
                            <span className="text-cyan-400 font-bold text-base">
                                {hoveredData.value > 7 ? 'Critical' : hoveredData.value > 4 ? 'Moderate' : 'Low'}
                                <span className="text-white/40 ml-1 font-normal">({hoveredData.value}/10)</span>
                            </span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header Overlay */}
            <div className="absolute top-6 left-6 max-w-xs pointer-events-none">
                <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-400 mb-2">
                    Attention Economy
                </h1>
                <p className="text-white/50 text-xs">
                    Hover nodes to isolate flows. Floor topography represents economic value extracted.
                </p>
            </div>

        </div>
    );
}
