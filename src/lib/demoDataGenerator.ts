/**
 * CULTMINDS Stance × Mindshare Engine - Demo Data Generator
 * 
 * Generates synthetic dataset for proving the concept:
 * - 30 voices with realistic names/platforms/categories
 * - 20 topics covering political/cultural subjects
 * - 30 days × 24 hours = 720 hourly bins
 * - Realistic mindshare dynamics (bursts, decays, power-law)
 * - Injected stance flips for demonstrable events
 * - Injected attention responses (flips → mindshare changes)
 */

import {
    Voice,
    Topic,
    StanceBin,
    MindshareBin,
    StanceFlipEvent,
    VoiceStanceTimeSeries,
    VoiceMindshareTimeSeries,
} from '@/types/stance';

// ============================================================================
// VOICE REGISTRY (30 voices)
// ============================================================================

const DEMO_VOICES: Voice[] = [
    // Political Commentators
    { voice_id: 'candace-owens', display_name: 'Candace Owens', platform_handles: { x: '@RealCandaceO', youtube: 'CandaceOwens' }, category: 'politics' },
    { voice_id: 'ben-shapiro', display_name: 'Ben Shapiro', platform_handles: { x: '@benshapiro', youtube: 'BenShapiro', podcast: 'The Ben Shapiro Show' }, category: 'politics' },
    { voice_id: 'tucker-carlson', display_name: 'Tucker Carlson', platform_handles: { x: '@TuckerCarlson', youtube: 'TuckerCarlson' }, category: 'media' },
    { voice_id: 'joe-rogan', display_name: 'Joe Rogan', platform_handles: { youtube: 'PowerfulJRE', podcast: 'The Joe Rogan Experience' }, category: 'media' },
    { voice_id: 'alex-jones', display_name: 'Alex Jones', platform_handles: { rumble: 'AlexJones', x: '@RealAlexJones' }, category: 'media' },
    { voice_id: 'charlie-kirk', display_name: 'Charlie Kirk', platform_handles: { x: '@charliekirk11', youtube: 'CharlieKirk' }, category: 'politics' },
    { voice_id: 'dan-bongino', display_name: 'Dan Bongino', platform_handles: { rumble: 'Bongino', podcast: 'The Dan Bongino Show' }, category: 'politics' },
    { voice_id: 'tim-pool', display_name: 'Tim Pool', platform_handles: { youtube: 'Timcast', x: '@Timcast' }, category: 'media' },
    { voice_id: 'steven-crowder', display_name: 'Steven Crowder', platform_handles: { youtube: 'StevenCrowder', rumble: 'LouderWithCrowder' }, category: 'media' },
    { voice_id: 'matt-walsh', display_name: 'Matt Walsh', platform_handles: { x: '@MattWalshBlog', youtube: 'MattWalsh' }, category: 'culture' },

    // Progressive/Left voices
    { voice_id: 'kyle-kulinski', display_name: 'Kyle Kulinski', platform_handles: { youtube: 'SecularTalk', x: '@KyleKulinski' }, category: 'politics' },
    { voice_id: 'cenk-uygur', display_name: 'Cenk Uygur', platform_handles: { youtube: 'TheYoungTurks', x: '@caboruygur' }, category: 'media' },
    { voice_id: 'sam-seder', display_name: 'Sam Seder', platform_handles: { youtube: 'TheMajorityReport', x: '@SamSeder' }, category: 'politics' },
    { voice_id: 'david-pakman', display_name: 'David Pakman', platform_handles: { youtube: 'DavidPakman', x: '@dpakman' }, category: 'politics' },
    { voice_id: 'hasan-piker', display_name: 'Hasan Piker', platform_handles: { youtube: 'HasanAbi', x: '@hasaboriker' }, category: 'culture' },

    // Independent/IDW
    { voice_id: 'jordan-peterson', display_name: 'Jordan Peterson', platform_handles: { youtube: 'JordanPeterson', x: '@jordanbpeterson' }, category: 'culture' },
    { voice_id: 'brett-weinstein', display_name: 'Bret Weinstein', platform_handles: { youtube: 'DarkHorse', podcast: 'DarkHorse Podcast' }, category: 'culture' },
    { voice_id: 'sam-harris', display_name: 'Sam Harris', platform_handles: { podcast: 'Making Sense', x: '@SamHarrisOrg' }, category: 'culture' },
    { voice_id: 'lex-fridman', display_name: 'Lex Fridman', platform_handles: { youtube: 'LexFridman', x: '@lexfridman' }, category: 'tech' },
    { voice_id: 'destiny', display_name: 'Destiny', platform_handles: { youtube: 'Destiny', x: '@TheOmniLiberal' }, category: 'politics' },

    // Tech/Business
    { voice_id: 'elon-musk', display_name: 'Elon Musk', platform_handles: { x: '@elonmusk' }, category: 'tech' },
    { voice_id: 'balaji', display_name: 'Balaji Srinivasan', platform_handles: { x: '@balaborijs', substack: 'Balaji' }, category: 'tech' },
    { voice_id: 'marc-andreessen', display_name: 'Marc Andreessen', platform_handles: { x: '@pmarca' }, category: 'tech' },
    { voice_id: 'peter-thiel', display_name: 'Peter Thiel', platform_handles: { x: '@peterthiel' }, category: 'tech' },

    // Culture/Entertainment
    { voice_id: 'pewdiepie', display_name: 'PewDiePie', platform_handles: { youtube: 'PewDiePie', x: '@pewdiepie' }, category: 'culture' },
    { voice_id: 'mrbeast', display_name: 'MrBeast', platform_handles: { youtube: 'MrBeast', x: '@MrBeast' }, category: 'culture' },
    { voice_id: 'asmongold', display_name: 'Asmongold', platform_handles: { youtube: 'Asmongold', x: '@Asmongold' }, category: 'gaming' },
    { voice_id: 'sneako', display_name: 'Sneako', platform_handles: { rumble: 'SNEAKO', x: '@sneaborko' }, category: 'culture' },
    { voice_id: 'fresh-and-fit', display_name: 'Fresh and Fit', platform_handles: { youtube: 'FreshandFit', rumble: 'FreshandFit' }, category: 'culture' },
    { voice_id: 'andrew-tate', display_name: 'Andrew Tate', platform_handles: { rumble: 'Tate', x: '@Cobratate' }, category: 'culture' },
];

// ============================================================================
// TOPIC REGISTRY (20 topics)
// ============================================================================

const DEMO_TOPICS: Topic[] = [
    { topic_id: 'ukraine-aid', label: 'Ukraine Aid', aliases: ['Ukraine funding', 'Ukraine war'], seed_keywords: ['ukraine', 'zelensky', 'aid', 'funding', 'war', 'russia'], category: 'foreign_policy' },
    { topic_id: 'israel-gaza', label: 'Israel-Gaza Conflict', aliases: ['Gaza war', 'Hamas', 'Israeli-Palestinian'], seed_keywords: ['israel', 'gaza', 'hamas', 'netanyahu', 'palestine', 'ceasefire'], category: 'foreign_policy' },
    { topic_id: 'immigration', label: 'Immigration Policy', aliases: ['Border crisis', 'Illegal immigration'], seed_keywords: ['border', 'immigration', 'migrant', 'asylum', 'deportation', 'wall'], category: 'politics' },
    { topic_id: 'trump-2024', label: 'Trump 2024 Campaign', aliases: ['Trump election', 'MAGA'], seed_keywords: ['trump', '2024', 'election', 'campaign', 'maga', 'republican'], category: 'politics' },
    { topic_id: 'biden-admin', label: 'Biden Administration', aliases: ['Biden policies', 'Democrats'], seed_keywords: ['biden', 'administration', 'democrat', 'white house'], category: 'politics' },
    { topic_id: 'ai-regulation', label: 'AI Regulation', aliases: ['AI safety', 'AI law'], seed_keywords: ['ai', 'artificial intelligence', 'regulation', 'safety', 'openai', 'chatgpt'], category: 'tech' },
    { topic_id: 'free-speech', label: 'Free Speech', aliases: ['Censorship', '1st Amendment'], seed_keywords: ['free speech', 'censorship', 'first amendment', 'ban', 'moderation'], category: 'culture' },
    { topic_id: 'trans-rights', label: 'Trans Rights', aliases: ['Gender identity', 'LGBTQ rights'], seed_keywords: ['trans', 'transgender', 'gender', 'pronouns', 'lgbtq'], category: 'culture' },
    { topic_id: 'climate-policy', label: 'Climate Policy', aliases: ['Green energy', 'Climate change'], seed_keywords: ['climate', 'green', 'carbon', 'renewable', 'emissions'], category: 'politics' },
    { topic_id: 'dei', label: 'DEI Initiatives', aliases: ['Diversity equity inclusion', 'Affirmative action'], seed_keywords: ['dei', 'diversity', 'equity', 'inclusion', 'affirmative'], category: 'culture' },
    { topic_id: 'crypto', label: 'Cryptocurrency', aliases: ['Bitcoin', 'Crypto regulation'], seed_keywords: ['crypto', 'bitcoin', 'ethereum', 'blockchain', 'sec'], category: 'tech' },
    { topic_id: 'tiktok-ban', label: 'TikTok Ban', aliases: ['TikTok legislation', 'China tech'], seed_keywords: ['tiktok', 'ban', 'china', 'bytedance', 'national security'], category: 'tech' },
    { topic_id: 'abortion', label: 'Abortion Rights', aliases: ['Roe v Wade', 'Pro-life/Pro-choice'], seed_keywords: ['abortion', 'roe', 'pro-life', 'pro-choice', 'reproductive'], category: 'politics' },
    { topic_id: 'gun-control', label: 'Gun Control', aliases: ['2nd Amendment', 'Gun rights'], seed_keywords: ['gun', 'second amendment', 'firearms', 'nra', 'shooting'], category: 'politics' },
    { topic_id: 'economy', label: 'Economic Policy', aliases: ['Inflation', 'Recession'], seed_keywords: ['economy', 'inflation', 'recession', 'jobs', 'gdp', 'fed'], category: 'economy' },
    { topic_id: 'woke-culture', label: 'Woke Culture', aliases: ['Cancel culture', 'Political correctness'], seed_keywords: ['woke', 'cancel', 'culture war', 'political correctness'], category: 'culture' },
    { topic_id: 'vaccines', label: 'Vaccine Policy', aliases: ['COVID vaccines', 'Mandates'], seed_keywords: ['vaccine', 'covid', 'mandate', 'pfizer', 'moderna', 'mrna'], category: 'politics' },
    { topic_id: 'twitter-x', label: 'X/Twitter', aliases: ['Elon Twitter', 'Platform changes'], seed_keywords: ['twitter', 'x', 'elon', 'musk', 'platform'], category: 'tech' },
    { topic_id: 'media-trust', label: 'Media Trust', aliases: ['Fake news', 'MSM'], seed_keywords: ['media', 'news', 'mainstream', 'propaganda', 'journalism'], category: 'media' },
    { topic_id: 'china-policy', label: 'US-China Relations', aliases: ['China threat', 'Trade war'], seed_keywords: ['china', 'ccp', 'taiwan', 'trade', 'beijing'], category: 'foreign_policy' },
];

// ============================================================================
// INJECTED FLIP SCENARIOS
// ============================================================================

interface FlipScenario {
    voice_id: string;
    topic_id: string;
    flip_day: number; // day 0-29
    stance_before: number;
    stance_after: number;
    mindshare_response: 'surge' | 'drop' | 'neutral';
    lag_hours: number;
}

const FLIP_SCENARIOS: FlipScenario[] = [
    // Candace Owens flips on Israel-Gaza → mindshare surge
    { voice_id: 'candace-owens', topic_id: 'israel-gaza', flip_day: 12, stance_before: 0.7, stance_after: -0.5, mindshare_response: 'surge', lag_hours: 24 },

    // Tucker Carlson flips on Ukraine aid → controversy surge
    { voice_id: 'tucker-carlson', topic_id: 'ukraine-aid', flip_day: 8, stance_before: 0.2, stance_after: -0.8, mindshare_response: 'surge', lag_hours: 12 },

    // Elon Musk flips on AI regulation → tech attention
    { voice_id: 'elon-musk', topic_id: 'ai-regulation', flip_day: 18, stance_before: -0.6, stance_after: 0.4, mindshare_response: 'surge', lag_hours: 6 },

    // Joe Rogan subtle stance shift on vaccines
    { voice_id: 'joe-rogan', topic_id: 'vaccines', flip_day: 22, stance_before: -0.3, stance_after: 0.1, mindshare_response: 'neutral', lag_hours: 48 },

    // Destiny flips on trans rights → drop from some audiences
    { voice_id: 'destiny', topic_id: 'trans-rights', flip_day: 15, stance_before: 0.8, stance_after: 0.1, mindshare_response: 'drop', lag_hours: 24 },

    // Andrew Tate flips on crypto → attention surge
    { voice_id: 'andrew-tate', topic_id: 'crypto', flip_day: 20, stance_before: -0.4, stance_after: 0.9, mindshare_response: 'surge', lag_hours: 8 },
];

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function randomNormal(mean: number, std: number): number {
    // Box-Muller transform
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    return mean + z * std;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function powerLaw(rank: number, alpha: number = 1.5): number {
    // Zipf-like distribution
    return 1 / Math.pow(rank + 1, alpha);
}

function generateTimestamp(dayOffset: number, hourOffset: number, baseDate: Date): string {
    const date = new Date(baseDate);
    date.setDate(date.getDate() - (29 - dayOffset)); // 30 days ago to now
    date.setHours(hourOffset, 0, 0, 0);
    return date.toISOString();
}

// ============================================================================
// MAIN GENERATOR FUNCTIONS
// ============================================================================

export function generateVoices(): Voice[] {
    return [...DEMO_VOICES];
}

export function generateTopics(): Topic[] {
    return [...DEMO_TOPICS];
}

/**
 * Generate base stance for a voice on a topic
 * Based on expected ideological positions
 */
function getBaseStance(voiceId: string, topicId: string): { stance: number; volatility: number } {
    // Define ideological clusters
    const rightVoices = ['candace-owens', 'ben-shapiro', 'tucker-carlson', 'charlie-kirk', 'dan-bongino', 'steven-crowder', 'matt-walsh', 'andrew-tate', 'sneako'];
    const leftVoices = ['kyle-kulinski', 'cenk-uygur', 'sam-seder', 'david-pakman', 'hasan-piker'];
    const independentVoices = ['joe-rogan', 'jordan-peterson', 'brett-weinstein', 'sam-harris', 'lex-fridman', 'destiny', 'tim-pool'];
    const techVoices = ['elon-musk', 'balaji', 'marc-andreessen', 'peter-thiel'];

    // Topic-specific stances
    const topicStances: Record<string, Record<string, number>> = {
        'ukraine-aid': { right: -0.3, left: 0.5, independent: 0, tech: 0.2 },
        'israel-gaza': { right: 0.7, left: -0.5, independent: 0, tech: 0.2 },
        'immigration': { right: -0.8, left: 0.6, independent: -0.2, tech: -0.1 },
        'trump-2024': { right: 0.9, left: -0.9, independent: 0, tech: 0.2 },
        'biden-admin': { right: -0.9, left: 0.3, independent: -0.2, tech: -0.1 },
        'ai-regulation': { right: -0.4, left: 0.3, independent: 0, tech: -0.6 },
        'free-speech': { right: 0.9, left: 0.2, independent: 0.7, tech: 0.8 },
        'trans-rights': { right: -0.9, left: 0.9, independent: 0, tech: 0.1 },
        'climate-policy': { right: -0.7, left: 0.8, independent: 0.2, tech: 0.3 },
        'dei': { right: -0.9, left: 0.7, independent: -0.3, tech: -0.5 },
        'crypto': { right: 0.5, left: -0.2, independent: 0.3, tech: 0.8 },
        'tiktok-ban': { right: 0.3, left: -0.2, independent: -0.3, tech: -0.1 },
        'abortion': { right: -0.9, left: 0.9, independent: 0.2, tech: 0.1 },
        'gun-control': { right: -0.9, left: 0.7, independent: -0.2, tech: -0.2 },
        'economy': { right: -0.5, left: 0.3, independent: 0, tech: 0.2 },
        'woke-culture': { right: -0.9, left: 0.4, independent: -0.4, tech: -0.3 },
        'vaccines': { right: -0.6, left: 0.5, independent: -0.2, tech: 0.1 },
        'twitter-x': { right: 0.6, left: -0.3, independent: 0.2, tech: 0.7 },
        'media-trust': { right: -0.8, left: -0.3, independent: -0.5, tech: -0.4 },
        'china-policy': { right: -0.7, left: -0.3, independent: -0.4, tech: -0.5 },
    };

    let cluster = 'independent';
    if (rightVoices.includes(voiceId)) cluster = 'right';
    else if (leftVoices.includes(voiceId)) cluster = 'left';
    else if (techVoices.includes(voiceId)) cluster = 'tech';

    const topicStance = topicStances[topicId] || { right: 0, left: 0, independent: 0, tech: 0 };
    const baseStance = topicStance[cluster as keyof typeof topicStance] || 0;

    // Add individual voice variation
    const individualVariation = randomNormal(0, 0.15);

    return {
        stance: clamp(baseStance + individualVariation, -1, 1),
        volatility: Math.random() * 0.1 + 0.02, // How much stance varies day-to-day
    };
}

/**
 * Generate mindshare time series for a voice
 */
function generateMindshareTimeSeries(
    voiceId: string,
    voiceRank: number, // 0 = most famous
    flipScenarios: FlipScenario[],
    baseDate: Date
): MindshareBin[] {
    const bins: MindshareBin[] = [];
    const baseMindshare = powerLaw(voiceRank, 1.2) * 100; // Power-law distribution

    // Find any flip scenarios for this voice
    const voiceFlips = flipScenarios.filter(f => f.voice_id === voiceId);

    for (let day = 0; day < 30; day++) {
        for (let hour = 0; hour < 24; hour++) {
            const binIndex = day * 24 + hour;

            // Base mindshare with random variation
            let mindshare = baseMindshare * (1 + randomNormal(0, 0.15));

            // Add periodic patterns (busier during day hours)
            const hourFactor = 0.7 + 0.3 * Math.sin((hour - 6) * Math.PI / 12);
            mindshare *= hourFactor;

            // Add random bursts (5% chance per hour)
            if (Math.random() < 0.05) {
                mindshare *= 1.5 + Math.random() * 1.5; // 1.5x to 3x burst
            }

            // Apply flip-related mindshare changes
            for (const flip of voiceFlips) {
                const flipHour = flip.flip_day * 24;
                const hoursAfterFlip = binIndex - flipHour;

                if (hoursAfterFlip >= flip.lag_hours && hoursAfterFlip < flip.lag_hours + 72) {
                    // Effect window: lag_hours to lag_hours + 72h
                    const effectProgress = (hoursAfterFlip - flip.lag_hours) / 72;
                    const effectStrength = Math.sin(effectProgress * Math.PI); // Bell curve

                    if (flip.mindshare_response === 'surge') {
                        mindshare *= 1 + effectStrength * 1.5; // Up to 2.5x
                    } else if (flip.mindshare_response === 'drop') {
                        mindshare *= 1 - effectStrength * 0.4; // Down to 0.6x
                    }
                }
            }

            bins.push({
                voice_id: voiceId,
                bin_start: generateTimestamp(day, hour, baseDate),
                bin_end: generateTimestamp(day, hour + 1, baseDate),
                mindshare: Math.max(0.01, mindshare),
                raw_score: mindshare * 1000,
                platform_scores: {
                    x: mindshare * 0.4,
                    youtube: mindshare * 0.35,
                    podcast: mindshare * 0.15,
                    rumble: mindshare * 0.1,
                },
            });
        }
    }

    return bins;
}

/**
 * Generate stance time series for a voice on a topic
 */
function generateStanceTimeSeries(
    voiceId: string,
    topicId: string,
    flipScenarios: FlipScenario[],
    baseDate: Date
): StanceBin[] {
    const { stance: baseStance, volatility } = getBaseStance(voiceId, topicId);
    const bins: StanceBin[] = [];

    // Find any flip scenarios for this voice+topic
    const flip = flipScenarios.find(f => f.voice_id === voiceId && f.topic_id === topicId);

    let currentStance = baseStance;

    for (let day = 0; day < 30; day++) {
        // Apply flip if this is the flip day
        if (flip && day === flip.flip_day) {
            currentStance = flip.stance_after;
        } else if (flip && day < flip.flip_day) {
            currentStance = flip.stance_before;
        } else if (!flip) {
            // Random walk with mean reversion
            const drift = (baseStance - currentStance) * 0.1; // Mean reversion
            const noise = randomNormal(0, volatility);
            currentStance = clamp(currentStance + drift + noise, -1, 1);
        }

        for (let hour = 0; hour < 24; hour++) {
            // Hourly micro-variation
            const hourlyStance = clamp(currentStance + randomNormal(0, volatility * 0.3), -1, 1);
            const confidence = 0.5 + Math.random() * 0.4; // 0.5 to 0.9
            const nItems = Math.floor(Math.random() * 5) + 1; // 1-5 items per hour

            bins.push({
                voice_id: voiceId,
                topic_id: topicId,
                bin_start: generateTimestamp(day, hour, baseDate),
                bin_end: generateTimestamp(day, hour + 1, baseDate),
                stance: hourlyStance,
                conf: confidence,
                n_items: nItems,
            });
        }
    }

    return bins;
}

/**
 * Generate flip events from the flip scenarios
 */
function generateFlipEvents(
    flipScenarios: FlipScenario[],
    baseDate: Date
): StanceFlipEvent[] {
    return flipScenarios.map((flip, index) => ({
        id: `flip-${index}`,
        type: 'STANCE_FLIP' as const,
        voice_id: flip.voice_id,
        topic_id: flip.topic_id,
        t0: generateTimestamp(flip.flip_day, 12, baseDate), // Flip at noon
        stance_before: flip.stance_before,
        stance_after: flip.stance_after,
        delta_stance: flip.stance_after - flip.stance_before,
        delta_mindshare: flip.mindshare_response === 'surge' ? 45 : (flip.mindshare_response === 'drop' ? -25 : 5),
        lag_hours: flip.lag_hours,
        confidence: 0.85 + Math.random() * 0.1,
        receipts: {
            before: [`content-${flip.voice_id}-before-1`, `content-${flip.voice_id}-before-2`],
            after: [`content-${flip.voice_id}-after-1`, `content-${flip.voice_id}-after-2`, `content-${flip.voice_id}-after-3`],
        },
        explanation: `${DEMO_VOICES.find(v => v.voice_id === flip.voice_id)?.display_name} shifted stance on ${DEMO_TOPICS.find(t => t.topic_id === flip.topic_id)?.label} from ${flip.stance_before > 0 ? 'supportive' : 'opposed'} to ${flip.stance_after > 0 ? 'supportive' : 'opposed'}`,
    }));
}

// ============================================================================
// MAIN EXPORT: Generate Complete Demo Dataset
// ============================================================================

export interface DemoDataset {
    voices: Voice[];
    topics: Topic[];
    stanceBins: StanceBin[];
    mindshareBins: MindshareBin[];
    flipEvents: StanceFlipEvent[];
    generatedAt: string;
    config: {
        numVoices: number;
        numTopics: number;
        numDays: number;
        numHours: number;
        numFlipEvents: number;
    };
}

export function generateDemoDataset(): DemoDataset {
    const baseDate = new Date();
    const voices = generateVoices();
    const topics = generateTopics();

    const stanceBins: StanceBin[] = [];
    const mindshareBins: MindshareBin[] = [];

    // Generate mindshare for each voice
    voices.forEach((voice, rank) => {
        const voiceMindshare = generateMindshareTimeSeries(
            voice.voice_id,
            rank,
            FLIP_SCENARIOS,
            baseDate
        );
        mindshareBins.push(...voiceMindshare);
    });

    // Normalize mindshare so it sums to 100 per time bin
    const binTimestamps = new Set(mindshareBins.map(b => b.bin_start));
    binTimestamps.forEach(timestamp => {
        const binsAtTime = mindshareBins.filter(b => b.bin_start === timestamp);
        const totalMindshare = binsAtTime.reduce((sum, b) => sum + b.mindshare, 0);
        binsAtTime.forEach(b => {
            b.mindshare = (b.mindshare / totalMindshare) * 100;
        });
    });

    // Generate stance for each voice+topic combo
    voices.forEach(voice => {
        topics.forEach(topic => {
            const voiceTopicStance = generateStanceTimeSeries(
                voice.voice_id,
                topic.topic_id,
                FLIP_SCENARIOS,
                baseDate
            );
            stanceBins.push(...voiceTopicStance);
        });
    });

    const flipEvents = generateFlipEvents(FLIP_SCENARIOS, baseDate);

    return {
        voices,
        topics,
        stanceBins,
        mindshareBins,
        flipEvents,
        generatedAt: new Date().toISOString(),
        config: {
            numVoices: voices.length,
            numTopics: topics.length,
            numDays: 30,
            numHours: 24,
            numFlipEvents: flipEvents.length,
        },
    };
}

/**
 * Get stance time series for a specific voice+topic
 */
export function getVoiceStanceTimeSeries(
    dataset: DemoDataset,
    voiceId: string,
    topicId: string
): VoiceStanceTimeSeries {
    const points = dataset.stanceBins
        .filter(b => b.voice_id === voiceId && b.topic_id === topicId)
        .sort((a, b) => new Date(a.bin_start).getTime() - new Date(b.bin_start).getTime())
        .map(b => ({
            timestamp: b.bin_start,
            stance: b.stance,
            conf: b.conf,
            n_items: b.n_items,
        }));

    const flipEvents = dataset.flipEvents.filter(
        f => f.voice_id === voiceId && f.topic_id === topicId
    );

    return { voice_id: voiceId, topic_id: topicId, points, flip_events: flipEvents };
}

/**
 * Get mindshare time series for a specific voice
 */
export function getVoiceMindshareTimeSeries(
    dataset: DemoDataset,
    voiceId: string
): VoiceMindshareTimeSeries {
    const points = dataset.mindshareBins
        .filter(b => b.voice_id === voiceId)
        .sort((a, b) => new Date(a.bin_start).getTime() - new Date(b.bin_start).getTime())
        .map(b => ({
            timestamp: b.bin_start,
            mindshare: b.mindshare,
        }));

    return { voice_id: voiceId, points };
}

/**
 * Downsample time series to daily bins for overview charts
 */
export function downsampleToDaily<T extends { timestamp: string }>(
    points: T[],
    aggregator: (dayPoints: T[]) => T
): T[] {
    const byDay = new Map<string, T[]>();

    points.forEach(p => {
        const dayKey = p.timestamp.slice(0, 10); // YYYY-MM-DD
        if (!byDay.has(dayKey)) byDay.set(dayKey, []);
        byDay.get(dayKey)!.push(p);
    });

    return Array.from(byDay.values()).map(aggregator);
}
