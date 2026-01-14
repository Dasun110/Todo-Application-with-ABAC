# Deployment Guide

## Deploy to Vercel (Recommended)

### Prerequisites
- A Vercel account (sign up at vercel.com)
- PostgreSQL database (Vercel Postgres, Supabase, Neon, etc.)

### Step-by-Step Deployment

#### 1. Prepare Your Repository
```bash
git init
git add .
git commit -m "Initial commit: Todo App with ABAC"
git branch -M main
git remote add origin <your-github-repo-url>
git push -u origin main
```

#### 2. Set Up PostgreSQL Database

For production, you'll need PostgreSQL instead of SQLite.

**Option A: Vercel Postgres**
1. Go to your Vercel dashboard
2. Create a new Postgres database
3. Copy the DATABASE_URL

**Option B: Supabase**
1. Create a project at supabase.com
2. Get the connection string from Settings → Database

**Option C: Neon**
1. Create a project at neon.tech
2. Get the connection string

#### 3. Update Prisma Schema for PostgreSQL

Update `prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 4. Deploy to Vercel

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Configure environment variables:
   ```
   DATABASE_URL=your-postgresql-connection-string
   BETTER_AUTH_SECRET=your-32-char-minimum-secret-key
   BETTER_AUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.vercel.app
   ```
3. Deploy!

#### 5. Run Database Migrations

After first deployment, run migrations:
```bash
npx prisma migrate deploy
```

Or use Vercel CLI:
```bash
vercel env pull .env
npx prisma migrate deploy
```

## Alternative: Deploy to Render

### 1. Create Web Service
1. Go to [render.com](https://render.com)
2. Create new Web Service from your Git repository
3. Configure:
   - Build Command: `npm install && npx prisma generate && npm run build`
   - Start Command: `npm start`

### 2. Add PostgreSQL Database
1. Create new PostgreSQL database on Render
2. Get the Internal Database URL

### 3. Set Environment Variables
```
DATABASE_URL=your-postgres-url
BETTER_AUTH_SECRET=your-secret-key
BETTER_AUTH_URL=https://your-app.onrender.com
NEXT_PUBLIC_BETTER_AUTH_URL=https://your-app.onrender.com
NODE_ENV=production
```

### 4. Deploy
Render will automatically build and deploy your app.

## Post-Deployment Checklist

- [ ] Test user registration with all three roles
- [ ] Verify ABAC permissions work correctly
- [ ] Test todo CRUD operations
- [ ] Check that Users can only see their own todos
- [ ] Verify Managers can see all todos but not create/edit/delete
- [ ] Confirm Admins can delete any todo
- [ ] Test Users can only delete their own draft todos

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `BETTER_AUTH_SECRET` | Secret key (min 32 chars) | `your-super-secret-key-minimum-32-characters` |
| `BETTER_AUTH_URL` | Your app URL | `https://your-app.vercel.app` |
| `NEXT_PUBLIC_BETTER_AUTH_URL` | Public app URL | `https://your-app.vercel.app` |

## Troubleshooting

### Database Connection Issues
- Verify DATABASE_URL is correct
- Check if database accepts connections from your host
- Ensure SSL mode is configured properly

### Authentication Issues
- Verify BETTER_AUTH_SECRET is at least 32 characters
- Check BETTER_AUTH_URL matches your deployment URL
- Ensure NEXT_PUBLIC_BETTER_AUTH_URL is set

### Build Failures
- Run `npx prisma generate` before build
- Verify all dependencies are in package.json
- Check Node.js version compatibility

## Security Recommendations

1. **Use Strong Secrets**: Generate secure random strings for BETTER_AUTH_SECRET
   ```bash
   openssl rand -base64 32
   ```

2. **Enable HTTPS**: Always use HTTPS in production

3. **Database Security**: 
   - Use connection pooling
   - Enable SSL/TLS for database connections
   - Rotate database credentials regularly

4. **Environment Variables**: Never commit `.env` files to Git

## Performance Optimization

1. **Database Indexing**: Already configured in Prisma schema
2. **Query Caching**: Configured in TanStack Query
3. **Static Generation**: Use ISR where possible
4. **CDN**: Vercel automatically provides CDN

## Monitoring

Consider adding:
- Error tracking (Sentry)
- Analytics (Vercel Analytics, Google Analytics)
- Performance monitoring (Vercel Speed Insights)
- Database monitoring (your provider's dashboard)
