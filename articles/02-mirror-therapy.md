# Mirror Therapy Without the Mirror Box: Treating Phantom Limbs in a Browser Tab

*A 1990s Nobel-adjacent therapy, a webcam, and 21 hand keypoints, recreating the mirror-box illusion for phantom limb pain, no hardware required.*

## A therapy built on an illusion

In the 1990s, neuroscientist V.S. Ramachandran discovered something remarkable: amputees suffering phantom limb pain often felt relief just by *seeing* their missing limb move again. His apparatus was almost comically simple: a box with a mirror. Put your intact hand in, look at its reflection where the missing hand would be, and move. The brain, watching the "missing" hand obey commands again, often dials the pain down.

The limitation was never the science. It was the box: a physical apparatus, used in clinics, hard to scale, impossible to measure.

## Replacing glass with keypoints

A webcam plus real-time hand tracking can produce the same illusion with better properties:

```
webcam frame → hand landmark model (21 keypoints, on-device)
→ reflect: phantom[i] = { x: 1 − x, y, z }
→ render real hand (solid) + phantom twin (ghost) on canvas
```

The reflection is one line of math. Everything around it is what makes the illusion land:

```javascript
const phantom = real.map(p => ({ x: 1 - p.x, y: p.y, z: p.z }));
```

![The mirror-box illusion digitized: webcam, hand landmarks, reflection, rendered phantom twin](https://raw.githubusercontent.com/rs-03/article-assets/main/02-mirror-diagram.png)


The visual treatment matters more than I expected. The phantom hand is rendered as a ghostly cyan skeleton with a translucent palm fill, a "breathing" glow that pulses on a ~3 second cycle, and a fading afterimage trail of its last few frames. It reads as *present but ethereal*, which is exactly the perceptual story mirror therapy needs to tell. A dashed mirror plane down the center of the frame makes the reflection relationship legible at a glance.

## The engineering details that matter

- **Tracking**: MediaPipe HandLandmarker (Google's pretrained model, credit where due), running via WebAssembly with GPU delegate. ~30 FPS on a laptop.
- **Privacy by architecture**: every frame is processed on-device. For a *medical-adjacent* application, "video never leaves your browser" isn't a feature, it's a requirement.
- **Lazy loading**: the model only downloads when the user clicks "Start the Mirror", so visitors who don't engage pay zero bandwidth.
- **Lifecycle hygiene**: camera tracks stopped and the model closed on unmount; nothing leaks.

## Why digitize a working therapy?

Because software adds what glass can't: guided exercise sequences, session tracking, range-of-motion measurement over time (the keypoints are already numbers), and remote delivery to patients who will never visit a clinic with a mirror box. The browser preview demonstrates the core interaction; a WebXR version with a fully rendered 3D limb is the natural next step.

## The research questions worth chasing

The browser preview proves the illusion mechanism. The interesting work starts after that:

- **Embodiment dosage.** The research suggests the sense of ownership over the virtual limb drives relief. What level of visual fidelity does that require? A glowing skeleton, a stylized hand, or a photorealistic limb with matched skin tone? That is a testable dose-response question, and a browser-based system can run it at a scale no clinic can.
- **Therapy that measures itself.** A physical mirror box produces zero data. Hand tracking produces 21 trajectories per frame, so range of motion, movement smoothness, and session adherence can be measured and trended across weeks. A therapy that quantifies its own effect can prove, or disprove, that it works for a given patient.
- **Adaptive difficulty.** Pain-gated progression: exercises that advance only when movement quality and self-reported pain allow, which is how good physical therapists already operate. Encoding that judgment is a product problem, not a research one.
- **Lower limbs.** Hands are the easy case. Phantom leg pain is more common after amputation, and full-body pose models make a seated mirror-leg version plausible with the same architecture.

None of this needs new ML. It needs careful product and clinical work on top of commodity tracking, which is exactly the engineering that turns a demo into a deployable therapy tool.

**Try it** (camera optional, on-device only): [rs-03.github.io/demos](https://rs-03.github.io/demos/#mirror)
**Source**: [github.com/rs-03/rs-03.github.io](https://github.com/rs-03/rs-03.github.io)

*A demonstration of the interaction concept, not a medical device and not medical advice.*
