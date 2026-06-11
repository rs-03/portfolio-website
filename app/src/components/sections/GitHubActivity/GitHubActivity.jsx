import { Github, Activity } from 'lucide-react';
import { siteConfig } from '@/data/siteConfig';
import styles from './GitHubActivity.module.css';

const githubUsername = siteConfig.social.github.split('/').pop();

/**
 * GitHub Activity Section - Shows live GitHub contribution graph
 * Chart auto-updates via ghchart.rshah.org; one variant per theme
 */
export default function GitHubActivity() {
    return (
        <section className={`section ${styles.githubActivity}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Always Building</span>
                    <h2 className="section-header__title">GitHub Activity</h2>
                    <p className="section-header__description">
                        Personal projects, experiments, and continuous learning
                    </p>
                </div>

                <div className={styles.content}>
                    <div className={styles.card}>
                        <div className={styles.cardHeader}>
                            <h3 className={styles.cardTitle}>
                                <Github size={24} />
                                Contribution Graph
                            </h3>
                            <span className={styles.badge}>
                                <Activity size={14} />
                                Updated live from GitHub
                            </span>
                        </div>

                        <div className={styles.imageWrapper}>
                            {/* External SVG chart; next/image adds nothing with unoptimized static export */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                                src={`https://ghchart.rshah.org/2d5a27/${githubUsername}`}
                                alt={`GitHub contribution graph for ${githubUsername}`}
                                className={styles.graphImage}
                                loading="lazy"
                            />
                        </div>

                        <p className={styles.caption}>
                            Active development beyond enterprise projects.{' '}
                            <a
                                href={siteConfig.social.github}
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                View on GitHub →
                            </a>
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
