import Link from 'next/link';
import { getFeaturedProjects } from '@/data/projects/index';
import ProjectCard from '@/components/ProjectCard';
import styles from './FeaturedProjects.module.css';

/**
 * Featured Projects Section - Showcases top projects
 */
export default function FeaturedProjects() {
    const featuredProjects = getFeaturedProjects(6);

    return (
        <section className={`section ${styles.featured}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Portfolio</span>
                    <h2 className="section-header__title">Featured Projects</h2>
                    <p className="section-header__description">
                        A selection of AI/ML projects delivering real-world impact
                    </p>
                </div>

                <div className={styles.grid}>
                    {featuredProjects.map((project, index) => (
                        <ProjectCard
                            key={project.slug}
                            project={project}
                            featured={index === 0}
                        />
                    ))}
                </div>

                <div className={styles.viewAll}>
                    <Link href="/projects" className="btn btn--secondary">
                        View All Projects
                    </Link>
                </div>
            </div>
        </section>
    );
}
