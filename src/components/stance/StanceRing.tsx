'use client';

/**
 * StanceRing - Visual indicator for voice stance on map beads
 * 
 * Features:
 * - Ring color: red (against) → gray (neutral) → green (for)
 * - Ring thickness: confidence level
 * - Shock ring animation on recent flip
 */

import React from 'react';
import { stanceToColor, confidenceToThickness, StanceRingData } from '@/types/stance';

interface StanceRingProps {
    data: StanceRingData | null;
    size?: number;
    animated?: boolean;
}

export default function StanceRing({
    data,
    size = 48,
    animated = true,
}: StanceRingProps) {
    if (!data) {
        return (
            <svg width={size} height={size} className="stance-ring stance-ring--empty">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={size / 2 - 4}
                    fill="none"
                    stroke="rgba(255,255,255,0.1)"
                    strokeWidth={2}
                />
            </svg>
        );
    }

    const ringColor = stanceToColor(data.stance);
    const ringThickness = confidenceToThickness(data.confidence);
    const innerRadius = size / 2 - ringThickness - 2;
    const outerRadius = size / 2 - 2;

    return (
        <svg width={size} height={size} className="stance-ring">
            <defs>
                {/* Gradient for ring */}
                <linearGradient id={`ring-gradient-${data.voice_id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor={ringColor} stopOpacity="1" />
                    <stop offset="100%" stopColor={ringColor} stopOpacity="0.7" />
                </linearGradient>

                {/* Glow filter */}
                <filter id={`glow-${data.voice_id}`} x="-50%" y="-50%" width="200%" height="200%">
                    <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                    <feMerge>
                        <feMergeNode in="coloredBlur" />
                        <feMergeNode in="SourceGraphic" />
                    </feMerge>
                </filter>
            </defs>

            {/* Main ring */}
            <circle
                cx={size / 2}
                cy={size / 2}
                r={(innerRadius + outerRadius) / 2}
                fill="none"
                stroke={`url(#ring-gradient-${data.voice_id})`}
                strokeWidth={ringThickness}
                filter={data.has_recent_flip ? `url(#glow-${data.voice_id})` : undefined}
            />

            {/* Shock ring for recent flips */}
            {data.has_recent_flip && animated && (
                <>
                    <circle
                        className="shock-ring"
                        cx={size / 2}
                        cy={size / 2}
                        r={outerRadius}
                        fill="none"
                        stroke={data.flip_direction === 'positive' ? '#22c55e' : '#ef4444'}
                        strokeWidth={2}
                    />
                    <circle
                        className="shock-ring shock-ring--delayed"
                        cx={size / 2}
                        cy={size / 2}
                        r={outerRadius}
                        fill="none"
                        stroke={data.flip_direction === 'positive' ? '#22c55e' : '#ef4444'}
                        strokeWidth={1}
                    />
                </>
            )}

            {/* Flip indicator dot */}
            {data.has_recent_flip && (
                <circle
                    cx={size / 2 + outerRadius * 0.7}
                    cy={size / 2 - outerRadius * 0.7}
                    r={6}
                    fill={data.flip_direction === 'positive' ? '#22c55e' : '#ef4444'}
                    stroke="#fff"
                    strokeWidth={1.5}
                />
            )}

            <style jsx>{`
                .stance-ring {
                    overflow: visible;
                }

                .shock-ring {
                    opacity: 0;
                    animation: shock-pulse 2s ease-out infinite;
                }

                .shock-ring--delayed {
                    animation-delay: 0.5s;
                }

                @keyframes shock-pulse {
                    0% {
                        opacity: 0.8;
                        r: ${outerRadius}px;
                        stroke-width: 3px;
                    }
                    100% {
                        opacity: 0;
                        r: ${outerRadius + 20}px;
                        stroke-width: 0px;
                    }
                }
            `}</style>
        </svg>
    );
}

/**
 * StanceRingOverlay - Overlay stance rings on existing voice beads
 * Use this to wrap around existing bead components
 */
interface StanceRingOverlayProps {
    data: StanceRingData | null;
    children: React.ReactNode;
    size?: number;
}

export function StanceRingOverlay({
    data,
    children,
    size = 64,
}: StanceRingOverlayProps) {
    return (
        <div className="stance-ring-overlay" style={{ width: size, height: size }}>
            <div className="stance-ring-overlay__ring">
                <StanceRing data={data} size={size} />
            </div>
            <div className="stance-ring-overlay__content">
                {children}
            </div>

            <style jsx>{`
                .stance-ring-overlay {
                    position: relative;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }

                .stance-ring-overlay__ring {
                    position: absolute;
                    inset: 0;
                    pointer-events: none;
                }

                .stance-ring-overlay__content {
                    position: relative;
                    width: ${size - 16}px;
                    height: ${size - 16}px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
            `}</style>
        </div>
    );
}
