"use client";

import dynamic from 'next/dynamic';

const SplashCursor = dynamic(() => import('./SplashCursor'), { ssr: false });

export default function SplashCursorLoader(): React.ReactElement {
  return <SplashCursor />;
}
