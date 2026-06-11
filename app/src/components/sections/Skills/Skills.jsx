import { Brain, MessageSquare, Cloud, Code, Sparkles, Database } from 'lucide-react';
import { siteConfig } from '@/data/siteConfig';
import styles from './Skills.module.css';

// Map category names to icons
const categoryIcons = {
    'ML & Deep Learning': Brain,
    'GenAI & Prompt Engineering': Sparkles,
    'LLMs & NLP': MessageSquare,
    'Cloud & Data': Cloud,
    'Databases': Database,
    'Full-Stack': Code,
};

/**
 * Skills Section - Categorized tech stack display with icons
 */
export default function Skills() {
    return (
        <section className={`section ${styles.skills}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Tech Stack</span>
                    <h2 className="section-header__title">Skills & Expertise</h2>
                    <p className="section-header__description">
                        Technologies and frameworks I use to build production-grade AI systems
                    </p>
                </div>

                <div className={styles.grid}>
                    {siteConfig.skills.map((category, index) => {
                        const IconComponent = categoryIcons[category.category] || Code;
                        return (
                            <div key={index} className={styles.category}>
                                <div className={styles.categoryHeader}>
                                    <div className={styles.iconWrapper}>
                                        <IconComponent size={24} />
                                    </div>
                                    <h3 className={styles.categoryTitle}>{category.category}</h3>
                                </div>
                                <div className={styles.tags}>
                                    {category.items.map((skill, skillIndex) => (
                                        <span key={skillIndex} className={styles.tag}>
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
