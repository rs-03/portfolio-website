const project = {
    slug: 'baby-cry-interpreter',
    title: 'Adaptive Baby Cry Interpreter',
    shortDescription: 'AI that learns your baby\'s unique cry patterns through continuous parent feedback.',
    fullDescription: `AI that classifies baby cries AND learns your specific baby\'s unique patterns through parent feedback. Uses few-shot learning to create a personalized model that gets smarter over time, all running privately in your browser.`,
    category: 'personal',
    sector: 'healthcare',
    type: 'demo',
    status: 'coming-soon',
    featured: true,
    techStack: ['TensorFlow.js', 'Web Audio API', 'React', 'Few-shot Learning'],
    highlights: [
        'Initial 5-category classification',
        'Continuous parent feedback learning',
        'Per-baby personalization',
        'Privacy-preserving (runs in browser)',
    ],
    demoUrl: null, // TODO: point to /demos anchor once the demo is built
};

export default project;
