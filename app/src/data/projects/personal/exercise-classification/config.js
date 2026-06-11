const project = {
    slug: 'exercise-classification',
    title: 'Exercise Classification with BlazePose',
    shortDescription: 'Video-based exercise classifier using pose estimation and GBM achieving 90%+ accuracy.',
    fullDescription: `Built an exercise classification system using MediaPipe BlazePose to extract framewise pose tracking data from workout videos. The pipeline generates a training dataset from skeletal keypoints, which is fed into a Gradient Boosting Machine (GBM) classifier. At inference time, the model predicts exercise type for each frame, and majority voting across all frames determines the final classification, achieving over 90% accuracy.`,
    category: 'personal',
    sector: 'healthcare',
    type: 'case-study',
    status: 'completed',
    featured: true,
    techStack: ['BlazePose', 'MediaPipe', 'Python', 'Scikit-learn', 'GBM', 'OpenCV'],
    highlights: [
        'Framewise pose tracking with BlazePose',
        'Custom training dataset generation from videos',
        'GBM classifier for exercise recognition',
        'Majority voting for robust predictions',
        '90%+ classification accuracy',
    ],
};

export default project;
