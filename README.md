# Muhammad Kashif LMS

A private learning management system built with Next.js, React, TypeScript, Prisma and PostgreSQL.

## Core features

- Secure Admin and Student authentication
- Student account management and course access
- Course, module and video lesson management
- Progress tracking and completion analytics
- Responsive premium Admin and Student dashboards
- Login rate limiting, session protection and security headers
- PostgreSQL database through Prisma

## Environment

Create a `.env` file in the project root:

```env
DATABASE_URL=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

## Setup

```bash
npm install
npx prisma generate
npm run build
npm run dev
```

Use `npm run db:push` only when you intentionally want Prisma to apply schema changes to the configured database.
