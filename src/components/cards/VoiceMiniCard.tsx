'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

/**
 * VoiceMiniCard - Compact voice display for lists and sidebars
 * Shows avatar, name, top topics, and quick stats
 */

interface VoiceMiniCardProps {
    id: string;
    name: string;
    handle?: string;
    avatar?: string;
    accentColor?: string;
    platform?: 'twitter' | 'youtube' | 'rumble' | 'podcast';
    topTopics?: string[];
    stats?: {
        reach?: string;
        engagement?: string;
        velocity?: string;
    };
    trending?: boolean;
    className?: string;
    onClick?: () => void;
}

const platformIcons: Record<string, string> = {
    twitter: '𝕏',
    youtube: '▶',
    rumble: 'R',
    podcast: '🎙',
};

const platformColors: Record<string, string> = {
    twitter: '#1DA1F2',
    youtube: '#FF0000',
    rumble: '#85C742',
    podcast: '#9B59B6',
};

export function VoiceMiniCard({
    id,
    name,
    handle,
    avatar,
    accentColor = '#3b82f6',
    platform,
    topTopics = [],
    stats,
    trending = false,
    className = '',
    onClick,
}: VoiceMiniCardProps) {
    return (
        <Link href={`/profile/${id}`} onClick={onClick}>
            <motion.div
                className={`
                    group p-3 rounded-xl bg-white/[0.02] border border-white/[0.06]
                    hover:bg-white/[0.05] hover:border-white/[0.12]
                    hover:-translate-y-0.5 transition-all cursor-pointer
                    ${className}
                `}
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
            >
                <div className="flex items-center gap-3">
                    {/* Avatar */}
                    <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                        style={{
                            background: avatar
                                ? `url(${avatar}) center/cover`
                                : `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                        }}
                    >
                        {!avatar && name.charAt(0)}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="font-medium text-white text-sm truncate group-hover:text-white/90">
                                {name}
                            </span>
                            {trending && (
                                <span className="px-1.5 py-0.5 text-[9px] bg-amber-500/20 text-amber-400 rounded-full">
                                    🔥
                                </span>
                            )}
                            {platform && (
                                <span
                                    className="text-[10px]"
                                    style={{ color: platformColors[platform] }}
                                >
                                    {platformIcons[platform]}
                                </span>
                            )}
                        </div>
                        {handle && (
                            <p className="text-xs text-white/40 truncate">{handle}</p>
                        )}
                    </div>

                    {/* Quick Stats */}
                    {stats?.engagement && (
                        <div className="text-right flex-shrink-0">
                            <div className="text-xs font-semibold text-green-400">
                                {stats.engagement}
                            </div>
                            <div className="text-[10px] text-white/30">engagement</div>
                        </div>
                    )}
                </div>

                {/* Top Topics */}
                {topTopics.length > 0 && (
                    <div className="flex gap-1 mt-2 overflow-hidden">
                        {topTopics.slice(0, 2).map((topic) => (
                            <span
                                key={topic}
                                className="px-2 py-0.5 text-[10px] bg-white/5 rounded text-white/50 truncate"
                            >
                                {topic}
                            </span>
                        ))}
                        {topTopics.length > 2 && (
                            <span className="text-[10px] text-white/30">
                                +{topTopics.length - 2}
                            </span>
                        )}
                    </div>
                )}
            </motion.div>
        </Link>
    );
}

export default VoiceMiniCard;
