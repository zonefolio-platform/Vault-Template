'use client';

import { useEffect } from 'react';
import { safeColor } from '@/lib/theme';

const accent    = safeColor(process.env.NEXT_PUBLIC_COLOR_ACCENT,    'accent');
const secondary = safeColor(process.env.NEXT_PUBLIC_COLOR_SECONDARY, 'secondary');
const highlight = safeColor(process.env.NEXT_PUBLIC_COLOR_HIGHLIGHT, 'highlight');

export default function ThemeInjector(): null {
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--accent',    accent);
    root.style.setProperty('--secondary', secondary);
    root.style.setProperty('--highlight', highlight);
  }, []);
  return null;
}
