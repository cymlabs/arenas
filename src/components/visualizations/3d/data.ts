export const THEME = {
    source: 0x22d3ee,    // Cyan
    platform: 0xd946ef,  // Fuchsia
    outflow: 0xf59e0b,   // Amber
    passive: 0x6366f1,   // Indigo
    active: 0x10b981,    // Emerald
    dim: 0x1e293b,       // Slate 800
    floorBase: 0x0f172a, // Very dark blue/slate
    floorHigh: 0x3b82f6  // Bright Blue
};

export interface NodeData {
    label: string;
    sub: string;
    x: number;
    y: number;
    color: number;
    value: number;
    desc: string;
}

export const NODES: Record<string, NodeData> = {
    // Sources
    'sleep': { label: 'Sleep', sub: '8h / day', x: -18, y: 10, color: THEME.source, value: 0, desc: "Restorative time. Essential for cognitive function, often eroded by late-night scrolling." },
    'work': { label: 'Work', sub: '8h / day', x: -18, y: 0, color: THEME.source, value: 9, desc: "Economic necessity. Attention is sold for capital, though distractions are increasing." },
    'free_time': { label: 'Free Time', sub: '5h / day', x: -18, y: -10, color: THEME.source, value: 5, desc: "Disposable attention. The primary battleground for the attention economy." },

    // Platforms
    'netflix': { label: 'Streaming', sub: 'Netflix/TV', x: 0, y: 8, color: THEME.platform, value: 6, desc: "Long-form passive content. Subscription model relies on retention." },
    'social': { label: 'Social', sub: 'TikTok/IG', x: 0, y: 2, color: THEME.platform, value: 10, desc: "Ad-driven model. Maximizes time-on-device via algorithmic optimization." },
    'youtube': { label: 'Video', sub: 'YouTube', x: 0, y: -4, color: THEME.platform, value: 8, desc: "Hybrid medium. High data harvest through search and watch history." },
    'gaming': { label: 'Gaming', sub: 'Interactive', x: 0, y: -10, color: THEME.platform, value: 7, desc: "High-engagement interactive state. Microtransactions and DLC revenue." },

    // Outcomes
    'passive': { label: 'Passive State', sub: 'Consumption', x: 18, y: 6, color: THEME.passive, value: 2, desc: "Low cognitive load. Mental relaxation but potential for stagnation." },
    'dopamine': { label: 'Dopamine Loop', sub: 'Addiction', x: 18, y: 0, color: THEME.outflow, value: 9, desc: "Short-term reward seeking. High value for platforms, low value for user." },
    'learning': { label: 'Growth', sub: 'Skill Acquisition', x: 18, y: -6, color: THEME.active, value: 4, desc: "Conversion of attention into long-term user value." },
    'connection': { label: 'Connection', sub: 'Relationships', x: 18, y: -12, color: THEME.active, value: 3, desc: "Strengthening of social bonds. Hard to monetize directly." }
};

export const FLOWS = [
    { from: 'free_time', to: 'social', weight: 4 },
    { from: 'free_time', to: 'netflix', weight: 3 },
    { from: 'free_time', to: 'youtube', weight: 3 },
    { from: 'free_time', to: 'gaming', weight: 2 },
    { from: 'work', to: 'social', weight: 1 },
    { from: 'work', to: 'youtube', weight: 1 },
    { from: 'netflix', to: 'passive', weight: 3 },
    { from: 'social', to: 'dopamine', weight: 3 },
    { from: 'social', to: 'connection', weight: 1 },
    { from: 'social', to: 'passive', weight: 1 },
    { from: 'youtube', to: 'learning', weight: 2 },
    { from: 'youtube', to: 'passive', weight: 2 },
    { from: 'gaming', to: 'dopamine', weight: 1 },
    { from: 'gaming', to: 'connection', weight: 1 },
    { from: 'gaming', to: 'learning', weight: 0.5 }
];
