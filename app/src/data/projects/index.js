/**
 * Projects Aggregator
 * Imports all project configs and exports unified API
 */

import { projectCategories, projectDefaults, getCategoryById } from './_config';

// Professional Projects
import workflowBuilder from './professional/workflow-builder/config';
import agenticRag from './professional/agentic-rag/config';
import doubleWoodsDetection from './professional/double-woods-detection/config';
import poleHeightNesc from './professional/pole-height-nesc/config';
import keypointDetectionLlm from './professional/keypoint-detection-llm/config';
import promptableSegmentation from './professional/promptable-segmentation/config';
import mapDigitization from './professional/map-digitization/config';
import healthcareAnalytics from './professional/healthcare-analytics/config';
import noCodeMl from './professional/no-code-ml/config';
import documentIntelligence from './professional/document-intelligence/config';

// Personal Projects
import digitRecognition from './personal/digit-recognition/config';
import handKeypointDetection from './personal/hand-keypoint-detection/config';
import reticle from './personal/reticle/config';
import aletheiaAi from './personal/aletheia-ai/config';
import exerciseClassification from './personal/exercise-classification/config';
import beeWaggleDecoder from './personal/bee-waggle-decoder/config';
import camouflageAnalyzer from './personal/camouflage-analyzer/config';
import babyCryInterpreter from './personal/baby-cry-interpreter/config';
import phantomLimbVr from './personal/phantom-limb-vr/config';
import coughMonitor from './personal/cough-monitor/config';

/**
 * All projects combined with defaults applied
 */
const allProjects = [
    // Professional
    workflowBuilder,
    agenticRag,
    doubleWoodsDetection,
    poleHeightNesc,
    keypointDetectionLlm,
    promptableSegmentation,
    mapDigitization,
    healthcareAnalytics,
    noCodeMl,
    documentIntelligence,
    // Personal
    digitRecognition,
    handKeypointDetection,
    reticle,
    aletheiaAi,
    exerciseClassification,
    beeWaggleDecoder,
    camouflageAnalyzer,
    babyCryInterpreter,
    phantomLimbVr,
    coughMonitor,
].map(project => ({
    ...projectDefaults,
    ...project,
}));

/**
 * Get all projects
 * @returns {Array}
 */
export function getAllProjects() {
    return allProjects;
}

/**
 * Get projects by category (professional/personal)
 * @param {string} categoryId 
 * @returns {Array}
 */
export function getProjectsByCategory(categoryId) {
    return allProjects.filter(p => p.category === categoryId);
}

/**
 * Get featured projects
 * @param {number} limit - Optional limit
 * @returns {Array}
 */
export function getFeaturedProjects(limit = null) {
    const featured = allProjects.filter(p => p.featured);
    return limit ? featured.slice(0, limit) : featured;
}

/**
 * Get projects by sector
 * @param {string} sectorId 
 * @returns {Array}
 */
export function getProjectsBySector(sectorId) {
    return allProjects.filter(p => p.sector === sectorId);
}

/**
 * Get a single project by slug
 * @param {string} slug 
 * @returns {object|undefined}
 */
export function getProjectBySlug(slug) {
    return allProjects.find(p => p.slug === slug);
}

/**
 * Get all unique sectors that have projects
 * @returns {Array}
 */
export function getActiveSectors() {
    const sectorIds = [...new Set(allProjects.map(p => p.sector))];
    return sectorIds;
}

// Re-export for convenience
export { projectCategories, getCategoryById };
