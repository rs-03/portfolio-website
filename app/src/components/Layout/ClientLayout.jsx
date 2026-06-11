'use client';

import { ThemeProvider } from '@/context/ThemeContext';
import { Header, Footer } from '@/components/Layout';

/**
 * Client-side layout wrapper
 * Provides theme context and renders header/footer
 */
export default function ClientLayout({ children }) {
    return (
        <ThemeProvider>
            <Header />
            <main>{children}</main>
            <Footer />
        </ThemeProvider>
    );
}
