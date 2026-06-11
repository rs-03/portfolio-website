import { testimonials } from '@/data/testimonials';
import { getSectorById } from '@/data/sectors';
import styles from './Testimonials.module.css';

/**
 * Testimonials - renders only when real quotes exist in data/testimonials.js
 */
export default function Testimonials() {
    if (!testimonials || testimonials.length === 0) return null;

    return (
        <section className={`section ${styles.testimonials}`}>
            <div className="container">
                <div className="section-header">
                    <span className="section-header__eyebrow">Working Together</span>
                    <h2 className="section-header__title">What Clients Say</h2>
                </div>

                <div className={styles.grid}>
                    {testimonials.map((testimonial, index) => {
                        const sector = testimonial.sector ? getSectorById(testimonial.sector) : null;
                        return (
                            <figure key={index} className={styles.card}>
                                <span className={styles.quoteMark} aria-hidden="true">&ldquo;</span>
                                <blockquote className={styles.quote}>
                                    {testimonial.quote}
                                </blockquote>
                                <figcaption className={styles.attribution}>
                                    {sector && <span className={styles.sectorIcon}>{sector.icon}</span>}
                                    <span>
                                        {testimonial.name && (
                                            <span className={styles.name}>{testimonial.name}</span>
                                        )}
                                        <span className={styles.role}>{testimonial.role}</span>
                                    </span>
                                </figcaption>
                            </figure>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}
