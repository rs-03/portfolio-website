# One-off: replace user-visible em dashes with natural punctuation.
# Each rewrite is an exact judged substitution, not a blind replace.
import io
import os

ROOT = os.path.join(os.path.dirname(__file__), "..", "app", "src")

EDITS = [
    ("app/demos/page.jsx", "browser — draw for a neural network trained from scratch, and try", "browser. Draw for a neural network trained from scratch, or try"),
    ("app/demos/page.jsx", "nothing is faked — open devtools", "nothing is faked. Open devtools"),
    ("app/opengraph-image.jsx", "${siteConfig.name} — ${siteConfig.title}", "${siteConfig.name} · ${siteConfig.title}"),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "'Analysis failed — the model could not load.", "'Analysis failed. The model could not load."),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "'Camera permission was denied — upload", "'Camera permission was denied. Upload"),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "Live Demo — Adversarial Evaluation", "Live Demo · Adversarial Evaluation"),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "Modern surveillance is automated — so test", "Modern surveillance is automated, so test"),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "analyzed on your device — nothing is uploaded.", "analyzed on your device. Nothing is uploaded."),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "Stealth score — higher means", "Stealth score: higher means"),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "at any distance — either excellent", "at any distance. Either excellent"),
    ("components/sections/CamouflageTester/CamouflageTester.jsx", "TensorFlow.js — a single-model preview", "TensorFlow.js, a single-model preview"),
    ("components/sections/Contact/Contact.jsx", "{siteConfig.availability.label} — currently taking on new engagements", "{siteConfig.availability.label} · currently taking on new engagements"),
    ("components/sections/CoughMonitor/CoughMonitor.jsx", "'Recording was too quiet — cough clearly", "'Recording was too quiet. Cough clearly"),
    ("components/sections/CoughMonitor/CoughMonitor.jsx", "Live Demo — Personal Health Baseline", "Live Demo · Personal Health Baseline"),
    ("components/sections/CoughMonitor/CoughMonitor.jsx", "it — not against a population model", "it: not against a population model"),
    ("components/sections/CoughMonitor/CoughMonitor.jsx", "into your microphone — the recorder captures", "into your microphone. The recorder captures"),
    ("components/sections/CoughMonitor/CoughMonitor.jsx", "Concept demonstration — not a medical device", "Concept demonstration, not a medical device"),
    ("components/sections/GitHubActivity/GitHubActivity.jsx", "beyond enterprise projects —{' '}", "beyond enterprise projects.{' '}"),
    ("components/sections/Hero/Hero.jsx", "Five live AI demos run on this site — try them", "Five live AI demos run on this site. Try them"),
    ("components/sections/HowIWork/HowIWork.jsx", "read on feasibility — including when AI is", "read on feasibility, including when AI is"),
    ("components/sections/HowIWork/HowIWork.jsx", "full build — not after.", "full build, not after."),
    ("components/sections/HowIWork/HowIWork.jsx", "owns the system — no black boxes", "owns the system. No black boxes"),
    ("components/sections/HowIWork/HowIWork.jsx", "From first call to handover — built for teams", "From first call to handover, built for teams"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "Live Demo — Keypoints to Measurements", "Live Demo · Keypoints to Measurements"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "how open your hand is — the", "how open your hand is. That&apos;s the"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "on your device — video never leaves", "on your device. Video never leaves"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "Under the hood — what&apos;s actually running", "Under the hood: what&apos;s actually running"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "vision pipeline</strong> — a palm-detection", "vision pipeline</strong>: a palm-detection"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "Credit where due — I didn&apos;t train these.", "Credit where due: I didn&apos;t train these."),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "engineering around them</strong> — lazy", "engineering around them</strong>: lazy"),
    ("components/sections/KeypointStudio/KeypointStudio.jsx", "weren&apos;t enough — see the", "weren&apos;t enough. See the"),
    ("components/sections/LiveDemosTeaser/LiveDemosTeaser.jsx", "The phantom-limb illusion — no mirror box needed", "The phantom-limb illusion, no mirror box needed"),
    ("components/sections/LiveDemosTeaser/LiveDemosTeaser.jsx", "in your browser — nothing uploaded,", "in your browser, with nothing uploaded and"),
    ("components/sections/MirrorTherapy/MirrorTherapy.jsx", "Live Demo — Assistive Tech Preview", "Live Demo · Assistive Tech Preview"),
    ("components/sections/MirrorTherapy/MirrorTherapy.jsx", "on your device — video never leaves", "on your device. Video never leaves"),
    ("components/sections/MirrorTherapy/MirrorTherapy.jsx", "physical mirror box — making the", "physical mirror box, making the"),
    ("components/sections/MirrorTherapy/MirrorTherapy.jsx", "of the interaction — not a medical device", "of the interaction, not a medical device"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "Live Demo — No Smoke, No Mirrors", "Live Demo · No Smoke, No Mirrors"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "trained from scratch — just Python and math, no ML", "trained from scratch with just Python and math, no ML"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "frameworks — compressed to 145&nbsp;KB", "frameworks, compressed to 145&nbsp;KB"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "How this was built — see the actual code", "How this was built: see the actual code"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "in raw NumPy — hand-written", "in raw NumPy: hand-written"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "for the web</strong> — weights int8-quantized", "for the web</strong>: weights int8-quantized"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "plain JavaScript</strong> — the", "plain JavaScript</strong>: the"),
    ("components/sections/NeuralPlayground/NeuralPlayground.jsx", "not vibes</strong> — a parity test", "not vibes</strong>: a parity test"),
    ("components/sections/Services/Services.jsx", "solves your problem — and what it will take — before", "solves your problem, and what it will take, before"),
    ("components/sections/Services/Services.jsx", "evaluation frameworks — systems that answer", "evaluation frameworks: systems that answer"),
    ("components/sections/Services/Services.jsx", "keypoint systems — from annotation strategy", "keypoint systems, from annotation strategy"),
    ("components/sections/Services/Services.jsx", "handover — see the process below", "handover. See the process below"),
    ("data/projects/personal/aletheia-ai/config.js", "as a 3D model — rapid asset creation", "as a 3D model for rapid asset creation"),
    ("data/projects/personal/aletheia-ai/config.js", "with VLM + SAM — then exports", "with VLM + SAM, then exports"),
    ("data/projects/personal/camouflage-analyzer/config.js", "Adversarial camouflage testing — an AI detector", "Adversarial camouflage testing: an AI detector"),
    ("data/projects/personal/camouflage-analyzer/config.js", "'Adversarial testing — detection models as the enemy'", "'Adversarial testing with detection models as the enemy'"),
    ("data/projects/personal/digit-recognition/config.js", "pure JavaScript — try it live.", "pure JavaScript. Try it live."),
    ("data/projects/personal/digit-recognition/config.js", "'Trained from scratch — no TensorFlow, no PyTorch'", "'Trained from scratch, no TensorFlow, no PyTorch'"),
    ("data/projects/personal/exercise-classification/config.js", "final classification—achieving over 90%", "final classification, achieving over 90%"),
    ("data/projects/personal/hand-keypoint-detection/config.js", "gesture recognition — 21 landmarks per hand", "gesture recognition: 21 landmarks per hand"),
    ("data/projects/personal/hand-keypoint-detection/config.js", "device — no frames are ever uploaded.", "device. No frames are ever uploaded."),
    ("data/projects/personal/hand-keypoint-detection/config.js", "fully on-device — privacy by design", "fully on-device, privacy by design"),
    ("data/projects/personal/phantom-limb-vr/config.js", "hand tracking — browser preview live now", "hand tracking. Browser preview live now"),
    ("data/projects/personal/phantom-limb-vr/config.js", "opposite side — no physical mirror box required", "opposite side, no physical mirror box required"),
    ("data/projects/personal/phantom-limb-vr/config.js", "rendered live — the mirror-box illusion", "rendered live: the mirror-box illusion"),
    ("data/projects/professional/agentic-rag/config.js", "and how — so most questions", "and how, so most questions"),
    ("data/projects/professional/agentic-rag/config.js", "prompt optimization — the system tunes", "prompt optimization; the system tunes"),
    ("data/projects/professional/agentic-rag/config.js", "retrieval evaluation — answers are scored", "retrieval evaluation; answers are scored"),
    ("data/projects/professional/double-woods-detection/config.js", "Double wood poles — old poles left standing next to their replacements — are", "Double wood poles (old poles left standing next to their replacements) are"),
    ("data/projects/professional/flum-digitization/config.js", "reading a map by eye — slow, error-prone", "reading a map by eye: slow, error-prone"),
    ("data/projects/professional/healthcare-analytics/config.js", "operational records — too messy", "operational records, too messy"),
    ("data/projects/professional/healthcare-analytics/config.js", "insights — root causes, not just trends", "insights: root causes, not just trends"),
    ("data/projects/professional/keypoint-detection-llm/config.js", "pixel-precise keypoints — attachment heights, wire positions — but", "pixel-precise keypoints (attachment heights, wire positions), but"),
    ("data/projects/professional/keypoint-detection-llm/config.js", "fed back into training — so the model improves", "fed back into training, so the model improves"),
    ("data/projects/professional/promptable-segmentation/config.js", "infrastructure imagery — describe the object", "infrastructure imagery: describe the object"),
    ("data/projects/professional/workflow-builder/config.js", "connecting blocks — no code required", "connecting blocks, no code required"),
    ("data/projects/professional/workflow-builder/config.js", "pipeline assembly — visual flows replace", "pipeline assembly; visual flows replace"),
    ("data/projects/professional/workflow-builder/config.js", "on-prem — sensitive data never leaves", "on-prem; sensitive data never leaves"),
    ("data/siteConfig.js", "ML pipelines—from research prototypes", "ML pipelines, from research prototypes"),
]

missed = 0
for rel, old, new in EDITS:
    path = os.path.join(ROOT, rel)
    with io.open(path, encoding="utf-8") as f:
        content = f.read()
    if old not in content:
        print("MISS:", rel, "|", old[:55])
        missed += 1
        continue
    with io.open(path, "w", encoding="utf-8", newline="\n") as f:
        f.write(content.replace(old, new, 1))

print(f"applied {len(EDITS) - missed}/{len(EDITS)}")
