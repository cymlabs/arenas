'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { ThemeToggle } from '@/contexts/ThemeContext';

interface FloatingNavbarProps {
    currentTime?: string;
    onMenuClick?: () => void;
}

export function FloatingNavbar({ currentTime, onMenuClick }: FloatingNavbarProps) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Track scroll to add backdrop when scrolled
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <>
            {/* Large hover zone (invisible) */}
            <div
                className="fixed top-0 left-0 right-0 h-[120px] z-50"
                onMouseEnter={() => setIsExpanded(true)}
                onMouseLeave={() => setIsExpanded(false)}
            >
                {/* Actual navbar */}
                <motion.nav
                    className="absolute top-0 left-0 right-0 px-6 flex items-center justify-between"
                    initial={false}
                    animate={{
                        height: isExpanded ? 64 : 48,
                        opacity: isExpanded ? 1 : 0.8,
                        backgroundColor: isExpanded
                            ? 'rgba(0, 0, 0, 0.90)'
                            : 'rgba(0, 0, 0, 0.6)',
                    }}
                    transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                    style={{
                        backdropFilter: isScrolled || isExpanded ? 'blur(12px)' : 'none',
                        borderBottom: isExpanded ? '1px solid rgba(255, 255, 255, 0.06)' : 'none',
                    }}
                >
                    {/* Left: Logo */}
                    <Link href="/dashboard" className="flex items-center gap-2">
                        <motion.div
                            className="rounded-full bg-gradient-to-br from-blue-500 to-cyan-400"
                            animate={{ width: isExpanded ? 28 : 20, height: isExpanded ? 28 : 20 }}
                            transition={{ duration: 0.3 }}
                        />
                        <AnimatePresence>
                            {isExpanded && (
                                <motion.span
                                    className="text-white font-semibold text-sm whitespace-nowrap"
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    CULTURE MINDS <span className="text-blue-400">360</span>
                                </motion.span>
                            )}
                        </AnimatePresence>
                    </Link>

                    {/* Center: Navigation (shown when expanded) */}
                    <AnimatePresence>
                        {isExpanded && (
                            <motion.div
                                className="flex items-center gap-6 text-sm"
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2, delay: 0.1 }}
                            >
                                <Link href="/dashboard" className="text-white/70 hover:text-white transition-colors">
                                    Dashboard
                                </Link>
                                <Link href="/profile/nick-fuentes" className="text-white/70 hover:text-white transition-colors">
                                    Voices
                                </Link>
                                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                                    Topics
                                </Link>
                                <Link href="#" className="text-white/70 hover:text-white transition-colors">
                                    Clusters
                                </Link>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Right: Actions */}
                    <div className="flex items-center gap-3">
                        {/* Theme toggle (always visible but smaller when collapsed) */}
                        <motion.div
                            animate={{ scale: isExpanded ? 1 : 0.8 }}
                            transition={{ duration: 0.2 }}
                        >
                            <ThemeToggle />
                        </motion.div>

                        {/* Time display (only when expanded) */}
                        <AnimatePresence>
                            {isExpanded && currentTime && (
                                <motion.div
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5"
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <span className="text-white/40 text-xs font-mono">{currentTime}</span>
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Menu button (only when collapsed) */}
                        <AnimatePresence>
                            {!isExpanded && (
                                <motion.button
                                    className="text-white/40 hover:text-white/70 transition-colors"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    onClick={onMenuClick}
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </motion.button>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.nav>
            </div>

            {/* Spacer to push content below navbar */}
            <div className="h-8" />
        </>
    );
}
