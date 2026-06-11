/**
 * Verifies the cough-monitor DSP pipeline in Node:
 *  1. FFT matches a naive DFT reference
 *  2. Mel filterbank is well-formed
 *  3. Identical signals → similarity ~1.0
 *  4. Spectrally different signals → clearly lower similarity
 *  5. Same signal with noise/gain changes → still high similarity
 *
 * Run: node scripts/test_cough_dsp.mjs
 */
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const dsp = await import(
    'file://' + join(here, '..', 'app', 'src', 'components', 'sections', 'CoughMonitor', 'dsp.js').replace(/\\/g, '/')
);

const SR = 48000;
let failures = 0;

function check(name, condition, detail = '') {
    console.log(`${condition ? 'PASS' : 'FAIL'}  ${name}${detail ? `  (${detail})` : ''}`);
    if (!condition) failures++;
}

/* 1. FFT vs naive DFT on a small random frame */
{
    const n = 64;
    const frame = Float64Array.from({ length: n }, (_, i) => Math.sin(i * 0.7) + 0.3 * Math.cos(i * 2.1));
    const power = dsp.powerSpectrum(frame);

    let maxDiff = 0;
    for (let k = 0; k <= n / 2; k++) {
        let re = 0, im = 0;
        for (let t = 0; t < n; t++) {
            re += frame[t] * Math.cos((-2 * Math.PI * k * t) / n);
            im += frame[t] * Math.sin((-2 * Math.PI * k * t) / n);
        }
        maxDiff = Math.max(maxDiff, Math.abs(power[k] - (re * re + im * im) / n));
    }
    check('FFT matches naive DFT', maxDiff < 1e-9, `max diff ${maxDiff.toExponential(2)}`);
}

/* 2. Mel filterbank shape */
{
    const filters = dsp.buildMelFilterbank(SR);
    const allHaveWeight = filters.every(f => f.some(w => w > 0));
    check('mel filterbank: 26 non-empty filters', filters.length === 26 && allHaveWeight);
}

/* helpers: synthetic "coughs" */
function burst(freqs, seconds = 1.0, noise = 0.05, gain = 1, seed = 1) {
    let s = seed;
    const rand = () => ((s = (s * 1103515245 + 12345) % 2 ** 31) / 2 ** 31) * 2 - 1;
    const n = Math.floor(SR * seconds);
    const out = new Float32Array(n);
    for (let i = 0; i < n; i++) {
        const t = i / SR;
        const envelope = Math.exp(-3 * t); // decaying burst, cough-like
        let v = 0;
        for (const f of freqs) v += Math.sin(2 * Math.PI * f * t) / freqs.length;
        out[i] = gain * envelope * (v + noise * rand());
    }
    return out;
}

const coughA = burst([220, 480, 900], 1.0, 0.05, 1, 1);
const coughA2 = burst([220, 480, 900], 1.0, 0.08, 0.7, 99); // same spectrum, different noise + gain
const coughB = burst([1500, 3200, 5200], 1.0, 0.05, 1, 7); // very different spectrum

const fpA = dsp.computeFingerprint(coughA, SR);
const fpA2 = dsp.computeFingerprint(coughA2, SR);
const fpB = dsp.computeFingerprint(coughB, SR);

check('fingerprints computed', !!fpA && !!fpA2 && !!fpB, `dim ${fpA?.fingerprint.length}`);

/* 3. identical signal */
{
    const { similarity } = dsp.compareToBaseline(fpA.fingerprint, [fpA.fingerprint]);
    check('identical signal similarity ~1.0', similarity > 0.999, similarity.toFixed(4));
}

/* 4. different spectrum → low similarity */
{
    const { similarity, verdict } = dsp.compareToBaseline(fpB.fingerprint, [fpA.fingerprint]);
    check('different signal clearly lower', similarity < 0.8, `${similarity.toFixed(4)} → ${verdict}`);
}

/* 5. same spectrum with noise/gain change → still high */
{
    const { similarity, verdict } = dsp.compareToBaseline(fpA2.fingerprint, [fpA.fingerprint]);
    check('noise/gain-perturbed same signal stays high', similarity > 0.9, `${similarity.toFixed(4)} → ${verdict}`);
}

console.log(failures === 0 ? '\nDSP OK' : `\n${failures} FAILURES`);
process.exit(failures === 0 ? 0 : 1);
