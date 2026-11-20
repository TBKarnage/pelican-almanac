# Contributing to Pelican Almanac

Thank you for considering contributing to **Pelican Almanac**! Whether you're fixing a bug, updating Stardew Valley 1.6 data, or proposing a new feature, your help is appreciated.

## Prerequisites

- **Node.js** `20.19+` or `22.12+` (Node 22 LTS recommended)
- **npm** (bundled with Node.js)

## Getting Started

1. Fork or branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```

## Checks Before Opening a Pull Request

Please make sure all automated checks pass locally before pushing:

```bash
# Lint with oxlint
npm run lint

# Type-check with TypeScript and run production Vite build
npm run build
```

If your changes affect UI layout, navigation, or PWA behavior, please verify both desktop and tablet/iPad viewport layouts (and both **Pelican Parchment** and **Moonlight Cabin** themes).

## Pull Request Guidelines

- Keep pull requests focused on a single feature, fix, or data update.
- Use clear, descriptive commit messages and fill out the PR template.
- Do not commit `dist/`, `node_modules/`, or local TLS certificates in `certs/`.
- If updating Stardew Valley game data (`src/data/`), note the relevant game version (e.g., Update 1.6) and verify cross-references (item IDs, bundle slots, villager preferences, and map pins).

## Reporting Issues

Use the [GitHub Issue Templates](../../issues/new/choose) to submit bug reports or feature requests. For security issues, follow [SECURITY.md](SECURITY.md) instead of opening a public issue.

## Code of Conduct

All contributors are expected to uphold our [Code of Conduct](CODE_OF_CONDUCT.md).
