/**
 * CULTMINDS Stance × Mindshare Engine - Type Definitions
 * 
 * Core data schemas for tracking voice stances on topics over time,
 * detecting stance flips, and correlating with mindshare shifts.
 */

// ============================================================================
// PLATFORM & CATEGORY TYPES
// ============================================================================

export type Platform = 'x' | 'youtube' | 'instagram' | 'rumble' | 'google' | 'podcast' | 'substack';
export type VoiceCategory = 'politics' | 'culture' | 'music' | 'gaming' | 'tech' | 'media' | 'sports' | 'other';
export type TopicCategory = 'politics' | 'foreign_policy' | 'culture' | 'tech' | 'economy' | 'social' | 'media';

// ============================================================================
// RAW CONTENT ITEM (canonical input schema)
// ============================================================================

export interface ContentMetrics {
    views: number | null;
    likes: number | null;
    comments: number | null;
    shares: number | null;
}

export interface RawContentItem {
    id: string;
    platform: Platform;
    voice_id: string;
    timestamp: string; // ISO-8601
    text: string;
    title?: string;
    metrics: ContentMetrics;
    url: string;
}

// ============================================================================
// VOICE REGISTRY
// ============================================================================

export interface Voice {
    voice_id: string;
    display_name: string;
    platform_handles: Partial<Record<Platform, string>>;
    category?: VoiceCategory;
    avatar_url?: string;
    bio?: string;
}

// ============================================================================
// TOPIC REGISTRY
// ============================================================================

export interface Topic {
    topic_id: string;
    label: string;
    aliases: string[];
    seed_keywords: string[];
    category?: TopicCategory;
}

// ============================================================================
// TOPIC LINKING OUTPUT (Step A)
// ============================================================================

export interface TopicHit {
    topic_id: string;
    weight: number; // 0-1 relevance weight
}

export interface ContentTopicLink {
    content_id: string;
    topic_hits: TopicHit[];
}

// ============================================================================
// STANCE DETECTION OUTPUT (Step B)
// ============================================================================

export interface StanceEvidence {
    quote_spans: string[];
    url: string;
}

export interface StanceRecord {
    content_id: string;
    voice_id: string;
    topic_id: string;
    timestamp: string; // ISO-8601
    stance: number; // -1 to +1
    conf: number; // 0 to 1
    evidence: StanceEvidence;
}

// ============================================================================
// AGGREGATED STANCE PER TIME BIN (Step C)
// ============================================================================

export interface StanceBin {
    voice_id: string;
    topic_id: string;
    bin_start: string; // ISO-8601
    bin_end: string; // ISO-8601
    stance: number; // -1 to +1 (weighted average)
    conf: number; // 0 to 1 (mean confidence)
    n_items: number; // content items in this bin
    total_words?: number; // optional: helps detect low-signal bins
}

// ============================================================================
// MINDSHARE PER TIME BIN (Step D)
// ============================================================================

export interface MindshareBin {
    voice_id: string;
    bin_start: string; // ISO-8601
    bin_end: string; // ISO-8601
    mindshare: number; // 0-100 normalized share
    raw_score: number; // pre-normalization score
    platform_scores: Partial<Record<Platform, number>>;
}

// ============================================================================
// STANCE FLIP EVENTS (Step E)
// ============================================================================

export type FlipEventType = 'STANCE_FLIP' | 'MINDSHARE_SURGE' | 'MINDSHARE_DROP';

export interface FlipReceipts {
    before: string[]; // content_ids before flip
    after: string[]; // content_ids after flip
}

export interface StanceFlipEvent {
    id: string;
    type: FlipEventType;
    voice_id: string;
    topic_id: string;
    t0: string; // ISO-8601 timestamp of flip
    stance_before: number;
    stance_after: number;
    delta_stance: number;
    delta_mindshare: number;
    lag_hours: number; // correlation lag between stance and mindshare
    confidence: number;
    receipts: FlipReceipts;
    explanation?: string; // human-readable explanation
}

// ============================================================================
// BURST DETECTION OUTPUT (Step F)
// ============================================================================

export interface KeywordBurst {
    keyword: string;
    burst_start: string;
    burst_end: string;
    intensity: number;
    related_content_ids: string[];
}

export interface FlipExplanation {
    flip_event_id: string;
    keyword_bursts: KeywordBurst[];
    top_content: RawContentItem[];
    narrative_summary: string;
}

// ============================================================================
// TIME SERIES TYPES (for charts)
// ============================================================================

export interface StanceTimePoint {
    timestamp: string;
    stance: number;
    conf: number;
    n_items: number;
}

export interface MindshareTimePoint {
    timestamp: string;
    mindshare: number;
}

export interface VoiceStanceTimeSeries {
    voice_id: string;
    topic_id: string;
    points: StanceTimePoint[];
    flip_events: StanceFlipEvent[];
}

export interface VoiceMindshareTimeSeries {
    voice_id: string;
    points: MindshareTimePoint[];
}

// ============================================================================
// UI DISPLAY TYPES
// ============================================================================

export interface StanceRingData {
    voice_id: string;
    topic_id: string;
    stance: number; // -1 to +1 for color
    confidence: number; // 0 to 1 for thickness
    has_recent_flip: boolean;
    flip_direction?: 'positive' | 'negative';
}

export interface VoiceCompareAnnotation {
    type: 'flip_first' | 'mindshare_surge' | 'mindshare_drop' | 'correlation';
    voice_id: string;
    text: string;
    timestamp: string;
    delta?: number;
}

export interface TopicStanceDistribution {
    topic_id: string;
    distribution: {
        against: number; // count of voices with stance < -0.3
        neutral: number; // count of voices with stance -0.3 to 0.3
        for: number; // count of voices with stance > 0.3
    };
    mindshare_weighted_stance: number; // -1 to +1
    top_voices: Array<{
        voice_id: string;
        stance: number;
        mindshare: number;
    }>;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface StanceEngineConfig {
    bin_size_hours: number; // default: 1 for hourly, 24 for daily
    stance_flip_threshold: number; // default: 0.6
    min_confidence_threshold: number; // default: 0.3
    min_items_for_flip: number; // default: 2 (avoid hallucinating from 1 post)
    correlation_lag_hours: number; // default: 48
    mindshare_weights: {
        mentions: number;
        engagement: number;
        views: number;
    };
}

export const DEFAULT_ENGINE_CONFIG: StanceEngineConfig = {
    bin_size_hours: 1,
    stance_flip_threshold: 0.6,
    min_confidence_threshold: 0.3,
    min_items_for_flip: 2,
    correlation_lag_hours: 48,
    mindshare_weights: {
        mentions: 1.0,
        engagement: 0.5,
        views: 0.3,
    },
};

// ============================================================================
// TYPE GUARDS
// ============================================================================

export function isStanceFlipEvent(event: { type: string }): event is StanceFlipEvent {
    return event.type === 'STANCE_FLIP';
}

export function isValidStance(value: number): boolean {
    return value >= -1 && value <= 1;
}

export function isValidConfidence(value: number): boolean {
    return value >= 0 && value <= 1;
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

export function stanceToColor(stance: number): string {
    // Red (against) → Gray (neutral) → Green (for)
    if (stance < -0.3) {
        const intensity = Math.min(1, Math.abs(stance));
        return `hsl(0, ${intensity * 70 + 30}%, ${50 - intensity * 10}%)`;
    } else if (stance > 0.3) {
        const intensity = Math.min(1, stance);
        return `hsl(142, ${intensity * 70 + 30}%, ${45 - intensity * 10}%)`;
    }
    return 'hsl(0, 0%, 50%)'; // neutral gray
}

export function stanceToLabel(stance: number): string {
    if (stance < -0.6) return 'Strongly Against';
    if (stance < -0.3) return 'Against';
    if (stance > 0.6) return 'Strongly For';
    if (stance > 0.3) return 'For';
    return 'Neutral';
}

export function confidenceToThickness(conf: number): number {
    // Map 0-1 confidence to ring thickness (2-8px)
    return 2 + conf * 6;
}
