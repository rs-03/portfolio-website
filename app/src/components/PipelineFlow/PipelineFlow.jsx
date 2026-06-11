import styles from './PipelineFlow.module.css';

/**
 * Architecture pipeline visualization — numbered stages connected
 * by animated flow lines. Pure CSS, theme-aware.
 *
 * @param {string[]} stages - ordered stage labels
 */
export default function PipelineFlow({ stages }) {
    if (!stages || stages.length === 0) return null;

    return (
        <div className={styles.pipeline} role="img" aria-label={`Pipeline: ${stages.join(', then ')}`}>
            {stages.map((stage, index) => (
                <div key={index} className={styles.segment}>
                    <div className={styles.stage}>
                        <span className={styles.stageNumber}>{String(index + 1).padStart(2, '0')}</span>
                        <span className={styles.stageLabel}>{stage}</span>
                    </div>
                    {index < stages.length - 1 && (
                        <div className={styles.connector} aria-hidden="true">
                            <span className={styles.connectorLine} />
                            <span className={styles.connectorArrow}>▸</span>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
}
