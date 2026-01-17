'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { BubbleData } from '@/components/charts/PackedBubbleChart';

interface TopicDetailModalProps {
    topic: BubbleData | null;
    onClose: () => void;
    relatedVoices?: Array<{
        id: string;
        name: string;
        mentions: number;
        sentiment: number;
    }>;
}

export function TopicDetailModal({ topic, onClose, relatedVoices = [] }: TopicDetailModalProps) {
    if (!topic) return null;

    const sentimentLabel = topic.sentiment > 0.2 ? 'Positive' : topic.sentiment < -0.2 ? 'Negative' : 'Neutral';
    const sentimentColor = topic.sentiment > 0.2 ? 'text-green-400' : topic.sentiment < -0.2 ? 'text-red-400' : 'text-white/50';

    return (
        <AnimatePresence>
            {topic && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[90vw] z-50"
                    >
                        <div className="rounded-2xl bg-[#0a0a0f] border border-white/10 overflow-hidden">
                            {/* Header */}
                            <div className="p-6 border-b border-white/[0.06]">
                                <div className="flex items-start justify-between">
                                    <div>
                                        <div className="flex items-center gap-3 mb-2">
                                            <div
                                                className="w-4 h-4 rounded-full"
                                                style={{
                                                    backgroundColor: topic.category === 'politics' ? '#ef4444' :
                                                        topic.category === 'tech' ? '#3b82f6' :
                                                            topic.category === 'media' ? '#f97316' : '#8b5cf6'
                                                }}
                                            />
                                            <span className="text-white/40 text-xs uppercase tracking-wider">
                                                {topic.category}
                                            </span>
                                        </div>
                                        <h2 className="text-white text-xl font-bold">{topic.label}</h2>
                                    </div>

                                    <button
                                        onClick={onClose}
                                        className="text-white/40 hover:text-white/70 transition-colors text-xl"
                                    >
                                        ×
                                    </button>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4 p-6 border-b border-white/[0.06]">
                                <div>
                                    <div className="text-white/40 text-xs mb-1">Mentions</div>
                                    <div className="text-white text-lg font-bold tabular-nums">
                                        {(topic.value / 1000).toFixed(0)}K
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white/40 text-xs mb-1">Velocity</div>
                                    <div className={`text-lg font-bold tabular-nums ${topic.velocity > 0 ? 'text-green-400' : 'text-red-400'
                                        }`}>
                                        {topic.velocity > 0 ? '+' : ''}{(topic.velocity * 100).toFixed(0)}%
                                    </div>
                                </div>
                                <div>
                                    <div className="text-white/40 text-xs mb-1">Sentiment</div>
                                    <div className={`text-lg font-bold ${sentimentColor}`}>
                                        {sentimentLabel}
                                    </div>
                                </div>
                            </div>

                            {/* Noise/Volatility indicator (4th dimension) */}
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/40 text-xs">Volatility (discourse stability)</span>
                                    <span className="text-white/60 text-xs font-mono">
                                        {Math.round(Math.abs(topic.sentiment) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-cyan-500 to-purple-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${Math.abs(topic.sentiment) * 100}%` }}
                                        transition={{ duration: 0.5 }}
                                    />
                                </div>
                            </div>

                            {/* Freshness indicator (5th dimension) */}
                            <div className="px-6 py-4 border-b border-white/[0.06]">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-white/40 text-xs">Freshness (emergence age)</span>
                                    <span className="text-white/60 text-xs font-mono">
                                        {Math.round((1 - Math.abs(topic.velocity)) * 100)}%
                                    </span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <motion.div
                                        className="h-full bg-gradient-to-r from-green-500 to-yellow-500"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(1 - Math.abs(topic.velocity)) * 100}%` }}
                                        transition={{ duration: 0.5, delay: 0.1 }}
                                    />
                                </div>
                            </div>

                            {/* Related Voices */}
                            {relatedVoices.length > 0 && (
                                <div className="p-6">
                                    <h3 className="text-white/60 text-xs uppercase tracking-wider mb-3">
                                        Top Voices on This Topic
                                    </h3>
                                    <div className="space-y-2">
                                        {relatedVoices.filter(v => v && v.name).slice(0, 5).map((voice) => (
                                            <div key={voice.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/[0.02]">
                                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white text-xs font-bold">
                                                    {voice.name?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1">
                                                    <div className="text-white text-sm">{voice.name}</div>
                                                    <div className="text-white/40 text-xs">{voice.mentions} mentions</div>
                                                </div>
                                                <div className={`text-xs font-mono ${voice.sentiment > 0 ? 'text-green-400' : 'text-red-400'
                                                    }`}>
                                                    {voice.sentiment > 0 ? '+' : ''}{(voice.sentiment * 100).toFixed(0)}%
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="p-6 bg-white/[0.02] flex items-center gap-3">
                                <button className="flex-1 py-2.5 px-4 rounded-lg bg-blue-500/20 text-blue-400 text-sm font-medium hover:bg-blue-500/30 transition-colors">
                                    View Timeline
                                </button>
                                <button className="flex-1 py-2.5 px-4 rounded-lg bg-white/5 text-white/70 text-sm font-medium hover:bg-white/10 transition-colors">
                                    Set Alert
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
