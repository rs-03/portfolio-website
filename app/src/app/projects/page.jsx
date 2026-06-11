'use client';

import { useState, useMemo } from 'react';
import { getAllProjects, projectCategories, getProjectsByCategory } from '@/data/projects/index';
import { sectors } from '@/data/sectors';
import ProjectCard from '@/components/ProjectCard';
import styles from './page.module.css';

/**
 * Projects Page - All projects with category and sector filtering
 */
export default function ProjectsPage() {
    const [activeCategory, setActiveCategory] = useState('all');
    const [activeSector, setActiveSector] = useState('all');
    const [activeTech, setActiveTech] = useState('all');

    const allProjects = getAllProjects();

    // Get all unique technologies
    const allTechnologies = useMemo(() => {
        const techSet = new Set();
        allProjects.forEach(p => {
            p.techStack?.forEach(tech => techSet.add(tech));
        });
        return Array.from(techSet).sort();
    }, [allProjects]);

    // Filter by category first
    let filteredProjects = activeCategory === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === activeCategory);

    // Then filter by sector
    if (activeSector !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.sector === activeSector);
    }

    // Then filter by technology
    if (activeTech !== 'all') {
        filteredProjects = filteredProjects.filter(p => p.techStack?.includes(activeTech));
    }

    // Get only sectors that have projects in current category
    const currentCategoryProjects = activeCategory === 'all'
        ? allProjects
        : allProjects.filter(p => p.category === activeCategory);
    const activeSectorIds = [...new Set(currentCategoryProjects.map(p => p.sector))];
    const activeSectors = sectors.filter(s => activeSectorIds.includes(s.id));

    return (
        <section className={`section ${styles.projects}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Portfolio</span>
                    <h1 className="section-header__title">All Projects</h1>
                    <p className="section-header__description">
                        Explore my work across different domains and technologies
                    </p>
                </div>

                {/* Category Tabs (Professional vs Personal) */}
                <div className={styles.categoryTabs}>
                    <button
                        className={`${styles.categoryTab} ${activeCategory === 'all' ? styles.active : ''}`}
                        onClick={() => { setActiveCategory('all'); setActiveSector('all'); }}
                    >
                        All Work
                    </button>
                    {projectCategories.map(cat => (
                        <button
                            key={cat.id}
                            className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.active : ''}`}
                            onClick={() => { setActiveCategory(cat.id); setActiveSector('all'); }}
                        >
                            {cat.icon} {cat.name}
                        </button>
                    ))}
                </div>

                {/* Sector Filter Pills */}
                <div className={styles.filters}>
                    <button
                        className={`${styles.filterBtn} ${activeSector === 'all' ? styles.active : ''}`}
                        onClick={() => setActiveSector('all')}
                    >
                        All Sectors
                    </button>
                    {activeSectors.map(sector => (
                        <button
                            key={sector.id}
                            className={`${styles.filterBtn} ${activeSector === sector.id ? styles.active : ''}`}
                            onClick={() => setActiveSector(sector.id)}
                        >
                            {sector.icon} {sector.name}
                        </button>
                    ))}
                </div>

                {/* Technology Filter */}
                <div className={styles.techFilter}>
                    <label className={styles.techLabel}>Filter by Tech:</label>
                    <select
                        className={styles.techSelect}
                        value={activeTech}
                        onChange={(e) => setActiveTech(e.target.value)}
                    >
                        <option value="all">All Technologies</option>
                        {allTechnologies.map(tech => (
                            <option key={tech} value={tech}>{tech}</option>
                        ))}
                    </select>
                </div>

                {/* Results Count */}
                <p className={styles.resultsCount}>
                    Showing {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
                    {activeTech !== 'all' && ` using ${activeTech}`}
                </p>

                {/* Projects Grid */}
                <div className={styles.grid}>
                    {filteredProjects.map(project => (
                        <ProjectCard key={project.slug} project={project} />
                    ))}
                </div>

                {filteredProjects.length === 0 && (
                    <p className={styles.noResults}>No projects found matching your filters.</p>
                )}
            </div>
        </section>
    );
}
