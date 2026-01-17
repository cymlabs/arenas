'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';

interface Source {
    platform: string;
    subreddit?: string;
    title: string;
    score: number;
    comments: number;
    url: string;
    sentiment: number;
    created: string;
    thumbnail?: string | null;
    author?: string;
    domain?: string;
    isVideo?: boolean;
    videoUrl?: string;
}

interface SourceCardProps {
    source: Source;
    index?: number;
    onClick?: () => void;
}

// Platform icons
const platformIcons: Record<string, React.ReactNode> = {
    reddit: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.464 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z" />
        </svg>
    ),
    twitter: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
    ),
    youtube: (
        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
    ),
};

const platformColors: Record<string, string> = {
    reddit: '#FF4500',
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    news: '#6366f1',
};

export function SourceCard({ source, index = 0, onClick }: SourceCardProps) {
    const [imageError, setImageError] = useState(false);
    const [imageLoaded, setImageLoaded] = useState(false);

    const platform = source.platform || 'reddit';
    const platformColor = platformColors[platform] || '#6366f1';
    const timeAgo = getTimeAgo(new Date(source.created));

    return (
        <motion.a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.04, duration: 0.3 }}
            onClick={onClick}
            className="group block"
        >
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-900/80 to-slate-950/80 border border-white/[0.08] hover:border-white/20 transition-all duration-300 hover:shadow-lg hover:shadow-black/20">
                <div className="flex gap-4 p-4">
                    {/* Thumbnail */}
                    <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-slate-800">
                        {source.thumbnail && !imageError ? (
                            <>
                                <img
                                    src={source.thumbnail}
                                    alt=""
                                    onError={() => setImageError(true)}
                                    onLoad={() => setImageLoaded(true)}
                                    className={`w-full h-full object-cover transition-opacity duration-300 ${imageLoaded ? 'opacity-100' : 'opacity-0'}`}
                                />
                                {!imageLoaded && (
                                    <div className="absolute inset-0 animate-pulse bg-gradient-to-br from-slate-700 to-slate-800" />
                                )}
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-white/20">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9.5a2 2 0 00-2-2h-2" />
                                </svg>
                            </div>
                        )}

                        {/* Video indicator */}
                        {source.isVideo && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                                <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur flex items-center justify-center">
                                    <svg className="w-5 h-5 text-white ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M8 5v14l11-7z" />
                                    </svg>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0 flex flex-col">
                        <h4 className="font-medium text-white text-sm leading-snug line-clamp-2 group-hover:text-white/90 transition-colors mb-2">
                            {source.title}
                        </h4>

                        {/* Meta row */}
                        <div className="flex items-center gap-3 text-xs text-white/40 mt-auto">
                            {/* Platform */}
                            <div className="flex items-center gap-1.5" style={{ color: platformColor }}>
                                {platformIcons[platform]}
                                {source.subreddit && <span>r/{source.subreddit}</span>}
                            </div>

                            {/* Stats */}
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z" />
                                    </svg>
                                    {formatNumber(source.score)}
                                </span>
                                <span className="flex items-center gap-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                    </svg>
                                    {source.comments}
                                </span>
                            </div>

                            {/* Sentiment */}
                            <div className={`ml-auto px-2 py-0.5 rounded text-[10px] font-medium ${source.sentiment > 0.1
                                    ? 'bg-green-500/20 text-green-400'
                                    : source.sentiment < -0.1
                                        ? 'bg-red-500/20 text-red-400'
                                        : 'bg-slate-500/20 text-slate-400'
                                }`}>
                                {source.sentiment > 0.1 ? '↑' : source.sentiment < -0.1 ? '↓' : '○'} {Math.abs(source.sentiment).toFixed(2)}
                            </div>
                        </div>

                        {/* Author & time */}
                        <div className="flex items-center gap-2 text-[10px] text-white/30 mt-2">
                            {source.author && <span>u/{source.author}</span>}
                            <span>•</span>
                            <span>{timeAgo}</span>
                            {source.domain && source.domain !== 'self.' + source.subreddit && (
                                <>
                                    <span>•</span>
                                    <span className="text-white/40">{source.domain}</span>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Arrow */}
                    <div className="flex-shrink-0 self-center text-white/20 group-hover:text-white/40 group-hover:translate-x-1 transition-all">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                    </div>
                </div>

                {/* Hover gradient */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            </div>
        </motion.a>
    );
}

// Source list component
interface SourceListProps {
    sources: Source[];
    title?: string;
    subtitle?: string;
    maxItems?: number;
}

export function SourceList({ sources, title, subtitle, maxItems = 10 }: SourceListProps) {
    const displayedSources = sources.slice(0, maxItems);

    return (
        <div className="space-y-4">
            {(title || subtitle) && (
                <div className="flex items-end justify-between">
                    <div>
                        {title && <h3 className="text-lg font-semibold text-white">{title}</h3>}
                        {subtitle && <p className="text-sm text-white/40">{subtitle}</p>}
                    </div>
                    <span className="text-xs text-white/30">{sources.length} sources</span>
                </div>
            )}
            <div className="space-y-3">
                {displayedSources.map((source, i) => (
                    <SourceCard key={`${source.url}-${i}`} source={source} index={i} />
                ))}
            </div>
        </div>
    );
}

// Utility functions
function formatNumber(num: number): string {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function getTimeAgo(date: Date): string {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return date.toLocaleDateString();
}
