# Prime Number Calculator

A small browser app that checks numbers for primality and renders prime lists using Web Workers for responsive computation.

## Features

- TypeScript-powered frontend
- Web Worker-based prime and factor calculations
- Segmented Sieve of Eratosthenes for normal prime range searches
- Vite development server and production build
- Accessible UI using semantic buttons, ARIA progress indicators, and tooltip roles
- Supports both JavaScript `number` mode and `BigInt` mode
- Incremental single-prime factorization UI with live progress and scrollable divisor tables
- Modular UI code split into builders, events, and actions

## Getting Started

### Install

```bash
pnpm install
```

### Development

```bash
pnpm dev
```

Open the local URL shown by Vite.

### Build

```bash
pnpm build
```

### Preview

```bash
pnpm preview
```

### GitHub Pages Deployment

```bash
pnpm deploy
```

This builds the app with `vite build --base=./` and publishes the `dist` directory to the repository's `gh-pages` branch.

### Type checking and linting

```bash
pnpm typecheck
pnpm lint
```

## Project Structure

- `index.html` — app shell and Vite entry point
- `package.json` — scripts and dev dependencies
- `tsconfig.json` — TypeScript configuration
- `src/index.ts` — bootstrap and global window bindings
- `src/workers.ts` — typed worker loader using Vite `new URL(..., import.meta.url)` paths
- `src/ui/` — split UI implementation
    - `builders.ts` — HTML fragment builders and accessible controls
    - `events.ts` — DOM event wiring and button handlers
    - `actions.ts` — UI state flow and worker orchestration
- `src/dom.ts` — DOM helpers, tooltip display, accessible progress updates, and render timing
- `src/utils.ts` — formatting and input parsing helpers
- `src/state.ts` — shared app state and window typing
- `src/*.ts` — worker scripts for both normal and BigInt prime calculation modes

## Accessibility Improvements

- Buttons are rendered as `<button>` elements with `aria-label`
- Progress bars use `role="progressbar"` and update `aria-valuenow`
- Tooltip markup includes `role="tooltip"` and `aria-live="polite"`
- Result containers use `role="status"` for screen reader updates

## Notes

- Normal prime range searches now use a segmented Sieve of Eratosthenes for much better performance
- BigInt mode is available for values outside the safe JavaScript integer range, but ordinary `number` mode is still faster for typical ranges
- Single-prime checks now update incrementally with divisor row rendering rather than rebuilding the full factor display each time
- Tooltip prime checks show live progress and append factor rows as they are discovered
- Vite is used as the build/dev server; no manual `dist/` worker path generation is required
- Web workers are loaded as modules with Vite-compatible URLs
- The app avoids inline `javascript:void(0)` and anchor-only click handlers
