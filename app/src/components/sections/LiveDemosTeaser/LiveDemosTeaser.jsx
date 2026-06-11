import Link from 'next/link';
import styles from './LiveDemosTeaser.module.css';

const DEMOS = [
    {
        icon: '🫁',
        title: 'Cough Fingerprint',
        blurb: 'Your personal acoustic baseline, hand-rolled DSP',
        href: '/demos#cough',
    },
    {
        icon: '🪞',
        title: 'Mirror Therapy',
        blurb: 'The phantom-limb illusion, no mirror box needed',
        href: '/demos#mirror',
    },
    {
        icon: '🎯',
        title: 'Can an AI Spot You?',
        blurb: 'Test camouflage against a detection model at four distances',
        href: '/demos#camouflage',
    },
    {
        icon: '🖐️',
        title: 'Keypoints to Measurements',
        blurb: 'Live hand tracking with a real-centimeter pinch ruler',
        href: '/demos#keypoints',
    },
    {
        icon: '✍️',
        title: 'Draw a Digit',
        blurb: 'A from-scratch neural network reads your handwriting',
        href: '/demos#live-demo',
    },
];

/**
 * Live Demos Teaser - compact homepage strip linking into the demo lab
 */
export default function LiveDemosTeaser() {
    return (
        <section className={`section ${styles.teaser}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Proof, Not Promises</span>
                    <h2 className="section-header__title">Working AI You Can Try Right Now</h2>
                    <p className="section-header__description">
                        Five live demos run entirely in your browser, with nothing uploaded and
                        nothing faked. Pick one and poke at it.
                    </p>
                </div>

                <div className={styles.grid}>
                    {DEMOS.map(demo => (
                        <Link key={demo.href} href={demo.href} className={styles.card}>
                            <span className={styles.icon}>{demo.icon}</span>
                            <span className={styles.title}>{demo.title}</span>
                            <span className={styles.blurb}>{demo.blurb}</span>
                            <span className={styles.try}>
                                <span className={styles.liveDot} aria-hidden="true" />
                                Try it →
                            </span>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
