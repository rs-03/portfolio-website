"""
Train a small MLP on MNIST and export int8-quantized weights as JSON
for pure-JavaScript in-browser inference on the portfolio site.

Outputs:
  app/src/components/sections/NeuralPlayground/model.json   (quantized weights)
  scripts/parity_fixtures.json                               (inputs + expected probs for the Node parity test)
"""

import base64
import gzip
import json
import os
import struct
import urllib.request

import numpy as np

MIRROR = "https://storage.googleapis.com/cvdf-datasets/mnist/"
FILES = {
    "train_images": "train-images-idx3-ubyte.gz",
    "train_labels": "train-labels-idx1-ubyte.gz",
    "test_images": "t10k-images-idx3-ubyte.gz",
    "test_labels": "t10k-labels-idx1-ubyte.gz",
}
CACHE = os.path.join(os.path.dirname(__file__), "mnist_cache")
OUT_MODEL = os.path.join(
    os.path.dirname(__file__), "..", "app", "src", "components", "sections",
    "NeuralPlayground", "model.json",
)
OUT_FIXTURES = os.path.join(os.path.dirname(__file__), "parity_fixtures.json")

rng = np.random.default_rng(42)


def download():
    os.makedirs(CACHE, exist_ok=True)
    for name in FILES.values():
        path = os.path.join(CACHE, name)
        if not os.path.exists(path):
            print("downloading", name)
            urllib.request.urlretrieve(MIRROR + name, path)


def load_images(name):
    with gzip.open(os.path.join(CACHE, name), "rb") as f:
        _, n, rows, cols = struct.unpack(">IIII", f.read(16))
        data = np.frombuffer(f.read(), dtype=np.uint8).reshape(n, rows * cols)
    return data.astype(np.float32) / 255.0


def load_labels(name):
    with gzip.open(os.path.join(CACHE, name), "rb") as f:
        struct.unpack(">II", f.read(8))
        return np.frombuffer(f.read(), dtype=np.uint8)


def augment_shifts(x, y, max_shift=2, copies=1):
    """Random small translations so the model tolerates off-center drawings."""
    imgs = x.reshape(-1, 28, 28)
    out_x, out_y = [x], [y]
    for _ in range(copies):
        shifted = np.zeros_like(imgs)
        dx = rng.integers(-max_shift, max_shift + 1, size=len(imgs))
        dy = rng.integers(-max_shift, max_shift + 1, size=len(imgs))
        for i in range(len(imgs)):
            shifted[i] = np.roll(np.roll(imgs[i], dy[i], axis=0), dx[i], axis=1)
        out_x.append(shifted.reshape(-1, 784))
        out_y.append(y)
    return np.concatenate(out_x), np.concatenate(out_y)


def train():
    x_train = load_images(FILES["train_images"])
    y_train = load_labels(FILES["train_labels"])
    x_test = load_images(FILES["test_images"])
    y_test = load_labels(FILES["test_labels"])

    x_train, y_train = augment_shifts(x_train, y_train)
    print("training samples:", len(x_train))

    sizes = [784, 128, 64, 10]
    weights = [
        rng.normal(0, np.sqrt(2.0 / sizes[i]), (sizes[i], sizes[i + 1])).astype(np.float32)
        for i in range(3)
    ]
    biases = [np.zeros(sizes[i + 1], dtype=np.float32) for i in range(3)]

    # Adam
    m_w = [np.zeros_like(w) for w in weights]
    v_w = [np.zeros_like(w) for w in weights]
    m_b = [np.zeros_like(b) for b in biases]
    v_b = [np.zeros_like(b) for b in biases]
    beta1, beta2, eps, lr = 0.9, 0.999, 1e-8, 1e-3
    step = 0

    batch = 128
    epochs = 6
    n = len(x_train)
    onehot = np.eye(10, dtype=np.float32)[y_train]

    for epoch in range(epochs):
        perm = rng.permutation(n)
        total_loss = 0.0
        for i in range(0, n, batch):
            idx = perm[i:i + batch]
            xb, yb = x_train[idx], onehot[idx]

            # forward
            z1 = xb @ weights[0] + biases[0]
            a1 = np.maximum(z1, 0)
            z2 = a1 @ weights[1] + biases[1]
            a2 = np.maximum(z2, 0)
            z3 = a2 @ weights[2] + biases[2]
            z3 -= z3.max(axis=1, keepdims=True)
            expz = np.exp(z3)
            probs = expz / expz.sum(axis=1, keepdims=True)
            total_loss += -np.log(probs[np.arange(len(idx)), y_train[perm[i:i + batch]]] + 1e-12).sum()

            # backward
            dz3 = (probs - yb) / len(idx)
            grads_w = [None] * 3
            grads_b = [None] * 3
            grads_w[2] = a2.T @ dz3
            grads_b[2] = dz3.sum(axis=0)
            da2 = dz3 @ weights[2].T
            dz2 = da2 * (z2 > 0)
            grads_w[1] = a1.T @ dz2
            grads_b[1] = dz2.sum(axis=0)
            da1 = dz2 @ weights[1].T
            dz1 = da1 * (z1 > 0)
            grads_w[0] = xb.T @ dz1
            grads_b[0] = dz1.sum(axis=0)

            step += 1
            for j in range(3):
                m_w[j] = beta1 * m_w[j] + (1 - beta1) * grads_w[j]
                v_w[j] = beta2 * v_w[j] + (1 - beta2) * grads_w[j] ** 2
                m_b[j] = beta1 * m_b[j] + (1 - beta1) * grads_b[j]
                v_b[j] = beta2 * v_b[j] + (1 - beta2) * grads_b[j] ** 2
                mw_hat = m_w[j] / (1 - beta1 ** step)
                vw_hat = v_w[j] / (1 - beta2 ** step)
                mb_hat = m_b[j] / (1 - beta1 ** step)
                vb_hat = v_b[j] / (1 - beta2 ** step)
                weights[j] -= lr * mw_hat / (np.sqrt(vw_hat) + eps)
                biases[j] -= lr * mb_hat / (np.sqrt(vb_hat) + eps)

        acc = evaluate(weights, biases, x_test, y_test)
        print(f"epoch {epoch + 1}/{epochs} loss={total_loss / n:.4f} test_acc={acc:.4f}")

    return weights, biases, x_test, y_test


def forward(weights, biases, x):
    a = x
    for j in range(2):
        a = np.maximum(a @ weights[j] + biases[j], 0)
    z = a @ weights[2] + biases[2]
    z -= z.max(axis=1, keepdims=True)
    expz = np.exp(z)
    return expz / expz.sum(axis=1, keepdims=True)


def evaluate(weights, biases, x, y):
    return (forward(weights, biases, x).argmax(axis=1) == y).mean()


def quantize_and_export(weights, biases, x_test, y_test):
    # int8 symmetric quantization per layer
    layers = []
    q_weights = []
    for w, b in zip(weights, biases):
        scale = float(np.abs(w).max() / 127.0)
        q = np.clip(np.round(w / scale), -127, 127).astype(np.int8)
        q_weights.append((q, scale))
        layers.append({
            "rows": w.shape[0],
            "cols": w.shape[1],
            "scale": scale,
            "w": base64.b64encode(q.tobytes()).decode("ascii"),
            "b": [round(float(v), 6) for v in b],
        })

    # accuracy after quantization
    deq = [q.astype(np.float32) * s for q, s in q_weights]
    acc = evaluate(deq, biases, x_test, y_test)
    print(f"quantized test_acc={acc:.4f}")

    params = sum(w.size + b.size for w, b in zip(weights, biases))
    model = {
        "name": "digits-mlp",
        "arch": "784-128-64-10",
        "params": int(params),
        "testAccuracy": round(float(acc), 4),
        "layers": layers,
    }
    os.makedirs(os.path.dirname(OUT_MODEL), exist_ok=True)
    with open(OUT_MODEL, "w") as f:
        json.dump(model, f)
    print("model written:", OUT_MODEL, f"({os.path.getsize(OUT_MODEL) / 1024:.0f} KB)")

    # parity fixtures: 10 test images + expected probs from the QUANTIZED model
    idx = [np.flatnonzero(y_test == d)[0] for d in range(10)]
    fx = x_test[idx]
    fprobs = forward(deq, biases, fx)
    fixtures = {
        "inputs": [[round(float(v), 6) for v in row] for row in fx],
        "labels": [int(y_test[i]) for i in idx],
        "expectedProbs": [[round(float(v), 8) for v in row] for row in fprobs],
    }
    with open(OUT_FIXTURES, "w") as f:
        json.dump(fixtures, f)
    print("fixtures written:", OUT_FIXTURES)


if __name__ == "__main__":
    download()
    w, b, x_test, y_test = train()
    quantize_and_export(w, b, x_test, y_test)
