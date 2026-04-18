# Template Identity — Premium Tier
# Codename: Vault

> Brand identity spec for ZoneFolio's first premium template.
> This file is the single source of truth for design, animation, and component decisions.
> All agents read this file first.

---

## Concept

**Name:** Vault  
**Tagline:** "Where serious work lives."  
**Category:** Premium / Dark Editorial  
**Tier:** PRO ($8/mo)  
**Target users:** Developers, designers, photographers, motion artists, architects, copywriters — anyone whose work needs to be experienced, not just listed.

### The idea
Vault uses a near-black editorial base with **3 user-defined colors** injected at build time from environment variables. Change the colors and the entire template transforms — accent drives CTAs, labels, and the SplashCursor fluid. Secondary drives raised surfaces and section alternates. Highlight drives hover glows and focus states. The structure is fixed. The palette is theirs.

---

## Color System — The 3 Env Colors

The user sets exactly **3 colors** from the ZoneFolio dashboard. They are written to the deployed site's Vercel environment at redeploy time.

| Env var | CSS token | Role | Default |
|---------|-----------|------|---------|
| `NEXT_PUBLIC_COLOR_ACCENT` | `--accent` | CTAs · links · section labels · active nav · SplashCursor · Aurora | `#3A7BFF` |
| `NEXT_PUBLIC_COLOR_SECONDARY` | `--secondary` | Raised cards · hover surfaces · section bg alternates | `#161B27` |
| `NEXT_PUBLIC_COLOR_HIGHLIGHT` | `--highlight` | Card hover glow · selection · focus rings | `#3A7BFF` |

> **Hard rule:** If any env var is missing, empty, or an invalid hex — use the default. Never crash. Never throw. Log a warning in development only.

### Derived tokens (auto-generated — never set manually)

```css
--accent-glow:    color-mix(in srgb, var(--accent)    15%, transparent);
--accent-border:  color-mix(in srgb, var(--accent)    30%, transparent);
--highlight-glow: color-mix(in srgb, var(--highlight) 20%, transparent);
--secondary-soft: color-mix(in srgb, var(--secondary) 60%, var(--vault-bg));
```

### Where each token is used

```
--accent           → CTA buttons (bg) · section labels (text + border-left)
                     nav active underline · skill tags (color)
                     SplashCursor fluid colors · Aurora colorStops[0]
                     Particles particleColors · focus rings

--accent-glow      → Card hover background · Aurora colorStops[2]
--accent-border    → Card hover border · ghost CTA border

--secondary        → Raised card surface · section alternate bg
--secondary-soft   → Subtle dividers · skills section bg

--highlight        → Card hover box-shadow color
--highlight-glow   → Focus rings · input focus border · selection
```

### Default accent presets (shown in dashboard picker)

| Preset | Accent | Secondary | Highlight | For |
|--------|--------|-----------|-----------|-----|
| Electric | `#3A7BFF` | `#161B27` | `#3A7BFF` | Devs · engineers |
| Coral | `#FF5C47` | `#1F1210` | `#FF5C47` | Designers · brand |
| Amber | `#F59E0B` | `#1A1508` | `#F59E0B` | Photographers · film |
| Mint | `#10B981` | `#0C1F18` | `#10B981` | Architects · product |
| Violet | `#8B5CF6` | `#13101F` | `#8B5CF6` | Motion · illustration |
| Rose | `#F43F5E` | `#1F0E12` | `#F43F5E` | Fashion · lifestyle |

### Base palette (fixed — never user-customizable)

| Token | Hex | Usage |
|-------|-----|-------|
| `--vault-bg` | `#080A0F` | Page background |
| `--vault-surface` | `#0F1117` | Card surfaces, nav, modals |
| `--vault-border` | `rgba(255,255,255,0.07)` | Default borders |
| `--vault-border-mid` | `rgba(255,255,255,0.13)` | Emphasis borders |
| `--vault-text-primary` | `#F0F2F8` | Headings, display text |
| `--vault-text-secondary` | `#6B7280` | Body, captions, meta |
| `--vault-text-muted` | `#374151` | Disabled, placeholder |
| `--vault-success` | `#22C55E` | Live / success states |
| `--vault-error` | `#EF4444` | Error states |

---

## ENV Injection — Full Implementation

### `lib/theme.ts` — color resolver with validation

```typescript
const DEFAULTS = {
  accent:    '#3A7BFF',
  secondary: '#161B27',
  highlight: '#3A7BFF',
} as const;

export function isValidHex(value: string): boolean {
  return /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/.test(value);
}

export function safeColor(
  value: string | undefined,
  key: keyof typeof DEFAULTS
): string {
  const fallback = DEFAULTS[key];
  if (!value || !isValidHex(value)) {
    if (process.env.NODE_ENV === 'development' && value) {
      console.warn(`[Vault] Invalid color for ${key}: "${value}" — using default ${fallback}`);
    }
    return fallback;
  }
  return value;
}

export function getThemeColors() {
  return {
    accent:    safeColor(process.env.NEXT_PUBLIC_COLOR_ACCENT,    'accent'),
    secondary: safeColor(process.env.NEXT_PUBLIC_COLOR_SECONDARY, 'secondary'),
    highlight: safeColor(process.env.NEXT_PUBLIC_COLOR_HIGHLIGHT, 'highlight'),
  };
}
```

### `app/layout.tsx` — inject into `<html>`

```tsx
import { getThemeColors } from '@/lib/theme';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const { accent, secondary, highlight } = getThemeColors();

  return (
    <html
      lang="en"
      style={{
        '--accent':    accent,
        '--secondary': secondary,
        '--highlight': highlight,
      } as React.CSSProperties}
    >
      <body>{children}</body>
    </html>
  );
}
```

### `styles/globals.css` — full token sheet

```css
:root {
  /* ── USER COLORS (from env via layout.tsx style prop) ── */
  /* CSS defaults below are last-resort fallbacks only.    */
  /* The real values come from the <html> style attribute. */
  --accent:    #3A7BFF;
  --secondary: #161B27;
  --highlight: #3A7BFF;

  /* ── DERIVED (computed from user colors) ─────────────── */
  --accent-glow:    color-mix(in srgb, var(--accent)    15%, transparent);
  --accent-border:  color-mix(in srgb, var(--accent)    30%, transparent);
  --highlight-glow: color-mix(in srgb, var(--highlight) 20%, transparent);
  --secondary-soft: color-mix(in srgb, var(--secondary) 60%, var(--vault-bg));

  /* ── BASE (fixed — never change) ─────────────────────── */
  --vault-bg:             #080A0F;
  --vault-surface:        #0F1117;
  --vault-border:         rgba(255,255,255,0.07);
  --vault-border-mid:     rgba(255,255,255,0.13);
  --vault-text-primary:   #F0F2F8;
  --vault-text-secondary: #6B7280;
  --vault-text-muted:     #374151;
  --vault-success:        #22C55E;
  --vault-error:          #EF4444;
  --vault-font-display:   'Clash Display', sans-serif;
  --vault-font-body:      'Satoshi', sans-serif;
  --vault-font-mono:      'JetBrains Mono', monospace;

  /* ── SPACING ──────────────────────────────────────────── */
  --space-xs:  4px;
  --space-sm:  8px;
  --space-md:  16px;
  --space-lg:  24px;
  --space-xl:  40px;
  --space-2xl: 64px;
  --space-3xl: 96px;
}

/* Fallback for browsers without color-mix() support */
@supports not (color: color-mix(in srgb, red, blue)) {
  :root {
    --accent-glow:    rgba(58, 123, 255, 0.15);
    --accent-border:  rgba(58, 123, 255, 0.30);
    --highlight-glow: rgba(58, 123, 255, 0.20);
    --secondary-soft: #0F1117;
  }
}
```

### `.env.local` template (given to user)

```bash
# Vault Template — Color Configuration
# Set these 3 values to customize your portfolio colors.
# Must be valid 6-character hex codes (e.g. #3A7BFF).
# Redeploy after changing.

NEXT_PUBLIC_COLOR_ACCENT=#3A7BFF
NEXT_PUBLIC_COLOR_SECONDARY=#161B27
NEXT_PUBLIC_COLOR_HIGHLIGHT=#3A7BFF
```

---

## Typography

| Role | Font | Weight | Size | Tracking |
|------|------|--------|------|----------|
| Display | Clash Display | 700 | 64–80px | −3px |
| Section heading | Clash Display | 600 | 32–40px | −1.5px |
| Subheading | Satoshi | 500 | 18–20px | −0.3px |
| Body | Satoshi | 300 | 15px | 0 |
| Section label | JetBrains Mono | 500 | 10px | 2px uppercase |
| Caption / tag | JetBrains Mono | 400 | 12–13px | 0.3px |

**Rules:**
- Sentence case always — no all-caps headings
- Display text: `--vault-text-primary`
- Section labels: `var(--accent)` + `border-left: 1px solid var(--accent)`
- Body: `--vault-text-secondary`
- Never hardcode a hex value in a component — CSS variables only

---

## Animation Stack

### Required

| Component | ReactBits URL | Key config | Location |
|-----------|--------------|------------|----------|
| SplashCursor | `/animations/splash-cursor` | SPLAT_RADIUS: 0.18 · colors from `--accent` | Global |
| Aurora | `/backgrounds/aurora` | colorStops from `--accent` · amplitude: 0.8 · speed: 0.4 | Hero bg |
| BlurText | `/text-animations/blur-text` | duration: 800ms · once on mount | Hero name |
| RotatingText | `/text-animations/rotating-text` | cycles `user.roles[]` | Hero subtitle |
| FadeContent | `/animations/fade-content` | blur: true · 900ms · scroll-triggered once | All sections |

### Recommended

| Component | Config | Location |
|-----------|--------|----------|
| Particles | particleCount: 60 · `--accent` colors · hover: true | Stack section bg |
| Silk | accent at 10% opacity | About section bg |

### Rules
- All animations fire once — never repeat on scroll re-entry
- `prefers-reduced-motion`: all animations off, instant transitions
- Mobile: Aurora amplitude halved · Particles count halved

---

## Layout Structure

### Navigation
- Transparent → `rgba(8,10,15,0.85)` + `backdrop-filter: blur(12px)` on scroll
- Left: `user.displayName` (dynamic)
- Right: nav links — no badge on PRO tier
- Active: 1px underline in `var(--accent)`

### Sections

| Section | Layout |
|---------|--------|
| Hero | Full-bleed · Aurora bg · display name + BlurText · RotatingText role |
| Work | Asymmetric: 1 large (60%) + 2 stacked (40%) · `--highlight-glow` on hover |
| About | Two-column: bio left · stats right · no "See more" |
| Stack | Horizontal scroll tags on Particles bg · JetBrains Mono · `--accent` text |
| Contact | Single column · email as display-size link · social icons only |

### Card system
- Default border: `1px solid var(--vault-border)`
- Default surface: `var(--vault-surface)`
- Hover surface: `var(--secondary)`
- Hover border: `var(--accent-border)`
- Hover glow: `box-shadow: 0 0 24px var(--highlight-glow)`
- Radius: 16px cards · 4px inner elements

---

## UI Components

### Section labels
```css
.section-label {
  font-family: var(--vault-font-mono);
  font-size: 10px;
  font-weight: 500;
  letter-spacing: 2px;
  text-transform: uppercase;
  color: var(--accent);
  padding-left: 10px;
  border-left: 1px solid var(--accent);
  border-radius: 0; /* never round a single-sided border */
}
```

### CTA buttons
- Primary: `background: var(--accent)` · white text · 6px radius
- Ghost: `border: 1px solid var(--accent-border)` · `color: var(--accent)`
- Hover: `letter-spacing` opens 0.5px · CSS transition · no bg change

### Project cards
- Top 60%: project image · scale 1.0 → 1.02 on hover
- Bottom: Clash Display 500 title · Satoshi body · JetBrains Mono stack tags
- Tags: `color: var(--accent)` · no bg · no border
- Hover: border → `var(--accent-border)` + `box-shadow: 0 0 24px var(--highlight-glow)`

---

## Differentiators vs Na8am

| Dimension | Na8am — Free | Vault — PRO |
|-----------|-------------|-------------|
| Colors | 1 fixed accent | 3 env-injected user colors |
| Theme | White light | Near-black dark editorial |
| Fonts | Syne + DM Sans | Clash Display + Satoshi + JetBrains Mono |
| Cursor | Default browser | WebGL SplashCursor (accent-colored fluid) |
| Background | None | Aurora · Particles · Silk |
| Animations | Minimal entrance | BlurText · RotatingText · FadeContent · Aurora |
| Layout | Split + pill badges | Asymmetric grid + border-left labels |
| Contact | Icon cards grid | Display-size email link only |
| ZF badge | Visible | Removed — key PRO perk |

---

## Voice & Copy

**Template description (gallery):**
Dark, editorial, and built to make your work impossible to ignore. Three colors. Your colors. Everything adapts.

**Short version (card):**
Your colors. Your work. A dark editorial portfolio that transforms with your palette.

**Rules:** Sentence case always · No buzzwords · JetBrains Mono for all technical meta

---

## Pre-launch Checklist

### Color injection
- [ ] `NEXT_PUBLIC_COLOR_ACCENT` falls back to `#3A7BFF` when missing
- [ ] `NEXT_PUBLIC_COLOR_SECONDARY` falls back to `#161B27` when missing
- [ ] `NEXT_PUBLIC_COLOR_HIGHLIGHT` falls back to `#3A7BFF` when missing
- [ ] `isValidHex()` runs before any env var is used
- [ ] Invalid hex: warn in dev, silent fallback in prod
- [ ] `color-mix()` `@supports` fallback block in globals.css
- [ ] All 3 vars injected via `style` prop on `<html>` in layout.tsx
- [ ] Zero hex values hardcoded in any component file
- [ ] SplashCursor fluid color reads `--accent`
- [ ] Aurora `colorStops[0]` reads `--accent`
- [ ] Particles `particleColors` reads `--accent`
- [ ] Card hover glow reads `--highlight-glow`
- [ ] Raised surfaces read `--secondary`

### Animation
- [ ] `prefers-reduced-motion` disables all animations
- [ ] FadeContent fires once — not on scroll re-entry
- [ ] BlurText fires once on mount
- [ ] Mobile: Aurora amplitude halved
- [ ] Mobile: Particles count halved
- [ ] SplashCursor touch tested on mobile

### General
- [ ] ZF badge absent on PRO plan (`plan === 'PRO'`)
- [ ] Nav name binds to `user.displayName`
- [ ] RotatingText reads `user.roles[]`
- [ ] Clash Display: weights 600 + 700 only
- [ ] JetBrains Mono: subset loaded only
- [ ] No `console.log` in production

---

## Agents

| Agent | When to use |
|-------|-------------|
| `frontend-developer` | React components, layout, animation wiring, env injection |
| `backend-developer` | Color preference storage, env var write on Vercel deploy |
| `ui-designer` | Layout, hover states, mobile adaptation |
| `brand-designer` | Color system audits, CSS variable consistency checks |
| `content-writer` | Section copy, placeholder text, error states |
| `code-reviewer` | Env validation logic, color-mix fallbacks, performance |
| `reality-checker` | GO / NEEDS WORK gate before shipping |