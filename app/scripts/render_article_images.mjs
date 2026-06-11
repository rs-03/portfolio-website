/**
 * Renders branded cover images + pipeline diagrams for the dev.to articles.
 * Hand-built SVGs in the site's dark theme, rasterized to PNG via sharp.
 *
 * Run from app/:  node scripts/render_article_images.mjs
 * Output:         ../articles/images/*.png
 */
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const outDir = join(here, '..', '..', 'articles', 'images');
mkdirSync(outDir, { recursive: true });

const C = {
    bg: '#0a0a14',
    bg2: '#12121f',
    card: '#16162a',
    border: 'rgba(255,255,255,0.14)',
    purple: '#7c6aef',
    purpleSoft: '#9d8df0',
    cyan: '#8cdcff',
    amber: '#fbbf24',
    green: '#4ade80',
    red: '#f87171',
    text: '#f0f0f5',
    muted: '#8888a0',
};
const FONT = 'Segoe UI, Arial, sans-serif';

const esc = s => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

/* ---------- shared SVG fragments ---------- */

function defs() {
    return `<defs>
        <linearGradient id="accent" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="${C.purple}"/><stop offset="1" stop-color="${C.purpleSoft}"/>
        </linearGradient>
        <radialGradient id="glow" cx="0.3" cy="0">
            <stop offset="0" stop-color="rgba(124,106,239,0.28)"/><stop offset="1" stop-color="rgba(124,106,239,0)"/>
        </radialGradient>
    </defs>`;
}

function frame(width, height, body) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
        ${defs()}
        <rect width="${width}" height="${height}" fill="${C.bg}"/>
        <rect width="${width}" height="${height}" fill="url(#glow)"/>
        ${body}
    </svg>`;
}

function box(x, y, w, h, label, sub = '', stroke = C.border) {
    return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="14" fill="${C.card}" stroke="${stroke}" stroke-width="1.5"/>
        <text x="${x + w / 2}" y="${y + (sub ? h / 2 - 4 : h / 2 + 6)}" text-anchor="middle" font-family="${FONT}" font-size="19" font-weight="600" fill="${C.text}">${esc(label)}</text>
        ${sub ? `<text x="${x + w / 2}" y="${y + h / 2 + 22}" text-anchor="middle" font-family="${FONT}" font-size="14" fill="${C.muted}">${esc(sub)}</text>` : ''}`;
}

function arrow(x1, y1, x2, y2, color = C.purple) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const ax = x2 - 12 * Math.cos(angle), ay = y2 - 12 * Math.sin(angle);
    const left = angle + 2.6, right = angle - 2.6;
    return `<line x1="${x1}" y1="${y1}" x2="${ax}" y2="${ay}" stroke="${color}" stroke-width="2.5" stroke-dasharray="7 5"/>
        <path d="M ${x2} ${y2} L ${x2 + 13 * Math.cos(left)} ${y2 + 13 * Math.sin(left)} L ${x2 + 13 * Math.cos(right)} ${y2 + 13 * Math.sin(right)} Z" fill="${color}"/>`;
}

function flowRow(nodes, y, width, h = 72) {
    const gap = 46;
    const w = (width - 120 - gap * (nodes.length - 1)) / nodes.length;
    let svg = '';
    nodes.forEach((node, i) => {
        const x = 60 + i * (w + gap);
        svg += box(x, y, w, h, node[0], node[1] || '');
        if (i < nodes.length - 1) {
            svg += arrow(x + w + 4, y + h / 2, x + w + gap - 4, y + h / 2);
        }
    });
    return svg;
}

function heading(title, sub, width) {
    return `<text x="60" y="64" font-family="${FONT}" font-size="30" font-weight="700" fill="${C.text}">${esc(title)}</text>
        <text x="60" y="96" font-family="${FONT}" font-size="17" fill="${C.muted}">${esc(sub)}</text>
        <rect x="60" y="112" width="${width - 120}" height="2" fill="url(#accent)" opacity="0.5"/>`;
}

function footer(width, height) {
    return `<text x="${width - 60}" y="${height - 28}" text-anchor="end" font-family="${FONT}" font-size="14" fill="${C.muted}">rs-03.github.io/portfolio-website · runs entirely in the browser</text>`;
}

/* ---------- hand skeleton (MediaPipe-style 21 landmarks) ---------- */

const HAND_POINTS = [
    [0.50, 0.96], // 0 wrist
    [0.39, 0.84], [0.30, 0.73], [0.24, 0.63], [0.19, 0.55], // thumb
    [0.42, 0.62], [0.40, 0.46], [0.39, 0.35], [0.38, 0.26], // index
    [0.50, 0.60], [0.50, 0.42], [0.50, 0.30], [0.50, 0.20], // middle
    [0.58, 0.62], [0.59, 0.46], [0.60, 0.35], [0.61, 0.27], // ring
    [0.66, 0.67], [0.69, 0.55], [0.71, 0.46], [0.72, 0.39], // pinky
];
const HAND_BONES = [
    [0, 1], [1, 2], [2, 3], [3, 4],
    [0, 5], [5, 6], [6, 7], [7, 8],
    [5, 9], [9, 10], [10, 11], [11, 12],
    [9, 13], [13, 14], [14, 15], [15, 16],
    [13, 17], [0, 17], [17, 18], [18, 19], [19, 20],
];

function hand(cx, cy, size, color, dotFill, mirror = false, opacity = 1) {
    const pt = i => {
        const [px, py] = HAND_POINTS[i];
        const x = cx + ((mirror ? 1 - px : px) - 0.5) * size;
        return [x, cy + (py - 0.55) * size];
    };
    let svg = `<g opacity="${opacity}">`;
    for (const [a, b] of HAND_BONES) {
        const [x1, y1] = pt(a), [x2, y2] = pt(b);
        svg += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${color}" stroke-width="3" stroke-linecap="round"/>`;
    }
    for (let i = 0; i < 21; i++) {
        const [x, y] = pt(i);
        svg += `<circle cx="${x}" cy="${y}" r="4.5" fill="${dotFill}" stroke="#fff" stroke-width="1"/>`;
    }
    return svg + '</g>';
}

/* ---------- covers ---------- */

function cover(_emoji, line1, line2, tagline, badge = 'LIVE DEMO INSIDE') {
    const width = 1000, height = 420;
    // decorative constellation rings on the right (emoji don't render in librsvg)
    let rings = '';
    for (let i = 0; i < 3; i++) {
        rings += `<circle cx="${width - 110}" cy="${height / 2 + 30}" r="${70 + i * 52}" fill="none" stroke="${C.purple}" stroke-width="1.5" opacity="${0.3 - i * 0.08}" stroke-dasharray="${i === 1 ? '6 8' : 'none'}"/>`;
    }
    rings += `<circle cx="${width - 110}" cy="${height / 2 + 30}" r="10" fill="url(#accent)"/>
        <circle cx="${width - 180}" cy="${height / 2 - 40}" r="5" fill="${C.cyan}" opacity="0.8"/>
        <circle cx="${width - 40}" cy="${height / 2 + 110}" r="4" fill="${C.purpleSoft}" opacity="0.8"/>
        <line x1="${width - 180}" y1="${height / 2 - 40}" x2="${width - 110}" y2="${height / 2 + 30}" stroke="${C.purple}" stroke-width="1" opacity="0.4"/>
        <line x1="${width - 110}" y1="${height / 2 + 30}" x2="${width - 40}" y2="${height / 2 + 110}" stroke="${C.purple}" stroke-width="1" opacity="0.4"/>`;

    return frame(width, height, `
        <rect x="0" y="0" width="${width}" height="6" fill="url(#accent)"/>
        ${rings}
        <circle cx="84" cy="116" r="7" fill="${C.green}"/>
        <text x="102" y="122" font-family="${FONT}" font-size="16" font-weight="600" letter-spacing="2" fill="${C.green}">${esc(badge)}</text>
        <text x="70" y="218" font-family="${FONT}" font-size="48" font-weight="800" fill="${C.text}">${esc(line1)}</text>
        <text x="70" y="276" font-family="${FONT}" font-size="48" font-weight="800" fill="${C.purpleSoft}">${esc(line2)}</text>
        <text x="70" y="338" font-family="${FONT}" font-size="20" fill="${C.muted}">${esc(tagline)}</text>
    `);
}

/* ---------- diagrams ---------- */

const W = 1200, H = 640;

function coughDiagram() {
    const melY = 300;
    let mel = `<text x="60" y="${melY - 16}" font-family="${FONT}" font-size="16" fill="${C.muted}">26 triangular mel filters, finer resolution where human hearing is</text>`;
    for (let i = 0; i < 26; i++) {
        const fx = 60 + Math.pow(i / 26, 1.45) * 1040;
        const fw = 28 + Math.pow(i / 26, 1.45) * 70;
        mel += `<path d="M ${fx} ${melY + 110} L ${fx + fw / 2} ${melY + 10} L ${fx + fw} ${melY + 110}" fill="none" stroke="${i % 2 ? C.purple : C.cyan}" stroke-width="2" opacity="0.75"/>`;
    }
    const vy = melY + 160;
    const verdicts = [
        ['✓ consistent', C.green, 'similarity ≥ 0.92'],
        ['~ some deviation', C.amber, '0.80 – 0.92'],
        ['▲ significant', C.red, '< 0.80'],
    ];
    let verdictRow = '';
    verdicts.forEach(([label, color, sub], i) => {
        const x = 620 + i * 190;
        verdictRow += `<rect x="${x}" y="${vy}" width="175" height="58" rx="12" fill="${C.card}" stroke="${color}" stroke-width="1.5"/>
            <text x="${x + 87}" y="${vy + 25}" text-anchor="middle" font-family="${FONT}" font-size="15" font-weight="600" fill="${color}">${esc(label)}</text>
            <text x="${x + 87}" y="${vy + 45}" text-anchor="middle" font-family="${FONT}" font-size="12" fill="${C.muted}">${esc(sub)}</text>`;
    });
    return frame(W, H, `
        ${heading('Cough fingerprint pipeline', 'Zero ML libraries: a hand-written FFT → mel filterbank → MFCC chain, verified against a reference DFT to 1e-14', W)}
        ${flowRow([['Record', '2s, trim to peak'], ['Frame + window', 'Hamming, 1024'], ['FFT', 'radix-2, 40 lines'], ['Mel + DCT', '26 filters → 12 MFCC'], ['Fingerprint', 'mean+std, 24-d']], 150, W)}
        ${mel}
        <text x="60" y="${vy + 36}" font-family="${FONT}" font-size="18" font-weight="600" fill="${C.text}">cosine similarity vs. YOUR baseline →</text>
        ${verdictRow}
        ${footer(W, H)}
    `);
}

function mirrorDiagram() {
    const cy = 400;
    return frame(W, H, `
        ${heading('The mirror-box illusion, digitized', 'One hand tracked → its phantom twin rendered across the mirror plane, every frame', W)}
        ${flowRow([['Webcam', 'on-device only'], ['Hand landmarks', '21 keypoints'], ['Reflect', 'x → 1 − x'], ['Render twin', 'glow + trails']], 150, W)}
        <line x1="${W / 2}" y1="280" x2="${W / 2}" y2="600" stroke="${C.cyan}" stroke-width="2" stroke-dasharray="10 12" opacity="0.55"/>
        <text x="${W / 2}" y="268" text-anchor="middle" font-family="${FONT}" font-size="14" fill="${C.cyan}" opacity="0.8">mirror plane</text>
        ${hand(W / 2 - 250, cy, 280, C.purple, C.purpleSoft)}
        <text x="${W / 2 - 250}" y="590" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${C.purpleSoft}">your real hand</text>
        ${hand(W / 2 + 250, cy, 280, C.cyan, 'rgba(140,220,255,0.55)', true, 0.65)}
        <text x="${W / 2 + 250}" y="590" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${C.cyan}">phantom twin</text>
        ${footer(W, H)}
    `);
}

function camoDiagram() {
    const levels = [
        ['Close ~5m', 1.0, '96%', C.red],
        ['Mid ~15m', 0.45, '41%', C.amber],
        ['Far ~30m', 0.22, 'not seen', C.green],
        ['V.far ~50m', 0.12, 'not seen', C.green],
    ];
    let ladder = '';
    levels.forEach(([label, scale, conf, color], i) => {
        const x = 80 + i * 280;
        const size = 170 * scale + 24;
        const cx = x + 105, cyBase = 470;
        ladder += `<rect x="${cx - size / 2}" y="${cyBase - size}" width="${size}" height="${size}" rx="8" fill="${C.bg2}" stroke="${color}" stroke-width="2"/>
            <circle cx="${cx}" cy="${cyBase - size * 0.62}" r="${size * 0.13}" fill="${C.muted}"/>
            <rect x="${cx - size * 0.11}" y="${cyBase - size * 0.52}" width="${size * 0.22}" height="${size * 0.36}" rx="${size * 0.05}" fill="${C.muted}"/>
            <text x="${cx}" y="${cyBase + 30}" text-anchor="middle" font-family="${FONT}" font-size="16" font-weight="600" fill="${C.text}">${esc(label)}</text>
            <text x="${cx}" y="${cyBase + 54}" text-anchor="middle" font-family="${FONT}" font-size="15" fill="${color}">person: ${esc(conf)}</text>`;
        if (i < levels.length - 1) ladder += arrow(x + 215, cyBase - 80, x + 270, cyBase - 80, C.muted);
    });
    return frame(W, H, `
        ${heading('Distance = pixels on target', 'The same photo, downscaled and re-run through the detector, producing a detection range profile', W)}
        ${flowRow([['Photo', 'analyzed on-device'], ['Downscale ×4', 'simulate range'], ['COCO-SSD', 'the adversary'], ['Stealth score', 'avg miss rate']], 150, W)}
        ${ladder}
        ${footer(W, H)}
    `);
}

function digitDiagram() {
    const layers = [
        { x: 220, n: 12, label: '784', sub: '28×28 input' },
        { x: 480, n: 9, label: '128', sub: 'ReLU' },
        { x: 720, n: 7, label: '64', sub: 'ReLU' },
        { x: 950, n: 5, label: '10', sub: 'softmax' },
    ];
    let net = '';
    const yMid = 400, spread = 230;
    // edges (sampled)
    for (let li = 0; li < layers.length - 1; li++) {
        const a = layers[li], b = layers[li + 1];
        for (let i = 0; i < a.n; i += 2) {
            for (let j = 0; j < b.n; j += 2) {
                const y1 = yMid - spread / 2 + (i / (a.n - 1)) * spread;
                const y2 = yMid - spread / 2 + (j / (b.n - 1)) * spread;
                net += `<line x1="${a.x}" y1="${y1}" x2="${b.x}" y2="${y2}" stroke="${C.purple}" stroke-width="1" opacity="0.18"/>`;
            }
        }
    }
    for (const layer of layers) {
        for (let i = 0; i < layer.n; i++) {
            const y = yMid - spread / 2 + (i / (layer.n - 1)) * spread;
            net += `<circle cx="${layer.x}" cy="${y}" r="7" fill="${C.card}" stroke="${C.purpleSoft}" stroke-width="1.5"/>`;
        }
        net += `<text x="${layer.x}" y="${yMid + spread / 2 + 38}" text-anchor="middle" font-family="${FONT}" font-size="18" font-weight="700" fill="${C.text}">${layer.label}</text>
            <text x="${layer.x}" y="${yMid + spread / 2 + 60}" text-anchor="middle" font-family="${FONT}" font-size="13" fill="${C.muted}">${layer.sub}</text>`;
    }
    return frame(W, H, `
        ${heading('784 → 128 → 64 → 10, trained in raw NumPy', 'Hand-written backprop + Adam · int8-quantized to 145 KB · browser inference matches Python to 1e-6', W)}
        ${flowRow([['Train', 'NumPy only, 98.2%'], ['Quantize', 'int8 · 430→145 KB'], ['Ship', 'JSON in the page'], ['Infer', '~80 lines of JS']], 150, W)}
        ${net}
        ${footer(W, H)}
    `);
}

function keypointsDiagram() {
    const cx = 300, cy = 420;
    // pinch line between thumb tip (4) and index tip (8)
    const size = 300;
    const p = i => [cx + (HAND_POINTS[i][0] - 0.5) * size, cy + (HAND_POINTS[i][1] - 0.55) * size];
    const [tx, ty] = p(4), [ix, iy] = p(8);
    const [wx, wy] = p(0), [mx, my] = p(9);
    const steps = [
        ['1. scale reference', 'palm length = the ruler', C.purpleSoft],
        ['2. relative measure', 'pinch ÷ palm, distance-stable', C.cyan],
        ['3. real units', '× 8.5 cm avg palm → "≈ 3.2 cm"', C.amber],
        ['4. decision', 'threshold → action', C.green],
    ];
    let stepBoxes = '';
    steps.forEach(([label, sub, color], i) => {
        const y = 280 + i * 82;
        stepBoxes += `<rect x="620" y="${y}" width="520" height="64" rx="12" fill="${C.card}" stroke="${color}" stroke-width="1.5"/>
            <text x="648" y="${y + 28}" font-family="${FONT}" font-size="17" font-weight="600" fill="${color}">${esc(label)}</text>
            <text x="648" y="${y + 50}" font-family="${FONT}" font-size="14" fill="${C.muted}">${esc(sub)}</text>`;
    });
    return frame(W, H, `
        ${heading('Keypoints are step one. Measurements are the product.', 'landmark → scale reference → relative measurement → real units → decision', W)}
        ${flowRow([['Frame', '30 FPS'], ['21 landmarks', 'per hand'], ['Geometry', '3 lines each'], ['Readout', 'cm, count, %']], 150, W)}
        ${hand(cx, cy, size, C.purple, C.purpleSoft)}
        <line x1="${wx}" y1="${wy}" x2="${mx}" y2="${my}" stroke="${C.purpleSoft}" stroke-width="5" opacity="0.85"/>
        <text x="${wx + 38}" y="${(wy + my) / 2 + 30}" font-family="${FONT}" font-size="14" fill="${C.purpleSoft}">palm = ruler</text>
        <line x1="${tx}" y1="${ty}" x2="${ix}" y2="${iy}" stroke="${C.amber}" stroke-width="3" stroke-dasharray="7 5"/>
        <text x="${(tx + ix) / 2 - 10}" y="${(ty + iy) / 2 - 16}" text-anchor="middle" font-family="${FONT}" font-size="17" font-weight="700" fill="${C.amber}">≈ 3.2 cm</text>
        ${stepBoxes}
        ${footer(W, H)}
    `);
}

/* ---------- render ---------- */

const jobs = [
    ['01-cough-cover.png', cover('🫁', 'Your Cough Has', 'a Fingerprint', 'Hand-rolling an FFT and MFCCs in JavaScript, all on-device')],
    ['01-cough-diagram.png', coughDiagram()],
    ['02-mirror-cover.png', cover('🪞', 'Mirror Therapy,', 'Without the Mirror Box', 'Treating phantom limbs with a webcam and 21 keypoints')],
    ['02-mirror-diagram.png', mirrorDiagram()],
    ['03-camo-cover.png', cover('🎯', 'Can an AI', 'Spot You?', 'Testing camouflage against the real adversary: a detection model')],
    ['03-camo-diagram.png', camoDiagram()],
    ['04-digit-cover.png', cover('✍️', 'A Neural Net in 145 KB:', 'No TensorFlow, No Server', 'Trained from scratch in NumPy, running as pure JavaScript')],
    ['04-digit-diagram.png', digitDiagram()],
    ['06-reticle-cover.png', cover('', 'Annotation at', 'Keyboard Speed', 'Why I built my own labeling tool, then open-sourced it', 'OPEN SOURCE / MIT')],
    ['05-keypoints-cover.png', cover('🖐️', 'From Keypoints', 'to Measurements', 'Why landmarks alone are useless, and what to build on top')],
    ['05-keypoints-diagram.png', keypointsDiagram()],
];

for (const [name, svg] of jobs) {
    await sharp(Buffer.from(svg), { density: 144 }).png().toFile(join(outDir, name));
    console.log('rendered', name);
}
console.log(`\nDone → ${outDir}`);
