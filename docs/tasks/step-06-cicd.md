# Step 6 — CI Pipeline with Claude Code Failure Analysis

## Context

The framework's core suite (auth, inventory, cart, checkout) is complete and passing
locally. This step wires it into GitHub Actions and adds Claude Code as an automated
failure analyst on pull requests.

## Build

Create `.github/workflows/ci.yml` with exactly this content:

\`\`\`yaml
name: E2E Tests

on:
push:
branches: [main]
pull_request:
branches: [main]

jobs:
test:
runs-on: ubuntu-latest
steps: - uses: actions/checkout@v4 - uses: actions/setup-node@v4
with:
node-version: 22 - name: Install dependencies
run: npm ci - name: Install Playwright browsers
run: npx playwright install --with-deps - name: Run Playwright tests
run: npx playwright test - name: Upload HTML report
if: always()
uses: actions/upload-artifact@v4
with:
name: playwright-report
path: playwright-report/
retention-days: 14

analyze-failure:
needs: test
if: failure() && github.event_name == 'pull_request'
runs-on: ubuntu-latest
permissions:
contents: read
pull-requests: write
steps: - uses: actions/checkout@v4 - name: Download report
uses: actions/download-artifact@v4
with:
name: playwright-report
path: playwright-report/ - name: Claude Code — analyze test failure
uses: anthropics/claude-code-action@v1
with:
anthropic_api_key: ${{ secrets.ANTHROPIC_API_KEY }}
prompt: |
The Playwright E2E test suite failed on this pull request. Inspect the
Playwright HTML report in playwright-report/ and the job logs from the
failed "test" job in this workflow run. Identify: (1) which test(s)
failed, (2) the most likely root cause (application/UI change vs.
flaky/timing issue vs. broken selector), (3) a concrete suggested fix.
Post the analysis as a single comment on this pull request.
claude_args: "--max-turns 6"
\`\`\`

## Verification steps

1. Confirm `npx playwright test` still passes locally (sanity check before pushing CI
   config).
2. Commit and push this workflow to a new branch, then open a PR against main using
   the `gh` CLI (`gh pr create`).
3. Confirm the `test` job runs and passes on the PR.
4. To verify the failure-analysis path works, temporarily break one assertion in
   any spec (e.g. change an expected text value), push that change to the same PR
   branch, confirm the `test` job fails and `analyze-failure` runs and posts a
   comment, then revert the intentional break and push again so the PR ends green.
5. Do not merge the PR — leave it open for me to review.

## On completion

Give a summary: PR URL, confirmation that both the pass and fail paths were
verified, and the exact spec/assertion you temporarily broke to test the failure
path (so I can see it was a deliberate, reverted test, not a real regression).
