import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Intentional Year',
  description: 'Plan your year, one day at a time. A year-at-a-glance planner for the trips, challenges, habits, and adventures that actually matter.',
  manifest: '/site.webmanifest',
  themeColor: '#2a2620',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  appleWebApp: {
    title: 'Intentional Year',
    statusBarStyle: 'default',
    capable: true,
  },
  openGraph: {
    title: 'Intentional Year',
    description: 'A year-at-a-glance planner for the trips, challenges, habits, and adventures that actually matter.',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
