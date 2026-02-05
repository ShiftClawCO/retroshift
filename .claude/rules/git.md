# Git Rules

- NEVER push directly to `main` — always work on `dev`
- NEVER deploy to production without explicit human approval
- Commit format: `type: description` (feat, fix, refactor, security, docs, test, chore)
- `npm run build` MUST pass before every commit
- Branch workflow: `dev` (development) → preview → human review → merge to `main` (production)
- Feature branches (`feature/*`) optional for large features
