# One-off: add "beyond the demo" research/potential sections to each article.
import io
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "articles")

SECTIONS = {
    "01-cough-monitor.md": (
        "## What I'd tell a client",
        """## The demo is the floor, not the ceiling

The live demo is deliberately minimal: three baseline coughs, one comparison, one verdict. That is the smallest version that proves the core mechanism honestly, and it runs in thirty seconds on any device. The concept underneath is a research program:

- **Adaptive baselines.** A fixed baseline ages; respiratory health drifts with seasons, allergies, and habits. The next step is a slowly adapting baseline (exponentially weighted, with change-point detection) that distinguishes "your cough evolved gradually" from "your cough changed overnight", which is the clinically interesting event.
- **Trajectories, not snapshots.** A single deviation score is weak evidence. A two-week trend of rising deviation is a different signal entirely, and it is the one worth showing a doctor.
- **Confound separation.** The honest open problem: distinguishing illness-driven spectral change from microphone distance, background noise, and time of day. Promising attacks include recording-condition normalization, per-session calibration sounds, and paired healthy/sick data per person.
- **Beyond coughs.** Personal-baseline deviation generalizes to any repeated personal sound: voice fatigue for call-center workers and singers, breathing during sleep, machine acoustics on a factory floor. The pattern (baseline, deviation, trend) is the product; the cough is one instance.

There is also a real research gap here: population models dominate the audio-health literature largely because labeled population data exists. Personalized baseline approaches have almost no shared benchmarks. Building one, using anonymized fingerprints rather than raw audio, would be a genuine contribution.

""",
    ),
    "02-mirror-therapy.md": (
        "**Try it** (camera optional",
        """## The research questions worth chasing

The browser preview proves the illusion mechanism. The interesting work starts after that:

- **Embodiment dosage.** The research suggests the sense of ownership over the virtual limb drives relief. What level of visual fidelity does that require? A glowing skeleton, a stylized hand, or a photorealistic limb with matched skin tone? That is a testable dose-response question, and a browser-based system can run it at a scale no clinic can.
- **Therapy that measures itself.** A physical mirror box produces zero data. Hand tracking produces 21 trajectories per frame, so range of motion, movement smoothness, and session adherence can be measured and trended across weeks. A therapy that quantifies its own effect can prove, or disprove, that it works for a given patient.
- **Adaptive difficulty.** Pain-gated progression: exercises that advance only when movement quality and self-reported pain allow, which is how good physical therapists already operate. Encoding that judgment is a product problem, not a research one.
- **Lower limbs.** Hands are the easy case. Phantom leg pain is more common after amputation, and full-body pose models make a seated mirror-leg version plausible with the same architecture.

None of this needs new ML. It needs careful product and clinical work on top of commodity tracking, which is exactly the engineering that turns a demo into a deployable therapy tool.

""",
    ),
    "03-camouflage.md": (
        "## Why this framing matters beyond camouflage",
        """## From toy to instrument

A single detector at four synthetic distances is the honest minimum that demonstrates the idea. Turning it into a real evaluation instrument is mostly known engineering plus a few open questions:

- **Ensembles disagree, and that is the point.** YOLO-family, R-CNN-family, and transformer-based detectors fail differently. Concealment that defeats one family often fails against another, so a credible score must aggregate across architectures, the way a security audit uses multiple scanners.
- **Explanation, not just detection.** The useful output for a designer is which region gave you away. Saliency maps over detector activations turn pass/fail into actionable feedback: break up the shoulder line; the head silhouette is carrying the detection.
- **Condition sweeps.** Honest evaluation varies illumination, weather, motion blur, and sensor type. Thermal is the hard one: visible-spectrum camouflage does nothing against IR, and simulating thermal signatures faithfully is an open problem.
- **The moving-target problem.** Detectors improve every year, so concealment effectiveness is a date-stamped claim. A serious evaluation service would re-test against current models continuously, like dependency scanning for the physical world.

The research framing: this is adversarial robustness studied from the defender's side of the camera, and the literature on physical adversarial attacks maps onto it almost one-to-one.

""",
    ),
    "04-digit-recognizer.md": (
        "**Try it** (draw badly",
        """## Where this goes beyond MNIST

The demo is intentionally the simplest possible instance, because the point is the deployment discipline around it, and that discipline scales to systems that matter:

- **Quantization with a budget.** Post-training int8 cost nothing here because the network is over-provisioned for the task. Real systems choose between quantization-aware training, mixed precision for sensitive layers, and distillation into a smaller student. The decision process stays identical: measure, compress, re-verify against parity fixtures.
- **The browser is becoming a serious inference target.** WASM SIMD and WebGPU put surprisingly large models within reach of a static page. The interesting product class is anything where privacy is the feature: medical screeners, document processing, anything users would refuse to upload.
- **Parity testing as a discipline.** The 1e-6 check between Python and JavaScript is a miniature of a production problem: proving the deployed artifact matches the trained one across runtimes, hardware, and compiler versions. Most teams discover deployment drift in production; fixtures catch it in CI.
- **From digits to your domain.** Swap the dataset and the same pipeline covers gesture commands, anomaly scoring over sensor windows, or keyword spotting: train anywhere, export weights, verify parity, run on-device. The 145 KB ceiling is a design constraint that forces good decisions.

""",
    ),
    "05-keypoints.md": (
        "## The pattern to steal",
        """## The hard problems hiding behind the dots

The demo derives three measurements with three lines of geometry each. Production measurement systems earn their keep on the problems the demo deliberately sidesteps:

- **Metric scale from a single camera.** Palm length is a convenient ruler, but it assumes an average hand. Real systems calibrate against a known object, use stereo or depth sensors, or exploit multi-frame geometry. Choosing the ruler is the core design decision in every measurement-from-pixels system.
- **Jitter becomes error bars.** Landmarks vibrate frame to frame. Filtering trades latency for stability (the one-euro filter is the workhorse), and the residual jitter should propagate into the output as explicit uncertainty: not "3.2 cm" but "3.2 plus or minus 0.3 cm". People make different decisions when they can see the error bars.
- **When the pretrained model stops being enough.** Hands are the best-served keypoint domain in the world. Utility crossarms are not. The judgment call between adapting a pretrained model, fine-tuning on custom annotations, and training from scratch is driven by how far your structures sit from the model's training distribution, and it is most of the senior work in applied CV.
- **Temporal measurements.** Static distances are the beginning. Velocities, ranges of motion, and repetition quality come from trajectories over time, which is where measurement systems start replacing human assessment instead of assisting it.

""",
    ),
}

for filename, (anchor, section) in SECTIONS.items():
    path = os.path.join(ROOT, filename)
    with io.open(path, encoding="utf-8") as f:
        content = f.read()
    if section[:40] in content:
        print(f"SKIP {filename}: already deepened")
        continue
    if anchor not in content:
        print(f"MISS {filename}: anchor not found: {anchor[:40]}")
        continue
    content = content.replace(anchor, section + anchor, 1)
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content)
    print(f"OK   {filename}")
