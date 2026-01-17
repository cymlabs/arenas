'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchResult {
    id: string;
    type: 'voice' | 'topic';
    label: string;
    subtext: string;
    url: string;
}

export function Search() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<SearchResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    // Close on click outside
    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSearch = async (value: string) => {
        setQuery(value);
        if (value.length < 2) {
            setResults([]);
            setIsOpen(false);
            return;
        }

        setLoading(true);
        setIsOpen(true);
        try {
            const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
            if (res.ok) {
                const data = await res.json();
                setResults(data.results);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div ref={containerRef} className="relative z-50">
            <div className={`flex items-center bg-white/5 border transition-all rounded-full px-3 py-1.5 w-64 ${isOpen ? 'bg-white/10 border-blue-500/50' : 'border-white/10 focus-within:bg-white/10 focus-within:border-blue-500/50'}`}>
                <svg className={`w-4 h-4 mr-2 transition-colors ${loading ? 'text-blue-400 animate-spin' : 'text-white/40'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {loading ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    )}
                </svg>
                <input
                    type="text"
                    value={query}
                    placeholder="Search voices, topics..."
                    className="bg-transparent border-none text-sm text-white placeholder:text-white/30 focus:outline-none w-full"
                    onChange={(e) => handleSearch(e.target.value)}
                    onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
                />
            </div>

            <AnimatePresence>
                {isOpen && (results.length > 0 || loading) && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        className="absolute top-full left-0 right-0 mt-2 bg-black/90 backdrop-blur-xl border border-white/10 rounded-xl overflow-hidden shadow-2xl"
                    >
                        <div className="max-h-[300px] overflow-y-auto py-2">
                            {results.length > 0 ? (
                                results.map((result) => (
                                    <Link
                                        key={result.id}
                                        href={result.url}
                                        onClick={() => setIsOpen(false)}
                                        className="flex items-center gap-3 px-4 py-3 hover:bg-white/10 transition-colors group"
                                    >
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${result.type === 'voice' ? 'bg-blue-500/20 text-blue-400' : 'bg-purple-500/20 text-purple-400'
                                            }`}>
                                            {result.type === 'voice' ? 'V' : 'T'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-white group-hover:text-blue-400 transition-colors font-medium truncate">
                                                {result.label}
                                            </div>
                                            <div className="text-xs text-white/40 truncate">
                                                {result.subtext}
                                            </div>
                                        </div>
                                    </Link>
                                ))
                            ) : (
                                !loading && <div className="px-4 py-3 text-sm text-white/40 text-center">No results found</div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
