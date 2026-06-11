# Testing Camouflage Against the Real Adversary: an AI

*Camouflage has always been graded by human eyes. But the thing hunting for you in 2026 is increasingly a detection model, so test against that.*

## The premise

Surveillance is automated now: drones, trail cameras, perimeter systems. Most of what "sees" runs an object-detection network. Which makes traditional camouflage evaluation (a person squinting at a photo) the wrong test. The right test is adversarial: **run the actual detector against your concealment and measure what it finds.**

That's the whole demo: upload a photo, and an object-detection model hunts for people in it at four simulated distances, producing a detection-range profile and a stealth score.

## Simulating distance with pixels

You can't move the camera after the photo is taken, but you can simulate the dominant factor in long-range detection: **pixels on target**. A person at 50 m simply occupies far fewer pixels than at 5 m. So each analysis run downscales the image progressively and re-runs detection:

```javascript
const DISTANCE_LEVELS = [
    { label: 'Close (~5m)',    scale: 1    },
    { label: 'Mid (~15m)',     scale: 0.45 },
    { label: 'Far (~30m)',     scale: 0.22 },
    { label: 'Very far (~50m)', scale: 0.12 },
];

for (const level of DISTANCE_LEVELS) {
    const scaled = drawScaled(image, level.scale);
    const detections = await model.detect(scaled, 10, 0.15);
    // best 'person' confidence at this simulated range
}
```

The output reads like a range card: *detected at 5 m with 96% confidence, 41% at 15 m, invisible beyond 30 m.* A stealth score aggregates it: how poorly did the adversary see you, averaged across ranges?

![Distance simulation: the same photo downscaled four times and re-run through the detector](https://raw.githubusercontent.com/rs-03/article-assets/main/03-camo-diagram.png)


## Honest about the model

The detector is COCO-SSD (a pretrained MobileNet-based model from the TensorFlow.js team) running entirely on-device. I didn't train it, and the demo says so on the page. The contribution here is the *evaluation framework*: using detectors as adversaries, simulating range, and turning subjective "good camo" into a measurable profile. The full version of this concept goes further: a multi-model ensemble (YOLO, Faster R-CNN, RetinaNet), lighting variation, and heatmaps showing *which region of you* gave you away.

## From toy to instrument

A single detector at four synthetic distances is the honest minimum that demonstrates the idea. Turning it into a real evaluation instrument is mostly known engineering plus a few open questions:

- **Ensembles disagree, and that is the point.** YOLO-family, R-CNN-family, and transformer-based detectors fail differently. Concealment that defeats one family often fails against another, so a credible score must aggregate across architectures, the way a security audit uses multiple scanners.
- **Explanation, not just detection.** The useful output for a designer is which region gave you away. Saliency maps over detector activations turn pass/fail into actionable feedback: break up the shoulder line; the head silhouette is carrying the detection.
- **Condition sweeps.** Honest evaluation varies illumination, weather, motion blur, and sensor type. Thermal is the hard one: visible-spectrum camouflage does nothing against IR, and simulating thermal signatures faithfully is an open problem.
- **The moving-target problem.** Detectors improve every year, so concealment effectiveness is a date-stamped claim. A serious evaluation service would re-test against current models continuously, like dependency scanning for the physical world.

The research framing: this is adversarial robustness studied from the defender's side of the camera, and the literature on physical adversarial attacks maps onto it almost one-to-one.

## Why this framing matters beyond camouflage

"Evaluate against the deployed adversary, not a human proxy" generalizes: testing ad creatives against content classifiers, validating anonymization against re-identification models, red-teaming computer vision systems before someone else does. Adversarial evaluation is a product category hiding inside a security habit.

**Try it** (images analyzed on-device, nothing uploaded): [rs-03.github.io/demos](https://rs-03.github.io/demos/#camouflage)
**Source**: [github.com/rs-03/rs-03.github.io](https://github.com/rs-03/rs-03.github.io)
