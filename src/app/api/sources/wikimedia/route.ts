import { NextResponse } from 'next/server';

// Wikimedia EventStreams - Recent Changes
// Docs: https://wikitech.wikimedia.org/wiki/Event_Platform/EventStreams

const WIKIMEDIA_RECENT_CHANGES = 'https://stream.wikimedia.org/v2/stream/recentchange';

interface WikiChange {
    id: number;
    type: string;
    namespace: number;
    title: string;
    title_url: string;
    comment: string;
    timestamp: number;
    user: string;
    bot: boolean;
    minor: boolean;
    length?: { old: number; new: number };
    revision?: { old: number; new: number };
    server_url: string;
    wiki: string;
    meta: {
        domain: string;
        uri: string;
    };
}

interface ProcessedEdit {
    id: string;
    platform: 'wikipedia';
    title: string;
    url: string;
    author: string;
    comment: string;
    wiki: string;
    created: string;
    changeSize: number;
    isBot: boolean;
    isMinor: boolean;
    sentiment: number;
}

// For SSE we'll use a polling approach to get recent data
// since Edge runtime doesn't support long-lived SSE connections well
const WIKIMEDIA_API = 'https://en.wikipedia.org/w/api.php';

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100);

    try {
        // Use MediaWiki API to get recent changes
        const params = new URLSearchParams({
            action: 'query',
            list: 'recentchanges',
            rcprop: 'title|ids|sizes|flags|user|timestamp|comment',
            rclimit: limit.toString(),
            rctype: 'edit|new',
            rcshow: '!bot', // Exclude bot edits
            format: 'json',
            origin: '*',
        });

        const res = await fetch(`${WIKIMEDIA_API}?${params}`, {
            headers: { 'User-Agent': 'CULTMINDS/1.0' },
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            throw new Error(`Wikimedia API responded with ${res.status}`);
        }

        const data = await res.json();
        const changes = data.query?.recentchanges || [];

        const processedEdits: ProcessedEdit[] = changes.map((change: {
            rcid: number;
            title: string;
            user: string;
            comment?: string;
            timestamp: string;
            oldlen?: number;
            newlen?: number;
            bot?: boolean;
            minor?: boolean;
        }) => ({
            id: `wiki-${change.rcid}`,
            platform: 'wikipedia' as const,
            title: change.title,
            url: `https://en.wikipedia.org/wiki/${encodeURIComponent(change.title.replace(/ /g, '_'))}`,
            author: change.user,
            comment: change.comment || '',
            wiki: 'en.wikipedia.org',
            created: change.timestamp,
            changeSize: (change.newlen || 0) - (change.oldlen || 0),
            isBot: change.bot || false,
            isMinor: change.minor || false,
            sentiment: analyzeSentiment(change.comment || ''),
        }));

        // Extract topic categories from page titles
        const topicCounts: Record<string, number> = {};
        const stopWords = new Set(['the', 'of', 'and', 'in', 'to', 'a', 'is', 'for', 'on', 'with']);

        for (const edit of processedEdits) {
            const words = edit.title.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').split(/\s+/);
            for (const word of words) {
                if (word.length > 3 && !stopWords.has(word)) {
                    topicCounts[word] = (topicCounts[word] || 0) + 1;
                }
            }
        }

        const hotTopics = Object.entries(topicCounts)
            .filter(([_, count]) => count >= 2)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 15)
            .map(([word, count]) => ({ word, count }));

        // Stats
        const totalAdditions = processedEdits.filter(e => e.changeSize > 0).reduce((a, e) => a + e.changeSize, 0);
        const totalDeletions = processedEdits.filter(e => e.changeSize < 0).reduce((a, e) => a + Math.abs(e.changeSize), 0);

        return NextResponse.json({
            platform: 'wikipedia',
            edits: processedEdits,
            stats: {
                total: processedEdits.length,
                avgChangeSize: processedEdits.reduce((a, e) => a + Math.abs(e.changeSize), 0) / processedEdits.length,
                totalAdditions,
                totalDeletions,
                uniqueEditors: new Set(processedEdits.map(e => e.author)).size,
                avgSentiment: processedEdits.reduce((a, e) => a + e.sentiment, 0) / processedEdits.length,
            },
            hotTopics,
            fetchedAt: new Date().toISOString(),
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
        });
    } catch (error) {
        console.error('Wikimedia API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch Wikipedia data', details: String(error) },
            { status: 500 }
        );
    }
}

function analyzeSentiment(text: string): number {
    const positive = ['added', 'fixed', 'improved', 'updated', 'expanded', 'corrected', 'clarified'];
    const negative = ['removed', 'reverted', 'deleted', 'vandalism', 'spam', 'blocked'];

    const lower = text.toLowerCase();
    let score = 0;

    for (const word of positive) {
        if (lower.includes(word)) score += 0.3;
    }
    for (const word of negative) {
        if (lower.includes(word)) score -= 0.3;
    }

    return Math.max(-1, Math.min(1, score));
}
