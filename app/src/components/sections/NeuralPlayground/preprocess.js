/**
 * Converts a drawing canvas into a MNIST-style 28x28 input vector,
 * matching how the training data was prepared: ink cropped to its
 * bounding box, scaled into a 20x20 box, and centered by center of
 * mass inside the 28x28 frame.
 *
 * Pure math (no canvas APIs) so it can be unit-tested in Node.
 */

const TARGET = 28;
const INNER = 20;

/**
 * @param {Uint8ClampedArray} rgba - source pixels (ink encoded in alpha)
 * @param {number} width
 * @param {number} height
 * @returns {Float32Array|null} 784 floats in [0,1], or null if the canvas is empty
 */
export function pixelsToInput(rgba, width, height) {
    // Ink intensity from the alpha channel
    const gray = new Float32Array(width * height);
    let minX = width, minY = height, maxX = -1, maxY = -1;

    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
            const a = rgba[(y * width + x) * 4 + 3] / 255;
            gray[y * width + x] = a;
            if (a > 0.05) {
                if (x < minX) minX = x;
                if (x > maxX) maxX = x;
                if (y < minY) minY = y;
                if (y > maxY) maxY = y;
            }
        }
    }

    if (maxX < 0) return null;

    const boxW = maxX - minX + 1;
    const boxH = maxY - minY + 1;
    const scale = INNER / Math.max(boxW, boxH);
    const outW = Math.max(1, Math.round(boxW * scale));
    const outH = Math.max(1, Math.round(boxH * scale));
    const offX = Math.floor((TARGET - outW) / 2);
    const offY = Math.floor((TARGET - outH) / 2);

    // Box-filter downsample of the cropped ink into the centered box
    const out = new Float32Array(TARGET * TARGET);
    for (let oy = 0; oy < outH; oy++) {
        const sy0 = minY + oy / scale;
        const sy1 = minY + (oy + 1) / scale;
        for (let ox = 0; ox < outW; ox++) {
            const sx0 = minX + ox / scale;
            const sx1 = minX + (ox + 1) / scale;
            let sum = 0, count = 0;
            for (let sy = Math.floor(sy0); sy < Math.min(Math.ceil(sy1), height); sy++) {
                for (let sx = Math.floor(sx0); sx < Math.min(Math.ceil(sx1), width); sx++) {
                    sum += gray[sy * width + sx];
                    count++;
                }
            }
            if (count > 0) {
                out[(oy + offY) * TARGET + (ox + offX)] = Math.min(1, (sum / count) * 1.25);
            }
        }
    }

    // Shift so the center of mass sits at the frame center (like MNIST)
    let total = 0, comX = 0, comY = 0;
    for (let y = 0; y < TARGET; y++) {
        for (let x = 0; x < TARGET; x++) {
            const v = out[y * TARGET + x];
            total += v;
            comX += v * x;
            comY += v * y;
        }
    }
    if (total === 0) return null;

    const shiftX = Math.round(TARGET / 2 - 0.5 - comX / total);
    const shiftY = Math.round(TARGET / 2 - 0.5 - comY / total);

    if (shiftX === 0 && shiftY === 0) return out;

    const shifted = new Float32Array(TARGET * TARGET);
    for (let y = 0; y < TARGET; y++) {
        const ny = y + shiftY;
        if (ny < 0 || ny >= TARGET) continue;
        for (let x = 0; x < TARGET; x++) {
            const nx = x + shiftX;
            if (nx < 0 || nx >= TARGET) continue;
            shifted[ny * TARGET + nx] = out[y * TARGET + x];
        }
    }
    return shifted;
}
