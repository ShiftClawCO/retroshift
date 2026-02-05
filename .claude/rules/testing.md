---
paths:
  - "e2e/**/*.ts"
  - "**/*.test.ts"
  - "**/*.spec.ts"
---

# Testing Rules

- Every Pro-gated feature MUST have e2e tests
- Security-critical paths (auth, payments, RLS) MUST have tests
- Use Playwright for e2e tests — config at `playwright.config.ts`
- Prefer `getByRole` and `getByText` over CSS selectors
- Add `.first()` for ambiguous matches
- Take screenshots on failure
- Test both happy path and error states
- For Convex: unit tests in `convex/*.test.ts` using vitest pattern from `convex/rules.test.ts`
