import { NextResponse } from 'next/server';

/**
 * CULTMINDS Master Data Aggregator
 * Fetches from all sources in parallel and unifies data format
 */

interface UnifiedItem {
    id: string;
    platform: string;
    title: string;
    url: string;
    author?: string;
    authorAvatar?: string;
    thumbnail?: string;
    score: number;
    engagement: number;
    sentiment: number;
    created: string;
    category: string;
    lat?: number;
    lng?: number;
    region?: string;
    metadata?: Record<string, unknown>;
}

interface AggregatedData {
    items: UnifiedItem[];
    platforms: Record<string, {
        count: number;
        avgSentiment: number;
        topItem?: string;
    }>;
    trendingTopics: Array<{ word: string; count: number; platforms: string[] }>;
    geoPoints: Array<{ lat: number; lng: number; label: string; value: number; platform: string }>;
    stats: {
        totalItems: number;
        totalPlatforms: number;
        avgSentiment: number;
        fetchedAt: string;
    };
}

// Parallel fetch with timeout
async function fetchWithTimeout(url: string, timeout = 5000): Promise<Response | null> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        return response;
    } catch {
        clearTimeout(timeoutId);
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const baseUrl = new URL(request.url).origin;
    const sources = searchParams.get('sources')?.split(',') || ['reddit', 'hackernews', 'github', 'wikimedia'];

    const startTime = Date.now();

    try {
        // Fetch all sources in parallel
        const fetchPromises: Record<string, Promise<Response | null>> = {};

        if (sources.includes('reddit')) {
            fetchPromises.reddit = fetchWithTimeout(`${baseUrl}/api/live`, 8000);
        }
        if (sources.includes('hackernews')) {
            fetchPromises.hackernews = fetchWithTimeout(`${baseUrl}/api/sources/hackernews?limit=30`, 8000);
        }
        if (sources.includes('github')) {
            fetchPromises.github = fetchWithTimeout(`${baseUrl}/api/sources/github`, 8000);
        }
        if (sources.includes('wikimedia')) {
            fetchPromises.wikimedia = fetchWithTimeout(`${baseUrl}/api/sources/wikimedia?limit=30`, 8000);
        }
        if (sources.includes('earthquake')) {
            fetchPromises.earthquake = fetchWithTimeout(`${baseUrl}/api/sources/earthquake?timeframe=day&min=4.5`, 8000);
        }

        const responses = await Promise.all(
            Object.entries(fetchPromises).map(async ([key, promise]) => {
                const res = await promise;
                if (res?.ok) {
                    const data = await res.json();
                    return { platform: key, data, success: true };
                }
                return { platform: key, data: null, success: false };
            })
        );

        // Unified items collection
        const allItems: UnifiedItem[] = [];
        const platformStats: Record<string, { count: number; avgSentiment: number; topItem?: string }> = {};
        const topicCounts: Record<string, { count: number; platforms: Set<string> }> = {};
        const geoPoints: AggregatedData['geoPoints'] = [];

        // Process Reddit data
        const redditData = responses.find(r => r.platform === 'reddit' && r.success);
        if (redditData?.data?.topics) {
            for (const topic of redditData.data.topics) {
                allItems.push({
                    id: `reddit-${topic.id}`,
                    platform: 'reddit',
                    title: topic.name,
                    url: topic.sources?.[0]?.url || '#',
                    thumbnail: topic.thumbnail,
                    score: topic.mentions,
                    engagement: topic.mentions,
                    sentiment: topic.sentiment,
                    created: topic.lastUpdated,
                    category: topic.category,
                });

                // Add geo points
                if (topic.geoPoints) {
                    for (const geo of topic.geoPoints) {
                        geoPoints.push({
                            lat: geo.lat,
                            lng: geo.lng,
                            label: topic.name,
                            value: geo.value,
                            platform: 'reddit',
                        });
                    }
                }

                // Track topics
                const words = topic.name.toLowerCase().split(/\s+/);
                for (const word of words) {
                    if (word.length > 3) {
                        if (!topicCounts[word]) topicCounts[word] = { count: 0, platforms: new Set() };
                        topicCounts[word].count++;
                        topicCounts[word].platforms.add('reddit');
                    }
                }
            }
            platformStats.reddit = {
                count: redditData.data.topics.length,
                avgSentiment: redditData.data.stats?.avgSentiment || 0,
                topItem: redditData.data.topics[0]?.name,
            };
        }

        // Process Hacker News data
        const hnData = responses.find(r => r.platform === 'hackernews' && r.success);
        if (hnData?.data?.stories) {
            for (const story of hnData.data.stories) {
                allItems.push({
                    id: story.id,
                    platform: 'hackernews',
                    title: story.title,
                    url: story.url,
                    author: story.author,
                    score: story.score,
                    engagement: story.score + story.comments * 2,
                    sentiment: story.sentiment,
                    created: story.created,
                    category: 'tech',
                    metadata: { domain: story.domain, comments: story.comments },
                });

                // Track topics
                const words = story.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
                for (const word of words) {
                    if (word.length > 3) {
                        if (!topicCounts[word]) topicCounts[word] = { count: 0, platforms: new Set() };
                        topicCounts[word].count++;
                        topicCounts[word].platforms.add('hackernews');
                    }
                }
            }
            platformStats.hackernews = {
                count: hnData.data.stories.length,
                avgSentiment: hnData.data.stats?.avgSentiment || 0,
                topItem: hnData.data.stories[0]?.title,
            };
        }

        // Process GitHub data
        const ghData = responses.find(r => r.platform === 'github' && r.success);
        if (ghData?.data?.events) {
            for (const event of ghData.data.events.slice(0, 20)) {
                allItems.push({
                    id: event.id,
                    platform: 'github',
                    title: event.title,
                    url: event.url,
                    author: event.author,
                    authorAvatar: event.authorAvatar,
                    score: 1,
                    engagement: 1,
                    sentiment: event.sentiment,
                    created: event.created,
                    category: 'tech',
                    metadata: { repo: event.repo, type: event.type },
                });
            }
            platformStats.github = {
                count: ghData.data.events.length,
                avgSentiment: ghData.data.stats?.avgSentiment || 0,
            };
        }

        // Process Wikipedia data
        const wikiData = responses.find(r => r.platform === 'wikimedia' && r.success);
        if (wikiData?.data?.edits) {
            for (const edit of wikiData.data.edits.slice(0, 20)) {
                allItems.push({
                    id: edit.id,
                    platform: 'wikipedia',
                    title: `Edited: ${edit.title}`,
                    url: edit.url,
                    author: edit.author,
                    score: Math.abs(edit.changeSize),
                    engagement: Math.abs(edit.changeSize),
                    sentiment: edit.sentiment,
                    created: edit.created,
                    category: 'culture',
                    metadata: { changeSize: edit.changeSize, comment: edit.comment },
                });

                // Track topics
                const words = edit.title.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
                for (const word of words) {
                    if (word.length > 3) {
                        if (!topicCounts[word]) topicCounts[word] = { count: 0, platforms: new Set() };
                        topicCounts[word].count++;
                        topicCounts[word].platforms.add('wikipedia');
                    }
                }
            }
            platformStats.wikipedia = {
                count: wikiData.data.edits.length,
                avgSentiment: wikiData.data.stats?.avgSentiment || 0,
            };
        }

        // Process Earthquake data
        const quakeData = responses.find(r => r.platform === 'earthquake' && r.success);
        if (quakeData?.data?.earthquakes) {
            for (const quake of quakeData.data.earthquakes.slice(0, 10)) {
                allItems.push({
                    id: quake.id,
                    platform: 'usgs',
                    title: quake.title,
                    url: quake.url,
                    score: quake.significance,
                    engagement: quake.significance,
                    sentiment: quake.magnitude >= 6 ? -0.8 : quake.magnitude >= 4 ? -0.3 : 0,
                    created: quake.created,
                    category: 'world',
                    lat: quake.lat,
                    lng: quake.lng,
                    region: quake.place,
                    metadata: { magnitude: quake.magnitude, depth: quake.depth, tsunami: quake.tsunami },
                });

                geoPoints.push({
                    lat: quake.lat,
                    lng: quake.lng,
                    label: `M${quake.magnitude.toFixed(1)} - ${quake.place}`,
                    value: quake.significance,
                    platform: 'usgs',
                });
            }
            platformStats.usgs = {
                count: quakeData.data.earthquakes.length,
                avgSentiment: -0.3,
            };
        }

        // Sort items by engagement
        allItems.sort((a, b) => b.engagement - a.engagement);

        // Build trending topics (cross-platform)
        const trendingTopics = Object.entries(topicCounts)
            .filter(([_, data]) => data.count >= 2)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 25)
            .map(([word, data]) => ({
                word,
                count: data.count,
                platforms: Array.from(data.platforms),
            }));

        const aggregated: AggregatedData = {
            items: allItems.slice(0, 100),
            platforms: platformStats,
            trendingTopics,
            geoPoints: geoPoints.slice(0, 50),
            stats: {
                totalItems: allItems.length,
                totalPlatforms: Object.keys(platformStats).length,
                avgSentiment: allItems.reduce((a, i) => a + i.sentiment, 0) / allItems.length,
                fetchedAt: new Date().toISOString(),
            },
        };

        const duration = Date.now() - startTime;

        return NextResponse.json({
            ...aggregated,
            debug: {
                duration: `${duration}ms`,
                sourcesRequested: sources,
                sourcesSucceeded: Object.keys(platformStats),
            },
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=120, stale-while-revalidate=60' },
        });
    } catch (error) {
        console.error('Aggregator error:', error);
        return NextResponse.json(
            { error: 'Failed to aggregate data', details: String(error) },
            { status: 500 }
        );
    }
}
