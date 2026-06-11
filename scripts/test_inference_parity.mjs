/**
 * Verifies the JS inference engine reproduces the Python model's
 * probabilities on 10 fixture digits (one per class).
 *
 * Run: node scripts/test_inference_parity.mjs
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));
const { createModel } = await import(
    'file://' + join(here, '..', 'app', 'src', 'components', 'sections', 'NeuralPlayground', 'inference.js').replace(/\\/g, '/')
);

const modelData = JSON.parse(readFileSync(join(here, '..', 'app', 'src', 'components', 'sections', 'NeuralPlayground', 'model.json'), 'utf8'));
const fixtures = JSON.parse(readFileSync(join(here, 'parity_fixtures.json'), 'utf8'));

const model = createModel(modelData);

let maxDiff = 0;
let correct = 0;

fixtures.inputs.forEach((input, i) => {
    const { probs } = model.forward(Float32Array.from(input));
    const expected = fixtures.expectedProbs[i];

    for (let j = 0; j < 10; j++) {
        maxDiff = Math.max(maxDiff, Math.abs(probs[j] - expected[j]));
    }

    const predicted = probs.indexOf(Math.max(...probs));
    if (predicted === fixtures.labels[i]) correct++;
    console.log(`digit ${fixtures.labels[i]}: predicted ${predicted}, confidence ${(Math.max(...probs) * 100).toFixed(1)}%`);
});

console.log(`\nmax prob diff vs Python: ${maxDiff.toExponential(2)}`);
console.log(`correct: ${correct}/10`);

if (maxDiff > 1e-4 || correct < 9) {
    console.error('PARITY FAILED');
    process.exit(1);
}
console.log('PARITY OK');
