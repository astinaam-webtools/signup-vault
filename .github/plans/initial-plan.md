## Plan: Build Full-Stack Email Collection SaaS Platform

A modern email collection app with multi-tenant project support, admin dashboard, analytics, and public API. Tech stack optimized for Coolify deployment: **Next.js 15 (App Router) + TypeScript + PostgreSQL + Prisma + tRPC + Tailwind CSS + Shadcn/UI**. This provides type-safety end-to-end, built-in API routes, excellent DX, and single-container deployment.

**App Name:** SignupVault

### Steps

1. **Initialize project structure** - Set up Next.js 15 with TypeScript, configure Prisma with PostgreSQL, add shadcn/ui components, tRPC for type-safe APIs, set up environment configuration with `.env.example`, and configure ESLint/Prettier for code quality.

2. **Design and implement database schema** in [`prisma/schema.prisma`] - Create models for `User` (with role enum: ADMIN/USER), `Project` (with API keys, settings), `EmailSubmission` (email, metadata: country, IP, user-agent, timestamp), and `Settings` (global app config for user registration toggle). Add indexes for performance on frequently queried fields.

3. **Build authentication system** - Implement NextAuth.js v5 with credentials provider in [`app/api/auth/[...nextauth]/route.ts`], create auto-generated admin account on first run with secure password hashing (bcrypt), add middleware for route protection in [`middleware.ts`], create login page at [`app/login/page.tsx`] with form validation.

4. **Create public email collection API** at [`app/api/public/collect/[projectId]/route.ts`] - Accept POST requests with email + optional metadata, validate project API key, extract IP address, geolocation (using headers like `CF-IPCountry` or `X-Forwarded-For`), user-agent, rate-limit using Upstash Redis or in-memory cache, store in database, return success/error JSON responses with proper CORS headers.

5. **Build admin dashboard layout and navigation** - Create protected dashboard at [`app/dashboard/layout.tsx`] with sidebar navigation, implement responsive design with Tailwind CSS, add user menu with logout, create dashboard home with stats cards (total projects, total emails, recent activity) using Recharts for visualizations.

6. **Implement project management features** in [`app/dashboard/projects/`] - Create project list page with search/filter, add/edit project forms with settings (name, description, custom fields), generate unique API keys per project, display embeddable code snippets for API integration, show project-specific email collection analytics.

7. **Build email list management per project** at [`app/dashboard/projects/[id]/emails/page.tsx`] - Display paginated email table with sorting/filtering (by date, country, etc.), show metadata columns (IP, location, timestamp, user-agent), implement CSV export function using `json2csv` library, add bulk actions (delete, export selected).

8. **Create user management system** (Admin only) at [`app/dashboard/users/page.tsx`] - List all users with roles, add user form with email/password/role selection, implement user enable/disable toggle, create settings page at [`app/dashboard/settings/page.tsx`] with toggle for "Allow User Registration" (admin-only access).

9. **Set up comprehensive testing infrastructure** - Configure Vitest for unit tests in [`vitest.config.ts`], add Playwright for E2E tests in [`playwright.config.ts`], create test utilities in [`tests/helpers/`] for database seeding and auth mocking, write API route tests in [`__tests__/api/`], component tests in [`__tests__/components/`], and E2E flows in [`e2e/`] (login, project creation, email collection, export).

10. **Configure Coolify deployment** - Create [`Dockerfile`] with multi-stage build (dependencies → build → production), add [`docker-compose.yml`] for local development with PostgreSQL service, create [`.dockerignore`], set up health check endpoint at [`app/api/health/route.ts`], document environment variables in [`README.md`] (DATABASE_URL, NEXTAUTH_SECRET, NEXTAUTH_URL, NODE_ENV).

11. **Add advanced features and polish** - Implement webhook notifications for new email submissions in [`app/api/webhooks/route.ts`], add email validation with DNS MX record checking, create API rate limiting with different tiers per project, add dark mode toggle using next-themes, implement search across all emails (admin view), add audit logs for user actions, create API documentation page at [`app/docs/page.tsx`].

12. **Create comprehensive documentation** - Write [`README.md`] with architecture overview, quick start guide, API documentation, deployment instructions for Coolify, environment variable reference, write [`.github/copilot-instructions.md`] with project-specific patterns (tRPC usage, Prisma conventions, shadcn/ui component usage, testing patterns), add inline code comments for complex business logic.

### Further Considerations

1. **Tech Stack Alternatives** - Option A: Next.js (recommended - simplest deployment, single container, full-stack TypeScript) / Option B: Separate backend (NestJS/Fastify) + frontend (React/Vue) if you need independent scaling / Option C: Django + HTMX for Python preference and simplicity.

2. **Geolocation strategy** - Option A: Use Cloudflare headers (`CF-IPCountry`) if using CF proxy (free, accurate) / Option B: MaxMind GeoLite2 database (self-hosted, privacy-friendly) / Option C: ipapi.co API (easy but external dependency, rate limits).

3. **Additional premium features to consider** - Email verification API integration (ZeroBounce, NeverBounce), duplicate detection across projects, custom email confirmation flows, webhook retry logic with exponential backoff, team collaboration (shared project access), SSO support (Google/GitHub OAuth), advanced analytics (conversion funnels, A/B testing support).

4. **Database concerns** - PostgreSQL is recommended for Coolify. Should we include Redis for caching and rate limiting, or use in-memory solutions initially for simplicity?

5. **API versioning strategy** - Should the public API have versioning (`/api/v1/collect`) from the start, or keep simple paths initially?

6. **Email field validation strictness** - Accept any string, basic regex validation, or strict RFC 5322 validation? Should we check MX records in real-time or async?
