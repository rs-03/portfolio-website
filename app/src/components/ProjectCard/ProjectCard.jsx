import Link from 'next/link';
import { getSectorById } from '@/data/sectors';
import { getCategoryById } from '@/data/projects/index';
import styles from './ProjectCard.module.css';

/**
 * Reusable Project Card Component
 * @param {object} project - Project data from projects.js
 * @param {boolean} featured - Show as featured (larger) card
 */
export default function ProjectCard({ project, featured = false }) {
    const sector = getSectorById(project.sector);

    const statusLabels = {
        'completed': 'Completed',
        'live': 'Live Demo',
        'coming-soon': 'Coming Soon',
    };

    const statusColors = {
        'completed': 'success',
        'live': 'success',
        'coming-soon': 'warning',
    };

    return (
        <Link
            href={`/projects/${project.slug}`}
            className={`${styles.card} ${featured ? styles.featured : ''}`}
        >
            {/* Card Header with sector and status */}
            <div className={styles.header}>
                <span className={styles.sector}>
                    {sector?.icon} {sector?.name}
                </span>
                <span className={`badge badge--${statusColors[project.status]}`}>
                    {statusLabels[project.status]}
                </span>
            </div>

            {/* Card Body */}
            <div className={styles.body}>
                <h3 className={styles.title}>{project.title}</h3>
                <p className={styles.description}>{project.shortDescription}</p>

                {/* Impact metric if available */}
                {project.impactMetric && (
                    <div className={styles.impact}>
                        <span className={styles.impactValue}>{project.impactMetric}</span>
                    </div>
                )}
            </div>

            {/* Card Footer with tech stack */}
            <div className={styles.footer}>
                <div className={styles.techStack}>
                    {project.techStack.slice(0, 4).map((tech, index) => (
                        <span key={index} className={styles.tech}>
                            {tech}
                        </span>
                    ))}
                    {project.techStack.length > 4 && (
                        <span className={styles.techMore}>
                            +{project.techStack.length - 4}
                        </span>
                    )}
                </div>

                <span className={styles.arrow}>→</span>
            </div>
        </Link>
    );
}
