/**
 * CULTMINDS Stance × Mindshare Engine - Zustand Store
 * 
 * Manages stance/mindshare data state and provides selectors
 * for the visualization components.
 */

import { create } from 'zustand';
import {
    Voice,
    Topic,
    StanceBin,
    MindshareBin,
    StanceFlipEvent,
    VoiceStanceTimeSeries,
    VoiceMindshareTimeSeries,
    TopicStanceDistribution,
    StanceRingData,
} from '@/types/stance';
import {
    DemoDataset,
    generateDemoDataset,
    getVoiceStanceTimeSeries,
    getVoiceMindshareTimeSeries,
} from '@/lib/demoDataGenerator';

// ============================================================================
// STATE INTERFACE
// ============================================================================

export type TimeWindow = '24h' | '7d' | '30d' | 'custom';

interface StanceState {
    // ---- DATA ----
    voices: Voice[];
    topics: Topic[];
    stanceBins: StanceBin[];
    mindshareBins: MindshareBin[];
    flipEvents: StanceFlipEvent[];
    dataLoaded: boolean;

    // ---- UI STATE ----
    selectedTopicId: string | null;
    selectedVoiceIds: string[];
    comparedVoiceIds: string[]; // For compare view
    hoveredVoiceId: string | null;
    timeWindow: TimeWindow;
    customTimeRange: { start: string; end: string } | null;
    showStanceRings: boolean;

    // ---- ACTIONS ----
    loadDemoData: () => void;
    setSelectedTopic: (topicId: string | null) => void;
    toggleVoiceSelection: (voiceId: string) => void;
    setComparedVoices: (voiceIds: string[]) => void;
    addToCompare: (voiceId: string) => void;
    removeFromCompare: (voiceId: string) => void;
    clearCompare: () => void;
    setHoveredVoice: (voiceId: string | null) => void;
    setTimeWindow: (window: TimeWindow) => void;
    setCustomTimeRange: (start: string, end: string) => void;
    toggleStanceRings: () => void;

    // ---- SELECTORS (computed from state) ----
    getVoiceStanceSeries: (voiceId: string, topicId: string) => VoiceStanceTimeSeries | null;
    getVoiceMindshareSeries: (voiceId: string) => VoiceMindshareTimeSeries | null;
    getTopicDistribution: (topicId: string) => TopicStanceDistribution | null;
    getStanceRingData: (voiceId: string) => StanceRingData | null;
    getFlipEventsForVoice: (voiceId: string) => StanceFlipEvent[];
    getFlipEventsForTopic: (topicId: string) => StanceFlipEvent[];
    getTopVoicesByMindshare: (limit?: number) => Array<{ voice: Voice; mindshare: number }>;
}

// ============================================================================
// STORE IMPLEMENTATION
// ============================================================================

export const useStanceStore = create<StanceState>((set, get) => ({
    // ---- INITIAL DATA STATE ----
    voices: [],
    topics: [],
    stanceBins: [],
    mindshareBins: [],
    flipEvents: [],
    dataLoaded: false,

    // ---- INITIAL UI STATE ----
    selectedTopicId: null,
    selectedVoiceIds: [],
    comparedVoiceIds: [],
    hoveredVoiceId: null,
    timeWindow: '7d',
    customTimeRange: null,
    showStanceRings: true,

    // ---- ACTIONS ----

    loadDemoData: () => {
        const dataset: DemoDataset = generateDemoDataset();
        set({
            voices: dataset.voices,
            topics: dataset.topics,
            stanceBins: dataset.stanceBins,
            mindshareBins: dataset.mindshareBins,
            flipEvents: dataset.flipEvents,
            dataLoaded: true,
            // Select first topic by default
            selectedTopicId: dataset.topics[0]?.topic_id || null,
        });
    },

    setSelectedTopic: (topicId) => {
        set({ selectedTopicId: topicId });
    },

    toggleVoiceSelection: (voiceId) => {
        set((state) => {
            const isSelected = state.selectedVoiceIds.includes(voiceId);
            return {
                selectedVoiceIds: isSelected
                    ? state.selectedVoiceIds.filter(id => id !== voiceId)
                    : [...state.selectedVoiceIds, voiceId],
            };
        });
    },

    setComparedVoices: (voiceIds) => {
        set({ comparedVoiceIds: voiceIds.slice(0, 5) }); // Max 5 voices
    },

    addToCompare: (voiceId) => {
        set((state) => {
            if (state.comparedVoiceIds.includes(voiceId)) return state;
            if (state.comparedVoiceIds.length >= 5) return state;
            return { comparedVoiceIds: [...state.comparedVoiceIds, voiceId] };
        });
    },

    removeFromCompare: (voiceId) => {
        set((state) => ({
            comparedVoiceIds: state.comparedVoiceIds.filter(id => id !== voiceId),
        }));
    },

    clearCompare: () => {
        set({ comparedVoiceIds: [] });
    },

    setHoveredVoice: (voiceId) => {
        set({ hoveredVoiceId: voiceId });
    },

    setTimeWindow: (window) => {
        set({ timeWindow: window, customTimeRange: null });
    },

    setCustomTimeRange: (start, end) => {
        set({ timeWindow: 'custom', customTimeRange: { start, end } });
    },

    toggleStanceRings: () => {
        set((state) => ({ showStanceRings: !state.showStanceRings }));
    },

    // ---- SELECTORS ----

    getVoiceStanceSeries: (voiceId, topicId) => {
        const state = get();
        if (!state.dataLoaded) return null;

        const dataset: DemoDataset = {
            voices: state.voices,
            topics: state.topics,
            stanceBins: state.stanceBins,
            mindshareBins: state.mindshareBins,
            flipEvents: state.flipEvents,
            generatedAt: new Date().toISOString(),
            config: { numVoices: 30, numTopics: 20, numDays: 30, numHours: 24, numFlipEvents: state.flipEvents.length },
        };

        return getVoiceStanceTimeSeries(dataset, voiceId, topicId);
    },

    getVoiceMindshareSeries: (voiceId) => {
        const state = get();
        if (!state.dataLoaded) return null;

        const dataset: DemoDataset = {
            voices: state.voices,
            topics: state.topics,
            stanceBins: state.stanceBins,
            mindshareBins: state.mindshareBins,
            flipEvents: state.flipEvents,
            generatedAt: new Date().toISOString(),
            config: { numVoices: 30, numTopics: 20, numDays: 30, numHours: 24, numFlipEvents: state.flipEvents.length },
        };

        return getVoiceMindshareTimeSeries(dataset, voiceId);
    },

    getTopicDistribution: (topicId) => {
        const state = get();
        if (!state.dataLoaded) return null;

        // Get latest stance for each voice on this topic
        const latestStances = new Map<string, { stance: number; mindshare: number }>();

        // Get latest stance per voice
        for (const bin of state.stanceBins) {
            if (bin.topic_id !== topicId) continue;
            const existing = latestStances.get(bin.voice_id);
            if (!existing || new Date(bin.bin_start) > new Date(existing.stance.toString())) {
                // Get corresponding mindshare
                const msbin = state.mindshareBins.find(
                    m => m.voice_id === bin.voice_id && m.bin_start === bin.bin_start
                );
                latestStances.set(bin.voice_id, {
                    stance: bin.stance,
                    mindshare: msbin?.mindshare || 0,
                });
            }
        }

        // Calculate distribution
        let against = 0, neutral = 0, forCount = 0;
        let totalMindshare = 0;
        let weightedStanceSum = 0;

        const voiceStances: Array<{ voice_id: string; stance: number; mindshare: number }> = [];

        for (const [voiceId, data] of Array.from(latestStances)) {
            if (data.stance < -0.3) against++;
            else if (data.stance > 0.3) forCount++;
            else neutral++;

            weightedStanceSum += data.stance * data.mindshare;
            totalMindshare += data.mindshare;
            voiceStances.push({ voice_id: voiceId, ...data });
        }

        return {
            topic_id: topicId,
            distribution: { against, neutral, for: forCount },
            mindshare_weighted_stance: totalMindshare > 0 ? weightedStanceSum / totalMindshare : 0,
            top_voices: voiceStances
                .sort((a, b) => b.mindshare - a.mindshare)
                .slice(0, 10),
        };
    },

    getStanceRingData: (voiceId) => {
        const state = get();
        if (!state.dataLoaded || !state.selectedTopicId) return null;

        const topicId = state.selectedTopicId;

        // Get latest stance for this voice on selected topic
        const voiceStanceBins = state.stanceBins
            .filter(b => b.voice_id === voiceId && b.topic_id === topicId)
            .sort((a, b) => new Date(b.bin_start).getTime() - new Date(a.bin_start).getTime());

        if (voiceStanceBins.length === 0) return null;

        const latestBin = voiceStanceBins[0];

        // Check for recent flip
        const recentFlips = state.flipEvents.filter(
            f => f.voice_id === voiceId && f.topic_id === topicId
        );
        const now = Date.now();
        const hasRecentFlip = recentFlips.some(
            f => now - new Date(f.t0).getTime() < 7 * 24 * 3600000 // Within 7 days
        );
        const latestFlip = recentFlips[recentFlips.length - 1];

        return {
            voice_id: voiceId,
            topic_id: topicId,
            stance: latestBin.stance,
            confidence: latestBin.conf,
            has_recent_flip: hasRecentFlip,
            flip_direction: latestFlip?.delta_stance && latestFlip.delta_stance > 0 ? 'positive' : 'negative',
        };
    },

    getFlipEventsForVoice: (voiceId) => {
        return get().flipEvents.filter(f => f.voice_id === voiceId);
    },

    getFlipEventsForTopic: (topicId) => {
        return get().flipEvents.filter(f => f.topic_id === topicId);
    },

    getTopVoicesByMindshare: (limit = 10) => {
        const state = get();
        if (!state.dataLoaded) return [];

        // Aggregate latest mindshare per voice
        const voiceMindshare = new Map<string, number>();

        // Get the most recent mindshare bin per voice
        for (const bin of state.mindshareBins) {
            const existing = voiceMindshare.get(bin.voice_id);
            if (!existing || existing < bin.mindshare) {
                voiceMindshare.set(bin.voice_id, bin.mindshare);
            }
        }

        // Sort and return with voice data
        return Array.from(voiceMindshare.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([voiceId, mindshare]) => ({
                voice: state.voices.find(v => v.voice_id === voiceId)!,
                mindshare,
            }))
            .filter(v => v.voice);
    },
}));

// ============================================================================
// HELPER HOOKS
// ============================================================================

/**
 * Get filtered time series based on current time window
 */
export function filterByTimeWindow<T extends { timestamp?: string; bin_start?: string }>(
    data: T[],
    timeWindow: TimeWindow,
    customRange?: { start: string; end: string } | null
): T[] {
    const now = Date.now();
    let startTime: number;
    let endTime = now;

    switch (timeWindow) {
        case '24h':
            startTime = now - 24 * 3600000;
            break;
        case '7d':
            startTime = now - 7 * 24 * 3600000;
            break;
        case '30d':
            startTime = now - 30 * 24 * 3600000;
            break;
        case 'custom':
            if (customRange) {
                startTime = new Date(customRange.start).getTime();
                endTime = new Date(customRange.end).getTime();
            } else {
                startTime = now - 7 * 24 * 3600000;
            }
            break;
        default:
            startTime = now - 7 * 24 * 3600000;
    }

    return data.filter(item => {
        const timestamp = item.timestamp || item.bin_start;
        if (!timestamp) return false;
        const time = new Date(timestamp).getTime();
        return time >= startTime && time <= endTime;
    });
}

/**
 * Downsample hourly data to daily for overview charts
 */
export function downsampleToDaily(
    points: Array<{ timestamp: string; value: number }>,
): Array<{ timestamp: string; value: number }> {
    const byDay = new Map<string, number[]>();

    for (const point of points) {
        const dayKey = point.timestamp.slice(0, 10); // YYYY-MM-DD
        if (!byDay.has(dayKey)) byDay.set(dayKey, []);
        byDay.get(dayKey)!.push(point.value);
    }

    return Array.from(byDay.entries()).map(([day, values]) => ({
        timestamp: day + 'T12:00:00.000Z',
        value: values.reduce((a, b) => a + b, 0) / values.length,
    }));
}
