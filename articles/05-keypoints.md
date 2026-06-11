# From Keypoints to Measurements: Why Landmarks Alone Are Useless

*Every hand-tracking demo shows you 21 dots. The interesting part is what nobody shows: turning dots into numbers someone can act on.*

## Dots are a capability, not a product

Run any modern hand-tracking model and you get 21 beautifully stable landmarks per hand at 30 FPS. Impressive, and by itself worthless. No client has ever paid for dots. They pay for *measurements*: is this clearance compliant, is this part aligned, did this patient's range of motion improve.

I learned this on utility infrastructure work, where the deliverable was never "we detected the wire". It was *the attachment height of that wire, and whether it violates clearance rules*. Keypoints were step one of three.

## The demo: live metrics, not just a skeleton

The demo I built derives three measurements per hand, every frame:

```javascript
const wrist = lm[0];
const palm = distance(wrist, lm[9]);          // scale reference

const pinch = distance(lm[4], lm[8]) / palm;  // thumb tip ↔ index tip
```

The crucial line is the **scale reference**. Pixel distances are meaningless; they change as you move toward the camera. Dividing by palm length (wrist to middle knuckle) gives a *relative* measurement that's stable under distance, and multiplying by the average adult palm length (~8.5 cm) converts it into an approximate real-world gap. The demo shows "≈ 3.2 cm" floating on the pinch line. In infrastructure work the same role is played by a known object dimension: a standard crossarm, a pole class height. Every measurement-from-pixels system needs its ruler.

![Hand skeleton with pinch ruler and the landmark-to-decision measurement ladder](https://raw.githubusercontent.com/rs-03/article-assets/main/05-keypoints-diagram.png)


Finger counting is a geometric test (is each fingertip farther from the wrist than its middle joint?), and "hand openness" averages fingertip extension. Three lines of geometry each, but they convert a model output into a readout a human understands instantly.

## Honest layering

The landmarks come from MediaPipe's pretrained pipeline (palm detector → landmark regressor → gesture classifier, float16, WASM + GPU delegate). They're Google's models, credited on the page. The engineering I own is the integration (lazy loading, render loop, throttled UI) and the measurement layer on top. Knowing *when* a pretrained model suffices and when you need to fine-tune your own (as I did for utility keypoints, where off-the-shelf models had never seen a crossarm) is most of the senior judgment in applied CV.

## The hard problems hiding behind the dots

The demo derives three measurements with three lines of geometry each. Production measurement systems earn their keep on the problems the demo deliberately sidesteps:

- **Metric scale from a single camera.** Palm length is a convenient ruler, but it assumes an average hand. Real systems calibrate against a known object, use stereo or depth sensors, or exploit multi-frame geometry. Choosing the ruler is the core design decision in every measurement-from-pixels system.
- **Jitter becomes error bars.** Landmarks vibrate frame to frame. Filtering trades latency for stability (the one-euro filter is the workhorse), and the residual jitter should propagate into the output as explicit uncertainty: not "3.2 cm" but "3.2 plus or minus 0.3 cm". People make different decisions when they can see the error bars.
- **When the pretrained model stops being enough.** Hands are the best-served keypoint domain in the world. Utility crossarms are not. The judgment call between adapting a pretrained model, fine-tuning on custom annotations, and training from scratch is driven by how far your structures sit from the model's training distribution, and it is most of the senior work in applied CV.
- **Temporal measurements.** Static distances are the beginning. Velocities, ranges of motion, and repetition quality come from trajectories over time, which is where measurement systems start replacing human assessment instead of assisting it.

## The pattern to steal

Whatever your domain: **landmark → scale reference → relative measurement → threshold → decision.** That last hop, from number to decision, is where the business value lives. Models are increasingly commodities; measurement systems are not.

**Try it** (pinch slowly and watch the number): [rs-03.github.io/demos](https://rs-03.github.io/demos/#keypoints)
**Source**: [github.com/rs-03/rs-03.github.io](https://github.com/rs-03/rs-03.github.io)
