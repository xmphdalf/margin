# Contributing to Margin

Margin is a passion project. Contributions are welcome — but quality over quantity, always.
If you want to experiment freely, **fork the repo** rather than cloning it directly.
Forks let you build on top of Margin without your changes being mistaken for the canonical version.

---

## Getting started

**Fork first — do not clone the original repo directly.**
Forking gives you your own copy to build on. If you clone the original you cannot push,
and your experiments will be tangled with the canonical codebase.

```bash
# 1. Fork on GitHub — click the Fork button on the repo page
# 2. Clone your fork (not the original)
git clone https://github.com/<your-username>/margin.git
cd margin

# 3. Add upstream so you can pull future changes from the original
git remote add upstream https://github.com/xmphdalf/margin.git

# 4. Install dependencies
npm install

# 5. Install the pre-push hook (one-time, per machine)
npm run setup-hooks

# 6. Start the dev server
npm run dev
```

**Staying in sync with upstream:**

```bash
git fetch upstream
git merge upstream/main
```

---

## Local → push → CI → deploy flow

This is the full pipeline. Every step must pass before the next runs.

```
Write code
   │
   ▼
git push  ←─ pre-push hook runs automatically
   │           npm test         (10 Playwright tests — 3 input flows)
   │           npm run check    (type-check, 0 errors required)
   │           npm run build    (production build must succeed)
   │           if any fails → push is blocked, fix locally
   │
   ▼
GitHub Actions (CI)
   │  npm test          (Playwright, Chromium only)
   │  npm run check
   │  npm run build
   │  if any fails → deploy is cancelled, you get an email
   │
   ▼
GitHub Pages deployed
   │
   ▼
Git tag + GitHub Release created (only if version is new)
```

The pre-push hook runs the same commands as CI. If it passes locally, CI passes.
You find out about problems on your machine — not on GitHub.

**To skip the hook in a genuine emergency** (do not make this a habit):
```bash
git push --no-verify
```

---

## Before you open a pull request

- [ ] `npm test` passes — all 10 Playwright tests green
- [ ] `npm run validate` passes (`check` + `build`, zero errors, zero warnings)
- [ ] Changes look correct across all three themes: Light, Dark, Sepia
- [ ] No `@ts-ignore`, `@ts-expect-error`, `eslint-disable`, or any suppression annotation
- [ ] New interactive elements are keyboard-accessible with proper `aria-*` attributes
- [ ] Motion respects `@media (prefers-reduced-motion: reduce)`

---

## Commit messages

Margin uses the [Conventional Commits](https://www.conventionalcommits.org/) spec.

```
<type>[optional scope]: <short description>

[optional body]

[optional footer — BREAKING CHANGE: <description>]
```

### Types

| Type | When to use | Version impact |
|---|---|---|
| `feat` | New feature | MINOR bump |
| `fix` | Bug fix | PATCH bump |
| `docs` | Documentation only | none |
| `style` | Formatting, whitespace | none |
| `refactor` | Restructure without behaviour change | none |
| `perf` | Performance improvement | PATCH bump |
| `chore` | Build, tooling, dependencies | none |
| `ci` | CI/CD workflow changes | none |

### Breaking changes

Add `!` after the type, or `BREAKING CHANGE:` in the commit footer:

```
feat!: replace URL panel with drag-and-drop

BREAKING CHANGE: UrlPanel is no longer exported from the input module.
```

This triggers a **MAJOR** version bump.

---

## Release workflow (maintainers only)

1. Stage your changes under `## [Unreleased]` in `CHANGELOG.md` as you work.
   Use the standard sections: `Added`, `Changed`, `Deprecated`, `Removed`, `Fixed`, `Security`.

2. When ready to release, update two files:
   - `package.json` — bump `"version"` per semver rules above
   - `CHANGELOG.md` — convert `[Unreleased]` to `[x.y.z] — YYYY-MM-DD`, add a fresh empty `[Unreleased]` section at the top, update the comparison links at the bottom

3. Commit:
   ```
   chore: release vX.Y.Z
   ```

4. Push to `main`. CI automatically:
   - Runs `npm run check` — if this fails, nothing deploys
   - Builds the site
   - Deploys to GitHub Pages
   - Creates an annotated git tag `vX.Y.Z`
   - Creates a GitHub Release with the changelog section as the body

---

## Version rules (semver)

| Change type | Example | Bump |
|---|---|---|
| New backward-compatible feature | Add Story Mode | `0.1.0` → `0.2.0` |
| Bug fix | Fix TOC scroll spy on iOS | `0.2.0` → `0.2.1` |
| Breaking change | Rename localStorage key | `0.2.1` → `1.0.0` |

Margin reaches `1.0.0` when the core feature set is stable and in real use.

---

## Design principles (read before proposing UI changes)

Every change to Margin must pass this test: **does this make reading calmer and better?**

- The interface should disappear behind the content
- Motion must be slow and deliberate — 300–500ms, no spring/bounce/elastic easing, ever
- All three themes (Light, Dark, Sepia) are equal citizens — never treat dark mode as an afterthought
- Typography is a first-class design decision — spacing, measure, and line height matter
- Default is always *less*, never *more*. If it looks like clutter, remove it.
