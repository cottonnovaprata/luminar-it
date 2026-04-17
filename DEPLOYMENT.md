# 🚀 Deployment Guide - NovaPrata Labs

## GitHub Setup

Your repository is ready for GitHub. Follow these steps:

### 1. **Authenticate with GitHub**

#### Option A: Using Personal Access Token (Recommended)

1. Go to GitHub Settings → Developer settings → Personal access tokens → Tokens (classic)
2. Click "Generate new token"
3. Name it: `ativosTI-deployment`
4. Select scopes:
   - ✅ `repo` (full control of private repositories)
   - ✅ `workflow` (for GitHub Actions)
5. Click "Generate token"
6. Copy the token (you won't see it again!)

#### Option B: Using SSH Key

1. Generate SSH key: `ssh-keygen -t ed25519 -C "raiiimundoemanuel2018@gmail.com"`
2. Add to GitHub Settings → SSH and GPG keys
3. Test connection: `ssh -T git@github.com`

### 2. **Push to GitHub**

Using Personal Access Token:

```bash
cd /path/to/novapratalabs
git remote add origin https://github.com/cottonnovaprata/ativosTI.git
git push -u origin main
```

When prompted for username: use your GitHub username
When prompted for password: use the Personal Access Token

Using SSH:

```bash
git remote add origin git@github.com:cottonnovaprata/ativosTI.git
git push -u origin main
```

---

## Vercel Setup

### 1. **Create Vercel Account**

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended for easy integration)
3. Authorize Vercel to access your GitHub account

### 2. **Import Project from GitHub**

1. Go to Vercel Dashboard → Add New → Project
2. Select "Import Git Repository"
3. Search for "ativosTI" repository
4. Click "Import"

### 3. **Configure Environment Variables**

Vercel will show a configuration screen. Add these environment variables:

```
DATABASE_URL=postgresql://user:password@localhost:5432/novapratalabs
JWT_SECRET=your-super-secret-jwt-key-here-min-32-chars
NEXTAUTH_URL=https://your-vercel-domain.vercel.app
NEXTAUTH_SECRET=your-nextauth-secret-key
```

**Important:**
- Generate strong secrets using: `openssl rand -base64 32`
- Use your actual database connection string
- Update NEXTAUTH_URL with your Vercel domain

### 4. **Database Setup**

Your project uses Prisma with PostgreSQL. You have options:

#### Option A: Vercel Postgres (Recommended)

1. In Vercel Dashboard, go to Storage → Create Database → Postgres
2. Click "Create"
3. Copy the connection string
4. Add it to environment variables as `DATABASE_URL`
5. Run migrations:
   ```bash
   npm run prisma:migrate
   ```

#### Option B: External Database (AWS RDS, Supabase, etc.)

1. Set up your PostgreSQL database
2. Get the connection string: `postgresql://user:password@host:5432/database`
3. Add to Vercel environment variables

### 5. **Deploy**

After configuration:

1. Click "Deploy" button
2. Vercel will automatically:
   - Build the Next.js project
   - Run database migrations
   - Deploy to live URL

Your app will be live at: `https://ativosTI-[random].vercel.app`

---

## Post-Deployment Steps

### 1. **Verify Deployment**

```bash
# Check build logs
# Visit your Vercel URL in browser
# Test login functionality
# Verify QR Code generation works
```

### 2. **Set Custom Domain (Optional)**

In Vercel Dashboard:
1. Go to Settings → Domains
2. Add custom domain (e.g., `ativos.company.com`)
3. Follow DNS configuration instructions

### 3. **Set Up CI/CD**

Vercel automatically deploys on every push to `main` branch.

To limit deployments, configure in Vercel Settings → Git:
- Production Deployments: From the `main` branch
- Preview Deployments: From Pull Requests

---

## Environment Variables Reference

### Development (.env.local)

```bash
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/novapratalabs"

# Authentication
JWT_SECRET="your-secret-key-min-32-chars"
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"

# API
NEXT_PUBLIC_API_URL="http://localhost:3000"
```

### Production (Vercel Dashboard)

Same as above, but with your Vercel domain.

---

## Troubleshooting

### Build Fails: "DATABASE_URL is required"

- Make sure you added the `DATABASE_URL` environment variable in Vercel
- Check that the database is accessible from Vercel's servers

### "PrismaClientInitializationError"

- Run migrations: `npm run prisma:migrate`
- Check DATABASE_URL is correct
- Ensure database is running

### QR Code Not Working

- Verify API route `/api/assets/[id]` is accessible
- Check browser console for errors
- Ensure QR Server API is accessible (requires internet)

### Login Redirect Issues

- Clear browser cookies
- Check JWT_SECRET matches in all environments
- Verify NEXTAUTH_URL matches your domain

---

## Continuous Deployment

### Automatic Deployments

Every push to `main` branch automatically deploys to production.

### Preview Deployments

Every Pull Request creates a preview URL for testing.

### Manual Rollback

In Vercel Dashboard:
1. Go to Deployments
2. Find previous deployment
3. Click "Redeploy"

---

## Monitoring & Logs

### View Logs in Vercel

1. Vercel Dashboard → ativosTI → Deployments
2. Click on deployment
3. View "Build Logs" and "Runtime Logs"

### Monitor Performance

1. Vercel Dashboard → Analytics
2. View:
   - Page Response Times
   - Web Vitals (Core Web Vitals)
   - Usage Analytics

---

## Local Development vs Production

### Development (npm run dev)

- Hot reload enabled
- Debug mode active
- Turbopack bundler
- Localhost with no CORS issues

### Production (npm run build && npm run start)

- Optimized for performance
- All debugging disabled
- CORS headers configured
- Environment variables from .env.production

---

## Security Checklist

- ✅ JWT_SECRET is strong and random (min 32 chars)
- ✅ DATABASE_URL uses a secure connection
- ✅ NEXTAUTH_SECRET is configured
- ✅ Environment variables NOT committed to Git
- ✅ .env.local in .gitignore
- ✅ HTTPS enforced on production domain
- ✅ CORS configured for your domain only
- ✅ API rate limiting configured (if needed)

---

## Next Steps

1. **Push to GitHub** using the instructions above
2. **Create Vercel account** at vercel.com
3. **Import project** from GitHub to Vercel
4. **Configure environment variables**
5. **Set up database** (Vercel Postgres or external)
6. **Deploy and test**

Your application is production-ready! 🎉
