# I Put a Neural Network Inside My Portfolio: No TensorFlow, No Server, 145 KB

*Training a network from scratch in raw NumPy, quantizing it to int8, and running it as ~80 lines of dependency-free JavaScript, with a parity test proving the browser matches Python to 1e-6.*

## Why bother? MNIST is a solved problem

Digit recognition is the "hello world" of ML, and that's exactly why I used it. The model isn't the point. The point is everything around the model, which happens to be the part that matters in production work too: training without a framework, compressing for deployment, running inference in a constrained environment, and *proving* the deployed system matches the trained one.

## Training: just NumPy and math

The network is a 784→128→64→10 MLP: hand-written forward pass, backpropagation, and Adam optimizer. No autograd, no framework:

```python
# backward pass, by hand
dz3 = (probs - y_batch) / batch_size
grads_w[2] = a2.T @ dz3
da2 = dz3 @ weights[2].T
dz2 = da2 * (z2 > 0)          # ReLU mask
grads_w[1] = a1.T @ dz2
...
```

![784-128-64-10 network trained in raw NumPy, int8-quantized, run in the browser](https://raw.githubusercontent.com/rs-03/article-assets/main/04-digit-diagram.png)

One trick that matters for a *drawing* demo specifically: **shift augmentation**. MNIST digits are centered; humans draw wherever they like. Training on randomly translated copies makes the model tolerant of sloppy placement. Combined with MNIST-style preprocessing at inference (crop to bounding box, scale into a 20×20 box, center by center-of-mass), real-world doodles classify reliably. Final test accuracy: **98.2%**.

## Compression: int8 in 15 lines

A float32 weight file would be ~430 KB. Symmetric int8 quantization cuts it ~4×:

```python
scale = np.abs(w).max() / 127.0
q = np.clip(np.round(w / scale), -127, 127).astype(np.int8)
```

One scale factor per layer, weights stored as base64 in JSON: **145 KB total**, and quantized test accuracy is *identical* to float: 98.2%.

## Inference: ~80 lines of plain JavaScript

In the browser, the weights are dequantized once on load, and inference is three matrix-vector products with ReLU and a softmax. ~109K multiply-adds, about a microsecond-scale problem for any modern device. No TensorFlow.js (that runtime is megabytes; the entire model is 145 KB).

## The part most deployments skip

Deployed-vs-trained drift is a real production failure mode, so the JS engine is tested against the Python model directly: ten fixture digits, expected probabilities exported from training, asserted in Node:

```
max prob diff vs Python: 1.14e-6
correct: 10/10
PARITY OK
```

If I change the inference code and break numerical equivalence, CI knows before a visitor does. That habit, *verifying the deployment artifact and not just the training run*, is worth more than another accuracy point.

## Where this goes beyond MNIST

The demo is intentionally the simplest possible instance, because the point is the deployment discipline around it, and that discipline scales to systems that matter:

- **Quantization with a budget.** Post-training int8 cost nothing here because the network is over-provisioned for the task. Real systems choose between quantization-aware training, mixed precision for sensitive layers, and distillation into a smaller student. The decision process stays identical: measure, compress, re-verify against parity fixtures.
- **The browser is becoming a serious inference target.** WASM SIMD and WebGPU put surprisingly large models within reach of a static page. The interesting product class is anything where privacy is the feature: medical screeners, document processing, anything users would refuse to upload.
- **Parity testing as a discipline.** The 1e-6 check between Python and JavaScript is a miniature of a production problem: proving the deployed artifact matches the trained one across runtimes, hardware, and compiler versions. Most teams discover deployment drift in production; fixtures catch it in CI.
- **From digits to your domain.** Swap the dataset and the same pipeline covers gesture commands, anomaly scoring over sensor windows, or keyword spotting: train anywhere, export weights, verify parity, run on-device. The 145 KB ceiling is a design constraint that forces good decisions.

**Try it** (draw badly, it copes): [rs-03.github.io/demos](https://rs-03.github.io/demos/#live-demo)
**Source**: [github.com/rs-03/rs-03.github.io](https://github.com/rs-03/rs-03.github.io): training script, inference engine, and parity test.
