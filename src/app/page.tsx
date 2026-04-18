export const dynamic = 'force-dynamic';

import { PortfolioData } from '@/types';
import ErrorState from '@/components/ErrorState';
import Nav from '@/components/Nav';
import Hero from '@/components/Hero';
import Work from '@/components/Work';
import About from '@/components/About';
import Stack from '@/components/Stack';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

async function getPortfolioData(): Promise<PortfolioData | null> {
  const raw = process.env.NEXT_PUBLIC_API_URL;
  if (!raw) {
    console.error('[Vault] NEXT_PUBLIC_API_URL is not set');
    return null;
  }
  const url = raw.startsWith('/')
    ? `http://localhost:${process.env.PORT ?? 3000}${raw}`
    : raw;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`API responded with ${res.status}`);
    return res.json() as Promise<PortfolioData>;
  } catch (err) {
    console.error('[Vault] Failed to fetch portfolio data:', err);
    return null;
  }
}

export default async function Page(): Promise<React.ReactElement> {
  const data = await getPortfolioData();
  if (!data) return <ErrorState />;

  return (
    <>
      <Nav name={data.hero.name} />
      <main>
        <Hero
          name={data.hero.name}
          title={data.hero.title}
          image={data.hero.image}
          socialLinks={data.hero.socialLinks}
          available={data.meta.plan !== 'UNAVAILABLE'}
        />
        <Work projects={data.projects.projects} />
        <About
          bio={data.about.bio}
          experience={data.about.experience}
          education={data.about.education}
        />
        <Stack skills={data.about.skills} />
        <Contact contact={data.contact} socialLinks={data.hero.socialLinks} />
      </main>
      <Footer />
    </>
  );
}
