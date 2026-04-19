import type { Metadata } from 'next';
import SplashCursorLoader from '@/components/SplashCursorLoader';
import ThemeInjector from '@/components/ThemeInjector';
import './globals.css';

export const metadata: Metadata = {
  title: 'Portfolio',
  description: 'Built with ZoneFolio',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=clash-display@600,700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@300,400,500&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <ThemeInjector />
        <SplashCursorLoader />
        {children}
      </body>
    </html>
  );
}
