'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
    setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [theme, setThemeState] = useState<Theme>('dark');

    useEffect(() => {
        // Check for saved theme preference
        const savedTheme = localStorage.getItem('cm360-theme') as Theme;
        if (savedTheme) {
            setThemeState(savedTheme);
        } else if (window.matchMedia('(prefers-color-scheme: light)').matches) {
            setThemeState('light');
        }
    }, []);

    useEffect(() => {
        // Apply theme to document
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(theme);
        localStorage.setItem('cm360-theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setThemeState(prev => prev === 'dark' ? 'light' : 'dark');
    };

    const setTheme = (newTheme: Theme) => {
        setThemeState(newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}

// Theme toggle button component
export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={`
        relative w-14 h-7 rounded-full transition-all duration-300
        ${theme === 'dark'
                    ? 'bg-slate-700 border border-slate-600'
                    : 'bg-amber-100 border border-amber-200'}
      `}
            aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
        >
            {/* Sun icon */}
            <span className={`
        absolute left-1 top-1 w-5 h-5 flex items-center justify-center
        transition-all duration-300
        ${theme === 'light' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
      `}>
                🌙
            </span>

            {/* Moon icon */}
            <span className={`
        absolute right-1 top-1 w-5 h-5 flex items-center justify-center
        transition-all duration-300
        ${theme === 'dark' ? 'opacity-0 scale-50' : 'opacity-100 scale-100'}
      `}>
                ☀️
            </span>

            {/* Toggle circle */}
            <span className={`
        absolute top-0.5 w-6 h-6 rounded-full transition-all duration-300
        shadow-md
        ${theme === 'dark'
                    ? 'left-0.5 bg-slate-900'
                    : 'left-7 bg-amber-400'}
      `} />
        </button>
    );
}

// CSS variables for theming
export const themeColors = {
    dark: {
        bg: '#000000',
        bgCard: 'rgba(255, 255, 255, 0.02)',
        bgCardHover: 'rgba(255, 255, 255, 0.05)',
        border: 'rgba(255, 255, 255, 0.08)',
        borderGlow: 'rgba(255, 255, 255, 0.15)',
        text: '#ffffff',
        textMuted: 'rgba(255, 255, 255, 0.5)',
        textDim: 'rgba(255, 255, 255, 0.3)',
        accent: '#3b82f6',
        glowColor: 'rgba(59, 130, 246, 0.5)',
    },
    light: {
        bg: '#fafafa',
        bgCard: 'rgba(0, 0, 0, 0.02)',
        bgCardHover: 'rgba(0, 0, 0, 0.05)',
        border: 'rgba(0, 0, 0, 0.08)',
        borderGlow: 'rgba(0, 0, 0, 0.15)',
        text: '#0a0a0a',
        textMuted: 'rgba(0, 0, 0, 0.5)',
        textDim: 'rgba(0, 0, 0, 0.3)',
        accent: '#2563eb',
        glowColor: 'rgba(37, 99, 235, 0.5)',
    },
};
