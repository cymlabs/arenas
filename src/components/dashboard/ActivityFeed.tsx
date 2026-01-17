'use client';

import { motion } from 'framer-motion';

interface ActivityEvent {
    id: string;
    type: 'surge' | 'merge' | 'split' | 'emergence' | 'mention';
    description: string;
    timestamp: number;
    color?: string;
}

interface ActivityFeedProps {
    events: ActivityEvent[];
    maxEvents?: number;
}

const eventIcons: Record<string, string> = {
    surge: '📈',
    merge: '🔗',
    split: '⚡',
    emergence: '✨',
    mention: '💬',
};

const eventColors: Record<string, string> = {
    surge: 'text-green-400 border-green-500/30',
    merge: 'text-purple-400 border-purple-500/30',
    split: 'text-orange-400 border-orange-500/30',
    emergence: 'text-cyan-400 border-cyan-500/30',
    mention: 'text-blue-400 border-blue-500/30',
};

export function ActivityFeed({ events, maxEvents = 10 }: ActivityFeedProps) {
    const displayEvents = events.slice(0, maxEvents);

    const getTimeAgo = (timestamp: number) => {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        if (seconds < 60) return `${seconds}s`;
        const minutes = Math.floor(seconds / 60);
        if (minutes < 60) return `${minutes}m`;
        const hours = Math.floor(minutes / 60);
        return `${hours}h`;
    };

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="px-4 py-3 border-b border-white/[0.06] flex items-center justify-between">
                <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    Activity
                </h3>
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-green-400/70 text-[10px] font-mono">LIVE</span>
                </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto no-scrollbar">
                {displayEvents.length === 0 ? (
                    <div className="px-4 py-8 text-center text-white/30 text-xs">
                        No recent activity
                    </div>
                ) : (
                    <div className="divide-y divide-white/[0.04]">
                        {displayEvents.map((event, index) => (
                            <motion.div
                                key={event.id}
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.03 }}
                                className={`px-4 py-3 hover:bg-white/[0.02] transition-colors border-l-2 ${eventColors[event.type] || 'border-white/10'}`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">{eventIcons[event.type] || '•'}</span>
                                    <span className={`text-[10px] font-bold uppercase ${eventColors[event.type]?.split(' ')[0] || 'text-white/50'}`}>
                                        {event.type}
                                    </span>
                                    <span className="text-white/30 text-[10px] ml-auto font-mono">
                                        {getTimeAgo(event.timestamp)}
                                    </span>
                                </div>
                                <p className="text-white/60 text-xs leading-relaxed">
                                    {event.description}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
