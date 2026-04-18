import type { Metadata } from 'next';
import { fetchPortfolioData } from '@/lib/server-fetcher';
import { generatePortfolioMetadata } from '@/lib/metadata';
import ErrorState from '@/components/ErrorState';
import VaultShell from '@/components/VaultShell';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const result = await fetchPortfolioData();
  if (!result.ok) return {};
  return generatePortfolioMetadata(result.data);
}

export default async function Page(): Promise<React.ReactElement> {
  const result = await fetchPortfolioData();
  if (!result.ok) return <ErrorState />;
  return <VaultShell data={result.data} />;
}
