import { NextResponse } from 'next/server';

// Fetch profile data from Wikipedia for a given name
const WIKI_API = 'https://en.wikipedia.org/api/rest_v1/page/summary';
const WIKI_SEARCH = 'https://en.wikipedia.org/w/api.php';

interface WikiSummary {
    title: string;
    extract: string;
    thumbnail?: {
        source: string;
        width: number;
        height: number;
    };
    description?: string;
    content_urls?: {
        desktop: { page: string };
    };
}

interface ProfileData {
    id: string;
    name: string;
    title?: string;
    description?: string;
    bio?: string;
    thumbnail?: string;
    wikiUrl?: string;
    categories?: string[];
    relatedTopics?: string[];
}

async function searchWikipedia(query: string): Promise<string | null> {
    const params = new URLSearchParams({
        action: 'query',
        list: 'search',
        srsearch: query,
        srlimit: '1',
        format: 'json',
        origin: '*',
    });

    try {
        const res = await fetch(`${WIKI_SEARCH}?${params}`, {
            headers: { 'User-Agent': 'CULTMINDS/1.0' },
        });
        if (!res.ok) return null;

        const data = await res.json();
        return data.query?.search?.[0]?.title || null;
    } catch {
        return null;
    }
}

async function fetchWikiSummary(title: string): Promise<WikiSummary | null> {
    try {
        const res = await fetch(`${WIKI_API}/${encodeURIComponent(title)}`, {
            headers: { 'User-Agent': 'CULTMINDS/1.0' },
            next: { revalidate: 3600 },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch {
        return null;
    }
}

async function fetchWikiCategories(title: string): Promise<string[]> {
    const params = new URLSearchParams({
        action: 'query',
        titles: title,
        prop: 'categories',
        cllimit: '10',
        format: 'json',
        origin: '*',
    });

    try {
        const res = await fetch(`${WIKI_SEARCH}?${params}`, {
            headers: { 'User-Agent': 'CULTMINDS/1.0' },
        });
        if (!res.ok) return [];

        const data = await res.json();
        const pages = data.query?.pages;
        if (!pages) return [];

        const page = Object.values(pages)[0] as { categories?: Array<{ title: string }> };
        return (page.categories || [])
            .map((c: { title: string }) => c.title.replace('Category:', ''))
            .filter((c: string) => !c.includes('Wikipedia') && !c.includes('Articles'));
    } catch {
        return [];
    }
}

async function fetchRelatedLinks(title: string): Promise<string[]> {
    const params = new URLSearchParams({
        action: 'query',
        titles: title,
        prop: 'links',
        pllimit: '20',
        format: 'json',
        origin: '*',
    });

    try {
        const res = await fetch(`${WIKI_SEARCH}?${params}`, {
            headers: { 'User-Agent': 'CULTMINDS/1.0' },
        });
        if (!res.ok) return [];

        const data = await res.json();
        const pages = data.query?.pages;
        if (!pages) return [];

        const page = Object.values(pages)[0] as { links?: Array<{ title: string }> };
        return (page.links || [])
            .map((l: { title: string }) => l.title)
            .filter((t: string) => !t.includes(':'))
            .slice(0, 10);
    } catch {
        return [];
    }
}

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');

    if (!name) {
        return NextResponse.json(
            { error: 'Name parameter required' },
            { status: 400 }
        );
    }

    try {
        // Search for the person on Wikipedia
        const wikiTitle = await searchWikipedia(name);

        if (!wikiTitle) {
            return NextResponse.json({
                id: name.toLowerCase().replace(/\s+/g, '-'),
                name,
                description: 'Profile data not available',
                bio: null,
                thumbnail: null,
                wikiUrl: null,
                categories: [],
                relatedTopics: [],
            });
        }

        // Fetch summary, categories, and related links in parallel
        const [summary, categories, related] = await Promise.all([
            fetchWikiSummary(wikiTitle),
            fetchWikiCategories(wikiTitle),
            fetchRelatedLinks(wikiTitle),
        ]);

        const profile: ProfileData = {
            id: name.toLowerCase().replace(/\s+/g, '-'),
            name: summary?.title || name,
            title: summary?.description,
            description: summary?.description,
            bio: summary?.extract,
            thumbnail: summary?.thumbnail?.source,
            wikiUrl: summary?.content_urls?.desktop?.page,
            categories,
            relatedTopics: related,
        };

        return NextResponse.json(profile, {
            headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=600' },
        });
    } catch (error) {
        console.error('Profile API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch profile', details: String(error) },
            { status: 500 }
        );
    }
}
