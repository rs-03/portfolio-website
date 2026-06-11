import { ImageResponse } from 'next/og';
import { siteConfig } from '@/data/siteConfig';

export const dynamic = 'force-static';
export const alt = `${siteConfig.name} · ${siteConfig.title}`;
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

/**
 * Open Graph image generated at build time
 */
export default function OpengraphImage() {
    return new ImageResponse(
        (
            <div
                style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                    padding: '80px',
                    background: 'linear-gradient(135deg, #0a0a14 0%, #1a1430 100%)',
                    color: '#f0f0f5',
                    fontFamily: 'sans-serif',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '16px',
                        fontSize: 28,
                        color: '#9d8df0',
                        marginBottom: 24,
                    }}
                >
                    {siteConfig.title}
                </div>
                <div style={{ display: 'flex', fontSize: 84, fontWeight: 700 }}>
                    {siteConfig.name}
                </div>
                <div
                    style={{
                        display: 'flex',
                        fontSize: 36,
                        color: '#bdb2f5',
                        marginTop: 28,
                    }}
                >
                    {siteConfig.tagline}
                </div>
                <div
                    style={{
                        display: 'flex',
                        gap: '40px',
                        marginTop: 64,
                        fontSize: 26,
                        color: '#8888a0',
                    }}
                >
                    <span>5+ Years Experience</span>
                    <span>14+ AI Products</span>
                    <span>$20M+ Impact</span>
                </div>
            </div>
        ),
        { ...size }
    );
}
