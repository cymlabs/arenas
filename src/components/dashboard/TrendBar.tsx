'use client';

interface TrendItem {
    id: string;
    label: string;
    change: string;
    changeType: 'positive' | 'negative' | 'neutral';
    sparkline: number[];
}

interface TrendBarProps {
    trends: TrendItem[];
}

export function TrendBar({ trends }: TrendBarProps) {
    return (
        <div className="flex items-center gap-6 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/[0.06] overflow-x-auto no-scrollbar">
            {trends.map((trend, i) => (
                <div key={trend.id} className="flex items-center gap-3 flex-shrink-0">
                    {i > 0 && <div className="w-px h-8 bg-white/10" />}

                    <div className="flex items-center gap-3">
                        <Sparkline data={trend.sparkline} positive={trend.changeType === 'positive'} />

                        <div>
                            <div className="text-white/80 text-xs font-medium whitespace-nowrap">
                                {trend.label}
                            </div>
                            <div className={`text-[10px] font-mono ${trend.changeType === 'positive' ? 'text-green-400' :
                                    trend.changeType === 'negative' ? 'text-red-400' :
                                        'text-white/40'
                                }`}>
                                {trend.change}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

interface SparklineProps {
    data: number[];
    positive?: boolean;
    width?: number;
    height?: number;
}

function Sparkline({ data, positive = true, width = 40, height = 20 }: SparklineProps) {
    if (data.length < 2) return null;

    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;

    const points = data.map((value, i) => {
        const x = (i / (data.length - 1)) * width;
        const y = height - ((value - min) / range) * height * 0.8 - height * 0.1;
        return `${x},${y}`;
    }).join(' ');

    const color = positive ? '#22c55e' : '#ef4444';

    // Create area fill path
    const areaPath = `M0,${height} L${points.split(' ').map((p, i) => {
        if (i === 0) return p;
        return 'L' + p;
    }).join(' ')} L${width},${height} Z`;

    return (
        <svg width={width} height={height} className="flex-shrink-0">
            <defs>
                <linearGradient id={`sparkGrad-${positive}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path
                d={areaPath.replace(/L/g, ' L').replace('M0', 'M 0')}
                fill={`url(#sparkGrad-${positive})`}
            />
            <polyline
                points={points}
                fill="none"
                stroke={color}
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
            />
        </svg>
    );
}
