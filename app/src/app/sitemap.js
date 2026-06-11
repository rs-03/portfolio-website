import { getAllProjects } from '@/data/projects/index';
import { siteConfig } from '@/data/siteConfig';

export const dynamic = 'force-static';

/**
 * Sitemap generated at build time from project data
 */
export default function sitemap() {
    const base = siteConfig.siteUrl;
    const lastModified = new Date();

    const projectUrls = getAllProjects().map(project => ({
        url: `${base}/projects/${project.slug}/`,
        lastModified,
        changeFrequency: 'monthly',
        priority: 0.7,
    }));

    return [
        {
            url: `${base}/`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 1,
        },
        {
            url: `${base}/projects/`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        {
            url: `${base}/demos/`,
            lastModified,
            changeFrequency: 'monthly',
            priority: 0.9,
        },
        ...projectUrls,
    ];
}
