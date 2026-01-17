/**
 * CULTMINDS Stance × Mindshare Engine - Core Pipeline
 * 
 * Implements the 6-step pipeline:
 * A. Topic linking (content → topic candidates)
 * B. Stance detection (content + topic → stance)
 * C. Aggregate stance per voice per time bin
 * D. Compute mindshare per voice per time bin
 * E. Detect stance flips and attention shifts
 * F. Explain "why" (keyword bursts around flip windows)
 */

import {
    RawContentItem,
    Topic,
    TopicHit,
    ContentTopicLink,
    StanceRecord,
    StanceBin,
    MindshareBin,
    StanceFlipEvent,
    KeywordBurst,
    FlipExplanation,
    StanceEngineConfig,
    DEFAULT_ENGINE_CONFIG,
    Platform,
} from '@/types/stance';

// ============================================================================
// STEP A: TOPIC LINKING
// ============================================================================

/**
 * Match content to topics using keyword-based semantic similarity
 * In production, this would use embeddings (BERT, OpenAI, etc.)
 */
export function linkTopics(
    content: RawContentItem,
    topics: Topic[]
): ContentTopicLink {
    const text = `${content.title || ''} ${content.text}`.toLowerCase();
    const topic_hits: TopicHit[] = [];

    for (const topic of topics) {
        let score = 0;
        let matches = 0;

        // Check label
        if (text.includes(topic.label.toLowerCase())) {
            score += 1.0;
            matches++;
        }

        // Check aliases
        for (const alias of topic.aliases) {
            if (text.includes(alias.toLowerCase())) {
                score += 0.8;
                matches++;
            }
        }

        // Check seed keywords
        for (const keyword of topic.seed_keywords) {
            if (text.includes(keyword.toLowerCase())) {
                score += 0.5;
                matches++;
            }
        }

        // Normalize score
        if (matches > 0) {
            const weight = Math.min(1, score / (1 + topic.seed_keywords.length * 0.3));
            if (weight > 0.1) {
                topic_hits.push({
                    topic_id: topic.topic_id,
                    weight,
                });
            }
        }
    }

    // Sort by weight and take top 3
    topic_hits.sort((a, b) => b.weight - a.weight);

    return {
        content_id: content.id,
        topic_hits: topic_hits.slice(0, 3),
    };
}

// ============================================================================
// STEP B: STANCE DETECTION
// ============================================================================

// Stance-specific lexicons (more nuanced than sentiment)
const STANCE_LEXICONS: Record<string, { pro: string[]; anti: string[] }> = {
    default: {
        pro: ['support', 'agree', 'endorse', 'favor', 'approve', 'back', 'champion', 'advocate', 'defend', 'embrace', 'right', 'correct', 'good', 'important', 'necessary', 'should', 'must', 'need'],
        anti: ['oppose', 'disagree', 'reject', 'against', 'condemn', 'criticize', 'denounce', 'attack', 'wrong', 'bad', 'dangerous', 'harmful', 'terrible', 'stupid', 'insane', 'ridiculous', 'shouldn\'t', 'must not', 'never'],
    },
};

// Negation words that flip stance
const NEGATION_WORDS = ['not', 'never', 'no', "don't", "doesn't", "won't", "can't", "shouldn't", "wouldn't", 'neither', 'hardly', 'barely', 'without'];

// Intensifiers
const INTENSIFIERS: Record<string, number> = {
    'very': 1.3, 'extremely': 1.5, 'absolutely': 1.4, 'completely': 1.4,
    'totally': 1.3, 'strongly': 1.4, 'deeply': 1.3, 'firmly': 1.3,
    'somewhat': 0.7, 'slightly': 0.5, 'kind of': 0.6, 'sort of': 0.6,
};

/**
 * Detect stance toward a specific topic from content
 * Returns stance score [-1, +1] and confidence [0, 1]
 */
export function detectStance(
    content: RawContentItem,
    topic: Topic
): StanceRecord {
    const text = `${content.title || ''} ${content.text}`.toLowerCase();
    const words = text.split(/\s+/);

    // Get relevant lexicon
    const lexicon = STANCE_LEXICONS.default;

    let proScore = 0;
    let antiScore = 0;
    let intensifier = 1;
    let negationActive = false;
    const evidenceSpans: string[] = [];

    for (let i = 0; i < words.length; i++) {
        const word = words[i].replace(/[^a-z']/g, '');

        // Check for negation
        if (NEGATION_WORDS.includes(word)) {
            negationActive = true;
            continue;
        }

        // Check for intensifier
        if (word in INTENSIFIERS) {
            intensifier = INTENSIFIERS[word];
            continue;
        }

        // Check for pro stance words
        if (lexicon.pro.some(w => word.includes(w))) {
            const contextWindow = words.slice(Math.max(0, i - 3), i + 4).join(' ');
            const score = intensifier * (negationActive ? -1 : 1);
            proScore += score;
            if (Math.abs(score) > 0.5) {
                evidenceSpans.push(contextWindow);
            }
            negationActive = false;
            intensifier = 1;
        }

        // Check for anti stance words
        if (lexicon.anti.some(w => word.includes(w))) {
            const contextWindow = words.slice(Math.max(0, i - 3), i + 4).join(' ');
            const score = intensifier * (negationActive ? -1 : 1);
            antiScore += score;
            if (Math.abs(score) > 0.5) {
                evidenceSpans.push(contextWindow);
            }
            negationActive = false;
            intensifier = 1;
        }
    }

    // Calculate stance
    const totalSignal = proScore + antiScore;
    let stance = 0;
    let conf = 0;

    if (totalSignal > 0) {
        stance = (proScore - antiScore) / Math.max(1, proScore + antiScore);
        stance = Math.max(-1, Math.min(1, stance));

        // Confidence based on signal strength and text length
        const signalStrength = Math.min(1, totalSignal / 5);
        const lengthFactor = Math.min(1, words.length / 50);
        conf = 0.3 + 0.5 * signalStrength + 0.2 * lengthFactor;
    } else {
        // No clear stance detected
        conf = 0.2;
    }

    return {
        content_id: content.id,
        voice_id: content.voice_id,
        topic_id: topic.topic_id,
        timestamp: content.timestamp,
        stance,
        conf,
        evidence: {
            quote_spans: evidenceSpans.slice(0, 3),
            url: content.url,
        },
    };
}

// ============================================================================
// STEP C: AGGREGATE STANCE PER TIME BIN
// ============================================================================

/**
 * Aggregate stance records into time bins
 * Uses weighted average: s_bin = Σ(s_i * c_i * w_topic_i) / Σ(c_i * w_topic_i)
 */
export function aggregateStance(
    records: StanceRecord[],
    topicLinks: ContentTopicLink[],
    binSizeHours: number = 1
): StanceBin[] {
    // Create lookup for topic weights
    const topicWeights = new Map<string, Map<string, number>>();
    for (const link of topicLinks) {
        const weights = new Map<string, number>();
        for (const hit of link.topic_hits) {
            weights.set(hit.topic_id, hit.weight);
        }
        topicWeights.set(link.content_id, weights);
    }

    // Group records by (voice_id, topic_id, time_bin)
    const binned = new Map<string, StanceRecord[]>();

    for (const record of records) {
        const timestamp = new Date(record.timestamp);
        const binStart = new Date(timestamp);
        binStart.setMinutes(0, 0, 0);
        binStart.setHours(Math.floor(binStart.getHours() / binSizeHours) * binSizeHours);

        const key = `${record.voice_id}|${record.topic_id}|${binStart.toISOString()}`;
        if (!binned.has(key)) binned.set(key, []);
        binned.get(key)!.push(record);
    }

    // Compute aggregates
    const bins: StanceBin[] = [];

    for (const [key, groupedRecords] of binned) {
        const [voice_id, topic_id, bin_start] = key.split('|');

        let weightedSum = 0;
        let weightSum = 0;
        let totalConf = 0;

        for (const record of groupedRecords) {
            const topicWeight = topicWeights.get(record.content_id)?.get(topic_id) || 1;
            const weight = record.conf * topicWeight;
            weightedSum += record.stance * weight;
            weightSum += weight;
            totalConf += record.conf;
        }

        const stance = weightSum > 0 ? weightedSum / weightSum : 0;
        const conf = totalConf / groupedRecords.length;

        const binEnd = new Date(bin_start);
        binEnd.setHours(binEnd.getHours() + binSizeHours);

        bins.push({
            voice_id,
            topic_id,
            bin_start,
            bin_end: binEnd.toISOString(),
            stance,
            conf,
            n_items: groupedRecords.length,
        });
    }

    return bins.sort((a, b) =>
        new Date(a.bin_start).getTime() - new Date(b.bin_start).getTime()
    );
}

// ============================================================================
// STEP D: COMPUTE MINDSHARE PER TIME BIN
// ============================================================================

/**
 * Compute mindshare (share of attention) per voice per time bin
 * Cross-platform normalized to 0-100 scale
 */
export function computeMindshare(
    contentItems: RawContentItem[],
    binSizeHours: number = 1,
    config: StanceEngineConfig = DEFAULT_ENGINE_CONFIG
): MindshareBin[] {
    // Score each content item
    const scored: Array<{ item: RawContentItem; score: number }> = contentItems.map(item => {
        const mentions = item.metrics.comments ?? 0;
        const engagement = (item.metrics.likes ?? 0) + (item.metrics.shares ?? 0) * 2;
        const views = item.metrics.views ?? 0;

        const score =
            mentions * config.mindshare_weights.mentions +
            engagement * config.mindshare_weights.engagement +
            views * config.mindshare_weights.views;

        return { item, score };
    });

    // Group by (voice_id, time_bin)
    const binned = new Map<string, typeof scored>();

    for (const { item, score } of scored) {
        const timestamp = new Date(item.timestamp);
        const binStart = new Date(timestamp);
        binStart.setMinutes(0, 0, 0);
        binStart.setHours(Math.floor(binStart.getHours() / binSizeHours) * binSizeHours);

        const key = `${item.voice_id}|${binStart.toISOString()}`;
        if (!binned.has(key)) binned.set(key, []);
        binned.get(key)!.push({ item, score });
    }

    // Calculate total score per time bin (across all voices)
    const binTotals = new Map<string, number>();
    for (const [key, items] of binned) {
        const binTime = key.split('|')[1];
        const totalScore = items.reduce((sum, { score }) => sum + score, 0);
        binTotals.set(binTime, (binTotals.get(binTime) || 0) + totalScore);
    }

    // Create mindshare bins
    const bins: MindshareBin[] = [];

    for (const [key, items] of binned) {
        const [voice_id, bin_start] = key.split('|');
        const rawScore = items.reduce((sum, { score }) => sum + score, 0);
        const binTotal = binTotals.get(bin_start) || 1;

        // Calculate platform-specific scores
        const platformScores: Partial<Record<Platform, number>> = {};
        for (const { item, score } of items) {
            platformScores[item.platform] = (platformScores[item.platform] || 0) + score;
        }

        const binEnd = new Date(bin_start);
        binEnd.setHours(binEnd.getHours() + binSizeHours);

        bins.push({
            voice_id,
            bin_start,
            bin_end: binEnd.toISOString(),
            mindshare: (rawScore / binTotal) * 100,
            raw_score: rawScore,
            platform_scores: platformScores,
        });
    }

    return bins.sort((a, b) =>
        new Date(a.bin_start).getTime() - new Date(b.bin_start).getTime()
    );
}

// ============================================================================
// STEP E: CHANGE POINT DETECTION
// ============================================================================

interface ChangePoint {
    index: number;
    timestamp: string;
    valueBefore: number;
    valueAfter: number;
    delta: number;
    confidence: number;
}

/**
 * CUSUM-style change point detection
 * Detects significant shifts in a time series
 */
export function detectChangePoints(
    values: number[],
    timestamps: string[],
    threshold: number = 0.6,
    windowSize: number = 12 // 12 hours default
): ChangePoint[] {
    if (values.length < windowSize * 2) return [];

    const changePoints: ChangePoint[] = [];

    for (let i = windowSize; i < values.length - windowSize; i++) {
        // Calculate mean and std of windows before and after
        const beforeWindow = values.slice(i - windowSize, i);
        const afterWindow = values.slice(i, i + windowSize);

        const meanBefore = beforeWindow.reduce((a, b) => a + b, 0) / windowSize;
        const meanAfter = afterWindow.reduce((a, b) => a + b, 0) / windowSize;
        const delta = meanAfter - meanBefore;

        // Calculate variance for confidence
        const varBefore = beforeWindow.reduce((sum, v) => sum + Math.pow(v - meanBefore, 2), 0) / windowSize;
        const varAfter = afterWindow.reduce((sum, v) => sum + Math.pow(v - meanAfter, 2), 0) / windowSize;
        const pooledStd = Math.sqrt((varBefore + varAfter) / 2);

        // Check if change is significant
        if (Math.abs(delta) >= threshold) {
            // Calculate confidence based on signal-to-noise ratio
            const snr = pooledStd > 0 ? Math.abs(delta) / pooledStd : 1;
            const confidence = Math.min(1, 0.5 + snr * 0.25);

            changePoints.push({
                index: i,
                timestamp: timestamps[i],
                valueBefore: meanBefore,
                valueAfter: meanAfter,
                delta,
                confidence,
            });
        }
    }

    // Merge nearby change points (within 6 hours)
    const mergedPoints: ChangePoint[] = [];
    for (const point of changePoints) {
        const lastPoint = mergedPoints[mergedPoints.length - 1];
        if (lastPoint && point.index - lastPoint.index < 6) {
            // Keep the more significant one
            if (Math.abs(point.delta) > Math.abs(lastPoint.delta)) {
                mergedPoints[mergedPoints.length - 1] = point;
            }
        } else {
            mergedPoints.push(point);
        }
    }

    return mergedPoints;
}

/**
 * Detect stance flips for a voice on a topic
 */
export function detectStanceFlips(
    stanceBins: StanceBin[],
    mindshareBins: MindshareBin[],
    config: StanceEngineConfig = DEFAULT_ENGINE_CONFIG
): StanceFlipEvent[] {
    // Sort bins by time
    const sortedStance = [...stanceBins].sort((a, b) =>
        new Date(a.bin_start).getTime() - new Date(b.bin_start).getTime()
    );
    const sortedMindshare = [...mindshareBins].sort((a, b) =>
        new Date(a.bin_start).getTime() - new Date(b.bin_start).getTime()
    );

    // Extract time series
    const stanceValues = sortedStance.map(b => b.stance);
    const stanceTimestamps = sortedStance.map(b => b.bin_start);
    const mindshareValues = sortedMindshare.map(b => b.mindshare);
    const mindshareTimestamps = sortedMindshare.map(b => b.bin_start);

    // Detect stance change points
    const stanceChanges = detectChangePoints(
        stanceValues,
        stanceTimestamps,
        config.stance_flip_threshold
    );

    // Create flip events
    const flipEvents: StanceFlipEvent[] = [];

    for (const change of stanceChanges) {
        const voiceId = sortedStance[0]?.voice_id;
        const topicId = sortedStance[0]?.topic_id;

        if (!voiceId || !topicId) continue;

        // Check if there's enough volume around the flip
        const nearbyBins = sortedStance.slice(
            Math.max(0, change.index - 12),
            change.index + 12
        );
        const totalItems = nearbyBins.reduce((sum, b) => sum + b.n_items, 0);

        if (totalItems < config.min_items_for_flip) continue;

        // Calculate mindshare change (look for correlated shift)
        let mindshareChange = 0;
        let lagHours = 0;

        // Find corresponding mindshare bins
        const flipTime = new Date(change.timestamp).getTime();
        const msIndex = mindshareTimestamps.findIndex(t =>
            Math.abs(new Date(t).getTime() - flipTime) < 3600000 // Within 1 hour
        );

        if (msIndex >= 12 && msIndex < mindshareValues.length - 12) {
            // Check for mindshare change in various lag windows
            for (let lag = 0; lag <= config.correlation_lag_hours; lag += 6) {
                const beforeIdx = msIndex;
                const afterIdx = Math.min(msIndex + lag, mindshareValues.length - 1);

                const msBefore = mindshareValues.slice(beforeIdx - 12, beforeIdx)
                    .reduce((a, b) => a + b, 0) / 12;
                const msAfter = mindshareValues.slice(afterIdx, afterIdx + 12)
                    .reduce((a, b) => a + b, 0) / Math.min(12, mindshareValues.length - afterIdx);

                const delta = msAfter - msBefore;
                if (Math.abs(delta) > Math.abs(mindshareChange)) {
                    mindshareChange = delta;
                    lagHours = lag;
                }
            }
        }

        // Collect receipt content IDs
        const beforeBins = sortedStance.slice(change.index - 6, change.index);
        const afterBins = sortedStance.slice(change.index, change.index + 6);

        flipEvents.push({
            id: `flip-${voiceId}-${topicId}-${change.index}`,
            type: 'STANCE_FLIP',
            voice_id: voiceId,
            topic_id: topicId,
            t0: change.timestamp,
            stance_before: change.valueBefore,
            stance_after: change.valueAfter,
            delta_stance: change.delta,
            delta_mindshare: mindshareChange,
            lag_hours: lagHours,
            confidence: change.confidence,
            receipts: {
                before: beforeBins.map((_, i) => `content-before-${i}`),
                after: afterBins.map((_, i) => `content-after-${i}`),
            },
        });
    }

    return flipEvents;
}

// ============================================================================
// STEP F: EXPLAIN FLIPS (KEYWORD BURST DETECTION)
// ============================================================================

/**
 * Simple keyword frequency burst detection
 * Identifies keywords that spiked around flip timestamp
 */
export function detectKeywordBursts(
    contentItems: RawContentItem[],
    t0: string,
    windowHours: number = 24
): KeywordBurst[] {
    const flipTime = new Date(t0).getTime();
    const windowMs = windowHours * 3600000;

    // Filter content around flip
    const nearbyContent = contentItems.filter(item => {
        const itemTime = new Date(item.timestamp).getTime();
        return Math.abs(itemTime - flipTime) <= windowMs;
    });

    // Extract and count keywords
    const wordCounts = new Map<string, { before: number; after: number; items: string[] }>();
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'was', 'are', 'were', 'be', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'it', 'this', 'that']);

    for (const item of nearbyContent) {
        const text = `${item.title || ''} ${item.text}`.toLowerCase();
        const words = text.split(/\s+/).filter(w => w.length > 3 && !stopWords.has(w));
        const isAfter = new Date(item.timestamp).getTime() > flipTime;

        for (const word of words) {
            const cleanWord = word.replace(/[^a-z]/g, '');
            if (cleanWord.length < 4) continue;

            if (!wordCounts.has(cleanWord)) {
                wordCounts.set(cleanWord, { before: 0, after: 0, items: [] });
            }
            const counts = wordCounts.get(cleanWord)!;
            if (isAfter) {
                counts.after++;
            } else {
                counts.before++;
            }
            if (!counts.items.includes(item.id)) {
                counts.items.push(item.id);
            }
        }
    }

    // Find words with significant increase after flip
    const bursts: KeywordBurst[] = [];

    for (const [word, counts] of wordCounts) {
        const ratio = counts.before > 0 ? counts.after / counts.before : counts.after;
        if (ratio > 2 && counts.after >= 3) {
            bursts.push({
                keyword: word,
                burst_start: t0,
                burst_end: new Date(flipTime + windowMs).toISOString(),
                intensity: ratio,
                related_content_ids: counts.items.slice(0, 10),
            });
        }
    }

    return bursts.sort((a, b) => b.intensity - a.intensity).slice(0, 10);
}

/**
 * Generate human-readable explanation for a flip event
 */
export function explainFlip(
    flipEvent: StanceFlipEvent,
    contentItems: RawContentItem[]
): FlipExplanation {
    const bursts = detectKeywordBursts(contentItems, flipEvent.t0);

    // Get top content items around flip
    const flipTime = new Date(flipEvent.t0).getTime();
    const topContent = contentItems
        .filter(item => {
            const itemTime = new Date(item.timestamp).getTime();
            return Math.abs(itemTime - flipTime) <= 48 * 3600000;
        })
        .sort((a, b) => {
            const aScore = (a.metrics.views || 0) + (a.metrics.likes || 0);
            const bScore = (b.metrics.views || 0) + (b.metrics.likes || 0);
            return bScore - aScore;
        })
        .slice(0, 5);

    // Generate narrative summary
    const direction = flipEvent.delta_stance > 0 ? 'more supportive' : 'more critical';
    const topKeywords = bursts.slice(0, 3).map(b => b.keyword).join(', ');
    const mindshareEffect = flipEvent.delta_mindshare > 10
        ? `This coincided with a ${Math.round(flipEvent.delta_mindshare)}% increase in attention.`
        : flipEvent.delta_mindshare < -10
            ? `This coincided with a ${Math.round(Math.abs(flipEvent.delta_mindshare))}% decrease in attention.`
            : '';

    const narrative = `Voice shifted to a ${direction} stance. ${topKeywords ? `Key topics: ${topKeywords}.` : ''} ${mindshareEffect}`;

    return {
        flip_event_id: flipEvent.id,
        keyword_bursts: bursts,
        top_content: topContent,
        narrative_summary: narrative,
    };
}

// ============================================================================
// CROSS-CORRELATION ANALYSIS
// ============================================================================

/**
 * Calculate cross-correlation between two time series
 * Returns optimal lag and correlation coefficient
 */
export function crossCorrelate(
    series1: number[],
    series2: number[],
    maxLag: number = 48
): { lag: number; correlation: number } {
    const n = Math.min(series1.length, series2.length);
    if (n < maxLag * 2) return { lag: 0, correlation: 0 };

    let bestLag = 0;
    let bestCorr = 0;

    // Calculate mean and std of series1
    const mean1 = series1.reduce((a, b) => a + b, 0) / n;
    const std1 = Math.sqrt(series1.reduce((sum, v) => sum + Math.pow(v - mean1, 2), 0) / n);

    for (let lag = -maxLag; lag <= maxLag; lag++) {
        // Shift series2 by lag
        const startIdx1 = Math.max(0, lag);
        const startIdx2 = Math.max(0, -lag);
        const length = n - Math.abs(lag);

        const slice1 = series1.slice(startIdx1, startIdx1 + length);
        const slice2 = series2.slice(startIdx2, startIdx2 + length);

        // Calculate correlation
        const mean2 = slice2.reduce((a, b) => a + b, 0) / length;
        const std2 = Math.sqrt(slice2.reduce((sum, v) => sum + Math.pow(v - mean2, 2), 0) / length);

        if (std1 * std2 === 0) continue;

        let corr = 0;
        for (let i = 0; i < length; i++) {
            corr += (slice1[i] - mean1) * (slice2[i] - mean2);
        }
        corr = corr / (length * std1 * std2);

        if (Math.abs(corr) > Math.abs(bestCorr)) {
            bestCorr = corr;
            bestLag = lag;
        }
    }

    return { lag: bestLag, correlation: bestCorr };
}

// ============================================================================
// ANNOTATION GENERATOR
// ============================================================================

export interface CompareAnnotation {
    type: 'flip_first' | 'mindshare_surge' | 'correlation' | 'divergence';
    text: string;
    timestamp: string;
    voices: string[];
}

/**
 * Generate annotations for voice comparison view
 */
export function generateCompareAnnotations(
    flipEvents: StanceFlipEvent[],
    voiceIds: string[]
): CompareAnnotation[] {
    const annotations: CompareAnnotation[] = [];

    // Filter relevant flip events
    const relevantFlips = flipEvents
        .filter(f => voiceIds.includes(f.voice_id))
        .sort((a, b) => new Date(a.t0).getTime() - new Date(b.t0).getTime());

    if (relevantFlips.length === 0) return annotations;

    // "Flipped first" annotation
    const firstFlip = relevantFlips[0];
    annotations.push({
        type: 'flip_first',
        text: `${firstFlip.voice_id} flipped first`,
        timestamp: firstFlip.t0,
        voices: [firstFlip.voice_id],
    });

    // Mindshare surge annotations
    for (const flip of relevantFlips) {
        if (flip.delta_mindshare > 20) {
            annotations.push({
                type: 'mindshare_surge',
                text: `+${Math.round(flip.delta_mindshare)}% mindshare within ${flip.lag_hours}h`,
                timestamp: flip.t0,
                voices: [flip.voice_id],
            });
        }
    }

    return annotations;
}
