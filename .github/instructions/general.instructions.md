---
applyTo: '**'
---

Email Collector App

This repository contains the source code for the Email Collector App, a simple web application that allows users to submit their email addresses for a newsletter subscription.This project is intended to facilitate the collection of email addresses for marketing and communication purposes. It is designed to be lightweight and easy to deploy, making it suitable for small businesses and startups looking to build their email lists quickly.

## Project Context
---
The project is SignupVault, a full-stack email collection SaaS platform with multi-tenant project support, admin dashboard, analytics, and public API. Tech stack: Next.js 15 (App Router) + TypeScript + PostgreSQL + Prisma + tRPC + Tailwind CSS + Shadcn/UI. Optimized for Coolify deployment.

Note: The UI now supports both light and dark color schemes based on the user's OS-level preference (prefers-color-scheme) — variables are applied through CSS to respect system theme automatically.

API: A project-scoped public email collection API endpoint has been added at `src/app/api/public/collect/[projectId]/route.ts`. It accepts POST submissions with an `x-api-key` header, extracts IP/country/user-agent headers, enforces an in-memory rate limit for development, and persists submissions to the database.
---

## Project Memory
---
Starting implementation on December 9, 2025. User specified using PostgreSQL database. Following the detailed plan in initial-plan.md. Completed steps 1, 2, and 3: Initialized Next.js 15 project structure with TypeScript, Prisma, tRPC, Tailwind CSS, shadcn/ui, designed and implemented database schema with PostgreSQL running in Docker on port 5433, and built authentication system with NextAuth.js v5, middleware, and login page. Admin user created with email admin@signupvault.com and password admin123.

Additionally, basic system-level theme support was added: the app respects the user's OS dark/light preference (prefers-color-scheme) and will switch color variables accordingly. This does not yet implement a user-facing theme toggle (that remains an advanced feature in the plan).

The landing page now includes a simple email signup form (client-side validation + API endpoint) for early access. A small visual tweak was applied to make the default light background less bright and easier on the eyes.

Update (December 10, 2025): Implemented task 9 — comprehensive testing infrastructure. Configured Vitest for unit testing with jsdom environment and React support, set up Playwright for E2E testing across Chromium and Firefox browsers, created test utilities for database seeding and auth mocking, wrote unit tests for API routes (email collection endpoint) and UI components (Button, Input, Label), developed E2E test suites covering authentication flows and project management scenarios. Testing framework is ready for development workflow integration.

Fixed E2E test failures by resolving database connectivity issues (corrected DATABASE_URL to use port 5433), implementing proper wait strategies for page elements, and ensuring authentication flow works correctly in test environment. All 6 E2E tests now pass, covering login, invalid credentials handling, and project creation. Unit tests maintain 93.33% coverage with 25 passing tests.
---

## Context Management
Always dump brief context about the changes in the "Project Context" section above. This helps maintainers/agents understand the purpose and scope of the changes made in the repository.

## Memory Management
When making changes to the repository, update the "Project Memory" section with any important information or decisions that should be remembered for future reference. This ensures that all relevant details are documented and easily accessible for future maintainers/agents.

