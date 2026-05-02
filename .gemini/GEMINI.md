# Technical Map: Secret Ceremony Dashboard

## Tech Stack
- **Framework:** React 19 (Vite) + TypeScript
- **Styling:** Tailwind CSS v4 + Motion (framer-motion)
- **UI Components:** Shadcn UI (Radix/Base UI)
- **State/Backend:** Zustand + Supabase
- **Routing:** React Router v7

## Project Architecture
- `@/components/ui/`: Atomic primitives (Button, Card, etc.). **CHECK HERE FIRST.**
- `@/components/[feature]/`: Logic-heavy components (finance, tasks, members).
- `@/pages/`: Route entry points and data orchestration.
- `@/hooks/` & `@/store/`: Business logic and global state (Zustand).
- `@/lib/`: Shared utilities and Supabase client.

## Rules of Engagement
1. **Import Priority:** Always check `@/components/ui/` for existing components before suggesting new ones or raw HTML.
2. **Style Guide:** Use Tailwind v4 utility classes. Prefer `gap` over `margin` for layouts.
3. **Types:** Always use TypeScript. Define interfaces in `@/types/` if shared, or locally if component-specific.
4. **Icons:** Exclusively use `lucide-react`.
5. **No Hallucinations:** If a UI component isn't in `@/components/ui/`, ask to create it or use a standard Shadcn pattern.