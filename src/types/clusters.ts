// Cluster Taxonomy Types and Constants
// Persistent IDs that never change, regardless of display names

// ============================================================================
// CLUSTER TYPES
// ============================================================================

export type ClusterType = 'demographic' | 'interest' | 'psychographic' | 'behavioral';

export interface PersistentCluster {
    id: string;              // CLU-XXX, never changes
    type: ClusterType;
    baseAttributes: {
        ageRange?: [number, number];
        gender?: 'male' | 'female' | 'all';
        interests?: string[];
        values?: string[];
        behaviors?: string[];
    };
    defaultName: string;     // Default display name
    aliases: string[];       // Alternative display names
}

export interface ClusterAlias {
    alias: string;           // e.g., "Swifties"
    clusterIds: string[];    // Maps to one or more cluster IDs
    activePeriod: {
        start: string;         // ISO date
        end?: string;          // null = ongoing
    };
}

// ============================================================================
// CLUSTER ATTRACTION (what we show instead of time scrubber)
// ============================================================================

export interface ClusterAttraction {
    voiceId: string;           // e.g., "nick-fuentes"
    voiceName: string;         // Display name
    clusterId: string;         // e.g., "CLU-005"
    clusterName: string;       // Current display name for cluster
    timeframe: string;         // e.g., "this week", "24h"
    attractionPct: number;     // 0.25 = "attracted 25%"
    previousPct: number;       // Previous period for comparison
    netChange: number;         // +0.05 = "up 5% from last period"
    confidence: number;        // 0-1 model confidence
}

export interface VoiceAttractionSummary {
    voiceId: string;
    voiceName: string;
    voiceAvatar?: string;
    timeframe: string;
    primaryCluster: ClusterAttraction;  // Highest attraction
    otherClusters: ClusterAttraction[]; // Other significant attractions
    totalReach: number;                 // Total audience reached
    reachChange: number;                // Change from previous period
}

// ============================================================================
// PERSISTENT CLUSTER TAXONOMY
// ============================================================================

export const CLUSTER_TAXONOMY: PersistentCluster[] = [
    // DEMOGRAPHIC CLUSTERS - Age/Gender
    { id: 'CLU-001', type: 'demographic', baseAttributes: { ageRange: [13, 17], gender: 'female' }, defaultName: 'Teen Girls (13-17)', aliases: ['GenZ Girls', 'Teen Women'] },
    { id: 'CLU-002', type: 'demographic', baseAttributes: { ageRange: [18, 24], gender: 'female' }, defaultName: 'Young Women (18-24)', aliases: ['GenZ Women', 'Zoomers F'] },
    { id: 'CLU-003', type: 'demographic', baseAttributes: { ageRange: [25, 34], gender: 'female' }, defaultName: 'Women (25-34)', aliases: ['Millennial Women'] },
    { id: 'CLU-004', type: 'demographic', baseAttributes: { ageRange: [35, 54], gender: 'female' }, defaultName: 'Women (35-54)', aliases: ['GenX Women'] },
    { id: 'CLU-005', type: 'demographic', baseAttributes: { ageRange: [55, 99], gender: 'female' }, defaultName: 'Women (55+)', aliases: ['Boomer Women'] },
    { id: 'CLU-006', type: 'demographic', baseAttributes: { ageRange: [13, 17], gender: 'male' }, defaultName: 'Teen Boys (13-17)', aliases: ['GenZ Boys', 'Teen Men'] },
    { id: 'CLU-007', type: 'demographic', baseAttributes: { ageRange: [18, 24], gender: 'male' }, defaultName: 'Young Men (18-24)', aliases: ['GenZ Men', 'Zoomers M'] },
    { id: 'CLU-008', type: 'demographic', baseAttributes: { ageRange: [25, 34], gender: 'male' }, defaultName: 'Men (25-34)', aliases: ['Millennial Men'] },
    { id: 'CLU-009', type: 'demographic', baseAttributes: { ageRange: [35, 54], gender: 'male' }, defaultName: 'Men (35-54)', aliases: ['GenX Men'] },
    { id: 'CLU-010', type: 'demographic', baseAttributes: { ageRange: [55, 99], gender: 'male' }, defaultName: 'Men (55+)', aliases: ['Boomer Men'] },

    // INTEREST CLUSTERS
    { id: 'CLU-100', type: 'interest', baseAttributes: { interests: ['gaming', 'esports', 'streaming'] }, defaultName: 'Gaming Community', aliases: ['Gamers', 'Twitch/YouTube Gaming'] },
    { id: 'CLU-101', type: 'interest', baseAttributes: { interests: ['crypto', 'defi', 'trading'] }, defaultName: 'Crypto/Finance', aliases: ['Degens', 'Web3', 'Finance Bros'] },
    { id: 'CLU-102', type: 'interest', baseAttributes: { interests: ['fitness', 'health', 'bodybuilding'] }, defaultName: 'Fitness Community', aliases: ['Gym Bros', 'Health Conscious'] },
    { id: 'CLU-103', type: 'interest', baseAttributes: { interests: ['tech', 'programming', 'startups'] }, defaultName: 'Tech/Dev Community', aliases: ['Techies', 'Founders', 'Hackers'] },
    { id: 'CLU-104', type: 'interest', baseAttributes: { interests: ['entertainment', 'celebrities', 'pop culture'] }, defaultName: 'Pop Culture', aliases: ['Stan Culture', 'Entertainment'] },

    // PSYCHOGRAPHIC CLUSTERS
    { id: 'CLU-200', type: 'psychographic', baseAttributes: { values: ['conservative', 'traditional'] }, defaultName: 'Political Right', aliases: ['Conservatives', 'MAGA', 'Traditional'] },
    { id: 'CLU-201', type: 'psychographic', baseAttributes: { values: ['progressive', 'liberal'] }, defaultName: 'Political Left', aliases: ['Progressives', 'Liberals', 'Social Justice'] },
    { id: 'CLU-202', type: 'psychographic', baseAttributes: { values: ['libertarian', 'anti-establishment'] }, defaultName: 'Libertarian/Anti-Est', aliases: ['Libertarians', 'Anti-System'] },
    { id: 'CLU-203', type: 'psychographic', baseAttributes: { values: ['religious', 'spiritual'] }, defaultName: 'Religious/Spiritual', aliases: ['Faith Community', 'Christian', 'Spiritual'] },
    { id: 'CLU-204', type: 'psychographic', baseAttributes: { values: ['academic', 'intellectual'] }, defaultName: 'Intellectual', aliases: ['Academics', 'Thinkers', 'IDW'] },

    // BEHAVIORAL CLUSTERS
    { id: 'CLU-300', type: 'behavioral', baseAttributes: { behaviors: ['high-engagement', 'influencer-follower'] }, defaultName: 'High Engagers', aliases: ['Reply Guys', 'Active Commenters'] },
    { id: 'CLU-301', type: 'behavioral', baseAttributes: { behaviors: ['lurker', 'consumer'] }, defaultName: 'Silent Majority', aliases: ['Lurkers', 'Passive Viewers'] },
    { id: 'CLU-302', type: 'behavioral', baseAttributes: { behaviors: ['creator', 'content-producer'] }, defaultName: 'Content Creators', aliases: ['Creators', 'Influencers'] },
];

// Get cluster by ID
export function getCluster(id: string): PersistentCluster | undefined {
    return CLUSTER_TAXONOMY.find(c => c.id === id);
}

// Get clusters by type
export function getClustersByType(type: ClusterType): PersistentCluster[] {
    return CLUSTER_TAXONOMY.filter(c => c.type === type);
}

// Get display name for cluster (current alias or default)
export function getClusterDisplayName(id: string, preferredAlias?: string): string {
    const cluster = getCluster(id);
    if (!cluster) return id;
    if (preferredAlias && cluster.aliases.includes(preferredAlias)) {
        return preferredAlias;
    }
    return cluster.defaultName;
}

// Cluster color by type
export const CLUSTER_TYPE_COLORS: Record<ClusterType, string> = {
    demographic: '#3b82f6',    // Blue
    interest: '#22c55e',       // Green
    psychographic: '#f97316',  // Orange
    behavioral: '#8b5cf6',     // Purple
};
