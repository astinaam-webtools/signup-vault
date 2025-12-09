# Tasks for SignupVault Development

Based on the initial plan in `initial-plan.md`.

- [x] 1. **Initialize project structure** - Set up Next.js 15 with TypeScript, configure Prisma with PostgreSQL, add shadcn/ui components, tRPC for type-safe APIs, set up environment configuration with `.env.example`, and configure ESLint/Prettier for code quality.

- [x] 2. **Design and implement database schema** in [`prisma/schema.prisma`] - Create models for `User` (with role enum: ADMIN/USER), `Project` (with API keys, settings), `EmailSubmission` (email, metadata: country, IP, user-agent, timestamp), and `Settings` (global app config for user registration toggle). Add indexes for performance on frequently queried fields.

- [x] 3. **Build authentication system** - Implement NextAuth.js v5 with credentials provider in [`app/api/auth/[...nextauth]/route.ts`], create auto-generated admin account on first run with secure password hashing (bcrypt), add middleware for route protection in [`middleware.ts`], create login page at [`app/login/page.tsx`] with form validation.

- [ ] 4. **Create public email collection API** at [`app/api/public/collect/[projectId]/route.ts`] - Accept POST requests with email + optional metadata, validate project API key, extract IP address, geolocation (using headers like `CF-IPCountry` or `X-Forwarded-For`), user-agent, rate-limit using Upstash Redis or in-memory cache, store in database, return success/error JSON responses with proper CORS headers.

- [ ] 5. **Build admin dashboard layout and navigation** - Create protected dashboard at [`app/dashboard/layout.tsx`] with sidebar navigation, implement responsive design with Tailwind CSS, add user menu with logout, create dashboard home with stats cards (total projects, total emails, recent activity) using Recharts for visualizations.

- [ ] 6. **Implement project management features** in [`app/dashboard/projects/`] - Create project list page with search/filter, add/edit project forms with settings (name, description, custom fields), generate unique API keys per project, display embeddable code snippets for API integration, show project-specific email collection analytics.

- [ ] 7. **Build email list management per project** at [`app/dashboard/projects/[id]/emails/page.tsx`] - Display paginated email table with sorting/filtering (by date, country, etc.), show metadata columns (IP, location, timestamp, user-agent), implement CSV export function using `json2csv` library, add bulk actions (delete, export selected).

- [ ] 8. **Create user management system** (Admin only) at [`app/dashboard/users/page.tsx`] - List all users with roles, add user form with email/password/role selection, implement user enable/disable toggle, create settings page at [`app/dashboard/settings/page.tsx`] with toggle for "Allow User Registration" (admin-only access).

- [ ] 9. **Set up comprehensive testing infrastructure** - Configure Vitest for unit tests in [`vitest.config.ts`], add Playwright for E2E tests in [`playwright.config.ts`], create test utilities in [`tests/helpers/`] for database seeding and auth mocking, write API route tests in [`__tests__/api/`], component tests in [`__tests__/components/`], and E2E flows in [`e2e/`] (login, project creation, email collection, export).

- [ ] 10. **Configure Coolify deployment** - Create [`Dockerfile`] with multi-stage build (dependencies → build → production), add [`docker-compose.yml`] for local development with PostgreSQL service, create [`.dockerignore`], set up health check endpoint at [`app/api/health/route.ts`], document environment variables in [`README.md`] (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NODE_ENV).

- [ ] 11. **Add advanced features and polish** - Implement webhook notifications for new email submissions in [`app/api/webhooks/route.ts`], add email validation with DNS MX record checking, create API rate limiting with different tiers per project, add dark mode toggle using next-themes, implement search across all emails (admin view), add audit logs for user actions, create API documentation page at [`app/docs/page.tsx`].

	Note: basic system-level dark/light support (prefers-color-scheme) was implemented in global styles so the UI respects the OS theme automatically. A user-toggle (next-themes) is still planned as an advanced feature.

- [ ] 12. **Create comprehensive documentation** - Write [`README.md`] with architecture overview, quick start guide, API documentation, deployment instructions for Coolify, environment variable reference, write [`.github/copilot-instructions.md`] with project-specific patterns (tRPC usage, Prisma conventions, shadcn/ui component usage, testing patterns), add inline code comments for complex business logic.
