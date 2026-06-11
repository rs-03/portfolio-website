import styles from './BeyondCode.module.css';

/**
 * Beyond Code Section - Subtle personality/hobbies display
 * Humanizes the portfolio without distracting from technical focus
 */
export default function BeyondCode() {
    const interests = [
        {
            icon: '♟️',
            title: 'Chess',
            subtitle: '1713 Rapid • Strategic thinking',
            url: 'https://www.chess.com/member/itachi_1999',
        },
        {
            icon: '🎭',
            title: 'Theater & Acting',
            subtitle: 'Communication & presence',
            url: 'https://in.bookmyshow.com/person/rahul-sangamker/2032332',
        },
    ];

    return (
        <section className={`section ${styles.beyondCode}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">The Human Side</span>
                    <h2 className="section-header__title">Beyond Code</h2>
                </div>

                <div className={styles.content}>
                    <p className={styles.tagline}>
                        When I&apos;m not building AI systems, you&apos;ll find me thinking a few moves ahead
                        or occasionally stepping on stage.
                    </p>

                    <div className={styles.interests}>
                        {interests.map((interest, index) => (
                            <a
                                key={index}
                                href={interest.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className={styles.interest}
                            >
                                <span className={styles.interestIcon}>{interest.icon}</span>
                                <div className={styles.interestContent}>
                                    <div className={styles.interestTitle}>{interest.title}</div>
                                    <div className={styles.interestSubtitle}>{interest.subtitle}</div>
                                </div>
                            </a>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
