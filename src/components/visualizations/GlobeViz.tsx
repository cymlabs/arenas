'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useStanceStore } from '@/lib/stanceStore';
// StanceRing import removed as we use native DOM elements for performance
// Voice import removed

// Dynamically import Globe to avoid SSR issues
const Globe = dynamic(() => import('react-globe.gl'), { ssr: false });

interface GlobeMarker {
    id: string;
    lat: number;
    lng: number;
    label?: string;
    size?: number;
    color?: string;
    onClick?: () => void;
}

interface GlobeVizProps {
    width?: number;
    height?: number;
    onVoiceClick?: (voiceId: string) => void;
    markers?: GlobeMarker[];
}

interface VoiceLocation {
    voiceId: string;
    lat: number;
    lng: number;
    city: string;
    country: string;
}

// Deterministic location generator based on voice ID hash
// Maps voices to major world cities for demo purposes
const MAJOR_CITIES = [
    { city: 'New York', lat: 40.7128, lng: -74.0060, country: 'USA' },
    { city: 'Los Angeles', lat: 34.0522, lng: -118.2437, country: 'USA' },
    { city: 'London', lat: 51.5074, lng: -0.1278, country: 'UK' },
    { city: 'Austin', lat: 30.2672, lng: -97.7431, country: 'USA' },
    { city: 'Miami', lat: 25.7617, lng: -80.1918, country: 'USA' },
    { city: 'Toronto', lat: 43.6532, lng: -79.3832, country: 'Canada' },
    { city: 'Berlin', lat: 52.5200, lng: 13.4050, country: 'Germany' },
    { city: 'San Francisco', lat: 37.7749, lng: -122.4194, country: 'USA' },
    { city: 'Chicago', lat: 41.8781, lng: -87.6298, country: 'USA' },
    { city: 'Washington DC', lat: 38.9072, lng: -77.0369, country: 'USA' },
    { city: 'Sydney', lat: -33.8688, lng: 151.2093, country: 'Australia' },
    { city: 'Tokyo', lat: 35.6762, lng: 139.6503, country: 'Japan' },
    { city: 'Paris', lat: 48.8566, lng: 2.3522, country: 'France' },
    { city: 'Dubai', lat: 25.2048, lng: 55.2708, country: 'UAE' },
    { city: 'Singapore', lat: 1.3521, lng: 103.8198, country: 'Singapore' },
    { city: 'Sao Paulo', lat: -23.5505, lng: -46.6333, country: 'Brazil' },
    { city: 'Stockholm', lat: 59.3293, lng: 18.0686, country: 'Sweden' },
    { city: 'Tel Aviv', lat: 32.0853, lng: 34.7818, country: 'Israel' },
    { city: 'Moscow', lat: 55.7558, lng: 37.6173, country: 'Russia' },
    { city: 'Nashville', lat: 36.1627, lng: -86.7816, country: 'USA' },
];

function getVoiceLocation(voiceId: string): VoiceLocation {
    // Simple hash function
    let hash = 0;
    for (let i = 0; i < voiceId.length; i++) {
        hash = voiceId.charCodeAt(i) + ((hash << 5) - hash);
    }
    const index = Math.abs(hash) % MAJOR_CITIES.length;
    const city = MAJOR_CITIES[index];

    // Add small random jitter so distinct voices in same city don't overlap perfectly
    const jitter = 0.5; // degrees
    // Use second hash pass for jitter
    const jLat = ((Math.abs(hash * 31) % 100) / 100 - 0.5) * jitter;
    const jLng = ((Math.abs(hash * 17) % 100) / 100 - 0.5) * jitter;

    return {
        voiceId,
        lat: city.lat + jLat,
        lng: city.lng + jLng,
        city: city.city,
        country: city.country
    };
}

export default function GlobeViz({
    width = 800,
    height = 600,
    onVoiceClick,
    markers: externalMarkers,
}: GlobeVizProps) {
    // Use any for Globe ref as types are complex to match exactly with dynamic import
    const globeEl = useRef<any>(null);
    const { voices, getStanceRingData } = useStanceStore();
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);

        // Auto-rotate
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true;
            globeEl.current.controls().autoRotateSpeed = 0.5;
            globeEl.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
        }
    }, []);

    // Prepare data for the globe
    const globeData = useMemo(() => {
        // If external markers are provided, use them directly
        if (externalMarkers && externalMarkers.length > 0) {
            return externalMarkers.map(m => ({
                id: m.id,
                name: m.label || '',
                lat: m.lat,
                lng: m.lng,
                size: m.size || 15,
                color: m.color || '#3b82f6',
                ringData: null, // Indicate this is not a voice marker
                onClick: m.onClick
            }));
        }

        // Otherwise use default Stance Store data
        return voices.map(voice => {
            const loc = getVoiceLocation(voice.voice_id);
            const ringData = getStanceRingData(voice.voice_id);

            return {
                id: voice.voice_id,
                name: voice.display_name,
                lat: loc.lat,
                lng: loc.lng,
                city: loc.city,
                avatar: voice.avatar_url,
                ringData,
                size: ringData ? 15 + (ringData.confidence * 20) : 15,
                color: ringData ? (ringData.stance > 0.3 ? '#22c55e' : ringData.stance < -0.3 ? '#ef4444' : '#9ca3af') : '#6b7280',
                onClick: () => onVoiceClick?.(voice.voice_id)
            };
        });
    }, [voices, getStanceRingData, externalMarkers, onVoiceClick]);

    if (!mounted) return <div style={{ width, height }} className="bg-black/90 flex items-center justify-center text-white/50">Loading Globe...</div>;

    return (
        <div className="relative rounded-2xl overflow-hidden border border-white/[0.08] shadow-2xl bg-black">
            <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur border border-white/10 text-xs text-white/70">
                    <span className="font-bold text-white">LIVE</span> STANCE MONITOR
                </div>
            </div>

            <Globe
                ref={globeEl}
                width={width}
                height={height}
                backgroundColor="#050508"
                // Globe appearance
                globeImageUrl="//unpkg.com/three-globe/example/img/earth-night.jpg"
                bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                atmosphereColor="#3b82f6"
                atmosphereAltitude={0.15}

                // HTML Elements (Stance Rings)
                htmlElementsData={globeData}
                htmlLat="lat"
                htmlLng="lng"
                htmlElement={(d: any) => {
                    const el = document.createElement('div');
                    el.className = 'globe-marker';
                    el.style.cursor = 'pointer';
                    // Need to interact with React component tree from vanilla DOM element
                    // We'll trust the click handler passed via props to the wrapper div below
                    // But here we just render visual structure

                    // Since we can't easily render a React component inside this callback repeatedly without performance cost,
                    // we'll build a lightweight DOM structure that looks like the ring.
                    // Or we can use ReactDOM.render/createRoot, but that's heavy.
                    // Better approach: Let's use simple CSS/DOM for the marker to match StanceRing visual

                    const stance = d.ringData?.stance || 0;
                    const confidence = d.ringData?.confidence || 0.5;
                    const isFlip = d.ringData?.has_recent_flip;

                    // Determine color
                    let color = '#9ca3af'; // neutral
                    if (stance > 0.3) color = '#22c55e'; // for
                    if (stance < -0.3) color = '#ef4444'; // against

                    const size = 30 + (confidence * 20);

                    el.style.width = `${size}px`;
                    el.style.height = `${size}px`;
                    el.style.background = `radial-gradient(circle, ${color}20 0%, transparent 70%)`;
                    el.style.borderRadius = '50%';
                    el.style.display = 'flex';
                    el.style.alignItems = 'center';
                    el.style.justifyContent = 'center';
                    el.style.transform = `translate(-50%, -50%)`;
                    el.style.pointerEvents = 'auto';
                    el.style.pointerEvents = 'auto';
                    el.onclick = () => d.onClick ? d.onClick() : onVoiceClick?.(d.id);

                    // Inner ring
                    const inner = document.createElement('div');
                    inner.style.width = `${size * 0.6}px`;
                    inner.style.height = `${size * 0.6}px`;
                    inner.style.border = `2px solid ${color}`;
                    inner.style.borderRadius = '50%';
                    inner.style.boxShadow = `0 0 10px ${color}40`;
                    inner.style.backgroundColor = `${color}20`;
                    el.appendChild(inner);

                    if (isFlip) {
                        el.style.animation = 'pulse-ring 2s infinite';
                    }

                    // Tooltip label on hover
                    const label = document.createElement('div');
                    label.textContent = d.name;
                    label.style.position = 'absolute';
                    label.style.top = '100%';
                    label.style.left = '50%';
                    label.style.transform = 'translate(-50%, 5px)';
                    label.style.color = 'white';
                    label.style.fontSize = '10px';
                    label.style.whiteSpace = 'nowrap';
                    label.style.background = 'rgba(0,0,0,0.8)';
                    label.style.padding = '2px 6px';
                    label.style.borderRadius = '4px';
                    label.style.pointerEvents = 'none';
                    label.style.opacity = '0';
                    label.style.transition = 'opacity 0.2s';
                    el.appendChild(label);

                    el.onmouseenter = () => { label.style.opacity = '1'; };
                    el.onmouseleave = () => { label.style.opacity = '0'; };

                    return el;
                }}

            // Optional: arcs for connections/mindshare flow?
            // arcsData={...}
            />

            <style jsx global>{`
                @keyframes pulse-ring {
                    0% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0.7); }
                    70% { transform: translate(-50%, -50%) scale(1.1); box-shadow: 0 0 0 10px rgba(255,255,255,0); }
                    100% { transform: translate(-50%, -50%) scale(1); box-shadow: 0 0 0 0 rgba(255,255,255,0); }
                }
            `}</style>
        </div>
    );
}
