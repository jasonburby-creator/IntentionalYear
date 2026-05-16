import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Adventure Planner',
  description: 'Plan your year, one day at a time.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
