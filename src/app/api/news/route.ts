import { NextResponse } from 'next/server';

// RSS parsing for news feeds
async function parseRSSFeed(url: string, source: string, category: string) {
    try {
        const response = await fetch(url, {
            headers: { 'User-Agent': 'CultureMinds360/1.0' },
        });

        if (!response.ok) return [];

        const text = await response.text();
        const articles: NewsArticle[] = [];

        // Simple XML parsing for RSS items
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        const titleRegex = /<title><!\[CDATA\[(.*?)\]\]>|<title>(.*?)<\/title>/;
        const descRegex = /<description><!\[CDATA\[(.*?)\]\]>|<description>(.*?)<\/description>/;
        const linkRegex = /<link>(.*?)<\/link>/;
        const pubDateRegex = /<pubDate>(.*?)<\/pubDate>/;

        let match;
        while ((match = itemRegex.exec(text)) !== null) {
            const item = match[1];

            const titleMatch = titleRegex.exec(item);
            const descMatch = descRegex.exec(item);
            const linkMatch = linkRegex.exec(item);
            const dateMatch = pubDateRegex.exec(item);

            const title = titleMatch?.[1] || titleMatch?.[2] || '';
            const description = descMatch?.[1] || descMatch?.[2] || '';

            if (title) {
                articles.push({
                    id: `${source}-${articles.length}`,
                    title: title.replace(/<[^>]*>/g, '').trim(),
                    description: description.replace(/<[^>]*>/g, '').slice(0, 300).trim(),
                    source,
                    url: linkMatch?.[1] || '',
                    publishedAt: dateMatch?.[1] ? new Date(dateMatch[1]) : new Date(),
                    category,
                });
            }
        }

        return articles;
    } catch (error) {
        console.error(`RSS fetch error for ${source}:`, error);
        return [];
    }
}

interface NewsArticle {
    id: string;
    title: string;
    description: string;
    source: string;
    url: string;
    publishedAt: Date;
    category: string;
}

export async function GET() {
    const feeds = [
        { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/topNews', category: 'news' },
        { name: 'BBC', url: 'https://feeds.bbci.co.uk/news/rss.xml', category: 'news' },
        { name: 'NPR', url: 'https://feeds.npr.org/1001/rss.xml', category: 'news' },
    ];

    const results = await Promise.allSettled(
        feeds.map(feed => parseRSSFeed(feed.url, feed.name, feed.category))
    );

    const articles = results
        .filter((r): r is PromiseFulfilledResult<NewsArticle[]> => r.status === 'fulfilled')
        .flatMap(r => r.value)
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
        .slice(0, 50);

    return NextResponse.json(articles, {
        headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=300',
        },
    });
}
