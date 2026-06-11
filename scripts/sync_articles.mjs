/**
 * Syncs local article text to the published dev.to articles.
 * Articles 02-05: local file is the source of truth (PUT body + title).
 * Article 01 (cough): the published body has user-placed images, so we
 * fetch it and apply the punctuation rewrites in place.
 *
 * Run: $env:DEV_TO_API_KEY = "..."; node scripts/sync_articles.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const articlesDir = join(here, '..', 'articles');
const API_KEY = process.env.DEV_TO_API_KEY;

if (!API_KEY) {
    console.error('DEV_TO_API_KEY is not set.');
    process.exit(1);
}

const headers = {
    'Content-Type': 'application/json',
    'api-key': API_KEY,
    accept: 'application/vnd.forem.api-v1+json',
};

const IDS = {
    '01-cough-monitor.md': 3868634,
    '02-mirror-therapy.md': 3868635,
    '03-camouflage.md': 3868636,
    '04-digit-recognizer.md': 3868637,
    '05-keypoints.md': 3868638,
};

// Site moved from rs-03.github.io/portfolio-website to the root domain
const CANONICALS = {
    '01-cough-monitor.md': 'https://rs-03.github.io/demos/#cough',
    '02-mirror-therapy.md': 'https://rs-03.github.io/demos/#mirror',
    '03-camouflage.md': 'https://rs-03.github.io/demos/#camouflage',
    '04-digit-recognizer.md': 'https://rs-03.github.io/demos/#live-demo',
    '05-keypoints.md': 'https://rs-03.github.io/demos/#keypoints',
};

const URL_MIGRATIONS = [
    ['rs-03.github.io/portfolio-website', 'rs-03.github.io'],
    ['github.com/rs-03/portfolio-website', 'github.com/rs-03/rs-03.github.io'],
];

// "Beyond the demo" section, inserted into the live cough body (which has
// user-placed images we must preserve). Idempotent via the includes() guard.
const COUGH_SECTION = `## The demo is the floor, not the ceiling

The live demo is deliberately minimal: three baseline coughs, one comparison, one verdict. That is the smallest version that proves the core mechanism honestly, and it runs in thirty seconds on any device. The concept underneath is a research program:

- **Adaptive baselines.** A fixed baseline ages; respiratory health drifts with seasons, allergies, and habits. The next step is a slowly adapting baseline (exponentially weighted, with change-point detection) that distinguishes "your cough evolved gradually" from "your cough changed overnight", which is the clinically interesting event.
- **Trajectories, not snapshots.** A single deviation score is weak evidence. A two-week trend of rising deviation is a different signal entirely, and it is the one worth showing a doctor.
- **Confound separation.** The honest open problem: distinguishing illness-driven spectral change from microphone distance, background noise, and time of day. Promising attacks include recording-condition normalization, per-session calibration sounds, and paired healthy/sick data per person.
- **Beyond coughs.** Personal-baseline deviation generalizes to any repeated personal sound: voice fatigue for call-center workers and singers, breathing during sleep, machine acoustics on a factory floor. The pattern (baseline, deviation, trend) is the product; the cough is one instance.

There is also a real research gap here: population models dominate the audio-health literature largely because labeled population data exists. Personalized baseline approaches have almost no shared benchmarks. Building one, using anonymized fingerprints rather than raw audio, would be a genuine contribution.

`;

// Rewrites applied to the cough article's live body (preserves user image edits)
const COUGH_REWRITES = [
    ["## What I'd tell a client", "## The pattern generalizes"],
    ["browser — no ML framework, no server, no audio ever leaving your device", "browser: no ML framework, no server, no audio ever leaving your device"],
    ["fundamental problem — *your* healthy cough", "fundamental problem: *your* healthy cough"],
    ["Just signal processing — which means it can run anywhere", "Just signal processing, which means it can run anywhere"],
    ["for decades — but implemented from scratch", "for decades, but implemented from scratch"],
    ["the way human hearing does — finer resolution at low frequencies, coarser at high — and a DCT", "the way human hearing does (finer resolution at low frequencies, coarser at high), and a DCT"],
    ["(volume invariance matters — you won't cough at calibrated loudness)", "(volume invariance matters; you won't cough at calibrated loudness)"],
    ["This pattern — *personal baseline + deviation scoring instead of population classification* — applies way beyond", "This pattern, *personal baseline + deviation scoring instead of population classification*, applies way beyond"],
    ["(https://github.com/rs-03/portfolio-website) — `dsp.js` and its parity test.", "(https://github.com/rs-03/portfolio-website). See `dsp.js` and its parity test."],
];

async function put(id, payload, label) {
    const response = await fetch(`https://dev.to/api/articles/${id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ article: payload }),
    });
    console.log(response.ok ? `SYNC  ${label} → #${id}` : `FAIL  ${label} — HTTP ${response.status}: ${await response.text()}`);
}

for (const [file, id] of Object.entries(IDS)) {
    if (file === '01-cough-monitor.md') {
        const response = await fetch(`https://dev.to/api/articles/${id}`, { headers });
        const article = await response.json();
        let body = article.body_markdown;
        let applied = 0;
        for (const [oldText, newText] of [...COUGH_REWRITES, ...URL_MIGRATIONS]) {
            while (body.includes(oldText)) {
                body = body.replace(oldText, newText);
                applied++;
            }
        }
        if (!body.includes('The demo is the floor, not the ceiling')) {
            body = body.replace("## What I'd tell a client", COUGH_SECTION + "## What I'd tell a client");
            applied++;
        }
        console.log(`cough: ${applied} rewrites applied to live body`);
        await put(id, { body_markdown: body, canonical_url: CANONICALS[file] }, file);
    } else {
        const raw = readFileSync(join(articlesDir, file), 'utf8');
        const title = raw.match(/^#\s+(.+)$/m)[1].trim();
        const body = raw.replace(/^#\s+.+$/m, '').trim();
        await put(id, { body_markdown: body, title, canonical_url: CANONICALS[file] }, file);
    }
    await new Promise(resolve => setTimeout(resolve, 1500));
}
console.log('done');
