'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './MirrorTherapy.module.css';

const ARTICLE_URL = 'https://dev.to/rahul_sangamker_653e0c1ba/mirror-therapy-without-the-mirror-box-treating-phantom-limbs-in-a-browser-tab-5750';

const MEDIAPIPE_VERSION = '0.10.35';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task';

const EXERCISES = [
    'Open and close your fist, slowly',
    'Touch each fingertip to your thumb',
    'Rotate your wrist in small circles',
    'Spread your fingers wide, then relax',
];

/**
 * Mirror Therapy demo — browser preview of the Phantom Limb VR project.
 * Tracks one real hand and renders a mirrored "phantom" twin on the
 * opposite side, recreating the mirror-box illusion with hand tracking.
 */
export default function MirrorTherapy() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const sessionRef = useRef(null);
    const fpsRef = useRef({ frames: 0, last: 0 });

    const [status, setStatus] = useState('idle'); // idle | loading | running | error
    const [errorMessage, setErrorMessage] = useState('');
    const [tracking, setTracking] = useState(false);
    const [fps, setFps] = useState(0);

    useEffect(() => {
        return () => stopSession();
    }, []);

    function stopSession() {
        const session = sessionRef.current;
        if (!session) return;
        cancelAnimationFrame(session.rafId);
        session.stream?.getTracks().forEach(track => track.stop());
        session.landmarker?.close();
        sessionRef.current = null;
    }

    async function start() {
        setStatus('loading');
        setErrorMessage('');

        try {
            const vision = await import('@mediapipe/tasks-vision');
            const { FilesetResolver, HandLandmarker, DrawingUtils } = vision;

            const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
            const landmarker = await HandLandmarker.createFromOptions(fileset, {
                baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
                runningMode: 'VIDEO',
                numHands: 1,
            });

            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user', width: 640, height: 480 },
            });

            const video = videoRef.current;
            video.srcObject = stream;
            await video.play();

            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');

            sessionRef.current = {
                landmarker,
                stream,
                rafId: 0,
                ctx,
                drawingUtils: new DrawingUtils(ctx),
                connections: HandLandmarker.HAND_CONNECTIONS,
                trails: [], // recent phantom frames for the afterimage effect
            };
            fpsRef.current = { frames: 0, last: performance.now() };
            setStatus('running');
            loop(performance.now());
        } catch (err) {
            stopSession();
            setStatus('error');
            setErrorMessage(
                err?.name === 'NotAllowedError'
                    ? 'Camera permission was denied. Allow camera access and try again.'
                    : 'Could not start the demo. Check your camera and connection, then retry.'
            );
        }
    }

    function loop(now) {
        const session = sessionRef.current;
        const video = videoRef.current;
        if (!session || !video) return;

        const { landmarker, ctx, drawingUtils, connections, trails } = session;
        const result = landmarker.detectForVideo(video, now);

        const { width, height } = ctx.canvas;
        ctx.clearRect(0, 0, width, height);

        // Mirror plane down the center of the frame
        ctx.save();
        ctx.setLineDash([10, 12]);
        ctx.strokeStyle = 'rgba(140, 220, 255, 0.35)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(width / 2, 0);
        ctx.lineTo(width / 2, height);
        ctx.stroke();
        ctx.restore();

        const PALM_OUTLINE = [0, 1, 2, 5, 9, 13, 17];
        const fillPalm = (lm, fillStyle) => {
            ctx.beginPath();
            PALM_OUTLINE.forEach((id, i) => {
                const x = lm[id].x * width;
                const y = lm[id].y * height;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            });
            ctx.closePath();
            ctx.fillStyle = fillStyle;
            ctx.fill();
        };

        const hasHand = result.landmarks && result.landmarks.length > 0;
        if (hasHand) {
            const real = result.landmarks[0];
            // The phantom twin: same hand, reflected to the opposite side
            const phantom = real.map(p => ({ x: 1 - p.x, y: p.y, z: p.z }));

            // Afterimage trail: recent phantom frames fading out behind the current one
            trails.push(phantom);
            if (trails.length > 6) trails.shift();
            trails.slice(0, -1).forEach((past, i) => {
                const alpha = 0.05 + (i / trails.length) * 0.12;
                drawingUtils.drawConnectors(past, connections, {
                    color: `rgba(140, 220, 255, ${alpha})`,
                    lineWidth: 2,
                });
            });

            // Real hand — solid accent with filled palm
            fillPalm(real, 'rgba(124, 106, 239, 0.18)');
            drawingUtils.drawConnectors(real, connections, {
                color: 'rgba(124, 106, 239, 0.9)',
                lineWidth: 3,
            });
            drawingUtils.drawLandmarks(real, {
                color: '#ffffff',
                fillColor: '#9d8df0',
                lineWidth: 1,
                radius: 4,
            });

            // Phantom hand — ghostly, breathing glow
            const breathe = 12 + 8 * Math.sin(now / 450);
            ctx.save();
            ctx.shadowColor = 'rgba(140, 220, 255, 0.9)';
            ctx.shadowBlur = breathe;
            fillPalm(phantom, 'rgba(140, 220, 255, 0.14)');
            drawingUtils.drawConnectors(phantom, connections, {
                color: 'rgba(170, 230, 255, 0.6)',
                lineWidth: 3.5,
            });
            drawingUtils.drawLandmarks(phantom, {
                color: 'rgba(220, 245, 255, 0.85)',
                fillColor: 'rgba(140, 220, 255, 0.5)',
                lineWidth: 1,
                radius: 4.5,
            });
            ctx.restore();
        } else if (trails.length > 0) {
            trails.length = 0;
        }

        const tracker = fpsRef.current;
        tracker.frames++;
        if (now - tracker.last > 500) {
            setFps(Math.round((tracker.frames * 1000) / (now - tracker.last)));
            setTracking(hasHand);
            tracker.frames = 0;
            tracker.last = now;
        }

        session.rafId = requestAnimationFrame(loop);
    }

    function stop() {
        stopSession();
        setStatus('idle');
        setTracking(false);
        setFps(0);
    }

    return (
        <section className={`section ${styles.mirror}`} id="mirror">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Live Demo · Assistive Tech Preview</span>
                    <h2 className="section-header__title">Mirror Therapy, Without the Mirror Box</h2>
                    <p className="section-header__description">
                        Mirror-box therapy reduces phantom limb pain by showing amputees their
                        missing limb moving again. This preview recreates that illusion with hand
                        tracking: show one hand, and its phantom twin moves on the other side.
                    </p>
                </div>

                <div className={styles.lab}>
                    {/* Camera stage */}
                    <div className={styles.stage}>
                        <video ref={videoRef} className={styles.video} playsInline muted />
                        <canvas ref={canvasRef} className={styles.overlay} />

                        {status !== 'running' && (
                            <div className={styles.stageIdle}>
                                {status === 'error' ? (
                                    <p className={styles.error}>{errorMessage}</p>
                                ) : (
                                    <p className={styles.privacy}>
                                        🔒 Runs entirely on your device. Video never leaves your
                                        browser.
                                    </p>
                                )}
                                <button
                                    onClick={start}
                                    className="btn btn--primary"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Loading model…' : '🪞 Start the Mirror'}
                                </button>
                            </div>
                        )}

                        {status === 'running' && (
                            <>
                                <span className={styles.fpsBadge}>{fps} FPS</span>
                                <span className={`${styles.trackBadge} ${tracking ? styles.trackOn : ''}`}>
                                    {tracking ? 'Phantom active' : 'Show one hand'}
                                </span>
                            </>
                        )}
                    </div>

                    {/* Side panel */}
                    <div className={styles.panel}>
                        <span className={styles.panelLabel}>Try These</span>
                        <ul className={styles.exerciseList}>
                            {EXERCISES.map((exercise, index) => (
                                <li key={index} className={styles.exercise}>
                                    <span className={styles.exerciseNumber}>
                                        {String(index + 1).padStart(2, '0')}
                                    </span>
                                    {exercise}
                                </li>
                            ))}
                        </ul>

                        <div className={styles.science}>
                            <span className={styles.panelLabel}>The Science</span>
                            <p className={styles.scienceText}>
                                Mirror therapy (Ramachandran, 1990s) exploits visual feedback:
                                seeing the &quot;missing&quot; limb move can reduce phantom pain.
                                Hand tracking removes the physical mirror box, making the
                                therapy portable and measurable. The full{' '}
                                <Link href="/projects/phantom-limb-vr">WebXR version</Link> is in
                                development.
                            </p>
                        </div>

                        {status === 'running' && (
                            <button onClick={stop} className={styles.stopBtn}>
                                Stop camera
                            </button>
                        )}
                    </div>
                </div>

                <p className={styles.disclaimer}>
                    Concept demonstration of the interaction, not a medical device and not
                    medical advice.
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
