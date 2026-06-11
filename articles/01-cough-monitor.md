# Your Cough Has a Fingerprint: Hand-Rolling an FFT and MFCCs in JavaScript

*I built a personal cough-health monitor that runs entirely in the browser: no ML framework, no server, no audio ever leaving your device. Here's how, down to the math.*

## The idea: deviation, not classification

Most "AI cough detection" projects train a classifier on a population dataset: thousands of strangers' coughs, labeled sick or healthy. That approach has a fundamental problem: *your* healthy cough might sound like someone else's sick one.

So I inverted it. Record your own healthy cough a few times to establish a **personal acoustic baseline**. Later, the system answers a much easier question: *how different does your cough sound from your own baseline?* No training data needed. No model. Just signal processing, which means it can run anywhere, instantly, privately.

## The pipeline

Every cough becomes a 24-dimensional acoustic fingerprint:

```
microphone → trim to cough peak → frame (Hamming window)
→ FFT → mel filterbank (26 filters) → log → DCT
→ 12 MFCCs → mean + std across frames = fingerprint
```

This is the classic MFCC (mel-frequency cepstral coefficients) front-end used in speech recognition for decades, but implemented from scratch in ~200 lines of JavaScript, because shipping TensorFlow.js for what is fundamentally an FFT felt absurd.

![Cough fingerprint pipeline: record, FFT, mel filterbank, MFCC fingerprint, similarity verdict](https://raw.githubusercontent.com/rs-03/article-assets/main/01-cough-diagram.png)


## The FFT, in 40 lines

The heart is an iterative radix-2 Cooley–Tukey FFT:

```javascript
for (let len = 2; len <= n; len <<= 1) {
    const angle = (-2 * Math.PI) / len;
    const wRe = Math.cos(angle), wIm = Math.sin(angle);
    for (let i = 0; i < n; i += len) {
        let curRe = 1, curIm = 0;
        for (let j = 0; j < len / 2; j++) {
            // butterfly: combine even/odd halves
            ...
        }
    }
}
```

Mel filters then pool FFT bins the way human hearing does (finer resolution at low frequencies, coarser at high), and a DCT decorrelates the log energies into compact coefficients. Two coughs are compared by cosine similarity between their fingerprints.

## Verify, don't vibe

Hand-rolled DSP is exactly the kind of code that *looks* right and is subtly wrong. So the whole pipeline is pure functions, unit-tested in Node before it ever touched a browser:

- FFT output vs. a naive O(n²) DFT reference: **max difference 1e-14**
- Identical signal vs. itself: **similarity 1.000**
- Same synthetic "cough" with added noise and 30% volume change: **0.998** (volume invariance matters; you won't cough at calibrated loudness)
- Spectrally different burst: **~0.0**

That last pair is the whole product: robust to irrelevant variation, sensitive to spectral change.

## The demo is the floor, not the ceiling

The live demo is deliberately minimal: three baseline coughs, one comparison, one verdict. That is the smallest version that proves the core mechanism honestly, and it runs in thirty seconds on any device. The concept underneath is a research program:

- **Adaptive baselines.** A fixed baseline ages; respiratory health drifts with seasons, allergies, and habits. The next step is a slowly adapting baseline (exponentially weighted, with change-point detection) that distinguishes "your cough evolved gradually" from "your cough changed overnight", which is the clinically interesting event.
- **Trajectories, not snapshots.** A single deviation score is weak evidence. A two-week trend of rising deviation is a different signal entirely, and it is the one worth showing a doctor.
- **Confound separation.** The honest open problem: distinguishing illness-driven spectral change from microphone distance, background noise, and time of day. Promising attacks include recording-condition normalization, per-session calibration sounds, and paired healthy/sick data per person.
- **Beyond coughs.** Personal-baseline deviation generalizes to any repeated personal sound: voice fatigue for call-center workers and singers, breathing during sleep, machine acoustics on a factory floor. The pattern (baseline, deviation, trend) is the product; the cough is one instance.

There is also a real research gap here: population models dominate the audio-health literature largely because labeled population data exists. Personalized baseline approaches have almost no shared benchmarks. Building one, using anonymized fingerprints rather than raw audio, would be a genuine contribution.

## The pattern generalizes

This pattern, *personal baseline + deviation scoring instead of population classification*, applies way beyond coughs: machine vibration monitoring, voice fatigue, equipment acoustics. It's cheaper than collecting a labeled dataset, inherently personalized, and privacy-preserving by construction.

**Try it live** (your audio never leaves the page): [rs-03.github.io/demos](https://rs-03.github.io/demos/#cough)
**Source**: [github.com/rs-03/rs-03.github.io](https://github.com/rs-03/rs-03.github.io). See `dsp.js` and its parity test.

*Not a medical device; a demonstration of the signal-processing concept.*
