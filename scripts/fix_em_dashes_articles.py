# One-off: judged em-dash rewrites for the article markdown + diagram strings.
import io
import os

ROOT = os.path.join(os.path.dirname(__file__), "..")

EDITS = {
    "articles/01-cough-monitor.md": [
        ("browser — no ML framework, no server, no audio ever leaving your device", "browser: no ML framework, no server, no audio ever leaving your device"),
        ("fundamental problem — *your* healthy cough", "fundamental problem: *your* healthy cough"),
        ("Just signal processing — which means it can run anywhere", "Just signal processing, which means it can run anywhere"),
        ("for decades — but implemented from scratch", "for decades, but implemented from scratch"),
        ("the way human hearing does — finer resolution at low frequencies, coarser at high — and a DCT", "the way human hearing does (finer resolution at low frequencies, coarser at high), and a DCT"),
        ("(volume invariance matters — you won't cough at calibrated loudness)", "(volume invariance matters; you won't cough at calibrated loudness)"),
        ("This pattern — *personal baseline + deviation scoring instead of population classification* — applies way beyond", "This pattern, *personal baseline + deviation scoring instead of population classification*, applies way beyond"),
        ("(https://github.com/rs-03/portfolio-website) — `dsp.js` and its parity test.", "(https://github.com/rs-03/portfolio-website). See `dsp.js` and its parity test."),
    ],
    "articles/02-mirror-therapy.md": [
        ("21 hand keypoints — recreating the mirror-box illusion", "21 hand keypoints, recreating the mirror-box illusion"),
        ("almost comically simple — a box with a mirror.", "almost comically simple: a box with a mirror."),
        ("last few frames — it reads as *present but ethereal*", "last few frames. It reads as *present but ethereal*"),
        ("(Google's pretrained model — credit where due)", "(Google's pretrained model, credit where due)"),
        ("\"Start the Mirror\" — visitors who don't engage pay zero bandwidth.", "\"Start the Mirror\", so visitors who don't engage pay zero bandwidth."),
        ("interaction concept — not a medical device, not medical advice.", "interaction concept, not a medical device and not medical advice."),
    ],
    "articles/03-camouflage.md": [
        ("increasingly a detection model — so test against that.", "increasingly a detection model, so test against that."),
        ("perimeter systems — most of what", "perimeter systems. Most of what"),
        ("hunts for people in it — at four simulated distances — producing", "hunts for people in it at four simulated distances, producing"),
        ("entirely on-device — I didn't train it", "entirely on-device. I didn't train it"),
        ("goes further — a multi-model ensemble", "goes further: a multi-model ensemble"),
    ],
    "articles/04-digit-recognizer.md": [
        ("# I Put a Neural Network Inside My Portfolio — No TensorFlow, No Server, 145 KB", "# I Put a Neural Network Inside My Portfolio: No TensorFlow, No Server, 145 KB"),
        ("dependency-free JavaScript — with a parity test", "dependency-free JavaScript, with a parity test"),
        ("\"hello world\" of ML — that's exactly why I used it", "\"hello world\" of ML, and that's exactly why I used it"),
        ("784→128→64→10 MLP — hand-written forward pass", "784→128→64→10 MLP: hand-written forward pass"),
        ("is *identical* to float — 98.2%.", "is *identical* to float: 98.2%."),
        ("~109K multiply-adds — about a microsecond-scale", "~109K multiply-adds, about a microsecond-scale"),
        ("correct: 10/10 — PARITY OK", "correct: 10/10\nPARITY OK"),
        ("That habit — *verify the deployment artifact, not just the training run* — is worth", "That habit, *verifying the deployment artifact and not just the training run*, is worth"),
        ("(https://github.com/rs-03/portfolio-website) — training script, inference engine, and parity test.", "(https://github.com/rs-03/portfolio-website): training script, inference engine, and parity test."),
    ],
    "articles/05-keypoints.md": [
        ("Impressive — and by itself, worthless.", "Impressive, and by itself worthless."),
        ("\"we detected the wire\" — it was *the attachment height", "\"we detected the wire\". It was *the attachment height"),
        ("are meaningless — they change as you move", "are meaningless; they change as you move"),
        ("approximate real-world gap — the demo shows", "approximate real-world gap. The demo shows"),
        ("a known object dimension — a standard crossarm, a pole class height.", "a known object dimension: a standard crossarm, a pole class height."),
        ("averages fingertip extension — three lines of geometry each, but they", "averages fingertip extension. Three lines of geometry each, but they"),
        ("GPU delegate) — Google's models, credited on the page.", "GPU delegate). They're Google's models, credited on the page."),
        ("fine-tune your own — as I did for utility keypoints, where off-the-shelf models had never seen a crossarm — is most of", "fine-tune your own (as I did for utility keypoints, where off-the-shelf models had never seen a crossarm) is most of"),
    ],
    "app/scripts/render_article_images.mjs": [
        ("'Zero ML libraries — a hand-written FFT", "'Zero ML libraries: a hand-written FFT"),
        ("26 triangular mel filters — finer resolution where human hearing is", "26 triangular mel filters, finer resolution where human hearing is"),
        ("re-run through the detector — a detection range profile", "re-run through the detector, producing a detection range profile"),
        ("'Hand-rolling an FFT and MFCCs in JavaScript — all on-device'", "'Hand-rolling an FFT and MFCCs in JavaScript, all on-device'"),
        ("'Testing camouflage against the real adversary — a detection model'", "'Testing camouflage against the real adversary: a detection model'"),
        ("'A Neural Net in 145 KB —'", "'A Neural Net in 145 KB:'"),
        ("'Why landmarks alone are useless — and what to build on top'", "'Why landmarks alone are useless, and what to build on top'"),
    ],
}

for rel, pairs in EDITS.items():
    path = os.path.join(ROOT, rel)
    with io.open(path, encoding="utf-8") as f:
        content = f.read()
    for old, new in pairs:
        if old not in content:
            print("MISS:", rel, "|", old[:55])
            continue
        content = content.replace(old, new, 1)
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"{rel}: remaining em dashes = {content.count(chr(8212))}")
