'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode, MouseEvent, useState, useRef } from 'react';

// ================================================================
// PREMIUM CARD COMPONENT - Aceternity Style
// ================================================================

interface PremiumCardProps extends HTMLMotionProps<'div'> {
    children: ReactNode;
    variant?: 'default' | 'glow' | 'interactive';
    className?: string;
    onClick?: () => void;
    as?: 'div' | 'article' | 'section';
}

export function PremiumCard({
    children,
    variant = 'default',
    className = '',
    onClick,
    ...props
}: PremiumCardProps) {
    const [ripplePos, setRipplePos] = useState({ x: 0, y: 0 });
    const [showRipple, setShowRipple] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);

    const handleClick = (e: MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        setRipplePos({
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        });
        setShowRipple(true);
        setTimeout(() => setShowRipple(false), 600);
        onClick?.();
    };

    const baseClasses = `
        relative overflow-hidden rounded-2xl
        bg-[rgba(15,15,25,0.4)] backdrop-blur-xl
        border border-white/[0.08]
        transition-all duration-300 ease-out
    `;

    const glowClasses = variant === 'glow' ? `
        shadow-[0_0_1px_rgba(255,255,255,0.1),inset_0_0_20px_rgba(59,130,246,0.03)]
        hover:shadow-[0_0_2px_rgba(255,255,255,0.2),0_20px_50px_rgba(0,0,0,0.5),0_0_80px_rgba(59,130,246,0.15)]
    ` : '';

    const interactiveClasses = variant === 'interactive' ? `
        cursor-pointer
        hover:bg-[rgba(25,25,40,0.5)] hover:border-white/[0.15]
        hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(0,0,0,0.4)]
        active:scale-[0.99] active:translate-y-0
    ` : '';

    return (
        <motion.div
            ref={cardRef}
            className={`${baseClasses} ${glowClasses} ${interactiveClasses} ${className}`}
            onClick={onClick ? handleClick : undefined}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            {...props}
        >
            {/* Metallic shine overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-white/[0.03] pointer-events-none z-10" />

            {/* Gradient border on hover */}
            <div className="absolute inset-0 rounded-2xl opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none z-0
                before:absolute before:inset-0 before:rounded-2xl before:p-px
                before:bg-gradient-to-br before:from-white/20 before:via-white/5 before:to-white/10
                before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)]
                before:[mask-composite:exclude]"
            />

            {/* Click ripple effect */}
            {showRipple && (
                <motion.div
                    className="absolute rounded-full bg-white/20 pointer-events-none z-20"
                    style={{ left: ripplePos.x, top: ripplePos.y }}
                    initial={{ width: 0, height: 0, x: 0, y: 0, opacity: 1 }}
                    animate={{ width: 400, height: 400, x: -200, y: -200, opacity: 0 }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                />
            )}

            {/* Content */}
            <div className="relative z-10">
                {children}
            </div>
        </motion.div>
    );
}

// ================================================================
// PREMIUM BUTTON COMPONENT
// ================================================================

interface PremiumButtonProps {
    children: ReactNode;
    variant?: 'default' | 'primary' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    className?: string;
    onClick?: () => void;
    disabled?: boolean;
    icon?: ReactNode;
    iconPosition?: 'left' | 'right';
}

export function PremiumButton({
    children,
    variant = 'default',
    size = 'md',
    className = '',
    onClick,
    disabled = false,
    icon,
    iconPosition = 'left'
}: PremiumButtonProps) {
    const sizeClasses = {
        sm: 'px-3 py-1.5 text-xs gap-1.5',
        md: 'px-5 py-2.5 text-sm gap-2',
        lg: 'px-7 py-3 text-base gap-2.5'
    };

    const variantClasses = {
        default: `
            bg-white/[0.05] border-white/10 text-white/90
            hover:bg-white/[0.1] hover:border-white/20
        `,
        primary: `
            bg-gradient-to-r from-blue-600 to-blue-500 border-blue-500/50 text-white
            hover:from-blue-500 hover:to-blue-400
            shadow-[0_4px_15px_rgba(59,130,246,0.3)]
            hover:shadow-[0_6px_25px_rgba(59,130,246,0.5)]
        `,
        ghost: `
            bg-transparent border-transparent text-white/70
            hover:bg-white/[0.05] hover:text-white/90
        `,
        danger: `
            bg-gradient-to-r from-red-600 to-red-500 border-red-500/50 text-white
            hover:from-red-500 hover:to-red-400
            shadow-[0_4px_15px_rgba(239,68,68,0.3)]
        `
    };

    return (
        <motion.button
            className={`
                relative inline-flex items-center justify-center
                font-medium rounded-xl border
                transition-all duration-200 ease-out
                hover:-translate-y-0.5
                active:translate-y-0 active:scale-[0.98]
                disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0
                ${sizeClasses[size]}
                ${variantClasses[variant]}
                ${className}
            `}
            onClick={onClick}
            disabled={disabled}
            whileTap={{ scale: 0.98 }}
        >
            {/* Shine overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 via-transparent to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none" />

            {icon && iconPosition === 'left' && <span>{icon}</span>}
            {children}
            {icon && iconPosition === 'right' && <span>{icon}</span>}
        </motion.button>
    );
}

// ================================================================
// PREMIUM INPUT COMPONENT
// ================================================================

interface PremiumInputProps {
    type?: string;
    placeholder?: string;
    value?: string;
    onChange?: (value: string) => void;
    className?: string;
    icon?: ReactNode;
    label?: string;
}

export function PremiumInput({
    type = 'text',
    placeholder,
    value,
    onChange,
    className = '',
    icon,
    label
}: PremiumInputProps) {
    return (
        <div className={`relative ${className}`}>
            {label && (
                <label className="block text-xs text-white/50 mb-1.5 ml-1">{label}</label>
            )}
            <div className="relative">
                {icon && (
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30">
                        {icon}
                    </div>
                )}
                <input
                    type={type}
                    placeholder={placeholder}
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className={`
                        w-full py-3 text-sm text-white/90
                        bg-white/[0.03] border border-white/[0.08] rounded-xl
                        placeholder:text-white/30
                        focus:bg-white/[0.05] focus:border-blue-500/50
                        focus:shadow-[0_0_0_3px_rgba(59,130,246,0.1),0_0_20px_rgba(59,130,246,0.1)]
                        outline-none transition-all duration-200
                        ${icon ? 'pl-10 pr-4' : 'px-4'}
                    `}
                />
            </div>
        </div>
    );
}

// ================================================================
// FIXED BOTTOM NAVIGATION
// ================================================================

interface NavItem {
    id: string;
    icon: ReactNode;
    label: string;
    onClick?: () => void;
}

interface FixedBottomNavProps {
    items: NavItem[];
    activeId?: string;
    onItemClick?: (id: string) => void;
    className?: string;
}

export function FixedBottomNav({
    items,
    activeId,
    onItemClick,
    className = ''
}: FixedBottomNavProps) {
    return (
        <motion.nav
            className={`
                fixed bottom-6 left-1/2 -translate-x-1/2 z-50
                flex items-center gap-1 p-2
                bg-black/80 backdrop-blur-2xl
                border border-white/10 rounded-2xl
                shadow-[0_20px_50px_rgba(0,0,0,0.5),0_0_1px_rgba(255,255,255,0.2)]
                ${className}
            `}
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
            {items.map((item) => (
                <motion.button
                    key={item.id}
                    className={`
                        flex items-center justify-center
                        w-11 h-11 text-lg rounded-xl
                        transition-all duration-200
                        ${activeId === item.id
                            ? 'text-white bg-gradient-to-br from-blue-500 to-purple-600 shadow-[0_4px_20px_rgba(59,130,246,0.4)]'
                            : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                        }
                    `}
                    onClick={() => {
                        item.onClick?.();
                        onItemClick?.(item.id);
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title={item.label}
                >
                    {item.icon}
                </motion.button>
            ))}
        </motion.nav>
    );
}

// ================================================================
// PREMIUM BADGE COMPONENT
// ================================================================

interface PremiumBadgeProps {
    children: ReactNode;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'md';
    className?: string;
}

export function PremiumBadge({
    children,
    variant = 'default',
    size = 'sm',
    className = ''
}: PremiumBadgeProps) {
    const variantClasses = {
        default: 'bg-white/10 text-white/70 border-white/10',
        success: 'bg-green-500/10 text-green-400 border-green-500/20',
        warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
        danger: 'bg-red-500/10 text-red-400 border-red-500/20',
        info: 'bg-blue-500/10 text-blue-400 border-blue-500/20'
    };

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[10px]',
        md: 'px-3 py-1 text-xs'
    };

    return (
        <span className={`
            inline-flex items-center gap-1
            font-medium rounded-full border
            ${variantClasses[variant]}
            ${sizeClasses[size]}
            ${className}
        `}>
            {children}
        </span>
    );
}

// ================================================================
// PREMIUM STAT CARD
// ================================================================

interface PremiumStatCardProps {
    label: string;
    value: string | number;
    change?: string;
    changeType?: 'positive' | 'negative' | 'neutral';
    icon?: ReactNode;
    className?: string;
}

export function PremiumStatCard({
    label,
    value,
    change,
    changeType = 'neutral',
    icon,
    className = ''
}: PremiumStatCardProps) {
    const changeColors = {
        positive: 'text-green-400',
        negative: 'text-red-400',
        neutral: 'text-white/50'
    };

    return (
        <PremiumCard variant="glow" className={`p-5 ${className}`}>
            <div className="flex items-start justify-between mb-3">
                <span className="text-xs text-white/50 uppercase tracking-wider">{label}</span>
                {icon && <span className="text-white/30">{icon}</span>}
            </div>
            <div className="text-3xl font-bold text-white mb-1">{value}</div>
            {change && (
                <div className={`text-xs ${changeColors[changeType]}`}>
                    {change}
                </div>
            )}
        </PremiumCard>
    );
}

// ================================================================
// SECTION HEADER COMPONENT
// ================================================================

interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    action?: ReactNode;
    className?: string;
}

export function SectionHeader({
    title,
    subtitle,
    action,
    className = ''
}: SectionHeaderProps) {
    return (
        <div className={`flex items-end justify-between mb-6 ${className}`}>
            <div>
                <h2 className="text-xl font-bold text-white">{title}</h2>
                {subtitle && (
                    <p className="text-sm text-white/50 mt-1">{subtitle}</p>
                )}
            </div>
            {action}
        </div>
    );
}

// ================================================================
// PAGE HEADER COMPONENT
// ================================================================

interface PageHeaderProps {
    title: string;
    description?: string;
    breadcrumbs?: Array<{ label: string; href?: string }>;
    actions?: ReactNode;
    className?: string;
}

export function PageHeader({
    title,
    description,
    breadcrumbs,
    actions,
    className = ''
}: PageHeaderProps) {
    return (
        <header className={`mb-8 ${className}`}>
            {breadcrumbs && breadcrumbs.length > 0 && (
                <nav className="flex items-center gap-2 text-sm text-white/40 mb-4">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-2">
                            {i > 0 && <span>/</span>}
                            {crumb.href ? (
                                <a href={crumb.href} className="hover:text-white/70 transition-colors">
                                    {crumb.label}
                                </a>
                            ) : (
                                <span className="text-white/60">{crumb.label}</span>
                            )}
                        </span>
                    ))}
                </nav>
            )}
            <div className="flex items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">{title}</h1>
                    {description && (
                        <p className="text-white/50 max-w-2xl">{description}</p>
                    )}
                </div>
                {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
        </header>
    );
}

// ================================================================
// LOADING SKELETON
// ================================================================

interface SkeletonProps {
    width?: string | number;
    height?: string | number;
    className?: string;
    variant?: 'text' | 'circle' | 'rect';
}

export function Skeleton({
    width,
    height,
    className = '',
    variant = 'rect'
}: SkeletonProps) {
    const baseClasses = `
        animate-pulse bg-white/5
        ${variant === 'circle' ? 'rounded-full' : 'rounded-lg'}
    `;

    return (
        <div
            className={`${baseClasses} ${className}`}
            style={{
                width: width ?? '100%',
                height: height ?? (variant === 'text' ? '1em' : variant === 'circle' ? 40 : 100)
            }}
        />
    );
}

// ================================================================
// EMPTY STATE COMPONENT
// ================================================================

interface EmptyStateProps {
    icon?: ReactNode;
    title: string;
    description?: string;
    action?: ReactNode;
    className?: string;
}

export function EmptyState({
    icon,
    title,
    description,
    action,
    className = ''
}: EmptyStateProps) {
    return (
        <div className={`flex flex-col items-center justify-center py-16 text-center ${className}`}>
            {icon && (
                <div className="w-16 h-16 flex items-center justify-center text-3xl text-white/20 mb-4">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-medium text-white/80 mb-2">{title}</h3>
            {description && (
                <p className="text-sm text-white/40 max-w-md mb-6">{description}</p>
            )}
            {action}
        </div>
    );
}
