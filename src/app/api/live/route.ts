import { NextResponse } from 'next/server';

const REDDIT_BASE_URL = 'https://www.reddit.com';

interface RedditChild {
    data: {
        id: string;
        title: string;
        subreddit: string;
        score: number;
        num_comments: number;
        url: string;
        selftext?: string;
        created_utc: number;
        upvote_ratio: number;
        thumbnail?: string;
        preview?: {
            images?: Array<{
                source?: { url: string; width: number; height: number };
                resolutions?: Array<{ url: string; width: number; height: number }>;
            }>;
        };
        author: string;
        permalink: string;
        domain?: string;
        is_video?: boolean;
        media?: {
            reddit_video?: { fallback_url: string };
        };
    };
}

// Sentiment lexicon
const SENTIMENT_WORDS: Record<string, number> = {
    good: 0.6, great: 0.8, excellent: 0.9, amazing: 0.85, wonderful: 0.8,
    success: 0.7, win: 0.6, victory: 0.7, progress: 0.5, love: 0.7, hope: 0.5,
    bad: -0.6, terrible: -0.8, awful: -0.85, horrible: -0.8, worst: -0.9,
    fail: -0.7, loss: -0.5, problem: -0.4, hate: -0.8, fear: -0.5,
    scandal: -0.6, controversy: -0.4, corrupt: -0.7, fraud: -0.7, crisis: -0.6,
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

// Category classification
const CATEGORY_KEYWORDS: Record<string, string[]> = {
    politics: ['election', 'president', 'congress', 'senate', 'democrat', 'republican', 'vote', 'trump', 'biden', 'governor', 'political', 'government', 'white house'],
    tech: ['ai', 'artificial intelligence', 'google', 'apple', 'microsoft', 'meta', 'software', 'crypto', 'blockchain', 'algorithm', 'data', 'tech'],
    culture: ['movie', 'music', 'art', 'celebrity', 'entertainment', 'sports', 'education', 'religion', 'lifestyle'],
    media: ['news', 'journalist', 'reporter', 'broadcast', 'fox', 'cnn', 'msnbc', 'media', 'press'],
    social: ['twitter', 'tiktok', 'instagram', 'viral', 'influencer', 'trend', 'social media'],
    science: ['research', 'study', 'scientist', 'vaccine', 'medicine', 'health', 'climate', 'environment', 'space'],
};

function classifyCategory(text: string): string {
    const lower = text.toLowerCase();
    let maxScore = 0, maxCat = 'other';
    for (const [cat, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
        const matches = keywords.filter(kw => lower.includes(kw)).length;
        if (matches > maxScore) {
            maxScore = matches;
            maxCat = cat;
        }
    }
    return maxCat;
}

// Stop words for topic extraction
const STOP_WORDS = new Set([
    'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with',
    'by', 'from', 'as', 'is', 'was', 'are', 'were', 'been', 'be', 'have', 'has', 'had',
    'do', 'does', 'did', 'will', 'would', 'could', 'should', 'it', 'its', 'this', 'that',
    'these', 'those', 'i', 'you', 'he', 'she', 'we', 'they', 'what', 'which', 'who',
    'when', 'where', 'why', 'how', 'all', 'each', 'every', 'both', 'few', 'more', 'most',
    'other', 'some', 'such', 'no', 'not', 'only', 'same', 'so', 'than', 'too', 'very',
    'just', 'also', 'now', 'new', 'says', 'said', 'would', 'about', 'after', 'before',
]);

async function fetchRedditData() {
    const subreddits = ['news', 'worldnews', 'politics', 'technology', 'Conservative'];
    const allPosts: RedditChild['data'][] = [];

    for (const sub of subreddits) {
        try {
            const response = await fetch(`${REDDIT_BASE_URL}/r/${sub}/hot.json?limit=30`, {
                headers: { 'User-Agent': 'CultMinds/1.0' },
                next: { revalidate: 300 },
            });
            if (response.ok) {
                const data = await response.json();
                const posts = data.data.children.map((c: RedditChild) => c.data);
                allPosts.push(...posts);
            }
        } catch (e) {
            console.error(`Error fetching r/${sub}:`, e);
        }
    }

    return allPosts;
}

function extractTopics(posts: RedditChild['data'][]) {
    const wordFreq: Record<string, number> = {};
    const bigramFreq: Record<string, number> = {};
    const topicPosts: Record<string, RedditChild['data'][]> = {};

    for (const post of posts) {
        const text = `${post.title} ${post.selftext || ''}`;
        const words = text.toLowerCase()
            .replace(/[^a-z0-9\s]/g, ' ')
            .split(/\s+/)
            .filter(w => w.length > 2 && !STOP_WORDS.has(w));

        // Track which posts contain which words
        for (const word of words) {
            wordFreq[word] = (wordFreq[word] || 0) + 1;
            if (!topicPosts[word]) topicPosts[word] = [];
            if (!topicPosts[word].includes(post)) topicPosts[word].push(post);
        }

        // Bigrams
        for (let i = 0; i < words.length - 1; i++) {
            const bigram = `${words[i]} ${words[i + 1]}`;
            bigramFreq[bigram] = (bigramFreq[bigram] || 0) + 1;
            if (!topicPosts[bigram]) topicPosts[bigram] = [];
            if (!topicPosts[bigram].includes(post)) topicPosts[bigram].push(post);
        }
    }

    // Combine and rank
    const topics: Array<{
        phrase: string;
        frequency: number;
        posts: RedditChild['data'][];
    }> = [];

    // Add bigrams first (more specific)
    Object.entries(bigramFreq)
        .filter(([_, count]) => count >= 2)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 15)
        .forEach(([phrase, count]) => {
            topics.push({ phrase, frequency: count, posts: topicPosts[phrase] || [] });
        });

    // Add single words
    Object.entries(wordFreq)
        .filter(([_, count]) => count >= 3)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 20)
        .forEach(([word, count]) => {
            if (!topics.some(t => t.phrase.includes(word))) {
                topics.push({ phrase: word, frequency: count, posts: topicPosts[word] || [] });
            }
        });

    return topics;
}

// Get best thumbnail from post
function getBestThumbnail(post: RedditChild['data']): string | null {
    // Try preview images first (highest quality)
    if (post.preview?.images?.[0]?.source?.url) {
        return post.preview.images[0].source.url.replace(/&amp;/g, '&');
    }
    // Try resolutions
    if (post.preview?.images?.[0]?.resolutions?.length) {
        const res = post.preview.images[0].resolutions;
        const best = res[res.length - 1]; // Highest resolution
        return best.url.replace(/&amp;/g, '&');
    }
    // Fall back to thumbnail if it's a valid URL
    if (post.thumbnail && post.thumbnail.startsWith('http')) {
        return post.thumbnail;
    }
    return null;
}

// Geographic location assignment based on subreddit/content
function assignGeolocation(post: RedditChild['data']): { lat: number; lng: number; region: string } {
    const text = `${post.title} ${post.subreddit}`.toLowerCase();

    // Check for location mentions
    if (text.includes('china') || text.includes('chinese') || text.includes('beijing')) {
        return { lat: 39.9, lng: 116.4, region: 'Beijing, China' };
    }
    if (text.includes('russia') || text.includes('moscow') || text.includes('putin')) {
        return { lat: 55.8, lng: 37.6, region: 'Moscow, Russia' };
    }
    if (text.includes('uk') || text.includes('britain') || text.includes('london')) {
        return { lat: 51.5, lng: -0.1, region: 'London, UK' };
    }
    if (text.includes('france') || text.includes('paris') || text.includes('macron')) {
        return { lat: 48.9, lng: 2.3, region: 'Paris, France' };
    }
    if (text.includes('germany') || text.includes('berlin')) {
        return { lat: 52.5, lng: 13.4, region: 'Berlin, Germany' };
    }
    if (text.includes('california') || text.includes('silicon valley') || text.includes('san francisco')) {
        return { lat: 37.8, lng: -122.4, region: 'San Francisco, CA' };
    }
    if (text.includes('new york') || text.includes('nyc') || text.includes('wall street')) {
        return { lat: 40.7, lng: -74.0, region: 'New York, NY' };
    }
    if (text.includes('texas') || text.includes('austin') || text.includes('houston')) {
        return { lat: 30.3, lng: -97.7, region: 'Austin, TX' };
    }
    if (text.includes('florida') || text.includes('miami')) {
        return { lat: 25.8, lng: -80.2, region: 'Miami, FL' };
    }
    if (text.includes('canada') || text.includes('toronto') || text.includes('ottawa')) {
        return { lat: 43.7, lng: -79.4, region: 'Toronto, Canada' };
    }
    if (text.includes('australia') || text.includes('sydney')) {
        return { lat: -33.9, lng: 151.2, region: 'Sydney, Australia' };
    }
    if (text.includes('india') || text.includes('delhi') || text.includes('modi')) {
        return { lat: 28.6, lng: 77.2, region: 'Delhi, India' };
    }
    if (text.includes('japan') || text.includes('tokyo')) {
        return { lat: 35.7, lng: 139.7, region: 'Tokyo, Japan' };
    }
    if (text.includes('middle east') || text.includes('israel') || text.includes('iran')) {
        return { lat: 31.8, lng: 35.2, region: 'Middle East' };
    }
    if (text.includes('ukraine') || text.includes('kyiv')) {
        return { lat: 50.4, lng: 30.5, region: 'Kyiv, Ukraine' };
    }

    // Default to Washington DC for US political content
    return { lat: 38.9, lng: -77.0, region: 'Washington, DC' };
}

export async function GET() {
    try {
        const posts = await fetchRedditData();
        const topics = extractTopics(posts);

        const processedTopics = topics.slice(0, 25).map(topic => {
            const relevantPosts = topic.posts.slice(0, 10);
            const totalScore = relevantPosts.reduce((a, p) => a + p.score, 0);
            const totalComments = relevantPosts.reduce((a, p) => a + p.num_comments, 0);

            // Sentiment
            const sentiments = relevantPosts.map(p => analyzeSentiment(p.title));
            const avgSentiment = sentiments.length > 0
                ? sentiments.reduce((a, b) => a + b, 0) / sentiments.length : 0;

            // Category
            const category = classifyCategory(topic.phrase);

            // Velocity based on upvote ratios
            const avgUpvoteRatio = relevantPosts.length > 0
                ? relevantPosts.reduce((a, p) => a + p.upvote_ratio, 0) / relevantPosts.length
                : 0.5;
            const velocity = (avgUpvoteRatio - 0.5) * 2 + (totalScore > 1000 ? 0.2 : 0);

            // Get best thumbnail from posts
            let thumbnail: string | null = null;
            for (const post of relevantPosts) {
                thumbnail = getBestThumbnail(post);
                if (thumbnail) break;
            }

            // Geographic distribution
            const geoPoints = relevantPosts.slice(0, 5).map(post => {
                const geo = assignGeolocation(post);
                return {
                    ...geo,
                    value: post.score,
                    label: topic.phrase,
                    thumbnail: getBestThumbnail(post),
                };
            });

            return {
                id: topic.phrase.replace(/\s+/g, '-').toLowerCase(),
                name: topic.phrase.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
                frequency: topic.frequency,
                mentions: totalScore + totalComments,
                sentiment: avgSentiment,
                velocity: Math.max(-1, Math.min(1, velocity)),
                category,
                thumbnail,
                geoPoints,
                sources: relevantPosts.map(p => ({
                    platform: 'reddit',
                    subreddit: p.subreddit,
                    title: p.title,
                    score: p.score,
                    comments: p.num_comments,
                    url: `https://reddit.com${p.permalink}`,
                    sentiment: analyzeSentiment(p.title),
                    created: new Date(p.created_utc * 1000).toISOString(),
                    thumbnail: getBestThumbnail(p),
                    author: p.author,
                    domain: p.domain,
                    isVideo: p.is_video,
                    videoUrl: p.media?.reddit_video?.fallback_url,
                })),
                relatedTopics: topics
                    .filter(t => t.phrase !== topic.phrase)
                    .slice(0, 5)
                    .map(t => t.phrase),
                lastUpdated: new Date().toISOString(),
            };
        });

        return NextResponse.json({
            topics: processedTopics,
            stats: {
                totalPosts: posts.length,
                topicsExtracted: processedTopics.length,
                avgSentiment: processedTopics.reduce((a, t) => a + t.sentiment, 0) / processedTopics.length,
                subreddits: [...new Set(posts.map(p => p.subreddit))],
                fetchedAt: new Date().toISOString(),
            },
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=120' },
        });
    } catch (error) {
        console.error('Live API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch live data', details: String(error) },
            { status: 500 }
        );
    }
}
