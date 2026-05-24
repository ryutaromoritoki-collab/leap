import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Leap - 起業家の成長を追える資本提携プラットフォーム',
  description: 'Leapは起業家の進捗とKPIを投資家が継続的に観察できるSNS型資本提携プラットフォームです。',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ja">
      <body>{children}</body>
    </html>
  );
}
