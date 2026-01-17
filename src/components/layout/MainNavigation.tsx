'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Search } from './Search';

const navLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: '◉' },
    { href: '/topics', label: 'Topics', icon: '◎' },
    { href: '/voices', label: 'Voices', icon: '◈' },
    { href: '/narratives', label: 'Narratives', icon: '◇' },
    { href: '/stance', label: 'Stance Engine', icon: '⚡' },
    { href: '/regions', label: 'Regions', icon: '◆' },
    { href: '/trends', label: 'Trends', icon: '△' },
];

export function MainNavigation() {
    const pathname = usePathname();
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    return (
        <>
            {/* Desktop Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 hidden md:block">
                <div className="mx-4 mt-4">
                    <div className="max-w-7xl mx-auto px-6 py-3 bg-black/60 backdrop-blur-xl border border-white/10 rounded-2xl">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-3 group">
                                <div className="relative w-10 h-10">
                                    {/* Animated logo ring */}
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-violet-500 via-blue-500 to-cyan-400 animate-spin-slow opacity-80" />
                                    <div className="absolute inset-[2px] rounded-full bg-black flex items-center justify-center">
                                        <span className="text-lg font-black bg-gradient-to-br from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                                            C
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-lg font-black tracking-tight text-white">
                                        CULT<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">MINDS</span>
                                    </span>
                                    <span className="text-[9px] tracking-[0.2em] text-white/40 uppercase -mt-1">
                                        Intelligence Platform
                                    </span>
                                </div>
                            </Link>

                            {/* Navigation Links */}
                            <div className="flex items-center gap-1">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href || pathname?.startsWith(link.href + '/');
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            className="relative px-4 py-2 group"
                                        >
                                            <span className={`relative z-10 text-sm font-medium transition-colors ${isActive ? 'text-white' : 'text-white/50 group-hover:text-white/80'
                                                }`}>
                                                {link.label}
                                            </span>
                                            {isActive && (
                                                <motion.div
                                                    layoutId="activeNav"
                                                    className="absolute inset-0 bg-white/10 rounded-lg"
                                                    transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                                                />
                                            )}
                                        </Link>
                                    );
                                })}
                            </div>

                            {/* Right section */}
                            <div className="flex items-center gap-4">
                                {/* Search Component */}
                                <Search />

                                {/* Simulation Badge */}
                                <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 bg-yellow-500/10 border border-yellow-500/20 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" />
                                    <span className="text-xs text-yellow-500 font-medium tracking-wide">SIMULATION MODE</span>
                                </div>

                                {/* Live indicator */}
                                <div className="flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-full">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-xs text-green-400 font-medium">Live</span>
                                </div>

                                {/* Profile */}
                                <button className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-purple-500/20">
                                    U
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Mobile Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 md:hidden">
                <div className="mx-3 mt-3">
                    <div className="px-4 py-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-xl">
                        <div className="flex items-center justify-between">
                            {/* Logo */}
                            <Link href="/" className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-cyan-500 flex items-center justify-center">
                                    <span className="text-sm font-black text-white">C</span>
                                </div>
                                <span className="text-base font-black text-white">
                                    CULT<span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">MINDS</span>
                                </span>
                            </Link>

                            {/* Mobile menu button */}
                            <button
                                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                                className="p-2 text-white/60"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {mobileMenuOpen ? (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    ) : (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    )}
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile menu */}
                <AnimatePresence>
                    {mobileMenuOpen && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mx-3 mt-2 p-4 bg-black/95 backdrop-blur-xl border border-white/10 rounded-xl"
                        >
                            <div className="space-y-1">
                                {navLinks.map((link) => {
                                    const isActive = pathname === link.href;
                                    return (
                                        <Link
                                            key={link.href}
                                            href={link.href}
                                            onClick={() => setMobileMenuOpen(false)}
                                            className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                                ? 'bg-white/10 text-white'
                                                : 'text-white/60 hover:bg-white/5 hover:text-white'
                                                }`}
                                        >
                                            <span className="text-lg">{link.icon}</span>
                                            <span className="font-medium">{link.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </nav>
        </>
    );
}
