'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { computeFingerprint, compareToBaseline } from './dsp';
import styles from './CoughMonitor.module.css';

const ARTICLE_URL = 'https://dev.to/rahul_sangamker_653e0c1ba/your-cough-has-a-fingerprint-hand-rolling-an-fft-and-mfccs-in-javascript-e4k';

const RECORD_MS = 2000;
const BASELINE_TARGET = 3;
const STORAGE_KEY = 'cough-baseline-v1';

const VERDICTS = {
    'consistent': { icon: '✅', title: 'Consistent with baseline', tone: 'good' },
    'some-deviation': { icon: '🟡', title: 'Some deviation detected', tone: 'mid' },
    'significant-deviation': { icon: '🔺', title: 'Significant deviation', tone: 'bad' },
};

/* Baseline lives in localStorage; exposed as an external store so the
   component reads it without setState-in-effect or hydration mismatch. */
const EMPTY_BASELINE = [];
let baselineCache = null;
const baselineListeners = new Set();

function readBaseline() {
    if (baselineCache === null) {
        try {
            const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
            baselineCache = Array.isArray(parsed) ? parsed : EMPTY_BASELINE;
        } catch {
            baselineCache = EMPTY_BASELINE;
        }
    }
    return baselineCache;
}

function writeBaseline(next) {
    baselineCache = next;
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
        // storage unavailable — baseline still works for this session
    }
    baselineListeners.forEach(listener => listener());
}

function subscribeBaseline(listener) {
    baselineListeners.add(listener);
    return () => baselineListeners.delete(listener);
}

function drawSpectrogram(canvas, spectrogram) {
    if (!canvas || !spectrogram) return;
    const ctx = canvas.getContext('2d');
    const frames = spectrogram.length;
    const bands = spectrogram[0].length;
    canvas.width = frames;
    canvas.height = bands;

    let min = Infinity, max = -Infinity;
    for (const frame of spectrogram) {
        for (const v of frame) {
            if (v < min) min = v;
            if (v > max) max = v;
        }
    }
    const range = max - min || 1;

    const img = ctx.createImageData(frames, bands);
    for (let x = 0; x < frames; x++) {
        for (let y = 0; y < bands; y++) {
            const t = (spectrogram[x][y] - min) / range;
            const idx = ((bands - 1 - y) * frames + x) * 4;
            // dark navy → purple → warm white ramp
            img.data[idx] = Math.round(16 + t * 220);
            img.data[idx + 1] = Math.round(16 + t * 160);
            img.data[idx + 2] = Math.round(34 + t * 200);
            img.data[idx + 3] = 255;
        }
    }
    ctx.putImageData(img, 0, 0);
}

/**
 * Personal Cough Baseline Monitor — record a healthy-cough baseline,
 * then score new coughs for acoustic deviation. All DSP is hand-rolled
 * (FFT → mel filterbank → MFCC) and runs on-device.
 */
export default function CoughMonitor() {
    const baselineSpecRef = useRef(null);
    const currentSpecRef = useRef(null);

    const baseline = useSyncExternalStore(subscribeBaseline, readBaseline, () => EMPTY_BASELINE);
    const [phase, setPhase] = useState('idle'); // idle | recording | processing
    const [countdown, setCountdown] = useState(0);
    const [result, setResult] = useState(null);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        if (baseline.length > 0) {
            drawSpectrogram(baselineSpecRef.current, baseline[baseline.length - 1].spectrogram);
        }
    }, [baseline]);

    const baselineReady = baseline.length >= BASELINE_TARGET;

    async function record() {
        setErrorMessage('');
        setPhase('recording');

        let stream;
        try {
            stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        } catch {
            setPhase('idle');
            setErrorMessage('Microphone permission was denied. Allow access and try again.');
            return;
        }

        try {
            const recorder = new MediaRecorder(stream);
            const chunks = [];
            recorder.ondataavailable = e => chunks.push(e.data);

            const stopped = new Promise(resolve => {
                recorder.onstop = resolve;
            });
            recorder.start();

            // countdown display
            const startedAt = performance.now();
            const tick = () => {
                const left = Math.max(0, RECORD_MS - (performance.now() - startedAt));
                setCountdown(left / 1000);
                if (left > 0 && recorder.state === 'recording') requestAnimationFrame(tick);
            };
            requestAnimationFrame(tick);

            await new Promise(resolve => setTimeout(resolve, RECORD_MS));
            recorder.stop();
            await stopped;
            stream.getTracks().forEach(track => track.stop());

            setPhase('processing');

            const blob = new Blob(chunks);
            const arrayBuffer = await blob.arrayBuffer();
            const audioCtx = new AudioContext();
            const decoded = await audioCtx.decodeAudioData(arrayBuffer);
            const samples = decoded.getChannelData(0);
            const analysis = computeFingerprint(samples, decoded.sampleRate);
            audioCtx.close();

            if (!analysis) {
                setErrorMessage('Recording was too quiet. Cough clearly into the microphone and retry.');
                setPhase('idle');
                return;
            }

            if (!baselineReady) {
                writeBaseline([...baseline, analysis]);
            } else {
                const comparison = compareToBaseline(
                    analysis.fingerprint,
                    baseline.map(b => b.fingerprint),
                );
                setResult({ ...comparison, spectrogram: analysis.spectrogram });
                drawSpectrogram(currentSpecRef.current, analysis.spectrogram);
            }
            setPhase('idle');
        } catch {
            stream?.getTracks().forEach(track => track.stop());
            setPhase('idle');
            setErrorMessage('Could not process the recording. Try a different browser or device.');
        }
    }

    function resetBaseline() {
        writeBaseline(EMPTY_BASELINE);
        setResult(null);
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch {
            // ignore
        }
    }

    const verdict = result ? VERDICTS[result.verdict] : null;

    return (
        <section className={`section ${styles.monitor}`} id="cough">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Live Demo · Personal Health Baseline</span>
                    <h2 className="section-header__title">Your Cough Has a Fingerprint.</h2>
                    <p className="section-header__description">
                        Record your healthy cough a few times to build a personal acoustic
                        baseline. Later, the monitor scores how far a new cough deviates from
                        it: not against a population model, against <em>you</em>. The signal
                        processing (FFT, mel filterbank, MFCC) is hand-rolled and runs on-device.
                    </p>
                </div>

                <div className={styles.lab}>
                    {/* Recorder panel */}
                    <div className={styles.panel}>
                        <span className={styles.panelLabel}>
                            {baselineReady ? 'Check a Cough' : 'Build Your Baseline'}
                        </span>

                        {!baselineReady && (
                            <>
                                <div className={styles.baselineProgress}>
                                    {Array.from({ length: BASELINE_TARGET }, (_, i) => (
                                        <span
                                            key={i}
                                            className={`${styles.progressDot} ${i < baseline.length ? styles.progressDone : ''}`}
                                        />
                                    ))}
                                    <span className={styles.progressText}>
                                        {baseline.length}/{BASELINE_TARGET} healthy coughs recorded
                                    </span>
                                </div>
                                <p className={styles.hint}>
                                    Cough naturally into your microphone. The recorder captures
                                    2 seconds and finds the cough automatically.
                                </p>
                            </>
                        )}

                        {baselineReady && (
                            <p className={styles.hint}>
                                Baseline ready. Record a cough and it will be compared against
                                your healthy fingerprint.
                            </p>
                        )}

                        <button
                            onClick={record}
                            className="btn btn--primary"
                            disabled={phase !== 'idle'}
                        >
                            {phase === 'recording' && `🔴 Recording… ${countdown.toFixed(1)}s`}
                            {phase === 'processing' && 'Analyzing…'}
                            {phase === 'idle' && (baselineReady ? '🎙️ Record & Compare' : '🎙️ Record Baseline Cough')}
                        </button>

                        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

                        {baseline.length > 0 && (
                            <button onClick={resetBaseline} className={styles.resetBtn}>
                                Reset baseline
                            </button>
                        )}

                        <p className={styles.privacy}>
                            🔒 Audio is processed and stored only on your device.
                        </p>
                    </div>

                    {/* Results panel */}
                    <div className={styles.panel}>
                        <span className={styles.panelLabel}>Acoustic Fingerprints</span>

                        <div className={styles.specs}>
                            <div className={styles.specBlock}>
                                <span className={styles.specLabel}>Baseline (latest)</span>
                                <canvas ref={baselineSpecRef} className={styles.spectrogram} />
                                {baseline.length === 0 && (
                                    <span className={styles.specEmpty}>No baseline yet</span>
                                )}
                            </div>
                            <div className={styles.specBlock}>
                                <span className={styles.specLabel}>Latest check</span>
                                <canvas ref={currentSpecRef} className={styles.spectrogram} />
                                {!result && <span className={styles.specEmpty}>No check yet</span>}
                            </div>
                        </div>

                        {result && verdict && (
                            <div className={`${styles.verdict} ${styles[verdict.tone]}`}>
                                <span className={styles.verdictIcon}>{verdict.icon}</span>
                                <div className={styles.verdictBody}>
                                    <span className={styles.verdictTitle}>{verdict.title}</span>
                                    <span className={styles.verdictDetail}>
                                        {result.deviation.toFixed(0)}% deviation from your healthy
                                        baseline ({(result.similarity * 100).toFixed(0)}% similar)
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <p className={styles.disclaimer}>
                    Concept demonstration, not a medical device and not medical advice.
                    Mel-frequency analysis: 26 filters · 12 MFCCs · hand-written FFT, verified
                    against a reference DFT.
                </p>

                {ARTICLE_URL && (
                    <p className="demo-article-link">
                        <a href={ARTICLE_URL} target="_blank" rel="noopener noreferrer">
                            📝 Read the build deep-dive on Medium →
                        </a>
                    </p>
                )}
            </div>
        </section>
    );
}
