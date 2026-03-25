# Repository Guidelines

## Project Structure & Module Organization
This repository is a Next.js 15 App Router project for a private CRM. Route segments live in `app/`, including authenticated views in `app/(app)/`, login flows in `app/(auth)/`, and the WhatsApp placeholder endpoint in `app/api/whatsapp-ingest/route.ts`. Reusable UI lives in `components/`. Shared logic, typing, auth helpers, and Supabase clients live in `lib/`. Database schema changes are tracked as SQL files in `supabase/migrations/`. Reference notes belong in `docs/`.

## Build, Test, and Development Commands
Use `npm install` to install dependencies. Use `npm run dev` to start the local server at `http://localhost:3000`. Use `npm run build` to compile the production build, and `npm run start` to serve that build locally. Use `npm run lint` for Next.js ESLint checks and `npm run typecheck` for a strict TypeScript pass. Run both before opening a PR.

## Coding Style & Naming Conventions
The codebase uses TypeScript, React 19, Tailwind CSS, and the ESLint presets in `.eslintrc.json` (`next/core-web-vitals` and `next/typescript`). Follow the existing style: 2-space indentation, double quotes, semicolons, and trailing commas only where the formatter adds them. Use PascalCase for React components (`AppShell`), camelCase for functions and variables (`signOutAction`), and kebab-case for component filenames (`contact-edit-panel.tsx`). Keep route folders aligned with URL structure, for example `app/(app)/contacts/[id]/page.tsx`.

## Testing Guidelines
There is no dedicated automated test runner configured yet. Until one is added, treat `npm run lint` and `npm run typecheck` as required checks. Manually verify affected flows in the browser, especially login, role-based access, contact CRUD, dashboard metrics, and Supabase-backed mutations. If you add tests later, place them near the feature or under a consistent `tests/` folder and mirror the target module name.

## Commit & Pull Request Guidelines
Recent commits use short, descriptive messages in Spanish and focus on one change at a time. Keep that pattern: concise summary, present tense, and scope-specific, for example `ajusta paginacion de contactos`. Pull requests should include a short problem statement, a summary of the change, verification steps (`npm run lint`, `npm run typecheck`, manual checks), and screenshots for UI changes. Link any related issue or migration.

## Security & Configuration Tips
Never commit real secrets. Keep local credentials in `.env.local` and update `.env.example` when required variables change. Apply new database changes through `supabase/migrations/` instead of editing production tables manually.

## Git rules
- For any Git-related task, always use the `safe-git-commit` skill first.
- Before starting code changes, check the current branch and workspace status.
- If the branch tracks a remote branch, check whether a pull is appropriate before editing.
- Prefer `git pull --rebase` over merge-based pull when syncing local work, unless the repo uses a different policy.
- Never run `git commit` without my explicit confirmation.
- Never run `git push` without my explicit confirmation.
- Before committing:
  1. summarize changed files,
  2. explain what changed,
  3. recommend whether the changes belong in one commit or multiple commits,
  4. propose high-quality commit messages in English.
- After a commit is created, ask whether I want to push it.
- Do not auto-push every small change unless I explicitly ask for that behavior in this session.


## Commit message style
- Use imperative mood in English.
- Be specific and professional.
- Avoid vague messages like:
  - update
  - changes
  - fixes
  - misc