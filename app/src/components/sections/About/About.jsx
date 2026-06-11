import { siteConfig } from '@/data/siteConfig';
import styles from './About.module.css';

/**
 * About Section - Brief professional summary
 */
export default function About() {
    return (
        <section className={`section ${styles.about}`}>
            <div className="container">
                <div className={styles.wrapper}>
                    <div className={styles.header}>
                        <span className="section-header__eyebrow">About Me</span>
                        <h2 className={styles.title}>Turning AI Research Into Business Results</h2>
                    </div>

                    <div className={styles.content}>
                        {siteConfig.bio.split('\n\n').map((paragraph, index) => (
                            <p key={index} className={styles.paragraph}>
                                {paragraph}
                            </p>
                        ))}
                    </div>

                    {/* Highlight Stats */}
                    <div className={styles.highlights}>
                        <div className={styles.highlight}>
                            <span className={styles.highlightIcon}>🎯</span>
                            <span className={styles.highlightText}>Production-Grade Systems</span>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.highlightIcon}>🔬</span>
                            <span className={styles.highlightText}>Research to Deployment</span>
                        </div>
                        <div className={styles.highlight}>
                            <span className={styles.highlightIcon}>📈</span>
                            <span className={styles.highlightText}>Measurable Impact</span>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
