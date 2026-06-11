'use client';

import { useEffect, useRef, useState } from 'react';
import { siteConfig } from '@/data/siteConfig';
import styles from './Stats.module.css';

/**
 * Animated counter for stat values like "5+", "$20M+", "Fortune 500".
 * Counts the numeric part up once the section becomes visible.
 */
function StatValue({ value, active }) {
    const match = /^([^\d]*)(\d+)(.*)$/.exec(value);
    const target = match ? parseInt(match[2], 10) : 0;
    const [current, setCurrent] = useState(0);

    useEffect(() => {
        if (!active || !match) return;
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setCurrent(target);
            return;
        }

        const duration = 1300;
        const start = performance.now();
        let rafId;

        const step = (now) => {
            const progress = Math.min((now - start) / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCurrent(Math.round(eased * target));
            if (progress < 1) {
                rafId = requestAnimationFrame(step);
            }
        };
        rafId = requestAnimationFrame(step);
        return () => cancelAnimationFrame(rafId);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    if (!match) return value;
    return `${match[1]}${current}${match[3]}`;
}

/**
 * Stats Section - Key metrics with animated counters
 */
export default function Stats() {
    const [isVisible, setIsVisible] = useState(false);
    const sectionRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.3 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section className={styles.stats} ref={sectionRef}>
            <div className="container">
                <div className={styles.grid}>
                    {siteConfig.stats.map((stat, index) => (
                        <div
                            key={index}
                            className={`${styles.statItem} ${isVisible ? styles.visible : ''}`}
                            style={{ '--delay': `${index * 100}ms` }}
                        >
                            <span className={styles.value}>
                                <StatValue value={stat.value} active={isVisible} />
                            </span>
                            <span className={styles.label}>{stat.label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
