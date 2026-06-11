'use client';

import { useTheme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';

/**
 * Animated Theme Toggle
 * Sun for light mode, Moon with stars for dark mode
 */
export default function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();
    const isDark = theme === 'dark';

    return (
        <button
            onClick={toggleTheme}
            className={styles.toggle}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
            <div className={`${styles.iconWrapper} ${isDark ? styles.dark : styles.light}`}>
                {/* Sun */}
                <div className={`${styles.sun} ${!isDark ? styles.active : ''}`}>
                    <div className={styles.sunCore}></div>
                    <div className={styles.sunRays}>
                        {[...Array(8)].map((_, i) => (
                            <div key={i} className={styles.ray} style={{ '--ray-index': i }}></div>
                        ))}
                    </div>
                </div>

                {/* Moon */}
                <div className={`${styles.moon} ${isDark ? styles.active : ''}`}>
                    <div className={styles.moonCore}></div>
                    <div className={styles.moonCrater1}></div>
                    <div className={styles.moonCrater2}></div>
                    {/* Stars */}
                    <div className={styles.stars}>
                        <div className={`${styles.star} ${styles.star1}`}></div>
                        <div className={`${styles.star} ${styles.star2}`}></div>
                        <div className={`${styles.star} ${styles.star3}`}></div>
                    </div>
                </div>
            </div>
        </button>
    );
}
