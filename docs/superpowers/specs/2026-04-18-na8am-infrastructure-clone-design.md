# Design Spec: Clone Na8am Data Infrastructure into Vault

**Date:** 2026-04-18  
**Project:** Vault (Premium Tier)  
**Scope:** Port na8am's data-driven infrastructure into Vault — optional types, isFilled validation, server fetcher, metadata generation, VaultShell section orchestrator, dynamic navigation.

---

## Goal

Vault currently has strict required types, inline data fetching with no caching, static metadata, hardcoded navigation links, and no field-level validation. Na8am has a proven infrastructure for all of these. This spec defines cloning that infrastructure into Vault, adapted for Vault's design system and section structure.

---

## 1. Types (`src/types/index.ts`)

All fields on all interfaces become optional (`?`). This enables graceful degradation when the ZoneFolio API returns incomplete data.

**Types to update:**
- `SocialLink` — `platform?`, `url?`
- `WorkExperience` — `position?`, `company?`, `duration?`, `description?`
- `Education` — `degree?`, `university?`, `from?`, `to?`, `GPA?`
- `Project` — `name?`, `description?`, `image?`, `technologies?`, `liveUrl?`, `githubUrl?`
- `ContactInfo` — `email?`, `phone?`, `location?`, `whatsapp?`
- `Meta` — `plan?`, `showBranding?`
- `PortfolioData` — all top-level sections optional: `hero?`, `about?`, `work?`, `stack?`, `contact?`, `meta?`

Vault-specific notes:
- `hero.name` already feeds Nav — no separate `displayName` field needed
- `hero.title` is a plain string in current implementation — no `roles[]` added (Hero animation is out of scope)

---

## 2. Validation Utility (`src/lib/is-filled.ts`)

Direct copy from na8am's `src/libs/is-filled.ts`. Returns `false` for: `undefined`, `null`, `""`, `" "` (any whitespace-only string), `[]`, `0`.

```ts
export function isFilled(value: unknown): boolean
```

Used everywhere a field is conditionally rendered. No inline `value !== ""` or `value?.length > 0` checks in components — always `isFilled()`.

---

## 3. Server Fetcher (`src/lib/server-fetcher.ts`)

Adapted from na8am's `src/libs/server-fetcher.ts`. Server-only. Replaces the inline `getPortfolioData()` currently in `page.tsx`.

**Shape:**
```ts
export const fetchPortfolioData: () => Promise<
  { ok: true; data: PortfolioData } | { ok: false; status: number }
>
```

**Behaviour:**
- Wrapped with React `cache()` for deduplication within a single render pass
- If `NEXT_PUBLIC_API_URL` starts with `/` → read from filesystem (dev mode)
- Otherwise → `fetch(url, { cache: 'no-store' })` (prod, always fresh)
- 404 → `{ ok: false, status: 404 }` (portfolio unpublished)
- Network error → `{ ok: false, status: 500 }`
- Never throws — all errors produce `ok: false`

---

## 4. Metadata Generator (`src/lib/metadata.ts`)

Adapted from na8am's `src/libs/metadata.ts`. Replaces static `metadata` export in `page.tsx`.

- Extracts `data.hero?.name` for page title
- Extracts `data.about?.bio` for description, auto-truncated to 160 chars
- Sets OpenGraph and Twitter card fields
- Falls back gracefully if fields are missing

```ts
export function generatePortfolioMetadata(data: PortfolioData): Metadata
```

---

## 5. VaultShell (`src/components/VaultShell.tsx`)

New client component. Mirrors na8am's `TemplateShell.tsx`. Owns all section-visibility logic — no component decides its own visibility.

**Props:** `data: PortfolioData`

**Section visibility logic:**
```ts
const hero    = data.hero
const showHero    = isFilled(hero?.name) || isFilled(hero?.title)

const projects = data.projects?.projects ?? []
const validProjects = projects.filter(p => isFilled(p.name))
const showWork    = validProjects.length > 0

const about = data.about
const validSkills = (about?.skills ?? []).filter(s => isFilled(s))
const validExp    = (about?.experience ?? []).filter(e => isFilled(e.position))
const validEdu    = (about?.education ?? []).filter(e => isFilled(e.degree))
const showAbout   = isFilled(about?.bio) || validSkills.length > 0 || validExp.length > 0 || validEdu.length > 0

const showStack   = validSkills.length > 0

const contact = data.contact
const showContact = isFilled(contact?.email) || isFilled(contact?.phone) || isFilled(contact?.whatsapp) || isFilled(contact?.location)
```

**Renders:**
1. `Nav` — receives computed `sections` array
2. `SplashCursor` — always rendered (Vault-specific, not gated by data)
3. Each section conditionally: `{showHero && <Hero data={hero} />}` etc.

---

## 6. Dynamic Navigation (`src/components/Nav.tsx`)

**Current:** Hardcoded 4 links (`work`, `about`, `stack`, `contact`).

**After:** Receives `sections: string[]` prop from `VaultShell`. Renders only links for sections that have data. Active underline logic unchanged. `displayName` for the left logo still comes from `data.hero?.displayName`.

```ts
interface NavProps {
  name: string        // unchanged — from hero.name
  sections: string[]  // new — only sections with data
}
```

---

## 7. Section Component Updates

All section components updated to accept optional data and guard fields with `isFilled()`.

| Component | Key changes |
|-----------|-------------|
| `Hero.tsx` | Guard `name`, `title`, `image`, `roles[]`, `socialLinks` with `isFilled()`. Filter `socialLinks` before mapping. |
| `Work.tsx` | Accept `projects?: Project[]`. Filter to `validProjects`. Guard `name`, `description`, `image`, `liveUrl`, `githubUrl` per card. |
| `About.tsx` | Guard `bio`, `image`. Filter `experience`, `education`, `skills` arrays. Guard each item's fields. |
| `Stack.tsx` | Accept `skills?: string[]`. Filter with `isFilled()` before rendering tags. |
| `Contact.tsx` | Guard `email`, `phone`, `whatsapp`, `location` individually. Only render present fields. |

Components do **not** decide section visibility — that lives in `VaultShell`. Components only guard individual field rendering.

---

## 8. `page.tsx` Updates

Simplified to three responsibilities:
1. Call `fetchPortfolioData()` 
2. Export `generateMetadata()` using `generatePortfolioMetadata()`
3. Pass `data` to `VaultShell` (or render `ErrorState` on `ok: false`)

```tsx
export async function generateMetadata(): Promise<Metadata> {
  const result = await fetchPortfolioData()
  if (!result.ok) return {}
  return generatePortfolioMetadata(result.data)
}

export default async function Page() {
  const result = await fetchPortfolioData()
  if (!result.ok) return <ErrorState status={result.status} />
  return <VaultShell data={result.data} />
}
```

---

## 9. `fakeAPI.json`

No changes needed. The existing data already covers all fields. `meta.plan` stays `"FREE"` for local dev.

---

## Data Flow

```
page.tsx (server)
  ├── fetchPortfolioData() [React cache() deduped]
  ├── generateMetadata() [same cached call]
  └── <VaultShell data={...} /> (client)
        ├── Section visibility computed with isFilled()
        ├── <Nav sections={visibleSections} displayName={...} />
        ├── <SplashCursor /> (always)
        ├── {showHero    && <Hero    data={hero}    />}
        ├── {showWork    && <Work    data={work}    />}
        ├── {showAbout   && <About   data={about}   />}
        ├── {showStack   && <Stack   data={stack}   />}
        └── {showContact && <Contact data={contact} />}
```

---

## Files Changed / Created

| File | Action |
|------|--------|
| `src/types/index.ts` | Update — all fields optional |
| `src/lib/is-filled.ts` | Create — copy from na8am |
| `src/lib/server-fetcher.ts` | Create — adapted from na8am |
| `src/lib/metadata.ts` | Create — adapted from na8am |
| `src/components/VaultShell.tsx` | Create — new shell component |
| `src/components/Nav.tsx` | Update — dynamic sections prop |
| `src/components/Hero.tsx` | Update — isFilled guards |
| `src/components/Work.tsx` | Update — isFilled guards |
| `src/components/About.tsx` | Update — isFilled guards |
| `src/components/Stack.tsx` | Update — isFilled guards |
| `src/components/Contact.tsx` | Update — isFilled guards |
| `src/app/page.tsx` | Update — use fetcher + metadata + VaultShell |
| `public/fakeAPI.json` | No change needed |

---

## Out of Scope

- TruncatedText component (no long-form text in Vault's design)
- QueryProvider / TanStack Query (Vault is server-rendered)
- ScrollToTop (Vault uses section-based nav)
- Any visual design changes — zero UI changes, infrastructure only
