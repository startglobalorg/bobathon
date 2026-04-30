# Apartner — Corporate Identity (CI)

*Mobile-first web app. Zürich. Last updated: April 2026.*

## 1. Brand essence

Apartner is the warm, optimistic counterweight to Zürich's brutal rental market. We treat finding a home the way a good friend would help you find one — not the way a property portal would. Every interaction should feel calm, human, and lightly hopeful. Swiss precision in the structure; warmth in the details. Confident, never pushy. Inclusive without performing it.

**Tagline:** *Find your place — one swipe at a time.*

## 2. Color palette

| Token | Hex | Usage |

|---|---|---|

| `white` | `#FFFFFF` | Dominant surface. App background, cards. |

| `accent` | `#0077C8` | Primary CTAs, links, active nav, swipe-right. The hero. |

| `accent-hover` | `#005FA3` | Pressed/hover; small text on white. |

| `accent-soft` | `#E5F1FA` | Tinted backgrounds, selected chips. |

| `warm` | `#FF8A6B` | Affirmative micro-moments: like animation, success toast, celebratory states. Use sparingly. |

| `warm-soft` | `#FFE3D8` | Warm tinted backgrounds. |

| `ink-900` | `#0F1419` | Primary text. |

| `ink-600` | `#4A5560` | Secondary text. |

| `ink-400` | `#8A95A1` | Tertiary / placeholder. |

| `border` | `#E6E8EB` | Card borders, dividers. |

| `surface-soft` | `#F7F8FA` | Subtle section backgrounds. |

| `success` | `#1F9D55` | Confirmations. |

| `error` | `#D64545` | Errors only. |



### Tailwind snippet



```ts

// tailwind.config.ts

import type { Config } from 'tailwindcss'



export default {

  theme: {

    extend: {

      colors: {

        accent: {

          DEFAULT: '#0077C8',

          hover: '#005FA3',

          soft: '#E5F1FA',

        },

        warm: { DEFAULT: '#FF8A6B', soft: '#FFE3D8' },

        ink: { 900: '#0F1419', 600: '#4A5560', 400: '#8A95A1' },

        border: '#E6E8EB',

        surface: { soft: '#F7F8FA' },

        success: '#1F9D55',

        error: '#D64545',

      },

      fontFamily: {

        sans: ['Inter', 'ui-sans-serif', 'system-ui', 'sans-serif'],

        display: ['Fraunces', 'ui-serif', 'Georgia', 'serif'],

      },

      borderRadius: { '4xl': '2rem' },

    },

  },

} satisfies Config

```



## 3. Typography



**Inter** (Google Fonts) — single versatile sans for body, UI, and most headings. Modern, neutral, excellent legibility at small sizes, the typeface the audience already reads in Linear, Notion, Vercel. Weights: `400`, `500`, `600`, `700`.



**Optional pairing — Fraunces** (variable, Google Fonts) for hero/onboarding headlines only. Adds quiet warmth without being decorative. Never use Fraunces inside the app UI.



### Type scale (mobile-first)



| Style | Size | Tailwind | Weight | Tracking |

|---|---|---|---|---|

| h1 | 32px | `text-3xl` | 700 | -0.02em |

| h2 | 24px | `text-2xl` | 600 | -0.01em |

| h3 | 20px | `text-xl`  | 600 | normal |

| body | 16px | `text-base` | 400 | normal |

| button | 16px | `text-base` | 500 | normal |

| small | 14px | `text-sm` | 400 | normal |

| caption | 12px | `text-xs` | 500 | normal |



Line height: `1.5` body, `1.2` headings.



## 4. Spacing & layout



Base unit **4px** (Tailwind default). Multiples of 4 only. Mobile edge padding `px-5` (20px); tablet+ `px-8`. Section rhythm `py-10` mobile, `py-16` desktop. Swipe stack stays mobile-shaped on every breakpoint: `max-w-md mx-auto`. Marketing/profile pages `max-w-5xl`. Respect `env(safe-area-inset-*)` for iOS PWA. **When in doubt, add more space.** Whitespace is the brand.



## 5. Component style



**Buttons.** Primary: `bg-accent text-white rounded-full h-12 px-6 font-medium`. Press: `active:scale-[0.98] active:bg-accent-hover`. Secondary: `bg-white border border-border text-ink-900`. Tertiary: text-only, `text-accent`.



**Cards.** `rounded-2xl` (16px). Either `border border-border` *or* a soft shadow `shadow-[0_2px_12px_rgba(15,20,25,0.06)]` — never both on the same surface. No heavy drop shadows, ever.



**Inputs.** `h-12 rounded-xl border border-border bg-white`. Focus: `border-accent ring-2 ring-accent/20`. Labels sit above the field, not floating.



**Swipe cards.** `rounded-3xl` (24px), full-bleed photo on top, content `p-5`. Drag tilt ±8°. Right-swipe overlay: `bg-warm/90` with white check. Left-swipe overlay: `bg-ink-900/70` with subtle X. Always provide visible Like/Pass buttons as keyboard/tap fallbacks.



**Motion.** 150–250ms ease-out. Spring physics on swipes only. No bouncy UI transitions.



## 6. Iconography & imagery



**Icons:** [Lucide](https://lucide.dev) — 1.5px stroke, 20px in dense UI, 24px in nav. Matches the Linear/modern-app aesthetic the audience expects.



**Listing photography:** natural light, lived-in Zürich interiors. Texture, plants, parquet, an unmade morning. Wide-angle, never fisheye. Show the place as somewhere a person already lives.



**Avoid:** stock couples with keys, skyline silhouettes, isometric house illustrations, 3D-rendered "modern living" rooms, AI-generated interiors, generic real-estate iconography.



## 7. Voice & tone



Warm, direct, lightly witty. Like a friend texting, not a property manager emailing.



- **Empty state (no matches yet):** *"Quiet here for now. New flats land daily — we'll ping you the moment something fits."*

- **Right-swipe toast:** *"Liked. We'll let them know you're interested."*

- **Error:** *"That didn't load. Pull to try again — not your fault."*

- **Profile incomplete:** *"Almost there. A few more details and your applications stand out."*

- **Inclusive defaults:** "you," "your household," "people you live with." Never assume gender, partner, or family structure.



## 8. Accessibility baseline



- Target: **WCAG AA** — 4.5:1 contrast for body text, 3:1 for large text and UI components.

- `#0077C8` on white ≈ **4.7:1** — passes AA for all text sizes (narrowly). ⚠️ **Flag:** for text below 14px, or accent text on `surface-soft`/`accent-soft`, switch to `accent-hover` `#005FA3` (≈ 7:1, AAA). Don't run small accent text on tinted backgrounds.

- `ink-600` on white ≈ 8.5:1, `ink-400` on white ≈ 3.4:1 — `ink-400` is for placeholder/disabled only, never body copy.

- Minimum font size **14px**. Tap targets **≥ 44×44px** (`min-h-11`).

- Focus state: `focus-visible:ring-2 ring-accent ring-offset-2`. Never remove outlines.

- All swipe gestures need keyboard + button equivalents.

- Respect `prefers-reduced-motion`: disable tilt and spring animations, fall back to fades.

## 9. Don'ts

- No dark mode as default. White is the brand.

- No neon, no purple gradients, no glassmorphism, no AI-slop hero illustrations.

- No real-estate clichés: keys, house outlines, skylines, "dream home," "perfect for you and your loved one."

- No tech-bro tone: no "rockstar flat," no "crush your apartment search," no exclamation pile-ups.

- No assumed pronouns, partners, or family shapes.

- No heavy shadows, chunky borders, or inconsistent radii — stick to the values above.

- No emoji-heavy microcopy. One, rarely, max.