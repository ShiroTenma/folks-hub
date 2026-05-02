````markdown
# Project Refactor & Feature Execution Plan

## Core Rule

Work **phase by phase**.  
Do **NOT** skip phases.  
Do **NOT** partially finish a phase and move on.

You may only continue to the next phase when:

- all tasks in current phase are completed
- code builds successfully
- no obvious regressions exist
- duplicated code is reduced
- files are organized properly

If a phase is incomplete, continue working until complete.

---

# Global Engineering Standards

## Code Quality

- Refactor aggressively where needed
- Prefer reusable architecture
- Remove dead code
- Remove duplicated logic
- Improve naming consistency
- Improve readability
- Improve maintainability
- Optimize unnecessary rerenders / queries / loops

## File Structure

Separate code into proper folders:

```text
/components
/components/ui
/components/member
/components/dashboard
etc..

/lib
/lib/utils
/lib/hooks
/lib/services
/lib/constants
/lib/types
..etc

/pages

/features

/store
````

## File Size Rule

Target:

* files under **200 lines**
* if larger, split by responsibility

Examples:

* page layout separate from logic
* hooks separate from UI
* table separate from filters
* modal separate from forms
* services separate from components

## Reusability Rule

Extract repeated logic into:

* utility functions
* hooks
* shared UI components
* services
* constants

---

# Phase 1 — Audit & Cleanup

## Goals

1. Scan project structure
2. Detect oversized files
3. Detect duplicate logic
4. Detect dead imports / unused code
5. Detect inconsistent naming
6. Detect poor folder structure

## Required Actions

* Refactor worst offenders first
* Move reusable helpers into `/lib`
* Move reusable UI into `/components/ui`
* Remove junk code

## Exit Condition

* project cleaner than before
* no broken imports
* no unused obvious code

---

# Phase 2 — Architecture Refactor

## Goals

Separate concerns.

## Required Actions

### Pages should only handle:

* layout
* route logic
* composition

### Business logic should move into:

```text
/lib/services
/features
/hooks
```

### UI logic should move into:

```text
/components
```

### Shared helpers into:

```text
/lib/utils
```

## Exit Condition

* pages slimmed down
* reusable architecture created
* cleaner imports

---

# Phase 3 — Performance Optimization

## Required Actions

* memoize expensive renders where useful
* reduce duplicate fetches
* avoid unnecessary state
* reduce prop drilling
* optimize queries
* lazy load heavy components if needed

## Exit Condition

* faster rendering
* cleaner state flow
* less waste

---

# Phase 4 — Member System Improvements

## Required Actions

Implement:

1. Bulk update system roles
2. Bulk add tags
3. Show all profiles even with incomplete data
4. Remove filters:

   * payment
   * active wp tags
   * committee

## Refactor Rule

Keep logic modular:

```text
/components/member/
/features/member/
/lib/services/member.ts
```

## Exit Condition

All member features complete and maintainable.

---

# Phase 5 — Credential Management

## Required Actions

1. One-time password set = NIM
2. Change password feature
3. Change email feature
4. Reset password tools
5. Validation + confirmations

## Security Rule

Use safe auth flows only.

## Exit Condition

Credential tools fully functional.

---

# Phase 6 — Settings Refactor

## Required Actions

1. Allow member data updates from settings page
2. Sync with member page
3. Shared forms/components
4. Shared update logic

## Exit Condition

No duplicated settings/member update logic.

---

# Phase 7 — Bug Fixing

## Required Actions

Fix:

```text
Uncaught (in promise) Error:
A listener indicated an asynchronous response...
```

Also audit async actions globally.

Add:

* try/catch
* proper loading states
* success/error toasts

## Exit Condition

No obvious async update failures.

---

# Phase 8 — UI Redesign

## Palette

```text
#1c1c1c
#eae6e0
#535366
#ffffff
```

## Typography

Readable serif style with strong UX.

## Required Actions

Redesign:

* sidebar
* navbar
* cards
* tables
* forms
* buttons
* spacing
* typography
* responsive behavior

## Exit Condition

Modern premium cohesive UI.

---

# Phase 9 — Final Polish

## Required Actions

* lint code
* remove leftovers
* fix inconsistent naming
* improve comments only where useful
* verify imports
* verify responsive layout
* verify loading states
* verify empty states

---

# Final Output Rules

After each phase report:

```text
PHASE X COMPLETE
- completed items
- files changed
- remaining risks
```

If not complete, continue working.

Do not claim completion early.
Do not skip refactoring.
Do not preserve bad architecture for convenience.

Focus on long-term maintainability, not hacks.

```
```