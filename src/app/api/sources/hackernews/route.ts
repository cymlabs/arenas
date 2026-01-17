import { NextResponse } from 'next/server';

const HN_API_BASE = 'https://hacker-news.firebaseio.com/v0';

interface HNStory {
    id: number;
    title: string;
    url?: string;
    score: number;
    by: string;
    time: number;
    descendants: number;
    text?: string;
    type: string;
}

interface ProcessedStory {
    id: string;
    platform: 'hackernews';
    title: string;
    url: string;
    score: number;
    author: string;
    comments: number;
    created: string;
    domain?: string;
    text?: string;
    sentiment: number;
}

// Sentiment analysis
const SENTIMENT_WORDS: Record<string, number> = {
    amazing: 0.8, awesome: 0.8, great: 0.7, good: 0.5, love: 0.7, excellent: 0.8,
    better: 0.4, best: 0.6, impressive: 0.6, revolutionary: 0.7, breakthrough: 0.7,
    bad: -0.5, terrible: -0.8, awful: -0.7, hate: -0.7, worst: -0.8, broken: -0.5,
    failed: -0.6, disappointing: -0.6, scam: -0.8, dead: -0.4, killed: -0.5,
};

function analyzeSentiment(text: string): number {
    const words = text.toLowerCase().split(/\s+/);
    let score = 0, count = 0;
    for (const word of words) {
        const clean = word.replace(/[^a-z]/g, '');
        if (clean in SENTIMENT_WORDS) {
            score += SENTIMENT_WORDS[clean];
            count++;
        }
    }
    return count > 0 ? Math.max(-1, Math.min(1, score / Math.sqrt(count))) : 0;
}

function extractDomain(url?: string): string | undefined {
    if (!url) return undefined;
    try {
        const domain = new URL(url).hostname.replace('www.', '');
        return domain;
    } catch {
        return undefined;
    }
}

async function fetchStory(id: number): Promise<HNStory | null> {
    try {
        const res = await fetch(`${HN_API_BASE}/item/${id}.json`, {
            next: { revalidate: 300 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'top'; // top, new, best
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    try {
        // Fetch story IDs
        const idsRes = await fetch(`${HN_API_BASE}/${type}stories.json`, {
            next: { revalidate: 300 },
        });

        if (!idsRes.ok) {
            throw new Error('Failed to fetch HN story IDs');
        }

        const storyIds: number[] = await idsRes.json();
        const selectedIds = storyIds.slice(0, limit);

        // Fetch stories in parallel (batches of 10)
        const stories: ProcessedStory[] = [];
        const batchSize = 10;

        for (let i = 0; i < selectedIds.length; i += batchSize) {
            const batch = selectedIds.slice(i, i + batchSize);
            const batchResults = await Promise.all(batch.map(fetchStory));

            for (const story of batchResults) {
                if (story && story.type === 'story' && story.title) {
                    stories.push({
                        id: `hn-${story.id}`,
                        platform: 'hackernews',
                        title: story.title,
                        url: story.url || `https://news.ycombinator.com/item?id=${story.id}`,
                        score: story.score || 0,
                        author: story.by || 'anonymous',
                        comments: story.descendants || 0,
                        created: new Date(story.time * 1000).toISOString(),
                        domain: extractDomain(story.url),
                        text: story.text?.slice(0, 500),
                        sentiment: analyzeSentiment(story.title),
                    });
                }
            }
        }

        // Extract topics from titles
        const topicCounts: Record<string, number> = {};
        const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'shall']);

        for (const story of stories) {
            const words = story.title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
            for (const word of words) {
                if (word.length > 3 && !stopWords.has(word)) {
                    topicCounts[word] = (topicCounts[word] || 0) + 1;
                }
            }
        }

        const trendingTopics = Object.entries(topicCounts)
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word, count]) => ({ word, count }));

        return NextResponse.json({
            platform: 'hackernews',
            type,
            stories,
            stats: {
                total: stories.length,
                avgScore: stories.reduce((a, s) => a + s.score, 0) / stories.length,
                avgComments: stories.reduce((a, s) => a + s.comments, 0) / stories.length,
                avgSentiment: stories.reduce((a, s) => a + s.sentiment, 0) / stories.length,
                topDomains: [...new Set(stories.map(s => s.domain).filter(Boolean))].slice(0, 10),
            },
            trendingTopics,
            fetchedAt: new Date().toISOString(),
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
        });
    } catch (error) {
        console.error('HN API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Hacker News data', details: String(error) },
            { status: 500 }
        );
    }
}
