const project = {
    slug: 'aletheia-ai',
    title: 'Aletheia AI',
    shortDescription: 'Describe an object in plain language, segment it, export it as a 3D model for rapid asset creation for games and AR/VR.',
    fullDescription: `From mask to asset: upload an image, describe what you want in natural language, and Aletheia segments it with VLM + SAM, then exports the isolated object as a 3D model, turning any photo into game, AR/VR, or digital-content assets in seconds instead of a manual modeling session.`,
    category: 'personal',
    sector: 'creative',
    type: 'demo',
    status: 'completed',
    featured: true,
    techStack: ['SAM3', 'VLM', 'Streamlit', 'Python'],
    highlights: [
        '2D segment → exported 3D model pipeline',
        'Natural language prompt-driven segmentation',
        'Real-time interactive mask refinement',
        'Multi-object support for batch asset extraction',
    ],
    demoUrl: null, // TODO: point to /demos anchor once the in-browser segmentation demo is built
};

export default project;
