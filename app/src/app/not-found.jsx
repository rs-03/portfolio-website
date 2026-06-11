import Link from 'next/link';
import styles from './not-found.module.css';

export const metadata = {
    title: 'Page Not Found | Rahul Sangamker',
};

/**
 * Custom 404 page
 */
export default function NotFound() {
    return (
        <section className={`section ${styles.notFound}`}>
            <div className="container">
                <div className={styles.content}>
                    <span className={styles.code}>404</span>
                    <h1 className={styles.title}>Page Not Found</h1>
                    <p className={styles.description}>
                        The page you&apos;re looking for doesn&apos;t exist or has been moved.
                    </p>
                    <div className={styles.actions}>
                        <Link href="/" className="btn btn--primary">
                            Back to Home
                        </Link>
                        <Link href="/projects" className="btn btn--secondary">
                            View Projects
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    );
}
