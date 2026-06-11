import styles from './HowIWork.module.css';

const STEPS = [
    {
        number: '01',
        title: 'Scope',
        description: 'A short call to understand the problem, the data you have, and what success actually looks like. You get an honest read on feasibility, including when AI is the wrong tool.',
    },
    {
        number: '02',
        title: 'Prototype',
        description: 'A working proof-of-concept early, on your real data. We validate the approach before committing to a full build, not after.',
    },
    {
        number: '03',
        title: 'Production',
        description: 'Hardened, evaluated, deployed. Every system ships with evaluation metrics you can trust, not just a demo that worked once.',
    },
    {
        number: '04',
        title: 'Handover',
        description: 'Documentation, knowledge transfer, and support. Your team owns the system. No black boxes, no lock-in.',
    },
];

/**
 * How I Work - engagement process for prospective clients
 */
export default function HowIWork() {
    return (
        <section className={`section ${styles.howIWork}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Engagement</span>
                    <h2 className="section-header__title">How I Work</h2>
                    <p className="section-header__description">
                        From first call to handover, built for teams that need results, not research
                    </p>
                </div>

                <div className={styles.steps}>
                    {STEPS.map((step, index) => (
                        <div key={step.number} className={styles.step}>
                            <div className={styles.stepHeader}>
                                <span className={styles.stepNumber}>{step.number}</span>
                                {index < STEPS.length - 1 && <span className={styles.stepLine} aria-hidden="true" />}
                            </div>
                            <h3 className={styles.stepTitle}>{step.title}</h3>
                            <p className={styles.stepDescription}>{step.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
