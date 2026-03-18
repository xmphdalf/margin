#!/usr/bin/env bash
# Install git hooks for Margin.
# Run once after cloning your fork: npm run setup-hooks

set -euo pipefail

HOOKS_DIR=".git/hooks"
PRE_PUSH="${HOOKS_DIR}/pre-push"

if [ ! -d ".git" ]; then
  echo "Error: run this from the repo root." >&2
  exit 1
fi

cat > "${PRE_PUSH}" << 'EOF'
#!/usr/bin/env bash
# Pre-push hook — mirrors the CI pipeline locally.
# Blocks the push if tests, type-check, or build fails.

set -euo pipefail

# Only run when pushing to main (or when no remote branch exists yet)
PROTECTED_BRANCH="main"
CURRENT_BRANCH=$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

if [ "${CURRENT_BRANCH}" != "${PROTECTED_BRANCH}" ]; then
  exit 0
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  Pre-push: running tests + validate (check + build)"
echo "  Same steps CI will run — fix here, not on GitHub."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

npm test
npm run validate

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  All checks passed. Pushing."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
EOF

chmod +x "${PRE_PUSH}"

echo "Git pre-push hook installed."
echo "Every push to main will now run: npm test + npm run validate (check + build)"
echo ""
echo "To skip in an emergency (use sparingly):"
echo "  git push --no-verify"
