import { create } from 'zustand';

// Entity types
export interface Entity {
    id: string;
    type: 'topic' | 'influencer' | 'event';
    label: string;
    position: [number, number, number];
    size: number;
    intensity: number;
    velocity: number;
    colorCold: string;
    colorWarm: string;
    colorHot: string;
    mentions?: number;
    delta?: string;
}

export interface Connection {
    id: string;
    from: string;
    to: string;
    strength: number;
    colorStart: string;
    colorEnd: string;
}

export interface Event {
    id: string;
    type: 'merge' | 'surge' | 'split' | 'emergence';
    position: [number, number, number];
    color: string;
    timestamp: number;
    description: string;
    entities: string[];
}

interface VisualizationState {
    // Data
    entities: Entity[];
    connections: Connection[];
    events: Event[];

    // UI State
    selectedEntityId: string | null;
    hoveredEntityId: string | null;
    timeRange: '1h' | '6h' | '12h' | '24h' | '7d';
    playbackPosition: number; // 0-1
    isPlaying: boolean;
    showLabels: boolean;

    // Filters
    platformFilters: Set<string>;

    // Actions
    setSelectedEntity: (id: string | null) => void;
    setHoveredEntity: (id: string | null) => void;
    setTimeRange: (range: '1h' | '6h' | '12h' | '24h' | '7d') => void;
    setPlaybackPosition: (position: number) => void;
    togglePlayback: () => void;
    toggleLabels: () => void;
    togglePlatformFilter: (platform: string) => void;

    // Data mutations
    addEvent: (event: Event) => void;
    updateEntityPosition: (id: string, position: [number, number, number]) => void;
}

// Demo data
const demoEntities: Entity[] = [
    { id: 'immigration', type: 'topic', label: 'Immigration', position: [0, 0, 0], size: 2, intensity: 0.7, velocity: 0.15, colorCold: '#3b82f6', colorWarm: '#f8fafc', colorHot: '#f97316', mentions: 125000, delta: '+36%' },
    { id: 'candace', type: 'influencer', label: 'Candace Owens', position: [-3.5, 1.5, -2], size: 0.9, intensity: 0.85, velocity: 0.23, colorCold: '#f97316', colorWarm: '#fbbf24', colorHot: '#ef4444', mentions: 212000, delta: '+14.8%' },
    { id: 'nick', type: 'influencer', label: 'Nick Fuentes', position: [3, -1, -1.5], size: 0.7, intensity: 0.6, velocity: 0.18, colorCold: '#8b5cf6', colorWarm: '#ec4899', colorHot: '#ef4444', mentions: 180000, delta: '+23.2%' },
    { id: 'censorship', type: 'topic', label: 'Censorship', position: [2, 2.5, -3], size: 1.2, intensity: 0.55, velocity: 0.12, colorCold: '#10b981', colorWarm: '#06b6d4', colorHot: '#3b82f6', mentions: 98000, delta: '+35%' },
    { id: 'charlie', type: 'influencer', label: 'Charlie Kirk', position: [-2.5, -2, -1], size: 0.65, intensity: 0.5, velocity: 0.11, colorCold: '#f59e0b', colorWarm: '#ef4444', colorHot: '#dc2626', mentions: 145000, delta: '+11.5%' },
    { id: 'ukraine', type: 'topic', label: 'Ukraine Aid', position: [4, 1, -2.5], size: 1.0, intensity: 0.45, velocity: 0.08, colorCold: '#06b6d4', colorWarm: '#3b82f6', colorHot: '#8b5cf6', mentions: 88000, delta: '+33%' },
    { id: 'alex', type: 'influencer', label: 'Alex Jones', position: [-1.5, 3, -2], size: 0.6, intensity: 0.7, velocity: 0.2, colorCold: '#22c55e', colorWarm: '#f97316', colorHot: '#ef4444', mentions: 122000, delta: '+8.7%' },
];

const demoConnections: Connection[] = [
    { id: 'c1', from: 'immigration', to: 'candace', strength: 0.8, colorStart: '#3b82f6', colorEnd: '#f97316' },
    { id: 'c2', from: 'immigration', to: 'nick', strength: 0.6, colorStart: '#3b82f6', colorEnd: '#8b5cf6' },
    { id: 'c3', from: 'immigration', to: 'charlie', strength: 0.7, colorStart: '#3b82f6', colorEnd: '#f59e0b' },
    { id: 'c4', from: 'censorship', to: 'nick', strength: 0.9, colorStart: '#10b981', colorEnd: '#8b5cf6' },
    { id: 'c5', from: 'censorship', to: 'alex', strength: 0.5, colorStart: '#10b981', colorEnd: '#22c55e' },
    { id: 'c6', from: 'candace', to: 'charlie', strength: 0.6, colorStart: '#f97316', colorEnd: '#f59e0b' },
    { id: 'c7', from: 'ukraine', to: 'candace', strength: 0.4, colorStart: '#06b6d4', colorEnd: '#f97316' },
];

export const useVisualizationStore = create<VisualizationState>((set) => ({
    // Initial data
    entities: demoEntities,
    connections: demoConnections,
    events: [],

    // Initial UI state
    selectedEntityId: null,
    hoveredEntityId: null,
    timeRange: '24h',
    playbackPosition: 1,
    isPlaying: false,
    showLabels: true,
    platformFilters: new Set(['all']),

    // Actions
    setSelectedEntity: (id) => set({ selectedEntityId: id }),
    setHoveredEntity: (id) => set({ hoveredEntityId: id }),
    setTimeRange: (range) => set({ timeRange: range }),
    setPlaybackPosition: (position) => set({ playbackPosition: position }),
    togglePlayback: () => set((state) => ({ isPlaying: !state.isPlaying })),
    toggleLabels: () => set((state) => ({ showLabels: !state.showLabels })),
    togglePlatformFilter: (platform) => set((state) => {
        const newFilters = new Set(state.platformFilters);
        if (platform === 'all') {
            return { platformFilters: new Set(['all']) };
        }
        newFilters.delete('all');
        if (newFilters.has(platform)) {
            newFilters.delete(platform);
            if (newFilters.size === 0) {
                newFilters.add('all');
            }
        } else {
            newFilters.add(platform);
        }
        return { platformFilters: newFilters };
    }),

    addEvent: (event) => set((state) => ({
        events: [...state.events.slice(-50), event], // Keep last 50 events
    })),

    updateEntityPosition: (id, position) => set((state) => ({
        entities: state.entities.map((e) =>
            e.id === id ? { ...e, position } : e
        ),
    })),
}));
