'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import styles from './KeypointStudio.module.css';

const ARTICLE_URL = 'https://dev.to/rahul_sangamker_653e0c1ba/from-keypoints-to-measurements-why-landmarks-alone-are-useless-4oec';

const MEDIAPIPE_VERSION = '0.10.35';
const WASM_URL = `https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@${MEDIAPIPE_VERSION}/wasm`;
const MODEL_URL = 'https://storage.googleapis.com/mediapipe-models/gesture_recognizer/gesture_recognizer/float16/1/gesture_recognizer.task';

const GESTURE_LABELS = {
    Thumb_Up: '👍 Thumbs up',
    Thumb_Down: '👎 Thumbs down',
    Victory: '✌️ Victory',
    Open_Palm: '✋ Open palm',
    Closed_Fist: '✊ Fist',
    Pointing_Up: '☝️ Pointing up',
    ILoveYou: '🤟 I love you',
    None: 'Hand detected',
};

const distance2d = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);

// Average adult palm length (wrist → middle knuckle), used to convert
// the camera-relative pinch ratio into an approximate real-world gap
const AVG_PALM_CM = 8.5;

/**
 * Derive live measurements from the 21 landmarks — keypoints are only
 * useful once they become numbers. Palm length (wrist → middle MCP)
 * is the scale reference, like a known pole height in infrastructure work.
 */
function handMetrics(lm) {
    const wrist = lm[0];
    const palm = distance2d(wrist, lm[9]) || 1e-6;

    const pinch = distance2d(lm[4], lm[8]) / palm;
    const pinchCm = pinch * AVG_PALM_CM;

    let fingersUp = 0;
    for (const [tip, pip] of [[8, 6], [12, 10], [16, 14], [20, 18]]) {
        if (distance2d(lm[tip], wrist) > distance2d(lm[pip], wrist) * 1.1) fingersUp++;
    }
    if (distance2d(lm[4], wrist) > distance2d(lm[3], wrist) * 1.05) fingersUp++;

    const tipIds = [4, 8, 12, 16, 20];
    const avgTip = tipIds.reduce((sum, t) => sum + distance2d(lm[t], wrist), 0) / tipIds.length;
    const openness = Math.min(1, Math.max(0, (avgTip / palm - 0.9) / 1.3));

    return { pinchCm, fingersUp, openness };
}

/**
 * Live webcam keypoint detection + gesture recognition.
 * Models and WASM load lazily on camera start; every frame is
 * processed on-device — video never leaves the browser.
 */
export default function KeypointStudio() {
    const videoRef = useRef(null);
    const canvasRef = useRef(null);
    const sessionRef = useRef(null); // { recognizer, stream, rafId, drawingUtils, connections }
    const fpsRef = useRef({ frames: 0, last: 0 });

    const [status, setStatus] = useState('idle'); // idle | loading | running | error
    const [errorMessage, setErrorMessage] = useState('');
    const [hands, setHands] = useState([]);
    const [fps, setFps] = useState(0);

    useEffect(() => {
        return () => stopSession();
    }, []);

    function stopSession() {
        const session = sessionRef.current;
        if (!session) return;
        cancelAnimationFrame(session.rafId);
        session.stream?.getTracks().forEach(track => track.stop());
        session.recognizer?.close();
        sessionRef.current = null;
    }

    async function start() {
        setStatus('loading');
        setErrorMessage('');

        try {
            // Lazy-load MediaPipe only when the visitor opts in
            const vision = await import('@mediapipe/tasks-vision');
            const { FilesetResolver, GestureRecognizer, DrawingUtils } = vision;

            const fileset = await FilesetResolver.forVisionTasks(WASM_URL);
            const recognizer = await GestureRecognizer.createFromOptions(fileset, {
                baseOptions: { modelAssetPath: MODEL_URL, delegate: 'GPU' },
                runningMode: 'VIDEO',
                numHands: 2,
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
                recognizer,
                stream,
                rafId: 0,
                drawingUtils: new DrawingUtils(ctx),
                connections: GestureRecognizer.HAND_CONNECTIONS,
                ctx,
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

        const { recognizer, ctx, drawingUtils, connections } = session;
        const result = recognizer.recognizeForVideo(video, now);

        ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        const detected = [];
        if (result.landmarks) {
            result.landmarks.forEach((landmarks, i) => {
                drawingUtils.drawConnectors(landmarks, connections, {
                    color: 'rgba(124, 106, 239, 0.85)',
                    lineWidth: 3,
                });
                drawingUtils.drawLandmarks(landmarks, {
                    color: '#ffffff',
                    fillColor: '#9d8df0',
                    lineWidth: 1,
                    radius: 4,
                });

                const metrics = handMetrics(landmarks);

                // Measurement overlay: pinch line between thumb tip and index tip
                const { width, height } = ctx.canvas;
                const thumb = { x: landmarks[4].x * width, y: landmarks[4].y * height };
                const index = { x: landmarks[8].x * width, y: landmarks[8].y * height };
                ctx.save();
                ctx.setLineDash([6, 5]);
                ctx.strokeStyle = '#fbbf24';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.moveTo(thumb.x, thumb.y);
                ctx.lineTo(index.x, index.y);
                ctx.stroke();
                ctx.setLineDash([]);

                // Label (counter-mirrored so it reads correctly on the flipped canvas)
                const midX = (thumb.x + index.x) / 2;
                const midY = (thumb.y + index.y) / 2 - 10;
                ctx.font = '600 15px sans-serif';
                ctx.fillStyle = '#fbbf24';
                ctx.translate(midX, midY);
                ctx.scale(-1, 1);
                ctx.fillText(`≈ ${metrics.pinchCm.toFixed(1)} cm`, -28, 0);
                ctx.restore();

                const gesture = result.gestures?.[i]?.[0];
                const handedness = result.handedness?.[i]?.[0];
                detected.push({
                    // The preview is mirrored, so flip the reported side
                    side: handedness?.categoryName === 'Left' ? 'Right' : 'Left',
                    gesture: GESTURE_LABELS[gesture?.categoryName] || GESTURE_LABELS.None,
                    confidence: gesture?.score ?? 0,
                    metrics,
                });
            });
        }

        // Throttled UI updates (~6/s) so React isn't re-rendering every frame
        const tracker = fpsRef.current;
        tracker.frames++;
        if (now - tracker.last > 500) {
            setFps(Math.round((tracker.frames * 1000) / (now - tracker.last)));
            setHands(detected);
            tracker.frames = 0;
            tracker.last = now;
        }

        session.rafId = requestAnimationFrame(loop);
    }

    function stop() {
        stopSession();
        setStatus('idle');
        setHands([]);
        setFps(0);
    }

    return (
        <section className={`section ${styles.studio}`} id="keypoints">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Live Demo · Keypoints to Measurements</span>
                    <h2 className="section-header__title">21 Keypoints. Every Frame. Your Device.</h2>
                    <p className="section-header__description">
                        Keypoints only matter once they become measurements. This demo tracks
                        21 landmarks per hand and turns them into numbers: the real-world gap
                        between your thumb and index finger (the amber ruler on screen), how
                        many fingers you&apos;re holding up, and how open your hand is. That&apos;s the
                        same keypoints-to-measurements principle behind my utility pole
                        attachment-height and clearance work. Try pinching slowly.
                    </p>
                </div>

                <div className={styles.lab}>
                    {/* Camera stage */}
                    <div className={styles.stage}>
                        <video
                            ref={videoRef}
                            className={styles.video}
                            playsInline
                            muted
                        />
                        <canvas ref={canvasRef} className={styles.overlay} />

                        {status !== 'running' && (
                            <div className={styles.stageIdle}>
                                {status === 'error' ? (
                                    <p className={styles.error}>{errorMessage}</p>
                                ) : (
                                    <p className={styles.privacy}>
                                        🔒 Runs entirely on your device. Video never leaves your
                                        browser, nothing is recorded or uploaded.
                                    </p>
                                )}
                                <button
                                    onClick={start}
                                    className="btn btn--primary"
                                    disabled={status === 'loading'}
                                >
                                    {status === 'loading' ? 'Loading model…' : '📷 Start Camera'}
                                </button>
                            </div>
                        )}

                        {status === 'running' && (
                            <span className={styles.fpsBadge}>{fps} FPS</span>
                        )}
                    </div>

                    {/* Readout */}
                    <div className={styles.readout}>
                        <span className={styles.panelLabel}>Detections</span>

                        {status === 'running' && hands.length === 0 && (
                            <p className={styles.waiting}>Show a hand to the camera…</p>
                        )}
                        {status !== 'running' && (
                            <p className={styles.waiting}>Start the camera to see live detections.</p>
                        )}

                        {hands.map((hand, i) => (
                            <div key={i} className={styles.handCard}>
                                <span className={styles.handSide}>{hand.side} hand</span>
                                <span className={styles.handGesture}>{hand.gesture}</span>
                                <div className={styles.confTrack}>
                                    <div
                                        className={styles.confFill}
                                        style={{ width: `${Math.round(hand.confidence * 100)}%` }}
                                    />
                                </div>
                                <span className={styles.handConf}>
                                    {(hand.confidence * 100).toFixed(0)}% confidence
                                </span>

                                {hand.metrics && (
                                    <>
                                        <div className={styles.metricsGrid}>
                                            <div className={styles.metric}>
                                                <span className={styles.metricValue}>
                                                    ≈{hand.metrics.pinchCm.toFixed(1)}cm
                                                </span>
                                                <span className={styles.metricLabel}>🤏 pinch gap</span>
                                            </div>
                                            <div className={styles.metric}>
                                                <span className={styles.metricValue}>
                                                    {hand.metrics.fingersUp}
                                                </span>
                                                <span className={styles.metricLabel}>🖐️ fingers raised</span>
                                            </div>
                                            <div className={styles.metric}>
                                                <span className={styles.metricValue}>
                                                    {(hand.metrics.openness * 100).toFixed(0)}%
                                                </span>
                                                <span className={styles.metricLabel}>✋ open: fist→palm</span>
                                            </div>
                                        </div>
                                        <p className={styles.metricsNote}>
                                            Pinch gap = thumb tip to index tip (the amber line on
                                            screen), in real centimeters estimated from average palm
                                            length. Openness runs 0% (closed fist) to 100% (fully
                                            spread hand).
                                        </p>
                                    </>
                                )}
                            </div>
                        ))}

                        {status === 'running' && (
                            <button onClick={stop} className={styles.stopBtn}>
                                Stop camera
                            </button>
                        )}
                    </div>
                </div>

                <p className={styles.specs}>
                    21 keypoints per hand
                    <span className={styles.specDot}>·</span>
                    7 gesture classes
                    <span className={styles.specDot}>·</span>
                    GPU-accelerated in your browser
                    <span className={styles.specDot}>·</span>
                    zero frames uploaded
                </p>

                <details className={styles.underHood}>
                    <summary className={styles.underHoodSummary}>
                        Under the hood: what&apos;s actually running
                    </summary>
                    <div className={styles.underHoodBody}>
                        <ul className={styles.underHoodList}>
                            <li>
                                <strong>A three-stage vision pipeline</strong>: a palm-detection
                                model locates hands in the frame, a landmark model regresses 21
                                3D keypoints per hand, and a gesture classifier runs on top of
                                the landmark geometry.
                            </li>
                            <li>
                                <strong>The models are Google&apos;s MediaPipe</strong>
                                (float16-quantized), executed in-browser through WebAssembly with
                                a GPU delegate. Credit where due: I didn&apos;t train these.
                            </li>
                            <li>
                                <strong>My work is the engineering around them</strong>: lazy
                                loading so nothing downloads until you opt in, the render loop
                                and overlay, throttled UI updates, and clean camera lifecycle.
                            </li>
                            <li>
                                <strong>Knowing when to fine-tune instead</strong> is the real
                                skill: for utility-infrastructure keypoints, off-the-shelf models
                                weren&apos;t enough. See the{' '}
                                <Link href="/projects/keypoint-detection-llm">
                                    custom fine-tuned keypoint model
                                </Link>{' '}
                                I built for that.
                            </li>
                        </ul>
                    </div>
                </details>

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
