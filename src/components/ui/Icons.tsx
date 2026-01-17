// Professional SVG Icon Library for CULTMINDS
// No emojis - clean vector icons only

import React from 'react';

interface IconProps {
    className?: string;
    size?: number;
}

// Platform Icons
export function RedditIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
    );
}

export function HackerNewsIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M0 0v24h24V0H0zm12.3 13.5v5.4h-1V13L7.3 5.6h1.2l3.3 6.4 3.3-6.4h1.2l-4 7.9z" />
        </svg>
    );
}

export function GitHubIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
        </svg>
    );
}

export function WikipediaIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12.09 13.119c-.936 1.932-2.217 4.548-2.853 5.728-.616 1.074-1.127.931-1.532.029-1.406-3.321-4.293-9.144-5.651-12.409-.251-.601-.441-.987-.619-1.139-.181-.15-.554-.24-1.122-.271C.103 5.033 0 4.982 0 4.898v-.455l.052-.045c.924-.005 5.401 0 5.401 0l.051.045v.434c0 .119-.075.176-.225.176l-.564.031c-.485.029-.727.164-.727.436 0 .135.053.33.166.602 1.632 3.963 3.524 7.867 5.234 11.86l.076.155.09-.178c.566-1.121 1.166-2.318 1.806-3.599l.089-.178-.06-.14c-1.23-2.931-2.449-5.866-3.611-8.752-.193-.478-.381-.783-.612-.935-.244-.157-.653-.243-1.221-.253-.152 0-.225-.058-.225-.177v-.433l.052-.045h4.989l.051.045v.434c0 .118-.075.176-.225.176l-.339.007c-.618.013-.906.166-.906.456 0 .117.061.306.186.576l2.558 5.983.087.191.09-.191c.768-1.64 1.559-3.295 2.352-4.959.162-.338.243-.6.243-.788 0-.385-.327-.579-.987-.579l-.318.002c-.151 0-.226-.057-.226-.176v-.434l.052-.045h3.921l.05.045v.434c0 .087-.072.157-.217.167-.631.036-1.086.164-1.359.388a4.373 4.373 0 0 0-.827 1.119l-2.855 5.901-.073.148.069.157 3.56 7.931c.231.513.453.814.663.906.215.091.619.14 1.218.14.152 0 .224.056.224.176v.434l-.052.044h-5.108l-.051-.044v-.434c0-.12.075-.176.227-.176.629 0 1.044-.063 1.241-.19.199-.127.3-.341.3-.646 0-.133-.057-.321-.172-.566l-2.854-6.405-.089-.191z" />
        </svg>
    );
}

export function GlobeIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="2" y1="12" x2="22" y2="12" />
            <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
    );
}

// UI Icons
export function TrendingUpIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
            <polyline points="17 6 23 6 23 12" />
        </svg>
    );
}

export function TrendingDownIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
            <polyline points="17 18 23 18 23 12" />
        </svg>
    );
}

export function FireIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 23c-4.97 0-9-3.58-9-8 0-3.35 2.04-6.01 4.61-8.02.98-.77.61-2.31-.55-2.49A.85.85 0 0 1 6.5 4c0-.55.45-1 1-1 .18 0 .35.05.5.13C11.36 5.11 15 8.59 15 12c0 1.65-.67 3.15-1.76 4.24a6.22 6.22 0 0 1-3.24 1.69c0 .02 0 .04-.01.07a1 1 0 0 1-1.99 0V17c0-2.21 1.79-4 4-4a4.002 4.002 0 0 0 3.58-5.78A10.96 10.96 0 0 1 21 15c0 4.42-4.03 8-9 8z" />
        </svg>
    );
}

export function ChartIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="20" x2="18" y2="10" />
            <line x1="12" y1="20" x2="12" y2="4" />
            <line x1="6" y1="20" x2="6" y2="14" />
        </svg>
    );
}

export function UsersIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    );
}

export function MessageIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
    );
}

export function SearchIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
    );
}

export function FilterIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
    );
}

export function ExpandIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 3 21 3 21 9" />
            <polyline points="9 21 3 21 3 15" />
            <line x1="21" y1="3" x2="14" y2="10" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    );
}

export function CollapseIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="4 14 10 14 10 20" />
            <polyline points="20 10 14 10 14 4" />
            <line x1="14" y1="10" x2="21" y2="3" />
            <line x1="3" y1="21" x2="10" y2="14" />
        </svg>
    );
}

export function ArrowRightIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="5" y1="12" x2="19" y2="12" />
            <polyline points="12 5 19 12 12 19" />
        </svg>
    );
}

export function ExternalLinkIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
            <polyline points="15 3 21 3 21 9" />
            <line x1="10" y1="14" x2="21" y2="3" />
        </svg>
    );
}

export function CloseIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
    );
}

export function MapPinIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
        </svg>
    );
}

export function ActivityIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
        </svg>
    );
}

export function LayersIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
        </svg>
    );
}

export function ZapIcon({ className = '', size = 20 }: IconProps) {
    return (
        <svg className={className} width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
        </svg>
    );
}

// Get platform icon component
export function getPlatformIcon(platform: string): React.FC<IconProps> {
    switch (platform.toLowerCase()) {
        case 'reddit': return RedditIcon;
        case 'hackernews': return HackerNewsIcon;
        case 'github': return GitHubIcon;
        case 'wikipedia': return WikipediaIcon;
        case 'usgs': return GlobeIcon;
        default: return GlobeIcon;
    }
}

// Platform colors (no emojis)
export const platformColors: Record<string, string> = {
    reddit: '#FF4500',
    hackernews: '#FF6600',
    github: '#6e5494',
    wikipedia: '#636466',
    usgs: '#228B22',
};

export const categoryColors: Record<string, string> = {
    politics: '#ef4444',
    tech: '#3b82f6',
    culture: '#8b5cf6',
    media: '#f97316',
    social: '#ec4899',
    science: '#22c55e',
    world: '#06b6d4',
    other: '#64748b',
};
