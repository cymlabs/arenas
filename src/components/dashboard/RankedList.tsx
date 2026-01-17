'use client';

import { motion } from 'framer-motion';

interface RankedItem {
    id: string;
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    color?: string;
    subtitle?: string;
}

interface RankedListProps {
    title: string;
    items: RankedItem[];
    maxItems?: number;
    onItemClick?: (item: RankedItem) => void;
    showRank?: boolean;
}

export function RankedList({
    title,
    items,
    maxItems = 5,
    onItemClick,
    showRank = true,
}: RankedListProps) {
    const displayItems = items.slice(0, maxItems);

    return (
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.06]">
            <div className="px-4 py-3 border-b border-white/[0.06]">
                <h3 className="text-white/70 text-xs font-semibold uppercase tracking-wider">
                    {title}
                </h3>
            </div>

            <div className="divide-y divide-white/[0.04]">
                {displayItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                        onClick={() => onItemClick?.(item)}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-white/[0.03] transition-colors cursor-pointer group"
                    >
                        {showRank && (
                            <span className="text-white/30 text-xs font-mono w-4 text-right">
                                {index + 1}
                            </span>
                        )}

                        {item.color && (
                            <div
                                className="w-2 h-2 rounded-full flex-shrink-0"
                                style={{ backgroundColor: item.color }}
                            />
                        )}

                        <div className="flex-1 min-w-0">
                            <div className="text-white text-sm font-medium truncate group-hover:text-white/90">
                                {item.label}
                            </div>
                            {item.subtitle && (
                                <div className="text-white/40 text-xs truncate">
                                    {item.subtitle}
                                </div>
                            )}
                        </div>

                        <div className="text-right flex-shrink-0">
                            <div className="text-white/70 text-sm font-mono">
                                {item.value}
                            </div>
                            {item.change && (
                                <div className={`text-xs font-mono ${item.changeType === 'positive' ? 'text-green-400' :
                                        item.changeType === 'negative' ? 'text-red-400' :
                                            'text-white/40'
                                    }`}>
                                    {item.change}
                                </div>
                            )}
                        </div>
                    </motion.div>
                ))}
            </div>

            {items.length > maxItems && (
                <div className="px-4 py-2 border-t border-white/[0.06]">
                    <button className="text-white/40 text-xs hover:text-white/60 transition-colors">
                        View all {items.length} →
                    </button>
                </div>
            )}
        </div>
    );
}
