import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { QueryProvider } from '@/providers/QueryProvider';
import { AuthProvider } from '@/providers/AuthProvider';
import './globals.css';

export const metadata: Metadata = {
  title: {
    template: '%s | ProjectFlow',
    default: 'ProjectFlow',
  },
  description: 'Production-grade project management platform.',
};

// Viewport is exported separately per Next.js 14+ convention.
// Placing it inside metadata raises a build warning.
export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

interface RootLayoutProps {
  children: ReactNode;
}

// Provider ordering matters:
//   QueryProvider must be the outer wrapper so AuthProvider (and any
//   future hook inside it) can call useQuery / useMutation.
export default function RootLayout({ children }: RootLayoutProps): JSX.Element {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning>
        <QueryProvider>
          <AuthProvider>{children}</AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
