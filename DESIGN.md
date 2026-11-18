# Design: B-CONNECT (Municipality of Roxas, Oriental Mindoro)

The locked system. Every Hallmark run reads this first and all pages and screens share it. Change it on purpose; this file is the rule.

## System
- Genre: modern-minimal
- Shape of the first page: Civic Workbench (Public Portal) / Dense Operational Console (App Screens)
- Theme: Brand (Roxas Civic Green & Clean Porcelain Paper)
- Axes: light/geometric-sans/warm · posture: Stage (Landing) / Dense App Screen (Console)

## Tokens
`src/tokens.css` is the source of truth. The roles:
```css
:root {
  --color-paper: oklch(98.5% 0.005 150);
  --color-paper-2: oklch(96.5% 0.01 150);
  --color-paper-3: oklch(93.5% 0.015 150);
  --color-ink: oklch(18% 0.02 160);
  --color-ink-2: oklch(35% 0.03 160);
  --color-muted: oklch(52% 0.025 160);
  --color-rule: oklch(89% 0.015 150);
  --color-accent: oklch(45% 0.12 148);
  --color-accent-ink: oklch(99% 0 0);
  --color-focus: oklch(45% 0.12 148);
  --color-error: oklch(52% 0.19 27);
  --color-warning: oklch(72% 0.16 65);
  --color-success: oklch(50% 0.12 150);
  --font-display: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
  --font-body: "Plus Jakarta Sans", system-ui, -apple-system, sans-serif;
  --font-outlier: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --radius-card: 12px;
  --radius-pill: 999px;
  --rule-hair: 1px;
  --shadow-card: 0 1px 3px rgba(15, 29, 22, 0.06), 0 1px 2px rgba(15, 29, 22, 0.04);
}
```
The spacing scale, the type scale, the easings and the durations live in `src/tokens.css`.

## Controls
- Primary: Filled `var(--color-accent)`, text `var(--color-accent-ink)`, radius `6px` / `var(--radius-card)`, control height 34–40px, instant `:focus-visible:ring-2 focus-visible:ring-focus`.
- Secondary: Background `var(--color-paper-2)` or `var(--color-paper-3)`, text `var(--color-ink)`, border `var(--color-rule)`.
- Agency Signals: Restrained to live indicators: MDRRMO Emergency Amber (`oklch(72% 0.16 65)`), LGU Executive Green (`oklch(45% 0.12 148)`), Statutory Overdue Alert (`oklch(52% 0.19 27)`).

## Motion
- Character: Calm and state-driven (`--dur-micro: 120ms`, `--dur-short: 220ms`). No decorative ambient bounces or floating orbs. Under `prefers-reduced-motion: reduce`, all durations collapse to `0.01ms`.

## Exports
`src/tokens.css` in this project declares an `@theme static` block for Tailwind CSS v4. Every color, font, radius, and duration is consumable as a semantic utility (`bg-paper`, `text-ink`, `border-rule`, `bg-accent`, `font-display`).
