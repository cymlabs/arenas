'use client';

import { ReactNode, useState } from 'react';
import { motion } from 'framer-motion';

interface GlowingCardProps {
    children: ReactNode;
    className?: string;
    glowColor?: string;
    hoverGlow?: boolean;
    onClick?: () => void;
}

export function GlowingCard({
    children,
    className = '',
    glowColor = 'rgba(255, 255, 255, 0.1)',
    hoverGlow = true,
    onClick,
}: GlowingCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            className={`relative ${onClick ? 'cursor-pointer' : ''} ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={onClick}
            whileHover={hoverGlow ? { scale: 1.01 } : undefined}
            transition={{ duration: 0.2 }}
        >
            {/* Glow border effect */}
            <div
                className="absolute -inset-[1px] rounded-xl transition-opacity duration-300"
                style={{
                    background: `linear-gradient(135deg, ${glowColor}, transparent, ${glowColor})`,
                    opacity: isHovered && hoverGlow ? 1 : 0.3,
                    filter: isHovered ? 'blur(1px)' : 'blur(0px)',
                }}
            />

            {/* Card content */}
            <div className="relative rounded-xl bg-black/80 dark:bg-black/80 light:bg-white/80 backdrop-blur-sm border border-white/[0.08] dark:border-white/[0.08] light:border-black/[0.08] p-5 h-full">
                {children}
            </div>
        </motion.div>
    );
}

// Aceternity-style bordered card with gradient glow
interface AceternityCardProps {
    title: string;
    description?: string;
    icon?: ReactNode;
    children?: ReactNode;
    className?: string;
    accentColor?: string;
}

export function AceternityCard({
    title,
    description,
    icon,
    children,
    className = '',
    accentColor = '#ffffff',
}: AceternityCardProps) {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        setMousePosition({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top,
        });
    };

    return (
        <motion.div
            className={`group relative rounded-xl overflow-hidden ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onMouseMove={handleMouseMove}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
        >
            {/* Animated border gradient that follows mouse */}
            <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
                style={{
                    background: isHovered
                        ? `radial-gradient(400px circle at ${mousePosition.x}px ${mousePosition.y}px, ${accentColor}20, transparent 40%)`
                        : 'transparent',
                }}
            />

            {/* Border */}
            <div className="absolute inset-0 rounded-xl border border-white/[0.1] group-hover:border-white/[0.2] transition-colors duration-300" />

            {/* Content */}
            <div className="relative bg-neutral-950/80 backdrop-blur-sm p-6 h-full">
                {icon && (
                    <div className="mb-4 text-2xl">{icon}</div>
                )}
                <h3 className="text-white font-semibold text-lg mb-2">{title}</h3>
                {description && (
                    <p className="text-white/50 text-sm">{description}</p>
                )}
                {children}
            </div>
        </motion.div>
    );
}

// Stats card with glowing accent
interface StatCardProps {
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: ReactNode;
    accentColor?: string;
}

export function StatCard({
    label,
    value,
    change,
    changeType = 'neutral',
    icon,
    accentColor = '#3b82f6',
}: StatCardProps) {
    return (
        <GlowingCard glowColor={accentColor + '40'}>
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-white/40 text-xs uppercase tracking-wider mb-1">{label}</p>
                    <p className="text-white text-2xl font-bold">{value}</p>
                    {change && (
                        <p className={`text-xs mt-1 ${changeType === 'positive' ? 'text-green-400' :
                                changeType === 'negative' ? 'text-red-400' :
                                    'text-white/40'
                            }`}>
                            {change}
                        </p>
                    )}
                </div>
                {icon && (
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center text-xl"
                        style={{ backgroundColor: accentColor + '20', color: accentColor }}
                    >
                        {icon}
                    </div>
                )}
            </div>
        </GlowingCard>
    );
}

// Profile card with image and glowing border
interface ProfileCardProps {
    name: string;
    subtitle?: string;
    image?: string;
    stats?: { label: string; value: string }[];
    accentColor?: string;
    onClick?: () => void;
}

export function ProfileCard({
    name,
    subtitle,
    image,
    stats = [],
    accentColor = '#f97316',
    onClick,
}: ProfileCardProps) {
    return (
        <GlowingCard glowColor={accentColor} onClick={onClick}>
            <div className="flex items-center gap-4">
                {/* Avatar */}
                <div
                    className="w-16 h-16 rounded-full flex items-center justify-center text-white text-xl font-bold flex-shrink-0"
                    style={{
                        background: image ? `url(${image}) center/cover` : `linear-gradient(135deg, ${accentColor}, ${accentColor}80)`,
                    }}
                >
                    {!image && name.charAt(0)}
                </div>

                <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-lg truncate">{name}</h3>
                    {subtitle && (
                        <p className="text-white/40 text-sm truncate">{subtitle}</p>
                    )}
                </div>
            </div>

            {stats.length > 0 && (
                <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white/[0.06]">
                    {stats.map((stat, i) => (
                        <div key={i}>
                            <p className="text-white/40 text-xs">{stat.label}</p>
                            <p className="text-white font-mono text-sm">{stat.value}</p>
                        </div>
                    ))}
                </div>
            )}
        </GlowingCard>
    );
}
