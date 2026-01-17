import { NextResponse } from 'next/server';

const GITHUB_EVENTS_API = 'https://api.github.com/events';

interface GitHubEvent {
    id: string;
    type: string;
    actor: {
        id: number;
        login: string;
        display_login: string;
        avatar_url: string;
    };
    repo: {
        id: number;
        name: string;
        url: string;
    };
    payload: {
        action?: string;
        ref?: string;
        ref_type?: string;
        description?: string;
        master_branch?: string;
        pusher_type?: string;
        commits?: Array<{ message: string }>;
        pull_request?: { title: string; body?: string };
        issue?: { title: string; body?: string };
        release?: { name: string; body?: string; tag_name: string };
        comment?: { body: string };
    };
    public: boolean;
    created_at: string;
}

interface ProcessedEvent {
    id: string;
    platform: 'github';
    type: string;
    title: string;
    description?: string;
    url: string;
    author: string;
    authorAvatar: string;
    repo: string;
    created: string;
    sentiment: number;
}

const SENTIMENT_WORDS: Record<string, number> = {
    fix: 0.4, fixed: 0.5, add: 0.3, added: 0.3, update: 0.2, improve: 0.4, improved: 0.5,
    feature: 0.5, enhancement: 0.4, optimize: 0.4, release: 0.5, new: 0.3, support: 0.3,
    bug: -0.3, issue: -0.2, error: -0.4, broken: -0.5, failed: -0.5, deprecated: -0.3,
    remove: -0.2, removed: -0.2, revert: -0.3, breaking: -0.4, vulnerability: -0.6,
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

function getEventTitle(event: GitHubEvent): string {
    switch (event.type) {
        case 'PushEvent':
            const commits = event.payload.commits?.length || 0;
            return `Pushed ${commits} commit${commits !== 1 ? 's' : ''} to ${event.repo.name}`;
        case 'CreateEvent':
            return `Created ${event.payload.ref_type} ${event.payload.ref || ''} in ${event.repo.name}`;
        case 'DeleteEvent':
            return `Deleted ${event.payload.ref_type} ${event.payload.ref || ''} from ${event.repo.name}`;
        case 'PullRequestEvent':
            return event.payload.pull_request?.title || `PR ${event.payload.action} on ${event.repo.name}`;
        case 'IssuesEvent':
            return event.payload.issue?.title || `Issue ${event.payload.action} on ${event.repo.name}`;
        case 'IssueCommentEvent':
            return `Commented on issue in ${event.repo.name}`;
        case 'WatchEvent':
            return `Starred ${event.repo.name}`;
        case 'ForkEvent':
            return `Forked ${event.repo.name}`;
        case 'ReleaseEvent':
            return event.payload.release?.name || `Released ${event.payload.release?.tag_name} for ${event.repo.name}`;
        case 'PublicEvent':
            return `Made ${event.repo.name} public`;
        default:
            return `${event.type.replace('Event', '')} on ${event.repo.name}`;
    }
}

function getEventDescription(event: GitHubEvent): string | undefined {
    if (event.payload.commits?.length) {
        return event.payload.commits[0].message;
    }
    if (event.payload.pull_request?.body) {
        return event.payload.pull_request.body.slice(0, 200);
    }
    if (event.payload.issue?.body) {
        return event.payload.issue.body.slice(0, 200);
    }
    if (event.payload.release?.body) {
        return event.payload.release.body.slice(0, 200);
    }
    if (event.payload.description) {
        return event.payload.description;
    }
    return undefined;
}

export async function GET() {
    try {
        const res = await fetch(GITHUB_EVENTS_API, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'CULTMINDS/1.0',
            },
            next: { revalidate: 60 },
        });

        if (!res.ok) {
            throw new Error(`GitHub API responded with ${res.status}`);
        }

        const events: GitHubEvent[] = await res.json();

        const processedEvents: ProcessedEvent[] = events
            .filter(e => e.public)
            .map(event => {
                const title = getEventTitle(event);
                const description = getEventDescription(event);
                return {
                    id: `gh-${event.id}`,
                    platform: 'github' as const,
                    type: event.type,
                    title,
                    description,
                    url: `https://github.com/${event.repo.name}`,
                    author: event.actor.login,
                    authorAvatar: event.actor.avatar_url,
                    repo: event.repo.name,
                    created: event.created_at,
                    sentiment: analyzeSentiment(`${title} ${description || ''}`),
                };
            });

        // Extract trending repos
        const repoCounts: Record<string, { count: number; stars: number }> = {};
        for (const event of processedEvents) {
            if (!repoCounts[event.repo]) {
                repoCounts[event.repo] = { count: 0, stars: 0 };
            }
            repoCounts[event.repo].count++;
            if (event.type === 'WatchEvent') {
                repoCounts[event.repo].stars++;
            }
        }

        const trendingRepos = Object.entries(repoCounts)
            .sort((a, b) => b[1].count - a[1].count)
            .slice(0, 10)
            .map(([repo, data]) => ({ repo, ...data }));

        // Event type breakdown
        const eventTypes: Record<string, number> = {};
        for (const event of processedEvents) {
            eventTypes[event.type] = (eventTypes[event.type] || 0) + 1;
        }

        return NextResponse.json({
            platform: 'github',
            events: processedEvents,
            stats: {
                total: processedEvents.length,
                avgSentiment: processedEvents.reduce((a, e) => a + e.sentiment, 0) / processedEvents.length,
                eventTypes,
            },
            trendingRepos,
            fetchedAt: new Date().toISOString(),
        }, {
            headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=30' },
        });
    } catch (error) {
        console.error('GitHub API error:', error);
        return NextResponse.json(
            { error: 'Failed to fetch GitHub events', details: String(error) },
            { status: 500 }
        );
    }
}
