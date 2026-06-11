'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';

const ThemeContext = createContext({
    theme: 'dark',
    setTheme: () => { },
    toggleTheme: () => { },
});

// The current theme lives on <html data-theme="...">, set before hydration
// by the inline script in layout.jsx. This module is the single writer.
const listeners = new Set();

function readTheme() {
    return document.documentElement.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
}

function writeTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    try {
        localStorage.setItem('theme', theme);
    } catch {
        // localStorage unavailable (private mode) — theme still applies for the session
    }
    listeners.forEach(listener => listener());
}

function subscribe(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
}

/**
 * Theme Provider Component
 * Manages dark/light theme state and persistence
 */
export function ThemeProvider({ children }) {
    const theme = useSyncExternalStore(subscribe, readTheme, () => 'light');

    const setTheme = useCallback((next) => writeTheme(next), []);
    const toggleTheme = useCallback(() => {
        writeTheme(readTheme() === 'dark' ? 'light' : 'dark');
    }, []);

    const value = useMemo(() => ({
        theme,
        setTheme,
        toggleTheme,
    }), [theme, setTheme, toggleTheme]);

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
}

/**
 * Hook to access theme context
 * @returns {{ theme: string, setTheme: function, toggleTheme: function }}
 */
export function useTheme() {
    const context = useContext(ThemeContext);
    return context;
}
