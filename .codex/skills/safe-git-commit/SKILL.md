---
name: safe-git-commit
description: Handle repository sync, staging, commit creation, and optional push with explicit user approval.
---

# Purpose
Safely manage git sync, commit, and push workflows.

# Workflow

1. Inspect repository state:
   - `git branch --show-current`
   - `git status --short`
   - `git remote -v`

2. If useful for synchronization, inspect remote state:
   - `git fetch`
   - determine whether local branch is behind/ahead its upstream

3. If the branch is behind and syncing is appropriate, recommend:
   - `git pull --rebase`

4. Review local work:
   - `git diff --stat`
   - `git diff`
   - `git diff --cached`

5. Summarize:
   - changed files
   - type of changes
   - whether the work should be committed together or split

6. Propose 3 commit message options in English.

7. Wait for explicit confirmation before running:
   - `git add`
   - `git commit`

8. After commit, ask whether to run:
   - `git push`

9. Never run `git commit` or `git push` without explicit user approval.