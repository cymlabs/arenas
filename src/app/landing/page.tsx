'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useScroll, useTransform, useSpring, useInView } from 'framer-motion';

function AnimatedGradientOrb() {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Main central orb */}
            <motion.div
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full opacity-30"
                style={{
                    background: 'radial-gradient(circle, rgba(59,130,246,0.4) 0%, rgba(6,182,212,0.2) 40%, transparent 70%)',
                    filter: 'blur(60px)',
                }}
                animate={{
                    scale: [1, 1.1, 1],
                    opacity: [0.3, 0.5, 0.3],
                }}
                transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            {/* Secondary orbs */}
            <motion.div
                className="absolute top-1/4 right-1/4 w-[300px] h-[300px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(249,115,22,0.4) 0%, transparent 60%)',
                    filter: 'blur(40px)',
                }}
                animate={{
                    x: [0, 50, 0],
                    y: [0, -30, 0],
                }}
                transition={{
                    duration: 12,
                    repeat: Infinity,
                    ease: 'easeInOut',
                }}
            />

            <motion.div
                className="absolute bottom-1/4 left-1/4 w-[250px] h-[250px] rounded-full opacity-20"
                style={{
                    background: 'radial-gradient(circle, rgba(139,92,246,0.4) 0%, transparent 60%)',
                    filter: 'blur(40px)',
                }}
                animate={{
                    x: [0, -40, 0],
                    y: [0, 40, 0],
                }}
                transition={{
                    duration: 10,
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
    const isInView = useInView(ref, { once: true, margin: '-100px' });

    return (
        <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 40 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.6, delay }}
            className="liquid-glass p-6 rounded-2xl group hover:border-blue-500/20 transition-all duration-300"
        >
            <div className="text-4xl mb-4">{icon}</div>
            <h3 className="text-white text-lg font-semibold mb-2">{title}</h3>
            <p className="text-white/50 text-sm leading-relaxed">{description}</p>
        </motion.div>
    );
}

function PlatformBadge({ name, color }: { name: string; color: string }) {
    return (
        <motion.div
            whileHover={{ scale: 1.05 }}
            className="px-4 py-2 rounded-full border border-white/10 flex items-center gap-2 bg-white/[0.02]"
        >
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
            <span className="text-white/60 text-sm">{name}</span>
        </motion.div>
    );
}

export default function LandingPage() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({ target: containerRef });

    const heroOpacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const heroScale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);
    const heroY = useTransform(scrollYProgress, [0, 0.2], [0, -50]);

    const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 });

    const [email, setEmail] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitted(true);
    };

    return (
        <div ref={containerRef} className="min-h-screen bg-black text-white">
            {/* Background grid */}
            <div className="fixed inset-0 void-grid opacity-20 pointer-events-none" />

            {/* Animated gradient orbs */}
            <AnimatedGradientOrb />

            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="relative">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400" />
                            <div className="absolute inset-0 w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-cyan-400 blur-md opacity-50" />
                        </div>
                        <span className="text-white font-semibold text-lg">
                            CULTURE MINDS <span className="text-blue-400">360</span>
                        </span>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <a href="#features" className="text-white/60 hover:text-white transition text-sm">Features</a>
                        <a href="#platforms" className="text-white/60 hover:text-white transition text-sm">Platforms</a>
                        <a href="#pricing" className="text-white/60 hover:text-white transition text-sm">Pricing</a>
                        <Link
                            href="/dashboard"
                            className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium hover:bg-blue-500/30 transition"
                        >
                            Launch App
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <motion.section
                style={{ opacity: heroOpacity, scale: heroScale, y: heroY }}
                className="min-h-screen flex flex-col items-center justify-center px-6 relative"
            >
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="text-center max-w-4xl mx-auto"
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/[0.02] mb-8"
                    >
                        <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                        <span className="text-white/60 text-sm">Real-time cultural intelligence</span>
                    </motion.div>

                    <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">
                            Track the Pulse
                        </span>
                        <br />
                        <span className="text-white/90">of Culture</span>
                    </h1>

                    <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
                        Visualize trending topics, track influencer momentum, and understand cultural shifts
                        in real-time across every major platform.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link
                            href="/dashboard"
                            className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold text-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-0.5"
                        >
                            Explore Dashboard
                        </Link>
                        <button className="px-8 py-4 border border-white/20 text-white/80 rounded-full font-medium hover:bg-white/5 transition-all">
                            Watch Demo
                        </button>
                    </div>
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.5 }}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                >
                    <motion.div
                        animate={{ y: [0, 10, 0] }}
                        transition={{ duration: 2, repeat: Infinity }}
                        className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-2"
                    >
                        <div className="w-1 h-2 bg-white/40 rounded-full" />
                    </motion.div>
                </motion.div>
            </motion.section>

            {/* Features Section */}
            <section id="features" className="py-32 px-6 relative">
                <div className="max-w-6xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">
                            <span className="text-white/90">Intelligence at a </span>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-amber-300">Glance</span>
                        </h2>
                        <p className="text-white/40 text-lg max-w-2xl mx-auto">
                            Powerful visualization tools that make complex cultural data instantly understandable.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <FeatureCard
                            icon="🌌"
                            title="Constellation Map"
                            description="Watch topics and influencers cluster, merge, and diverge in a stunning 3D visualization."
                            delay={0}
                        />
                        <FeatureCard
                            icon="📊"
                            title="Real-time Analytics"
                            description="Track mindshare, velocity, and sentiment across all major platforms simultaneously."
                            delay={0.1}
                        />
                        <FeatureCard
                            icon="⚡"
                            title="Event Detection"
                            description="Instant alerts for surges, merges, splits, and emerging controversies."
                            delay={0.2}
                        />
                        <FeatureCard
                            icon="🔗"
                            title="Connection Mapping"
                            description="Visualize relationships between influencers and topics with flowing data ribbons."
                            delay={0.3}
                        />
                        <FeatureCard
                            icon="⏱️"
                            title="Time Travel"
                            description="Scrub through history to understand how discourse evolved over time."
                            delay={0.4}
                        />
                        <FeatureCard
                            icon="🎯"
                            title="Smart Alerts"
                            description="Custom notifications for the topics and influencers you care about most."
                            delay={0.5}
                        />
                    </div>
                </div>
            </section>

            {/* Platforms Section */}
            <section id="platforms" className="py-32 px-6 relative">
                <div className="max-w-4xl mx-auto text-center">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white/90">
                            Every Platform. One View.
                        </h2>
                        <p className="text-white/40 text-lg mb-12">
                            We aggregate data from all major social and search platforms.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-wrap items-center justify-center gap-4"
                    >
                        <PlatformBadge name="X (Twitter)" color="#1DA1F2" />
                        <PlatformBadge name="YouTube" color="#FF0000" />
                        <PlatformBadge name="Instagram" color="#E4405F" />
                        <PlatformBadge name="Google Trends" color="#4285F4" />
                        <PlatformBadge name="Rumble" color="#85C742" />
                        <PlatformBadge name="TikTok" color="#00F2EA" />
                    </motion.div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-32 px-6 relative">
                <div className="max-w-2xl mx-auto">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="liquid-glass p-12 rounded-3xl text-center relative overflow-hidden"
                    >
                        {/* Glow effect */}
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 pointer-events-none" />

                        <h2 className="text-3xl font-bold mb-4 text-white relative z-10">
                            Ready to See the Signal?
                        </h2>
                        <p className="text-white/50 mb-8 relative z-10">
                            Join the waitlist for early access to Culture Minds 360.
                        </p>

                        {!submitted ? (
                            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 relative z-10">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Enter your email"
                                    className="flex-1 px-6 py-4 rounded-full bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus:outline-none focus:border-blue-500/50"
                                    required
                                />
                                <button
                                    type="submit"
                                    className="px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all whitespace-nowrap"
                                >
                                    Get Early Access
                                </button>
                            </form>
                        ) : (
                            <div className="text-green-400 font-medium relative z-10">
                                ✓ You&apos;re on the list! We&apos;ll be in touch soon.
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 px-6 border-t border-white/5">
                <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="text-white/30 text-sm">
                        © 2026 Culture Minds 360. All rights reserved.
                    </div>
                    <div className="flex items-center gap-6 text-white/30 text-sm">
                        <a href="#" className="hover:text-white transition">Privacy</a>
                        <a href="#" className="hover:text-white transition">Terms</a>
                        <a href="#" className="hover:text-white transition">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
}
