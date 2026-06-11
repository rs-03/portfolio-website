/**
 * Finalizes the dev.to drafts: embeds hosted diagrams, sets cover images,
 * and PUBLISHES all five articles. Idempotent — already-published or
 * user-edited bodies (containing images) are preserved.
 *
 * Run: $env:DEV_TO_API_KEY = "..."; node scripts/finalize_articles.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const articlesDir = join(here, '..', 'articles');
const ledgerPath = join(articlesDir, '.published.json');
const API_KEY = process.env.DEV_TO_API_KEY;
const ASSETS = 'https://raw.githubusercontent.com/rs-03/article-assets/main';

if (!API_KEY) {
    console.error('DEV_TO_API_KEY is not set.');
    process.exit(1);
}

const SITE = 'https://rs-03.github.io/demos/';
const ARTICLES = [
    { file: '01-cough-monitor.md', cover: '01-cough-cover.png', diagram: '01-cough-diagram.png', canonical: `${SITE}#cough`, alt: 'Cough fingerprint pipeline: record, FFT, mel filterbank, MFCC fingerprint, similarity verdict' },
    { file: '02-mirror-therapy.md', cover: '02-mirror-cover.png', diagram: '02-mirror-diagram.png', canonical: `${SITE}#mirror`, alt: 'The mirror-box illusion digitized: webcam, hand landmarks, reflection, rendered phantom twin' },
    { file: '03-camouflage.md', cover: '03-camo-cover.png', diagram: '03-camo-diagram.png', canonical: `${SITE}#camouflage`, alt: 'Distance simulation: the same photo downscaled four times and re-run through the detector' },
    { file: '04-digit-recognizer.md', cover: '04-digit-cover.png', diagram: '04-digit-diagram.png', canonical: `${SITE}#live-demo`, alt: '784-128-64-10 network trained in raw NumPy, int8-quantized, run in the browser' },
    { file: '05-keypoints.md', cover: '05-keypoints-cover.png', diagram: '05-keypoints-diagram.png', canonical: `${SITE}#keypoints`, alt: 'Hand skeleton with pinch ruler and the landmark-to-decision measurement ladder' },
];

const headers = {
    'Content-Type': 'application/json',
    'api-key': API_KEY,
    accept: 'application/vnd.forem.api-v1+json',
};

const draftsResponse = await fetch('https://dev.to/api/articles/me/unpublished?per_page=100', { headers });
const drafts = await draftsResponse.json();
const ledger = JSON.parse(readFileSync(ledgerPath, 'utf8'));

const markerPattern = /<!--\s*👉 drag articles\/images\/[\w.-]+ here\s*-->/;

for (const spec of ARTICLES) {
    const localPath = join(articlesDir, spec.file);
    const raw = readFileSync(localPath, 'utf8');
    const title = raw.match(/^#\s+(.+)$/m)[1].trim();
    const imageMarkdown = `![${spec.alt}](${ASSETS}/${spec.diagram})`;

    // keep the local copy in sync with the hosted image
    if (markerPattern.test(raw)) {
        writeFileSync(localPath, raw.replace(markerPattern, imageMarkdown));
    }

    const draft = drafts.find(d => d.title === title);
    if (!draft) {
        console.log(`SKIP  ${spec.file} — no draft titled "${title}" (already published?)`);
        continue;
    }

    // user-edited drafts (already contain images) are preserved as-is
    let body = draft.body_markdown;
    if (!body.includes('![')) {
        body = readFileSync(localPath, 'utf8').replace(/^#\s+.+$/m, '').trim();
    } else if (markerPattern.test(body)) {
        body = body.replace(markerPattern, imageMarkdown);
    }

    const put = await fetch(`https://dev.to/api/articles/${draft.id}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
            article: {
                body_markdown: body,
                main_image: `${ASSETS}/${spec.cover}`,
                canonical_url: spec.canonical,
                published: true,
            },
        }),
    });

    if (!put.ok) {
        console.error(`FAIL  ${spec.file} — HTTP ${put.status}: ${await put.text()}`);
        continue;
    }

    const result = await put.json();
    ledger[spec.file] = result.url;
    writeFileSync(ledgerPath, JSON.stringify(ledger, null, 2));
    console.log(`LIVE  ${spec.file} → ${result.url}`);

    await new Promise(resolve => setTimeout(resolve, 1500));
}

console.log('\nAll done — update ARTICLE_URL constants with the URLs above.');
