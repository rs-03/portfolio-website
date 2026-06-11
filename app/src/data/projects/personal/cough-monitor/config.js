const project = {
    slug: 'cough-monitor',
    title: 'Personal Cough Baseline Monitor',
    shortDescription: 'Record your healthy cough baseline and detect illness-indicating deviations.',
    fullDescription: `Record your healthy cough as a baseline, then detect when your cough sounds significantly different (indicating potential illness). All processing happens on-device for complete privacy.`,
    category: 'personal',
    sector: 'healthcare',
    type: 'demo',
    status: 'live',
    featured: false,
    techStack: ['TensorFlow.js', 'Web Audio API', 'MFCC', 'React'],
    highlights: [
        'Personal baseline establishment',
        'Deviation detection and scoring',
        'Trend tracking over time',
        'Privacy-preserving (all on-device)',
    ],
    demoUrl: '/demos#cough',
};

export default project;
