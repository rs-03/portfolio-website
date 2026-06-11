const project = {
    slug: 'phantom-limb-vr',
    title: 'Phantom Limb Mirror Therapy',
    shortDescription: 'Mirror-box therapy recreated with real-time hand tracking. Browser preview live now, WebXR version in development.',
    fullDescription: `Mirror-box therapy reduces phantom limb pain by showing amputees their missing limb moving again. This project recreates that illusion digitally: real-time hand tracking detects the intact hand and renders a mirrored "phantom" twin moving in sync on the opposite side, no physical mirror box required. A browser-based preview of the core interaction is live now; the full WebXR version with guided therapy exercises and pain-progress tracking is in development.`,
    category: 'personal',
    sector: 'healthcare',
    type: 'demo',
    status: 'live',
    featured: false,
    techStack: ['MediaPipe', 'Hand Tracking', 'WebXR', 'Three.js', 'React'],
    highlights: [
        'Real-time hand tracking at 21 keypoints',
        'Mirrored phantom hand rendered live: the mirror-box illusion, digitized',
        'Runs fully on-device in the browser',
        'WebXR version with therapy exercises in development',
    ],
    demoUrl: '/demos#mirror',
};

export default project;
