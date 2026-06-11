import Link from 'next/link';
import styles from './Services.module.css';

const SERVICES = [
    {
        icon: '🔍',
        title: 'AI Feasibility Sprint',
        description: 'A fixed-scope proof-of-concept on your real data. Find out whether AI actually solves your problem, and what it will take, before committing to a full build.',
        tags: ['Fixed scope', 'Working PoC', 'Go/no-go clarity'],
        highlight: true,
    },
    {
        icon: '🤖',
        title: 'AI Agents & RAG Systems',
        description: 'Autonomous agents and agentic pipelines, retrieval over your data sources, LLM fine-tuning, and evaluation frameworks: AI that does real work, with quality you can measure.',
        tags: ['Agents', 'RAG', 'LangGraph', 'Eval frameworks'],
    },
    {
        icon: '👁️',
        title: 'Computer Vision Pipelines',
        description: 'Detection, segmentation, and keypoint systems, from annotation strategy to production deployment, including the rule layers that handle real-world edge cases.',
        tags: ['Detection', 'Segmentation', 'Keypoints'],
    },
    {
        icon: '⚙️',
        title: 'ML Platforms & Automation',
        description: 'Workflow builders, no-code ML tooling, and end-to-end pipelines designed so your team can operate and extend them without me.',
        tags: ['Pipelines', 'No-code tools', 'Handover-ready'],
    },
    {
        icon: '☁️',
        title: 'Full-Stack & Cloud Engineering',
        description: 'The software around the models: APIs, dashboards, data pipelines, and the cloud infrastructure underneath. The unglamorous parts that make AI actually ship.',
        tags: ['FastAPI', 'React', 'AWS / Azure', 'Databricks'],
    },
];

/**
 * Services - what a client can actually engage me for
 */
export default function Services() {
    return (
        <section className={`section ${styles.services}`} id="services">
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Services</span>
                    <h2 className="section-header__title">What I Can Build for You</h2>
                    <p className="section-header__description">
                        Project-based engagements with clear scope, working software, and full
                        handover. See the process below
                    </p>
                </div>

                <div className={styles.grid}>
                    {SERVICES.map(service => (
                        <div
                            key={service.title}
                            className={`${styles.card} ${service.highlight ? styles.highlighted : ''}`}
                        >
                            {service.highlight && (
                                <span className={styles.badge}>Start here</span>
                            )}
                            <span className={styles.icon}>{service.icon}</span>
                            <h3 className={styles.title}>{service.title}</h3>
                            <p className={styles.description}>{service.description}</p>
                            <div className={styles.tags}>
                                {service.tags.map(tag => (
                                    <span key={tag} className={styles.tag}>{tag}</span>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <p className={styles.cta}>
                    If it runs on software, it can be scoped.{' '}
                    <Link href="#contact">Start with a conversation →</Link>
                </p>
            </div>
        </section>
    );
}
