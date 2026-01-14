# Todo Application with ABAC

A full-stack todo application built with Next.js featuring Attribute-Based Access Control (ABAC) with three distinct user roles: User, Manager, and Admin.

## Features

- **Authentication**: Email/password authentication using Better Auth
- **Authorization**: Attribute-Based Access Control (ABAC) system
- **Role-Based Permissions**:
  - **User**: Can view own todos, create, update, and delete own todos (only in draft status)
  - **Manager**: Can view all todos from all users (read-only)
  - **Admin**: Can view all todos and delete any todo regardless of status
- **Todo Management**: Create, read, update, and delete todos with three statuses (Draft, In Progress, Completed)
- **Modern UI**: Built with shadcn/ui components and Tailwind CSS
- **Data Fetching**: TanStack Query for efficient data management

## Tech Stack

- **Frontend**: Next.js 15 (App Router)
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Data Fetching**: TanStack Query
- **Authentication**: Better Auth
- **Database**: SQLite with Prisma ORM
- **Language**: TypeScript

## Getting Started

### Prerequisites

- Node.js 18+ installed
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd Todo-Application-with-ABAC
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` and add your configuration:
```env
DATABASE_URL="postgresql://postgres:<SUPABASE_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:<SUPABASE_PASSWORD>@db.<PROJECT_REF>.supabase.co:5432/postgres"
BETTER_AUTH_SECRET="your-secret-key-change-in-production"
BETTER_AUTH_URL="http://localhost:3000"
```

Supabase notes:
- `DATABASE_URL` should use the pooled connection string (with `pgbouncer=true&connection_limit=1`).
- `DIRECT_URL` should use the non-pooled connection string for Prisma migrations.

4. Generate Prisma client and push database schema:
```bash
npm run db:generate
npm run db:push
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating an Account

1. Navigate to the home page
2. Click "Don't have an account? Register"
3. Fill in your details and select a role:
   - **User**: For creating and managing your own todos
   - **Manager**: For viewing all todos (read-only access)
   - **Admin**: For full access including deleting any todo

### Managing Todos

**As a User:**
- Create new todos with title, description, and status
- Edit your own todos
- Delete your own todos (only when in Draft status)
- View only your own todos

**As a Manager:**
- View all todos from all users
- Cannot create, edit, or delete todos

**As an Admin:**
- View all todos from all users
- Delete any todo regardless of status
- Cannot create or edit todos

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── auth/         # Authentication endpoints
│   │   └── todos/        # Todo CRUD endpoints
│   ├── dashboard/        # Dashboard page
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/
│   ├── auth/            # Authentication components
│   ├── todos/           # Todo management components
│   ├── ui/              # shadcn/ui components
│   └── providers.tsx    # Query client provider
├── lib/
│   ├── abac.ts          # ABAC authorization logic
│   ├── auth.ts          # Better Auth configuration
│   ├── auth-client.ts   # Client-side auth utilities
│   └── utils.ts         # Utility functions
├── prisma/
│   └── schema.prisma    # Database schema
└── hooks/
    └── use-toast.ts     # Toast notification hook
```

## ABAC Implementation

The ABAC system uses user roles and todo attributes (status, ownership) to determine permissions:

### View Permission
- **User**: Can only view their own todos
- **Manager & Admin**: Can view all todos

### Create Permission
- **User**: Can create todos
- **Manager & Admin**: Cannot create todos

### Update Permission
- **User**: Can update their own todos
- **Manager & Admin**: Cannot update todos

### Delete Permission
- **User**: Can delete their own todos only if status is DRAFT
- **Manager**: Cannot delete todos
- **Admin**: Can delete any todo regardless of status

## Database Schema

### User Model
- id, name, email, role (USER/MANAGER/ADMIN)
- Relations: todos, sessions, accounts

### Todo Model
- id, title, description, status (DRAFT/IN_PROGRESS/COMPLETED)
- Relations: user (owner)

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables:
  - `DATABASE_URL` (use your Supabase pooled connection string)
  - `DIRECT_URL` (Supabase non-pooled connection string for migrations)
   - `BETTER_AUTH_SECRET`
   - `BETTER_AUTH_URL`
4. Deploy

For production (Supabase PostgreSQL):
1. Ensure `DATABASE_URL` uses the pooled URL (`pgbouncer=true&connection_limit=1`).
2. Ensure `DIRECT_URL` uses the non-pooled URL.
3. Run migrations against Supabase:
```bash
npx prisma migrate deploy
```

## License

MIT