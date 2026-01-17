'use client';

import { motion } from 'framer-motion';

interface KPICardProps {
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: React.ReactNode;
    sparkline?: number[];
}

export function KPICard({
    label,
    value,
    change,
    changeType = 'neutral',
    icon,
    sparkline,
}: KPICardProps) {
    const changeColor = {
        positive: 'text-green-400',
        negative: 'text-red-400',
        neutral: 'text-white/40',
    }[changeType];

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.05] transition-all"
        >
            <div className="flex items-start justify-between mb-2">
                <span className="text-white/50 text-xs font-medium uppercase tracking-wider">
                    {label}
                </span>
                {icon && <span className="text-white/30">{icon}</span>}
            </div>

            <div className="flex items-end justify-between">
                <div>
                    <div className="text-2xl font-bold text-white tabular-nums">
                        {value}
                    </div>
                    {change && (
                        <div className={`text-xs font-medium mt-1 ${changeColor}`}>
                            {changeType === 'positive' && '↑ '}
                            {changeType === 'negative' && '↓ '}
                            {change}
                        </div>
                    )}
                </div>

                {sparkline && sparkline.length > 0 && (
                    <MiniSparkline data={sparkline} positive={changeType === 'positive'} />
                )}
            </div>
        </motion.div>
    );
}

interface MiniSparklineProps {
    data: number[];
    positive?: boolean;
    width?: number;
    height?: number;
}

function MiniSparkline({ data, positive = true, width = 50, height = 24 }: MiniSparklineProps) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height;
        return `${x},${y}`;
    }).join(' ');

    const color = positive ? '#22c55e' : '#ef4444';

    return (
        <svg width={width} height={height} className="opacity-60">
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
            {/* End dot */}
            <circle
                cx={(data.length - 1) / (data.length - 1) * width}
                cy={height - ((data[data.length - 1] - min) / range) * height}
                r="2"
                fill={color}
            />
        </svg>
    );
}

interface KPIGridProps {
    kpis: KPICardProps[];
}

export function KPIGrid({ kpis }: KPIGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3">
            {kpis.map((kpi, i) => (
                <KPICard key={i} {...kpi} />
            ))}
        </div>
    );
}
