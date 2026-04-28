---
name: Routine Builder App
colors:
  primary: "#b39ddb"
  primary-dark: "#937dc2"
  quality-high: "#86efac"
  quality-mid: "#fcd34d"
  quality-low: "#fca5a5"
  background: "#f7f6f8"
  surface: "#ffffff"
  surface-highlight: "#f1f5f9"
  surface-input: "#ffffff"
  text-main: "#0f172a"
  text-secondary: "#475569"
  text-muted: "#94a3b8"
  text-inverse: "#ffffff"
  border: "#e2e8f0"
  border-hover: "#cbd5e1"
  dark-background: "#18141e"
  dark-surface: "#231f2a"
  dark-surface-highlight: "#2c2c2c"
  dark-surface-input: "#2e2936"
  dark-text-main: "#f8fafc"
  dark-text-secondary: "#cbd5e1"
  dark-text-muted: "#64748b"
  dark-text-inverse: "#0f172a"
  dark-border: "#2d2836"
  dark-border-hover: "#403848"
typography:
  display:
    fontFamily: "Lexend, sans-serif"
  sans:
    fontFamily: "Lexend, sans-serif"
  xs:
    fontSize: "12px"
    lineHeight: "16px"
  sm:
    fontSize: "14px"
    lineHeight: "20px"
  base:
    fontSize: "16px"
    lineHeight: "24px"
  lg:
    fontSize: "18px"
    lineHeight: "28px"
  xl:
    fontSize: "20px"
    lineHeight: "28px"
  2xl:
    fontSize: "24px"
    lineHeight: "32px"
  3xl:
    fontSize: "30px"
    lineHeight: "36px"
  4xl:
    fontSize: "36px"
    lineHeight: "40px"
rounded:
  sm: "0.125rem"
  DEFAULT: "0.25rem"
  md: "0.375rem"
  lg: "0.5rem"
  xl: "0.75rem"
  2xl: "1rem"
  full: "9999px"
shadows:
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)"
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)"
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)"
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)"
motion:
  fade-in: "150ms ease-in"
  soft-appear: "0.7s cubic-bezier(0.4, 0, 0.2, 1)"
spacing:
  unit: "4px"
  2: "8px"
  3: "12px"
  4: "16px"
  6: "24px"
---

## Brand & Style

This application is designed specifically for a mobile-first user experience. The aesthetic leans heavily into a clean, modern, and "softer" visual style, purposefully avoiding stark absolute blacks and whites in favor of deeply tinted or muted grays. It values clarity, immediate comprehension, and a calm, approachable interface.

The application uses organic rounded shapes (`2xl`, `xl`, and `full` radius) paired with very light drop shadows, communicating a tangible layering effect typical of high-quality mobile applications.

## Colors

The application relies on dual-mode color schemes with specifically tinted variables for dark and light modes. The intent is to offer accessible but pleasant contrast, reducing eye strain and keeping the user visually relaxed.

- **Background and Surfaces:** Light mode avoids pure white for the general background, instead opting for a slightly cool `#f7f6f8`. Dark mode strictly adheres to a purple-tinted background (`#18141E`), which integrates the brand color (`primary`) into the shadows themselves.
- **Text & Contrast:** Soft but highly contrasting shades. Dark mode text avoids pure `#FFFFFF`, settling instead on `#F8FAFC` for high emphasis and muted slates (`#64748b`) for secondary details.
- **Brand & Actions:** A muted purple (`#b39ddb`) functions as the primary interaction color, promoting a serene yet focused workout environment.
- **Status (Quality):** A traffic-light system of high (`#86efac`), mid (`#fcd34d`), and low (`#fca5a5`) quality indicators that use softer pastel tones rather than aggressive neon colors.

## Typography

**Lexend** is the exclusive font family across the application. Lexend was chosen for its exceptional legibility and high x-height, which dramatically improves readability on smaller mobile displays.

- **Hierarchy:** Headers scale up to `4xl` for dramatic active-workout moments, while list items and regular inputs rely primarily on `base` and `sm`. Over-titles or small labels leverage uppercase treatments combined with `tracking-wider` to clearly denote metadata without cluttering the hierarchy.
- **Weight:** Uses `normal`, `medium`, `semibold`, and `bold`. Interactive elements and headers skew toward `semibold` and `bold` to establish clear focal points.

## Layout & Spacing

The application assumes a standard mobile viewport dimensions and restricts the interface aggressively to fit this model. Layout is generous, employing comfortable touch-targets to ensure a frictionless interaction during a physical workout.

- **Base Rhythm:** The interface operates on a 4px grid. Primary spacing metrics utilize `p-4` (16px) or `p-6` (24px) for layout padding to give content room to breathe. List items and inputs are spaced with `gap-2` (8px) and `gap-4` (16px).
- **Navigation:** Persistent bottom navigation is present in standard views, intentionally hidden during active workout flows to maximize screen real estate and reduce distraction.

## Shapes & Radii

Sharp corners are almost completely avoided. The application makes heavy use of heavily rounded corners to establish a friendly and tactile aesthetic.

- **Buttons & Tags:** Primary actions use `rounded-2xl` or `rounded-full`.
- **Cards & Rows:** Interactive list items, inputs, and container cards favor `rounded-xl` and `rounded-2xl`, enforcing the pill-like, organic feeling across the board.

## Elevation & Depth

Shadows are used sparingly but effectively to establish depth.

- Interactive items and primary buttons leverage `shadow-lg` (often tinted with the primary color, e.g., `shadow-primary/30`) to visually float above the canvas.
- Cards, segments, and standard inputs use a subtle `shadow-sm` coupled with a light border, reinforcing the layered structure without dominating the visual hierarchy.

## Motion & Animation

Animation is functional but smooth, utilizing pure CSS over heavy JavaScript animation libraries.

- **Soft Appear:** A custom `@keyframes` animation (`soft-appear`) provides a gentle scale (from 0.95 to 1.0) and fade-in over 0.7s. This is used for page transitions and modal appearances, making the interface feel responsive and deliberate.
- **Immediate State Changes:** Shorter `150ms` transitions (`fade-in`, `transition-all`) govern hover, focus, and minor layout shifts to keep the interface feeling snappy but polished.
