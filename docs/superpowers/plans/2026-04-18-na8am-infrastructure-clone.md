# Na8am Infrastructure Clone — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Clone na8am's data-driven infrastructure into Vault — optional types, isFilled validation, server fetcher with React cache(), metadata generation, VaultShell section orchestrator, and dynamic navigation.

**Architecture:** A new `VaultShell` client component owns all section-visibility logic using `isFilled()`. It passes computed visible sections to `Nav` for dynamic link rendering. `page.tsx` is simplified to fetch data, generate metadata, and render `VaultShell`. All section components receive optional data slices and guard field rendering with `isFilled()`.

**Tech Stack:** Next.js 16 App Router, TypeScript, React 19, no test runner (verify with `npx tsc --noEmit` and `npm run build`)

**Working directory:** `/Volumes/Extreme SSD/Projects/Templates/vault`

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `src/types/index.ts` | Modify | All fields → optional |
| `src/lib/is-filled.ts` | Create | Pure validation utility |
| `src/lib/server-fetcher.ts` | Create | Deduped server-side fetch with React cache() |
| `src/lib/metadata.ts` | Create | Dynamic SEO metadata from portfolio data |
| `src/components/Hero.tsx` | Modify | Accept optional data slice, guard fields |
| `src/components/Work.tsx` | Modify | Accept optional data slice, guard fields |
| `src/components/About.tsx` | Modify | Accept optional data slice, guard fields |
| `src/components/Stack.tsx` | Modify | Accept optional skills array |
| `src/components/Contact.tsx` | Modify | Accept optional data slice, guard fields |
| `src/components/Nav.tsx` | Modify | Accept sections[] prop, build links dynamically |
| `src/components/VaultShell.tsx` | Create | Section orchestrator — computes visibility, owns layout |
| `src/app/page.tsx` | Modify | Use server-fetcher + metadata + VaultShell |

---

## Task 1: Make all types optional

**Files:**
- Modify: `src/types/index.ts`

- [ ] **Step 1: Replace the entire file contents**

```typescript
export interface SocialLink {
  platform?: string;
  url?: string;
}

export interface WorkExperience {
  position?: string;
  company?: string;
  duration?: string;
  description?: string;
}

export interface Education {
  degree?: string;
  university?: string;
  from?: string;
  to?: string;
  GPA?: string;
}

export interface Project {
  name?: string;
  description?: string;
  image?: string;
  technologies?: string[];
  liveUrl?: string;
  githubUrl?: string;
}

export interface ContactInfo {
  email?: string;
  phone?: string;
  location?: string;
  whatsapp?: string;
}

export interface Meta {
  plan?: string;
  showBranding?: boolean;
}

export interface PortfolioData {
  hero?: {
    name?: string;
    title?: string;
    image?: string;
    socialLinks?: SocialLink[];
  };
  about?: {
    bio?: string;
    image?: string;
    skills?: string[];
    experience?: WorkExperience[];
    education?: Education[];
  };
  projects?: {
    projects?: Project[];
  };
  contact?: ContactInfo;
  meta?: Meta;
}
```

- [ ] **Step 2: Verify TypeScript sees the change**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | head -30
```

Expected: Type errors (downstream code passes required props — that's fine, we fix in later tasks). Zero errors means the types file itself is valid syntax.

---

## Task 2: Create `is-filled.ts`

**Files:**
- Create: `src/lib/is-filled.ts`

- [ ] **Step 1: Create the file**

```typescript
export function isFilled(v: unknown): boolean {
  if (v === null || v === undefined) return false;
  if (typeof v === 'string') return v.trim().length > 0;
  if (typeof v === 'number') return v > 0;
  if (Array.isArray(v)) return v.length > 0;
  return true;
}
```

- [ ] **Step 2: Verify it compiles**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'is-filled' | head -10
```

Expected: No errors mentioning `is-filled.ts`.

---

## Task 3: Create `server-fetcher.ts`

**Files:**
- Create: `src/lib/server-fetcher.ts`

- [ ] **Step 1: Create the file**

```typescript
import { cache } from 'react';
import type { PortfolioData } from '@/types';

export type FetchResult =
  | { ok: true; data: PortfolioData }
  | { ok: false; status: number };

async function _fetchPortfolioData(): Promise<FetchResult> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  if (!apiUrl) {
    console.warn('[Vault] NEXT_PUBLIC_API_URL is not set');
    return { ok: false, status: 0 };
  }

  // Dev: read from a local public/ file (e.g. /fakeAPI.json)
  if (apiUrl.startsWith('/')) {
    try {
      const { readFile } = await import('fs/promises');
      const { join } = await import('path');
      const content = await readFile(
        join(process.cwd(), 'public', apiUrl),
        'utf-8'
      );
      return { ok: true, data: JSON.parse(content) as PortfolioData };
    } catch {
      console.error('[Vault] local file not found:', apiUrl);
      return { ok: false, status: 404 };
    }
  }

  // Production: always fetch fresh
  try {
    const res = await fetch(apiUrl, { cache: 'no-store' });
    if (!res.ok) {
      console.error(`[Vault] API returned ${res.status} for ${apiUrl}`);
      return { ok: false, status: res.status };
    }
    const data = (await res.json()) as PortfolioData;
    return { ok: true, data };
  } catch (err) {
    console.error('[Vault] fetch failed:', err);
    return { ok: false, status: 0 };
  }
}

// React cache() deduplicates calls within a single render pass
// so generateMetadata() and Page() share one fetch, not two
export const fetchPortfolioData = cache(_fetchPortfolioData);
```

- [ ] **Step 2: Verify it compiles**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'server-fetcher' | head -10
```

Expected: No errors mentioning `server-fetcher.ts`.

---

## Task 4: Create `metadata.ts`

**Files:**
- Create: `src/lib/metadata.ts`

- [ ] **Step 1: Create the file**

```typescript
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
```

- [ ] **Step 2: Verify it compiles**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'metadata' | head -10
```

Expected: No errors mentioning `src/lib/metadata.ts`.

- [ ] **Step 3: Commit the data layer**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && git add src/types/index.ts src/lib/is-filled.ts src/lib/server-fetcher.ts src/lib/metadata.ts && git commit -m "feat: add data layer — optional types, isFilled, server-fetcher, metadata"
```

---

## Task 5: Update `Hero.tsx`

**Files:**
- Modify: `src/components/Hero.tsx`

The component currently receives `name: string`, `title: string`, `image: string`, `socialLinks: SocialLink[]`, `available: boolean`. Change it to receive `data?: PortfolioData['hero']` and `available?: boolean`, then extract and guard all fields internally.

- [ ] **Step 1: Update the import and HeroProps interface**

Find and replace the top of the file — the import block and `HeroProps` interface:

Old:
```typescript
import { SocialLink } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroProps {
  name: string;
  title: string;
  image: string;
  socialLinks: Array<SocialLink>;
  available: boolean;
}
```

New:
```typescript
import { PortfolioData } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface HeroProps {
  data?: PortfolioData['hero'];
  available?: boolean;
}
```

- [ ] **Step 2: Update sub-component interfaces for optional fields**

`Eyebrow` and `DisplayName` are internal components that currently require `string` props. Update them:

Find `interface EyebrowProps` and change `title: string` → `title?: string`:
```typescript
interface EyebrowProps {
  available: boolean;
  title?: string;
}
```

Find `interface DisplayNameProps` and change `name: string` → `name?: string`:
```typescript
interface DisplayNameProps {
  name?: string;
  isMobile: boolean;
  reducedMotion: boolean;
}
```

Inside `DisplayName`, both `{name}` JSX renders will become `{name ?? ''}` to keep TypeScript happy:
```tsx
<span style={{ ...sharedStyle, color: 'var(--vault-text-primary)' }}>
  {name ?? ''}
</span>
{/* Outline echo */}
<span aria-hidden="true" style={{ ...sharedStyle, color: 'transparent', WebkitTextStroke: '1px rgba(240,242,248,0.25)' }}>
  {name ?? ''}
</span>
```

- [ ] **Step 3: Update the main Hero function signature and roles derivation**

Old function opening:
```typescript
export default function Hero({
  name,
  title,
  available,
}: HeroProps): React.ReactElement {
```

New:
```typescript
export default function Hero({ data, available = false }: HeroProps): React.ReactElement {
  const name  = data?.name;
  const title = data?.title;
```

Fix the `roles` derivation (currently crashes if `title` is undefined):

Old:
```typescript
  const roles = title.includes(' & ')
    ? title.split(' & ').map((r) => r.trim())
    : [title];
```

New:
```typescript
  const roles = title?.includes(' & ')
    ? title.split(' & ').map((r) => r.trim())
    : [title ?? ''];
```

- [ ] **Step 4: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'Hero' | head -10
```

Expected: No errors mentioning `Hero.tsx`.

---

## Task 6: Update `Work.tsx`

**Files:**
- Modify: `src/components/Work.tsx`

Currently receives `projects: Project[]`. Change to receive `data?: PortfolioData['projects']` and filter internally.

- [ ] **Step 1: Update import and WorkProps interface**

Old:
```typescript
import { Project } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkProps {
  projects: Project[];
}
```

New:
```typescript
import { PortfolioData } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface WorkProps {
  data?: PortfolioData['projects'];
}
```

- [ ] **Step 2: Update function signature and add field extraction**

Old:
```typescript
export default function Work({ projects }: WorkProps): React.ReactElement {
```

New:
```typescript
export default function Work({ data }: WorkProps): React.ReactElement {
  const projects = (data?.projects ?? []).filter((p) => isFilled(p.name));
```

- [ ] **Step 3: Fix `ProjectCard` for optional fields**

**Image area** — replace `project.image ?` with `isFilled(project.image) ?` and fix `alt`:

Old:
```tsx
        {project.image ? (
          <img
            src={project.image}
            alt={project.name}
```

New:
```tsx
        {isFilled(project.image) ? (
          <img
            src={project.image}
            alt={project.name ?? ''}
```

**ImagePlaceholder** — `name.charAt(0)` crashes if name is undefined. Fix the call:

Old: `<ImagePlaceholder name={project.name} height="100%" />`  
New: `<ImagePlaceholder name={project.name ?? ''} height="100%" />`

**Description** — wrap the `<p>` with a guard:

Old:
```tsx
        <p style={{ fontFamily: 'var(--vault-font-body)', ... }}>
          {project.description}
        </p>
```

New:
```tsx
        {isFilled(project.description) && (
          <p style={{ fontFamily: 'var(--vault-font-body)', ... }}>
            {project.description}
          </p>
        )}
```

**Technologies** — `project.technologies.length` crashes if `technologies` is undefined:

Old: `{project.technologies.length > 0 && (`  
New: `{isFilled(project.technologies) && (`

Also filter inside the map: `.filter((tech) => isFilled(tech))` before `.map()`

**Links** — replace truthy checks with isFilled:

Old:
```tsx
        {(project.liveUrl || project.githubUrl) && (
          ...
          {project.liveUrl && <CardLink href={project.liveUrl} ... />}
          {project.githubUrl && <CardLink href={project.githubUrl} ... />}
```

New:
```tsx
        {(isFilled(project.liveUrl) || isFilled(project.githubUrl)) && (
          ...
          {isFilled(project.liveUrl) && <CardLink href={project.liveUrl!} ... />}
          {isFilled(project.githubUrl) && <CardLink href={project.githubUrl!} ... />}
```

**Keys** in the `rest.map` — `key={project.name}` is undefined if name is missing:

Old: `key={project.name}`  
New: `key={project.name ?? i}`

- [ ] **Step 4: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'Work' | head -10
```

Expected: No errors mentioning `Work.tsx`.

---

## Task 7: Update `About.tsx`

**Files:**
- Modify: `src/components/About.tsx`

Currently receives `bio: string`, `experience: WorkExperience[]`, `education: Education[]`. Change to receive `data?: PortfolioData['about']`.

- [ ] **Step 1: Update import and AboutProps interface**

Old:
```typescript
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { WorkExperience, Education } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutProps {
  bio: string;
  experience: WorkExperience[];
  education: Education[];
}
```

New:
```typescript
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { PortfolioData } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface AboutProps {
  data?: PortfolioData['about'];
}
```

- [ ] **Step 2: Update function signature and add field extraction**

Old:
```typescript
export default function About({ bio, experience, education }: AboutProps): React.ReactElement {
```

New:
```typescript
export default function About({ data }: AboutProps): React.ReactElement {
  const bio        = data?.bio;
  const experience = (data?.experience ?? []).filter((e) => isFilled(e.position));
  const education  = (data?.education  ?? []).filter((e) => isFilled(e.degree));
```

- [ ] **Step 3: Guard bio render and update stat block derivation**

Find the bio `<p>` (line ~262 in the existing file). Wrap it:

Old:
```tsx
            <p
              style={{ fontFamily: 'var(--vault-font-body)', fontWeight: 300, fontSize: '15px', color: 'var(--vault-text-secondary)', lineHeight: 1.75, marginBottom: '40px', marginTop: 0 }}
            >
              {bio}
            </p>
```

New:
```tsx
            {isFilled(bio) && (
              <p
                style={{ fontFamily: 'var(--vault-font-body)', fontWeight: 300, fontSize: '15px', color: 'var(--vault-text-secondary)', lineHeight: 1.75, marginBottom: '40px', marginTop: 0 }}
              >
                {bio}
              </p>
            )}
```

The `yearsActive`, `projectsBuilt`, `clientsServed` derivations use `experience.length` and `education.length` — these are fine since the arrays default to `[]` and `.length` on an empty array is `0`.

- [ ] **Step 4: Fix ExperienceItem sub-component for optional fields**

In `ExperienceItem`, the meta line renders `{item.company} · {item.duration}` — this will print `"undefined · undefined"` if either field is missing. Replace:

Old:
```tsx
      <p style={{ fontFamily: 'var(--vault-font-mono)', fontSize: '12px', color: 'var(--accent)', margin: '4px 0 8px' }}>
        {item.company} · {item.duration}
      </p>
```

New:
```tsx
      {(isFilled(item.company) || isFilled(item.duration)) && (
        <p style={{ fontFamily: 'var(--vault-font-mono)', fontSize: '12px', color: 'var(--accent)', margin: '4px 0 8px' }}>
          {[item.company, item.duration].filter(Boolean).join(' · ')}
        </p>
      )}
```

Also update the `key` in the experience map to avoid `"undefined-0"`:

Old: `key={`${item.company}-${i}`}`  
New: `key={item.position ?? i}`

- [ ] **Step 5: Fix EducationItem sub-component for optional fields**

In `EducationItem`, the meta line renders `{item.university} · {item.from}–{item.to}`. Replace:

Old:
```tsx
      <p style={{ fontFamily: 'var(--vault-font-mono)', fontSize: '12px', color: 'var(--accent)', margin: '4px 0 8px' }}>
        {item.university} · {item.from}–{item.to}
      </p>
```

New:
```tsx
      {(isFilled(item.university) || isFilled(item.from) || isFilled(item.to)) && (
        <p style={{ fontFamily: 'var(--vault-font-mono)', fontSize: '12px', color: 'var(--accent)', margin: '4px 0 8px' }}>
          {[item.university, (isFilled(item.from) && isFilled(item.to)) ? `${item.from}–${item.to}` : undefined].filter(Boolean).join(' · ')}
        </p>
      )}
```

Guard the GPA line:

Old:
```tsx
        GPA {item.GPA}
```
Wrap its parent `<p>` with `{isFilled(item.GPA) && (...)}`

Update the education map `key`:

Old: `key={`${item.university}-${i}`}`  
New: `key={item.degree ?? i}`

- [ ] **Step 5: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'About' | head -10
```

Expected: No errors mentioning `About.tsx`.

---

## Task 8: Update `Stack.tsx`

**Files:**
- Modify: `src/components/Stack.tsx`

Currently receives `skills: string[]`. VaultShell will pass the pre-filtered array — Stack just needs to accept an optional prop.

- [ ] **Step 1: Update StackProps interface**

Find and change:
```typescript
interface StackProps {
  skills: string[];
}
```

To:
```typescript
interface StackProps {
  skills?: string[];
}
```

- [ ] **Step 2: Default skills to empty array in function signature**

Find:
```typescript
export default function Stack({ skills }: StackProps)
```

Change to:
```typescript
export default function Stack({ skills = [] }: StackProps)
```

- [ ] **Step 3: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'Stack' | head -10
```

Expected: No errors mentioning `Stack.tsx`.

---

## Task 9: Update `Contact.tsx`

**Files:**
- Modify: `src/components/Contact.tsx`

Currently receives `contact: ContactInfo` and `socialLinks: SocialLink[]`. Change to optional data slices.

- [ ] **Step 1: Update import and ContactProps interface**

Old:
```typescript
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { ContactInfo, SocialLink } from '@/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactProps {
  contact: ContactInfo;
  socialLinks: SocialLink[];
}
```

New:
```typescript
import { motion, useReducedMotion, type HTMLMotionProps } from 'framer-motion';
import { PortfolioData, SocialLink } from '@/types';
import { isFilled } from '@/lib/is-filled';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ContactProps {
  data?: PortfolioData['contact'];
  socialLinks?: SocialLink[];
}
```

- [ ] **Step 2: Update function signature and add field extraction**

Old:
```typescript
export default function Contact({ contact, socialLinks }: ContactProps): React.ReactElement {
```

New:
```typescript
export default function Contact({ data, socialLinks = [] }: ContactProps): React.ReactElement {
  const email      = data?.email;
  const phone      = data?.phone;
  const location   = data?.location;
  const whatsapp   = data?.whatsapp;
  const validLinks = socialLinks.filter((l) => isFilled(l.url) && isFilled(l.platform));
```

- [ ] **Step 3: Update the main Contact JSX**

The current render is:
```tsx
{contact.email && <EmailLink email={contact.email} />}
<SocialLinksList links={socialLinks} />
```

Replace with:
```tsx
{isFilled(email) && <EmailLink email={email!} />}
<SocialLinksList links={validLinks} />
```

Also update `SocialLinksList` — it already filters on `link.url`, but update its filter to use `isFilled`:
```typescript
const visibleLinks = links.filter((link) => isFilled(link.url) && isFilled(link.platform));
```

And update the `key` in the map (since `platform` can be undefined now):
```tsx
{visibleLinks.map((link, i) => (
  <a
    key={link.platform ?? i}
    href={link.url ?? '#'}
    ...
  >
    {link.platform}
  </a>
))}
```

- [ ] **Step 4: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'Contact' | head -10
```

Expected: No errors mentioning `Contact.tsx`.

- [ ] **Step 5: Commit component updates**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && git add src/components/Hero.tsx src/components/Work.tsx src/components/About.tsx src/components/Stack.tsx src/components/Contact.tsx && git commit -m "refactor: update section components to optional props with isFilled guards"
```

---

## Task 10: Update `Nav.tsx` — dynamic sections

**Files:**
- Modify: `src/components/Nav.tsx`

Currently uses hardcoded `NAV_LINKS` and `SECTION_IDS` arrays. Add a `sections` prop and derive both from it.

- [ ] **Step 1: Update NavProps and add section label map**

Find and replace the `NavProps` interface and the two hardcoded constants:

Old:
```typescript
interface NavProps {
  name: string;
}

const NAV_LINKS: { label: string; href: string }[] = [
  { label: 'Work',    href: '#work'    },
  { label: 'About',   href: '#about'   },
  { label: 'Stack',   href: '#stack'   },
  { label: 'Contact', href: '#contact' },
];

const SECTION_IDS = ['hero', 'work', 'about', 'stack', 'contact'];
```

New:
```typescript
interface NavProps {
  name: string;
  sections: string[];
}

const SECTION_LABELS: Record<string, string> = {
  work:    'Work',
  about:   'About',
  stack:   'Stack',
  contact: 'Contact',
};
```

- [ ] **Step 2: Update function signature and derive nav links + section IDs**

Old:
```typescript
export default function Nav({ name }: NavProps): React.ReactElement {
```

New:
```typescript
export default function Nav({ name, sections }: NavProps): React.ReactElement {
  const navLinks   = sections.map((id) => ({ label: SECTION_LABELS[id] ?? id, href: `#${id}` }));
  const sectionIds = ['hero', ...sections];
```

- [ ] **Step 3: Update IntersectionObserver to use derived sectionIds**

Find:
```typescript
  for (const id of SECTION_IDS) {
```

Replace with:
```typescript
  for (const id of sectionIds) {
```

Note: `sectionIds` is derived inside the component function, so this loop correctly reflects the actual rendered sections. However, because `sectionIds` is derived on each render, the `useEffect` that references it needs it in its dependency array or the value needs to be stable. To keep it simple, memoize `sectionIds`:

After the `navLinks` / `sectionIds` derivation lines, change to:
```typescript
  const navLinks   = useMemo(
    () => sections.map((id) => ({ label: SECTION_LABELS[id] ?? id, href: `#${id}` })),
    [sections]
  );
  const sectionIds = useMemo(() => ['hero', ...sections], [sections]);
```

Add `useMemo` to the existing import:
```typescript
import { useEffect, useMemo, useRef, useState } from 'react';
```

- [ ] **Step 4: Update the IntersectionObserver useEffect dependency array**

Find the `useEffect` that sets up the IntersectionObserver (the second `useEffect`). Its dependency array is currently `[]`. Change it to `[sectionIds]`.

- [ ] **Step 5: Replace NAV_LINKS.map with navLinks.map in JSX**

Find:
```typescript
        {NAV_LINKS.map(({ label, href }) => {
```

Replace with:
```typescript
        {navLinks.map(({ label, href }) => {
```

- [ ] **Step 6: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'Nav' | head -10
```

Expected: No errors mentioning `Nav.tsx`.

---

## Task 11: Create `VaultShell.tsx`

**Files:**
- Create: `src/components/VaultShell.tsx`

- [ ] **Step 1: Create the file**

```typescript
'use client';

import { useMemo } from 'react';
import { PortfolioData } from '@/types';
import { isFilled } from '@/lib/is-filled';
import Nav from './Nav';
import Hero from './Hero';
import Work from './Work';
import About from './About';
import Stack from './Stack';
import Contact from './Contact';
import Footer from './Footer';
import SplashCursorLoader from './SplashCursorLoader';

interface VaultShellProps {
  data: PortfolioData;
}

export default function VaultShell({ data }: VaultShellProps): React.ReactElement {
  const hero = data.hero;
  const showHero = isFilled(hero?.name) || isFilled(hero?.title);

  const rawProjects  = data.projects?.projects ?? [];
  const validProjects = rawProjects.filter((p) => isFilled(p.name));
  const showWork     = validProjects.length > 0;

  const about       = data.about;
  const validSkills = (about?.skills ?? []).filter((s) => isFilled(s));
  const validExp    = (about?.experience ?? []).filter((e) => isFilled(e.position));
  const validEdu    = (about?.education  ?? []).filter((e) => isFilled(e.degree));
  const showAbout   = isFilled(about?.bio) || validSkills.length > 0 || validExp.length > 0 || validEdu.length > 0;

  const showStack   = validSkills.length > 0;

  const contact     = data.contact;
  const showContact =
    isFilled(contact?.email) ||
    isFilled(contact?.phone) ||
    isFilled(contact?.whatsapp) ||
    isFilled(contact?.location);

  const visibleSections = useMemo(
    () =>
      ([
        showWork    && 'work',
        showAbout   && 'about',
        showStack   && 'stack',
        showContact && 'contact',
      ] as (string | false)[]).filter((s): s is string => Boolean(s)),
    [showWork, showAbout, showStack, showContact]
  );

  const available = data.meta?.plan !== 'UNAVAILABLE';

  return (
    <>
      <Nav name={hero?.name ?? ''} sections={visibleSections} />
      <SplashCursorLoader />
      <main>
        {showHero    && <Hero    data={hero}          available={available} />}
        {showWork    && <Work    data={data.projects} />}
        {showAbout   && <About   data={about}         />}
        {showStack   && <Stack   skills={validSkills} />}
        {showContact && <Contact data={contact}       socialLinks={hero?.socialLinks} />}
      </main>
      <Footer />
    </>
  );
}
```

- [ ] **Step 2: Verify types**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1 | grep 'VaultShell' | head -10
```

Expected: No errors mentioning `VaultShell.tsx`.

---

## Task 12: Update `page.tsx`

**Files:**
- Modify: `src/app/page.tsx`

Replace the entire file. Current inline fetch + manual component wiring → use server-fetcher, metadata generator, and VaultShell.

- [ ] **Step 1: Replace the file**

```typescript
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
```

- [ ] **Step 2: Full type check**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npx tsc --noEmit 2>&1
```

Expected: Zero errors.

- [ ] **Step 3: Build check**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npm run build 2>&1 | tail -20
```

Expected: `✓ Compiled successfully` (or similar). Zero type errors, zero build errors.

- [ ] **Step 4: Smoke test in dev**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && npm run dev 2>&1 &
```

Open `http://localhost:3000` in a browser. Verify:
- Nav shows only Work / About / Stack / Contact (all present in fakeAPI.json)
- Hero section renders name + title
- Work section renders 4 projects (2 with images, 2 without — images absent for projects 3 & 4 should show placeholder gracefully)
- About section renders bio + experience + education
- Stack section renders skill tags
- Contact section renders email + phone + location + whatsapp
- SplashCursor fluid effect active

- [ ] **Step 5: Final commit**

```bash
cd '/Volumes/Extreme SSD/Projects/Templates/vault' && git add src/components/Nav.tsx src/components/VaultShell.tsx src/app/page.tsx && git commit -m "feat: add VaultShell orchestrator, dynamic nav, and updated page.tsx"
```

---

## Definition of Done

- [ ] `npx tsc --noEmit` → zero errors
- [ ] `npm run build` → zero errors
- [ ] Dev server renders all sections from fakeAPI.json
- [ ] Nav links match only sections with data
- [ ] Projects 3 & 4 (no image in fakeAPI.json) render without crashing
- [ ] All commits use conventional commit format
