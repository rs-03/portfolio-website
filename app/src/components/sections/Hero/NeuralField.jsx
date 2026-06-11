'use client';

import { useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';

const THEME_STYLES = {
    dark: {
        node: 'rgba(189, 178, 245, 0.9)',
        nodeGlow: 'rgba(124, 106, 239, 0.5)',
        link: '124, 106, 239',
        count: 70,
        linkDistance: 140,
    },
    light: {
        node: 'rgba(45, 90, 39, 0.55)',
        nodeGlow: 'rgba(122, 163, 116, 0.4)',
        link: '74, 124, 67',
        count: 45,
        linkDistance: 120,
    },
};

/**
 * Animated "neural constellation" hero background.
 * Drifting nodes connect to neighbors like a network graph —
 * stars in dark mode, fireflies in light mode.
 */
export default function NeuralField() {
    const canvasRef = useRef(null);
    const { theme } = useTheme();
    const themeRef = useRef(theme);

    useEffect(() => {
        themeRef.current = theme;
    }, [theme]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        let width = 0;
        let height = 0;
        let particles = [];
        let rafId = 0;
        let running = true;

        function resize() {
            const rect = canvas.parentElement.getBoundingClientRect();
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = rect.width;
            height = rect.height;
            canvas.width = width * dpr;
            canvas.height = height * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            seed();
        }

        function seed() {
            const style = THEME_STYLES[themeRef.current] || THEME_STYLES.dark;
            const count = Math.min(style.count, Math.floor((width * height) / 14000));
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: (Math.random() - 0.5) * 0.25,
                vy: (Math.random() - 0.5) * 0.25,
                r: 1 + Math.random() * 1.6,
                tw: Math.random() * Math.PI * 2, // twinkle phase
            }));
        }

        function frame(t) {
            const style = THEME_STYLES[themeRef.current] || THEME_STYLES.dark;
            ctx.clearRect(0, 0, width, height);

            for (const p of particles) {
                p.x += p.vx;
                p.y += p.vy;
                if (p.x < -10) p.x = width + 10;
                if (p.x > width + 10) p.x = -10;
                if (p.y < -10) p.y = height + 10;
                if (p.y > height + 10) p.y = -10;
            }

            // Links between near neighbors
            const maxDist = style.linkDistance;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i];
                    const b = particles[j];
                    const dx = a.x - b.x;
                    const dy = a.y - b.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < maxDist) {
                        const alpha = (1 - dist / maxDist) * 0.22;
                        ctx.strokeStyle = `rgba(${style.link}, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
            }

            // Nodes with a slow twinkle
            for (const p of particles) {
                const twinkle = 0.65 + 0.35 * Math.sin(t / 900 + p.tw);
                ctx.globalAlpha = twinkle;
                ctx.fillStyle = p.r > 2 ? style.nodeGlow : style.node;
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
            ctx.globalAlpha = 1;

            if (running && !reducedMotion) {
                rafId = requestAnimationFrame(frame);
            }
        }

        resize();
        rafId = requestAnimationFrame(frame);

        // Pause when offscreen or tab hidden
        const observer = new IntersectionObserver(([entry]) => {
            running = entry.isIntersecting;
            if (running && !reducedMotion) {
                cancelAnimationFrame(rafId);
                rafId = requestAnimationFrame(frame);
            }
        });
        observer.observe(canvas);

        const onVisibility = () => {
            if (document.hidden) {
                cancelAnimationFrame(rafId);
            } else if (running && !reducedMotion) {
                rafId = requestAnimationFrame(frame);
            }
        };
        document.addEventListener('visibilitychange', onVisibility);
        window.addEventListener('resize', resize);

        return () => {
            cancelAnimationFrame(rafId);
            observer.disconnect();
            document.removeEventListener('visibilitychange', onVisibility);
            window.removeEventListener('resize', resize);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
            }}
        />
    );
}
