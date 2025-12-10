# SignupVault

A modern, full-stack email collection SaaS platform with multi-tenant project support, admin dashboard, analytics, and public API. Built with Next.js 15, TypeScript, PostgreSQL, Prisma, tRPC, Tailwind CSS, and Shadcn/UI.

**Containerized for Coolify and Docker deployments. Now includes curl in the Docker image for health checks and debugging.**

Health check endpoint: `/api/health` returns JSON with service health status and database connectivity. Docker image exposes port 3000 and includes curl for container diagnostics.

## Features

- 🔐 **Authentication**: Secure login system with role-based access control (Admin/User)
- 📊 **Admin Dashboard**: Comprehensive dashboard with analytics and project management
- 📧 **Email Collection**: Public API endpoints for collecting emails with metadata
- 🏗️ **Multi-tenant**: Project-scoped email collection with unique API keys
- 📈 **Analytics**: Real-time email collection analytics and trends
- 📤 **Export**: CSV export functionality for email lists
- 🌐 **API**: RESTful API with rate limiting and CORS support
- 🐳 **Docker**: Containerized deployment ready for Coolify

## Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Shadcn/UI
- **Backend**: Next.js API Routes, tRPC, NextAuth.js v5
- **Database**: PostgreSQL with Prisma ORM
- **Deployment**: Docker, Coolify optimized
- **Testing**: Vitest (unit), Playwright (E2E)

## Quick Start

### Prerequisites

- Node.js 20+
- Docker and Docker Compose
- PostgreSQL (or use Docker)

### Local Development

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd signupvault
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://postgres:postgres#123#@localhost:5433/signupvault"
   NEXTAUTH_SECRET="your-super-secret-key-change-in-production"
   NEXTAUTH_URL="http://localhost:3000"
   NODE_ENV="development"
   ```

4. **Start PostgreSQL with Docker**
   ```bash
   docker run -d \
     --name signupvault-db \
     -e POSTGRES_DB=signupvault \
     -e POSTGRES_USER=postgres \
     -e POSTGRES_PASSWORD=postgres#123# \
     -p 5433:5432 \
     postgres:15-alpine
   ```

5. **Run database migrations**
   ```bash
   npx prisma migrate dev --name init
   ```

6. **Seed admin user**
   ```bash
   npx tsx scripts/seed-admin.ts
   ```

7. **Start development server**
   ```bash
   npm run dev
   ```

8. **Open [http://localhost:3000](http://localhost:3000)**

### Using Docker Compose (Recommended)

For a complete development environment:

```bash
docker-compose up -d
```

#### Docker Image Notes
The Dockerfile installs curl for health checks and debugging. You can use curl inside the running container to test endpoints:
`docker exec -it <container_name> curl http://localhost:3000/api/health`

This will start both the PostgreSQL database and the Next.js application.

## Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `NEXTAUTH_SECRET` | Secret key for NextAuth.js | Yes | - |
| `NEXTAUTH_URL` | Base URL for authentication | Yes | - |
| `NODE_ENV` | Environment mode | No | `development` |

### Database URL Format

```
postgresql://username:password@host:port/database
```

For local development with Docker:
```
postgresql://postgres:postgres%23123%23@localhost:5433/signupvault
```

## API Documentation

### Public Email Collection

Collect emails for a specific project:

```bash
POST /api/public/collect/{projectId}
Content-Type: application/json
x-api-key: your-project-api-key

{
  "email": "user@example.com",
  "metadata": {
    "source": "website",
    "campaign": "newsletter"
  }
}
```

**Rate Limiting**: 100 requests per hour per IP address.

### Health Check

```bash
GET /api/health
```

Returns JSON with service health status and database connectivity. Example response:

```json
{
   "status": "healthy",
   "timestamp": "2025-12-11T12:34:56.789Z",
   "services": {
      "database": "connected"
   }
}
```

## Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   ├── dashboard/         # Admin dashboard
│   │   └── login/             # Authentication
│   ├── components/            # React components
│   ├── lib/                   # Utilities and configurations
│   └── types/                 # TypeScript types
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── e2e/                       # End-to-end tests
├── __tests__/                 # Unit tests
└── scripts/                   # Database seeding scripts
```

## Testing

### Unit Tests

```bash
npm run test:run
```

### E2E Tests

```bash
npm run test:e2e
```

### Coverage Report

```bash
npm run test:coverage
```

## Deployment

### Coolify Deployment

1. **Connect your repository** to Coolify
2. **Set environment variables** in Coolify dashboard
3. **Configure the service**:
   - Build Command: `npm run build`
   - Start Command: `npm start`
   - Health Check Path: `/api/health`
4. **Deploy**

#### Docker Health Check
You can use curl inside the container to verify health:
`curl http://localhost:3000/api/health`

### Manual Docker Deployment

```bash
# Build the image
docker build -t signupvault .

# Run with PostgreSQL
docker-compose up -d
```

## Database Schema

### Models

- **User**: Authentication and role management
- **Project**: Multi-tenant project isolation
- **EmailSubmission**: Collected emails with metadata
- **Settings**: Global application configuration

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on GitHub.

---
**Latest updates:**
- Health check endpoint `/api/health` implemented and documented
- Dockerfile now installs curl for diagnostics
