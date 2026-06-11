const project = {
    slug: 'camouflage-analyzer',
    title: 'Camouflage Effectiveness Analyzer',
    shortDescription: 'Adversarial camouflage testing: an AI detector hunts for you at simulated distances. Try it live.',
    fullDescription: `Modern surveillance is automated, so camouflage should be tested against the actual adversary: AI detection models. Upload a photo and an object-detection model hunts for people in it at four simulated distances, producing a detection-range profile and a stealth score. The live browser demo runs a single on-device detector; the full version expands to a multi-model ensemble (YOLO, Faster R-CNN, RetinaNet) with lighting variation and AI-powered improvement suggestions.`,
    category: 'personal',
    sector: 'defense',
    type: 'demo',
    status: 'live',
    featured: true,
    techStack: ['TensorFlow.js', 'Object Detection', 'Computer Vision', 'React'],
    highlights: [
        'Adversarial testing with detection models as the enemy',
        'Detection-range profile across simulated distances',
        'Stealth scoring with per-distance confidence',
        'Runs fully on-device; multi-model ensemble planned',
    ],
    demoUrl: '/demos#camouflage',
};

export default project;
