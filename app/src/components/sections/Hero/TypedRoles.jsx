'use client';

import { useEffect, useState } from 'react';
import styles from './Hero.module.css';

const PHRASES = [
    'production RAG systems',
    'computer-vision pipelines',
    'LLM evaluation frameworks',
    'agentic AI workflows',
    'fine-tuned transformers',
];

const TYPE_MS = 55;
const DELETE_MS = 28;
const HOLD_MS = 1800;

/**
 * Typewriter rotation of specialties.
 * Falls back to a static phrase for reduced-motion users.
 */
export default function TypedRoles() {
    const [text, setText] = useState('');
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            setReduced(true);
            return;
        }

        let phraseIndex = 0;
        let charIndex = 0;
        let deleting = false;
        let timer;

        function tick() {
            const phrase = PHRASES[phraseIndex];

            if (!deleting) {
                charIndex++;
                setText(phrase.slice(0, charIndex));
                if (charIndex === phrase.length) {
                    deleting = true;
                    timer = setTimeout(tick, HOLD_MS);
                    return;
                }
                timer = setTimeout(tick, TYPE_MS);
            } else {
                charIndex--;
                setText(phrase.slice(0, charIndex));
                if (charIndex === 0) {
                    deleting = false;
                    phraseIndex = (phraseIndex + 1) % PHRASES.length;
                }
                timer = setTimeout(tick, DELETE_MS);
            }
        }

        timer = setTimeout(tick, 600);
        return () => clearTimeout(timer);
    }, []);

    return (
        <span className={styles.typed}>
            {reduced ? PHRASES[0] : text}
            {!reduced && <span className={styles.caret} aria-hidden="true" />}
        </span>
    );
}
