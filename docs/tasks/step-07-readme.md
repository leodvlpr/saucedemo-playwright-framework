# Step 7 — README & Documentation

## Context

All prior steps are complete: layered Playwright + TypeScript framework
(pages/components/fixtures) against saucedemo.com, full test suite passing, and a
CI/CD pipeline with Claude Code automated failure analysis on PRs.

## Objective

Write a README.md that works as a portfolio piece — the artifact a recruiter or
tech lead reads before deciding whether to look at the code at all.

## Before writing anything

Inspect the actual repo state — do not invent numbers or claims:

- Count real specs, page objects, and components (`find tests -name "*.spec.ts"`,
  `find src/pages -name "*.ts"`, `find src/components -name "*.ts"`).
- Run `npx playwright test` and capture the real pass count/duration.
- Read the actual CI workflow file to describe it accurately.

## README structure

1. **Header**: project title, one-line pitch (what it is, what app it targets, why
   it exists as a portfolio piece — be explicit this targets a public demo app,
   not a client/employer codebase).

2. **Badges**: CI status badge (GitHub Actions workflow badge, auto-generated URL
   based on the actual repo), TypeScript badge, Playwright badge, license badge.
   Use shields.io badges, only for things that are actually true (don't add a
   coverage badge unless coverage is actually being measured).

3. **Architecture**: explain the 3-layer design (pages / components / fixtures) and
   WHY it's structured this way (reuse across pages, no duplicated locators,
   composable test setup). Include a simple folder tree (real, from `tree src`
   output, not invented) and a short code snippet showing how a Page composes a
   Component.

4. **Tech stack table**: Playwright, TypeScript, GitHub Actions, and the
   claude-code-action for AI-assisted CI — one line each on what role it plays.

5. **AI-powered CI/CD section** (the differentiator — give this real space, not
   one line): explain that failed test runs on PRs trigger an automated analysis
   via Claude Code that identifies root cause and posts it as a PR comment. Link
   to the actual PR from Step 6 that demonstrated this working, if it's still
   open/visible.

6. **What's covered**: bullet list of real test scenarios (derived from the actual
   spec files — auth incl. locked/error users, inventory sorting, cart, full
   checkout flow), not a generic "comprehensive test coverage" claim.

7. **Getting started**: clone, `npm install`, `npx playwright install`,
   `npm test`, `npm run test:ui`, `npm run report` — pull these from the real
   package.json scripts.

8. **Project structure**: the real folder tree from `src/` and `tests/`.

9. **Why this project exists**: 2-3 sentences, first person is fine, framed as a
   demonstration of production-style test architecture, not "class assignment"
   language. Do not include specific employer names, employer projects, or any
   confidential details — this is explicitly a from-scratch project against a
   public app.

10. **License**: add a LICENSE file (MIT) at repo root if one doesn't exist yet,
    and reference it here.

## Constraints

- No invented metrics, coverage percentages, or claims not verifiable from the
  actual repo.
- No mention of Holafly, Rappi, Platzi, Softvision, or any employer — this project
  stands on its own.
- Keep the tone factual and technical, not marketing-heavy — let the architecture
  and the CI/CD automation speak for themselves.
- After writing, run a markdown linter if one is available, or at minimum verify
  all internal links/anchors resolve and all shields.io badge URLs are correctly
  formed for this repo's actual owner/name.

## On completion

Give a summary: sections written, the LICENSE choice, and confirm all stats/counts
in the README were pulled from real inspection, not estimated.
