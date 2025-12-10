---
applyTo: '**'
---

Email Collector App

This repository contains the source code for the Email Collector App, a simple web application that allows users to submit their email addresses for a newsletter subscription.This project is intended to facilitate the collection of email addresses for marketing and communication purposes. It is designed to be lightweight and easy to deploy, making it suitable for small businesses and startups looking to build their email lists quickly.

## Project Context
---
The project is SignupVault, a full-stack email collection SaaS platform with multi-tenant project support, admin dashboard, analytics, and public API. Tech stack: Next.js 15 (App Router) + TypeScript + PostgreSQL + Prisma + tRPC + Tailwind CSS + Shadcn/UI. Optimized for Coolify deployment.

Note: The UI now supports both light and dark color schemes based on the user's OS-level preference (prefers-color-scheme) — variables are applied through CSS to respect system theme automatically.

Homepage, login, and dashboard surfaces have been refreshed with gradient layers and glassy cards that use design tokens (background/card/foreground) so they adapt cleanly to light/dark system themes, including a visible Login CTA for signed-out users.
Dashboard subpages (projects list/detail, project create/edit, users, settings) now use the same theme-aware gradients and glass cards to reduce whiteness and keep consistency across light/dark modes.
Dashboard pages (settings, projects list/detail/new, users) now span the full content width (no max-width containers) to match the main dashboard surface.

API: A project-scoped public email collection API endpoint has been added at `src/app/api/public/collect/[projectId]/route.ts`. It accepts POST submissions with an `x-api-key` header, extracts IP/country/user-agent headers, enforces an in-memory rate limit for development, and persists submissions to the database.

Auth: Credentials sign-in now normalizes emails (trim + lowercase) and user creation stores normalized emails to avoid case/whitespace login mismatches.

Docker: Multi-stage Docker build implemented with Node.js 20 Alpine, standalone Next.js output, health check endpoint at `/api/health`, and comprehensive container testing. Ready for Coolify deployment.
---

## Project Memory
---
Starting implementation on December 9, 2025. User specified using PostgreSQL database. Following the detailed plan in initial-plan.md. 

Completed tasks 1-10: Initialized Next.js 15 project structure with TypeScript, Prisma, tRPC, Tailwind CSS, shadcn/ui, designed and implemented database schema with PostgreSQL running in Docker on port 5433, built authentication system with NextAuth.js v5, middleware, and login page. Admin user created with email admin@signupvault.com and password admin123.

Implemented comprehensive admin dashboard with project management, email list management, user management, and analytics. Added public email collection API with rate limiting and metadata extraction. Set up comprehensive testing infrastructure with Vitest, Playwright, and Docker container tests.

Successfully configured Coolify deployment with multi-stage Dockerfile, docker-compose for local development, health check endpoints, and validated container functionality. All unit tests (31) and E2E tests passing. Application ready for production deployment.

Additionally, basic system-level theme support was added: the app respects the user's OS dark/light preference (prefers-color-scheme) and will switch color variables accordingly. This does not yet implement a user-facing theme toggle (that remains an advanced feature in the plan).

The landing page now includes a simple email signup form (client-side validation + API endpoint) for early access. A small visual tweak was applied to make the default light background less bright and easier on the eyes.

Update (December 10, 2025): Implemented task 10 — Coolify deployment configuration. Created multi-stage Dockerfile with Node.js 20 Alpine base image and standalone Next.js output, configured docker-compose.yml for local development with PostgreSQL service including health checks, created .dockerignore for optimized build context, implemented health check endpoint at /api/health with database connectivity testing, and updated README.md with comprehensive documentation covering environment variables, deployment instructions, API documentation, and project architecture overview.

Update (December 11, 2025): Refreshed homepage, login, and dashboard UI with token-driven gradients and glass cards that respect system light/dark preference; homepage shows Login CTA for unauthenticated visitors. Extended the same treatment to dashboard subpages (projects, project detail, project create/edit, users, settings) for consistent themed visuals.
Update (December 11, 2025): Adjusted dashboard settings/projects/users pages (including project detail/new) to remove max-width constraints so content uses the full available width alongside the sidebar layout.
Update (December 11, 2025): Normalized credential email handling (trim + lowercase) in auth and user creation to allow case-insensitive login for non-admin users.
---

## Context Management
Always dump brief context about the changes in the "Project Context" section above. This helps maintainers/agents understand the purpose and scope of the changes made in the repository.

## Memory Management
When making changes to the repository, update the "Project Memory" section with any important information or decisions that should be remembered for future reference. This ensures that all relevant details are documented and easily accessible for future maintainers/agents.

