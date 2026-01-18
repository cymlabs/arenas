'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { MainNavigation } from '@/components/layout/MainNavigation';

// --- Visual Components ---

function AnimatedGradientOrb() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {/* Main central orb - Blue/Cyan */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full opacity-20 dark:opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.3) 0%, rgba(6,182,212,0.15) 40%, transparent 70%)',
                    filter: 'blur(80px)',
                }}
                animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.2, 0.4, 0.2],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary orb - Violet/Purple (Left) */}
            <motion.div
                className="absolute top-1/3 left-0 w-[500px] h-[500px] rounded-full opacity-10 dark:opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.3) 0%, transparent 60%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    x: [-50, 50, -50],
                    y: [-20, 20, -20],
                }}
                transition={{
                    duration: 15,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Tertiary orb - Orange/Accent (Right) */}
            <motion.div
                className="absolute bottom-1/4 right-0 w-[400px] h-[400px] rounded-full opacity-10 dark:opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(249,115,22,0.25) 0%, transparent 60%)',
                    filter: 'blur(50px)',
                }}
                animate={{
                    x: [20, -20, 20],
                    y: [30, -30, 30],
                }}
                transition={{
                    duration: 18,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />
        </div>
    );
}

function FeatureCard({
    icon,
    title,
    description,
    delay = 0
}: {
    icon: string;
    title: string;
    description: string;
    delay?: number;
}) {
    const ref = useRef(null);
    const isInView = useInView(ref, { once: true, margin: '-50px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5, delay }}
            className="group p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/30 hover:bg-white/[0.07] backdrop-blur-md transition-all duration-300 h-full flex flex-col"
        >
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform duration-300">
                {icon}
            </div>
            <h3 className="text-white text-lg font-bold mb-2 tracking-tight">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed flex-grow">{description}</p>
        </motion.div>
    );
}

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    // Parallax logic
    const heroOpacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 0.15], [0, 50]);

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white selection:bg-blue-500/30">
            {/* Global Background Elements */}
            <div className="fixed inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] opacity-20 pointer-events-none z-0" />
            <AnimatedGradientOrb />

            {/* Consistent Main Navigation */}
            <MainNavigation />

            <main className="relative z-10">
                {/* HERO SECTION */}
                <motion.section
                    style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                    className="min-h-screen flex flex-col items-center justify-center px-4 relative pt-20"
                >
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                        className="text-center max-w-5xl mx-auto space-y-6"
                    >
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-blue-400 backdrop-blur-sm mb-4"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                            </span>
                            Live Intelligence Engine v1.0
                        </motion.div>

                        <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9]">
                            <span className="block text-white mb-2">DECODE THE</span>
                            <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
                                CULTURAL SIGNAL
                            </span>
                        </h1>

                        <p className="text-xl text-white/50 max-w-2xl mx-auto leading-relaxed">
                            The advanced intelligence platform for tracking voice mindshare, stance flips, and narrative shifts across the global digital landscape.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
                            <Link
                                href="/dashboard"
                                className="group relative px-8 py-4 bg-white text-black rounded-full font-bold text-lg hover:bg-gray-100 transition-all flex items-center gap-2"
                            >
                                Enter Platform
                                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </Link>
                            <Link
                                href="/stance"
                                className="px-8 py-4 rounded-full border border-violet-500/30 text-white font-medium bg-gradient-to-r from-violet-500/10 to-blue-500/10 hover:from-violet-500/20 hover:to-blue-500/20 transition-all backdrop-blur-sm shadow-lg shadow-violet-500/10 hover:shadow-violet-500/20"
                            >
                                Explore Stance Engine
                            </Link>
                        </div>
                    </motion.div>

                    {/* Scroll Indicator */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1.5, duration: 1 }}
                        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
                    >
                        <span className="text-xs uppercase tracking-widest text-white/50 bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10">Scroll to Discover</span>
                        <motion.div
                            className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center pt-2"
                            animate={{ y: [0, 5, 0] }}
                            transition={{ duration: 1.5, repeat: Infinity }}
                        >
                            <div className="w-1 h-2 bg-white/50 rounded-full" />
                        </motion.div>
                    </motion.div>
                </motion.section>

                {/* FEATURES GRID */}
                <section className="py-32 px-4 relative z-20 bg-black/50 backdrop-blur-sm border-t border-white/5">
                    <div className="max-w-7xl mx-auto">
                        <div className="text-center mb-20">
                            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
                                Intelligence at Scale
                            </h2>
                            <p className="text-white/40 text-lg max-w-2xl mx-auto">
                                Powerful tools designed to make sense of millions of data points in real-time.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <FeatureCard
                                icon="⚡"
                                title="Stance Engine"
                                description="Detect real-time shifts in influencer opinion. Track who flipped, when, and why with receipt-level precision."
                                delay={0}
                            />
                            <FeatureCard
                                icon="🌌"
                                title="Mindshare Mapping"
                                description="Visualize the dominance of voices and topics across multiple platforms. See the full landscape."
                                delay={0.1}
                            />
                            <FeatureCard
                                icon="🌍"
                                title="Global 3D Monitor"
                                description="Geospatial visualization of narrative reach. See where ideas are spreading physically."
                                delay={0.2}
                            />
                            <FeatureCard
                                icon="🎯"
                                title="Narrative Tracking"
                                description="Follow the lifecycle of stories from inception to peak viral saturation."
                                delay={0.3}
                            />
                            <FeatureCard
                                icon="📊"
                                title="Cross-Platform Data"
                                description="Aggregated metrics from X (Twitter), YouTube, Rumble, and Podcasts in one unified view."
                                delay={0.4}
                            />
                            <FeatureCard
                                icon="🔮"
                                title="Predictive Trends"
                                description="AI-driven analysis to forecast the next major cultural shifts before they happen."
                                delay={0.5}
                            />
                        </div>
                    </div>
                </section>

                {/* CTA / FOOTER */}
                <section className="py-24 px-4 text-center border-t border-white/10 bg-gradient-to-b from-black to-[#050510]">
                    <div className="max-w-3xl mx-auto space-y-8">
                        <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                            Ready to see the <span className="text-blue-400">signal</span>?
                        </h2>
                        <p className="text-white/50 text-xl">
                            Join the intelligence platform defining the future of cultural analysis.
                        </p>
                        <Link
                            href="/dashboard"
                            className="inline-block px-10 py-5 bg-blue-600 text-white rounded-full font-bold text-xl hover:bg-blue-500 hover:scale-105 transition-all shadow-lg shadow-blue-900/20"
                        >
                            Get Started Now
                        </Link>
                    </div>

                    <div className="mt-24 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center text-xs text-white/30 max-w-7xl mx-auto">
                        <p>© 2026 CULTMINDS Intelligence Platform. All rights reserved.</p>
                        <div className="flex gap-6 mt-4 md:mt-0">
                            <a href="#" className="hover:text-white transition">Privacy Policy</a>
                            <a href="#" className="hover:text-white transition">Terms of Service</a>
                            <a href="#" className="hover:text-white transition">Contact</a>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
}
