'use client';

import { useEffect, useRef, useState } from 'react';
import styles from './CamouflageTester.module.css';

const ARTICLE_URL = 'https://dev.to/rahul_sangamker_653e0c1ba/testing-camouflage-against-the-real-adversary-an-ai-34f1';

// Simulated distances: smaller render = fewer pixels on target,
// the dominant factor in long-range detection
const DISTANCE_LEVELS = [
    { label: 'Close (~5m)', scale: 1 },
    { label: 'Mid (~15m)', scale: 0.45 },
    { label: 'Far (~30m)', scale: 0.22 },
    { label: 'Very far (~50m)', scale: 0.12 },
];

/**
 * Camouflage Effectiveness Tester — runs an object-detection model
 * against your photo at simulated distances. The model is the adversary:
 * if it can't find you, neither can automated surveillance built on it.
 */
export default function CamouflageTester() {
    const modelRef = useRef(null);
    const imageCanvasRef = useRef(null);
    const fileInputRef = useRef(null);
    const streamRef = useRef(null);
    const videoRef = useRef(null);

    const [status, setStatus] = useState('idle'); // idle | loading-model | camera | analyzing | done | error
    const [errorMessage, setErrorMessage] = useState('');
    const [results, setResults] = useState(null);
    const [hasImage, setHasImage] = useState(false);

    useEffect(() => {
        return () => stopCamera();
    }, []);

    function stopCamera() {
        streamRef.current?.getTracks().forEach(track => track.stop());
        streamRef.current = null;
    }

    async function ensureModel() {
        if (modelRef.current) return modelRef.current;
        setStatus('loading-model');
        // Lazy-load TF.js + COCO-SSD only when the visitor opts in
        const [tf, cocoSsd] = await Promise.all([
            import('@tensorflow/tfjs'),
            import('@tensorflow-models/coco-ssd'),
        ]);
        await tf.ready();
        modelRef.current = await cocoSsd.load({ base: 'lite_mobilenet_v2' });
        return modelRef.current;
    }

    function drawSourceToCanvas(source, width, height) {
        const canvas = imageCanvasRef.current;
        const maxWidth = 640;
        const ratio = Math.min(1, maxWidth / width);
        canvas.width = Math.round(width * ratio);
        canvas.height = Math.round(height * ratio);
        canvas.getContext('2d').drawImage(source, 0, 0, canvas.width, canvas.height);
        setHasImage(true);
    }

    async function analyze() {
        const canvas = imageCanvasRef.current;
        setStatus('analyzing');
        setErrorMessage('');

        try {
            const model = await ensureModel();
            setStatus('analyzing');

            const levels = [];
            let closeDetections = [];

            for (const level of DISTANCE_LEVELS) {
                const scaled = document.createElement('canvas');
                scaled.width = Math.max(48, Math.round(canvas.width * level.scale));
                scaled.height = Math.max(48, Math.round(canvas.height * level.scale));
                const sctx = scaled.getContext('2d');
                sctx.drawImage(canvas, 0, 0, scaled.width, scaled.height);

                const detections = await model.detect(scaled, 10, 0.15);
                const person = detections
                    .filter(d => d.class === 'person')
                    .sort((a, b) => b.score - a.score)[0];

                if (level.scale === 1) closeDetections = detections;

                levels.push({
                    label: level.label,
                    personScore: person ? person.score : 0,
                    topOther: detections
                        .filter(d => d.class !== 'person')
                        .sort((a, b) => b.score - a.score)[0] || null,
                });
            }

            // Draw close-range boxes on the displayed image
            const ctx = canvas.getContext('2d');
            ctx.lineWidth = 3;
            ctx.font = '600 14px sans-serif';
            for (const det of closeDetections) {
                const isPerson = det.class === 'person';
                ctx.strokeStyle = isPerson ? '#f87171' : 'rgba(124, 106, 239, 0.9)';
                ctx.fillStyle = ctx.strokeStyle;
                const [x, y, w, h] = det.bbox;
                ctx.strokeRect(x, y, w, h);
                ctx.fillText(
                    `${det.class} ${(det.score * 100).toFixed(0)}%`,
                    x + 4,
                    Math.max(16, y - 6),
                );
            }

            // Stealth score: how poorly the adversary saw a person across distances
            const avgPersonScore = levels.reduce((sum, l) => sum + l.personScore, 0) / levels.length;
            const stealthScore = Math.round((1 - avgPersonScore) * 100);

            setResults({ levels, stealthScore, foundPerson: levels.some(l => l.personScore > 0.15) });
            setStatus('done');
        } catch {
            setStatus('error');
            setErrorMessage('Analysis failed. The model could not load. Check your connection and retry.');
        }
    }

    function handleFile(file) {
        if (!file || !file.type.startsWith('image/')) return;
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => {
            drawSourceToCanvas(img, img.naturalWidth, img.naturalHeight);
            URL.revokeObjectURL(url);
            setResults(null);
            analyze();
        };
        img.src = url;
    }

    async function startCamera() {
        setErrorMessage('');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'environment', width: 1280, height: 720 },
            });
            streamRef.current = stream;
            const video = videoRef.current;
            video.srcObject = stream;
            await video.play();
            setStatus('camera');
        } catch {
            setErrorMessage('Camera permission was denied. Upload a photo instead.');
        }
    }

    function capture() {
        const video = videoRef.current;
        drawSourceToCanvas(video, video.videoWidth, video.videoHeight);
        stopCamera();
        setResults(null);
        analyze();
    }

    const busy = status === 'loading-model' || status === 'analyzing';

    return (
        <section className={`section ${styles.tester}`} id="camouflage">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Live Demo · Adversarial Evaluation</span>
                    <h2 className="section-header__title">Can an AI Spot You?</h2>
                    <p className="section-header__description">
                        Modern surveillance is automated, so test against the actual adversary.
                        Upload a photo (camouflage, hunting gear, or just you in the garden) and
                        an object-detection model hunts for you at four simulated distances.
                    </p>
                </div>

                <div className={styles.lab}>
                    {/* Image stage */}
                    <div className={styles.stage}>
                        <video
                            ref={videoRef}
                            className={`${styles.video} ${status === 'camera' ? styles.videoActive : ''}`}
                            playsInline
                            muted
                        />
                        <canvas
                            ref={imageCanvasRef}
                            className={`${styles.canvas} ${hasImage && status !== 'camera' ? styles.canvasActive : ''}`}
                        />

                        {status !== 'camera' && !hasImage && (
                            <div
                                className={styles.dropzone}
                                onDragOver={e => e.preventDefault()}
                                onDrop={e => {
                                    e.preventDefault();
                                    handleFile(e.dataTransfer.files?.[0]);
                                }}
                            >
                                <p className={styles.privacy}>
                                    🔒 Images are analyzed on your device. Nothing is uploaded.
                                </p>
                                <div className={styles.dropActions}>
                                    <button
                                        className="btn btn--primary"
                                        onClick={() => fileInputRef.current?.click()}
                                    >
                                        📁 Choose a Photo
                                    </button>
                                    <button className="btn btn--secondary" onClick={startCamera}>
                                        📷 Use Camera
                                    </button>
                                </div>
                                <span className={styles.dropHint}>…or drag & drop an image here</span>
                            </div>
                        )}

                        {status === 'camera' && (
                            <div className={styles.captureBar}>
                                <button className="btn btn--primary" onClick={capture}>
                                    📸 Capture & Analyze
                                </button>
                            </div>
                        )}

                        {busy && (
                            <div className={styles.busyOverlay}>
                                <span className={styles.busyText}>
                                    {status === 'loading-model'
                                        ? 'Loading detection model…'
                                        : 'Hunting for you at 4 distances…'}
                                </span>
                            </div>
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            hidden
                            onChange={e => handleFile(e.target.files?.[0])}
                        />
                    </div>

                    {/* Results panel */}
                    <div className={styles.panel}>
                        <span className={styles.panelLabel}>Detection Report</span>

                        {!results && (
                            <p className={styles.waiting}>
                                {busy ? 'Analyzing…' : 'Add a photo to generate a detection range profile.'}
                            </p>
                        )}
                        {errorMessage && <p className={styles.error}>{errorMessage}</p>}

                        {results && (
                            <>
                                <div className={styles.scoreCard}>
                                    <span className={styles.scoreValue}>{results.stealthScore}</span>
                                    <span className={styles.scoreLabel}>
                                        Stealth score: higher means harder for AI to spot a person
                                    </span>
                                </div>

                                <div className={styles.levels}>
                                    {results.levels.map(level => (
                                        <div key={level.label} className={styles.levelRow}>
                                            <span className={styles.levelLabel}>{level.label}</span>
                                            <div className={styles.levelTrack}>
                                                <div
                                                    className={`${styles.levelFill} ${level.personScore > 0.5 ? styles.levelHot : ''}`}
                                                    style={{ width: `${Math.max(level.personScore * 100, 2)}%` }}
                                                />
                                            </div>
                                            <span className={styles.levelScore}>
                                                {level.personScore > 0.15
                                                    ? `${(level.personScore * 100).toFixed(0)}%`
                                                    : 'not seen'}
                                            </span>
                                        </div>
                                    ))}
                                </div>

                                <p className={styles.readout}>
                                    {results.foundPerson
                                        ? 'Person-confidence per simulated distance. Red boxes on the image show close-range detections.'
                                        : 'No person detected at any distance. Either excellent camouflage, or no person in frame.'}
                                </p>

                                <button
                                    className={styles.againBtn}
                                    onClick={() => {
                                        setResults(null);
                                        setHasImage(false);
                                        setStatus('idle');
                                    }}
                                >
                                    Test another photo
                                </button>
                            </>
                        )}
                    </div>
                </div>

                <p className={styles.footnote}>
                    Adversary model: COCO-SSD (pretrained, Google) running on-device via
                    TensorFlow.js, a single-model preview of the full multi-model ensemble
                    concept. Distance is simulated by reducing pixels-on-target.
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
