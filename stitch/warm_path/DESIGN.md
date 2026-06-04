---
name: Warm Path
colors:
  surface: '#FFFFFF'
  surface-dim: '#d3daef'
  surface-bright: '#f9f9ff'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f1f3ff'
  surface-container: '#e9edff'
  surface-container-high: '#e1e8fd'
  surface-container-highest: '#dce2f7'
  on-surface: '#141b2b'
  on-surface-variant: '#4e4446'
  inverse-surface: '#293040'
  inverse-on-surface: '#edf0ff'
  outline: '#807475'
  outline-variant: '#d1c3c4'
  surface-tint: '#6c5a5c'
  primary: '#6c5a5c'
  on-primary: '#ffffff'
  primary-container: '#f2d9dc'
  on-primary-container: '#705e60'
  inverse-primary: '#d9c1c4'
  secondary: '#4e6450'
  on-secondary: '#ffffff'
  secondary-container: '#d0e9cf'
  on-secondary-container: '#546a55'
  tertiary: '#625d5e'
  on-tertiary: '#ffffff'
  tertiary-container: '#e5ddde'
  on-tertiary-container: '#666162'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#f6dcdf'
  primary-fixed-dim: '#d9c1c4'
  on-primary-fixed: '#25181a'
  on-primary-fixed-variant: '#534245'
  secondary-fixed: '#d0e9cf'
  secondary-fixed-dim: '#b5cdb4'
  on-secondary-fixed: '#0c2010'
  on-secondary-fixed-variant: '#374c39'
  tertiary-fixed: '#e8e1e2'
  tertiary-fixed-dim: '#ccc5c6'
  on-tertiary-fixed: '#1e1b1c'
  on-tertiary-fixed-variant: '#4a4647'
  background: '#f9f9ff'
  on-background: '#141b2b'
  surface-variant: '#dce2f7'
  success: '#16A34A'
  warning: '#D97706'
  danger: '#DC2626'
  subtle-gray: '#F3F4F6'
typography:
  display-lg:
    fontFamily: Noto Serif
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Noto Serif
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Noto Serif
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  headline-sm:
    fontFamily: Noto Serif
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 14px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  base: 8px
  xs: 4px
  sm: 12px
  md: 24px
  lg: 40px
  xl: 64px
  container-max: 1200px
  gutter: 16px
---

## Brand & Style

The brand personality is rooted in warmth, intimacy, and the joy of shared experiences. It serves as a digital companion for couples, evoking a sense of calm reliability and creative inspiration. The aesthetic is "Soft Minimalist," prioritizing clarity and ease of use to reduce the cognitive load of planning a date.

The design style utilizes a mix of **Modern Minimalism** and **Tactile Softness**. By employing ample white space and a pastel-driven palette, the interface feels airy and premium. Large border radii and soft tonal layering move away from clinical corporate design toward a more inviting, "lifestyle-first" editorial feel. Every interaction should feel gentle and intentional, reflecting the nature of a thoughtful date.

## Colors

The palette is anchored by "Soft Pink" (Primary) and "Soft Green" (Secondary). The Primary color is the signature interaction signal, used for major calls to action and brand moments. The Secondary color acts as a refreshing counterpoint, ideal for success states, category tags, or secondary path highlights.

The background strategy relies on pure white surfaces to maintain a clean, high-end feel. Text is set in a deep, near-black slate (#111827) to ensure maximum legibility against the pastel backgrounds. Tertiary colors are derived from low-opacity versions of the primary pink to create subtle container backgrounds without introducing new hues.

## Typography

This design system uses a sophisticated typographic pairing to balance editorial flair with functional clarity. **Noto Serif** is used for headlines to provide an authoritative yet romantic "storytelling" quality, perfect for describing date routes. 

For all functional UI elements and body text, **Plus Jakarta Sans** provides a friendly, contemporary, and highly legible experience. The scale focuses on high contrast between titles and metadata. Use the `display-lg-mobile` variant for all top-level headings on screens narrower than 768px.

## Layout & Spacing

The layout follows a **Fluid Grid** model with a "Safe Zone" philosophy. Content is organized into clear vertical blocks to create a rhythmic scrolling experience. 

- **Desktop:** 12-column grid with 24px gutters and 64px side margins.
- **Tablet:** 8-column grid with 16px gutters and 32px side margins.
- **Mobile:** 4-column grid with 16px gutters and 16px side margins.

Spacing should favor "Large" (40px+) between major sections to prevent the UI from feeling cluttered. Internal component padding should remain tight and consistent (12px or 24px) to maintain a "compact density" within cards and interactive elements.

## Elevation & Depth

Visual hierarchy is achieved through **Tonal Layers** and **Ambient Shadows**. Instead of traditional heavy shadows, the design system uses very soft, diffused blurs with a hint of the primary pink color in the shadow mix to maintain the warm aesthetic.

1.  **Level 0 (Base):** Pure white background (#FFFFFF).
2.  **Level 1 (Cards):** Subtle 1px border in a very light neutral or a soft background tint (#F9F1F2) with no shadow.
3.  **Level 2 (Active Elements):** Floating elements like buttons or active route cards use a wide, low-opacity shadow (Y: 4, Blur: 20, Opacity: 0.05, Color: #111827).
4.  **Glassmorphism:** Use backdrop blurs (20px) for fixed navigation bars and modals to maintain context of the content beneath.

## Shapes

The shape language is defined by **Rounded** geometry. There are no sharp corners in the design system. This reinforces the "friendly and approachable" brand pillars.

- **Standard Buttons & Inputs:** 0.5rem (8px) radius.
- **Cards & Content Blocks:** 1rem (16px) radius.
- **Imagery:** Always clipped to at least a 1rem radius.
- **Chips & Tags:** Use the "Pill" style (full radius) to distinguish them from actionable buttons.

## Components

### Buttons
- **Primary:** Background #F2D9DC, Text #111827, Bold Weight. No border.
- **Secondary:** Background #FFFFFF, Border 1.5px #F2D9DC, Text #111827.
- **Tertiary:** Text only with 0.5rem padding, underline on hover.

### Cards
Cards are the primary vehicle for "Routes." They feature a 1rem corner radius and use 24px internal padding. Images within cards should have a subtle 0.5px inner stroke to ensure they don't bleed into white backgrounds.

### Input Fields
Inputs use a "Subtle Inset" look. Use a light gray background (#F3F4F6) with a 1.5px border that turns Primary Pink (#F2D9DC) on focus. Labels sit outside the field in `label-md`.

### Chips & Badges
Used for categories like "Cafe," "Park," or "Quiet." Use Secondary Green (#D9F2D8) with dark text for positive attributes and Tertiary Pink for general tags.

### Navigation
The bottom navigation bar (on mobile) should use a frosted glass effect (backdrop-blur) with high-quality line icons. The active state is indicated by a Primary Pink dot or icon fill.