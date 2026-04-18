import type { Metadata } from 'next';
import type { PortfolioData } from '@/types';

export function generatePortfolioMetadata(data: PortfolioData): Metadata {
  const name        = data?.hero?.name ?? 'Portfolio';
  const bio         = data?.about?.bio ?? 'A dark editorial portfolio built with Next.js.';
  const description = bio.length > 160 ? bio.substring(0, 157) + '...' : bio;
  const pageTitle   = name;

  return {
    title:       pageTitle,
    description,
    authors:     [{ name }],
    creator:     name,
    openGraph: {
      type:        'website',
      locale:      'en_US',
      title:       pageTitle,
      description,
      siteName:    name,
    },
    twitter: {
      card:        'summary_large_image',
      title:       pageTitle,
      description,
    },
    robots: {
      index:  true,
      follow: true,
      googleBot: {
        index:              true,
        follow:             true,
        'max-video-preview':  -1,
        'max-image-preview':  'large',
        'max-snippet':        -1,
      },
    },
  };
}
