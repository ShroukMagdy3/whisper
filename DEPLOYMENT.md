# Vercel Deployment Guide

This project is configured to deploy on Vercel as serverless functions while maintaining full test compatibility.

## Prerequisites

- Vercel account (https://vercel.com)
- Git repository (GitHub, GitLab, or Bitbucket)
- Node.js >= 20

## Deployment Steps

### 1. Prepare Your Repository

Ensure all files are committed to your git repository:

```bash
git add .
git commit -m "Configure for Vercel deployment"
git push origin main
```

### 2. Configure Environment Variables on Vercel

1. Go to your Vercel dashboard
2. Create a new project or select existing one
3. In **Settings → Environment Variables**, add:
   - `MONGODB_URI` - Your MongoDB Atlas connection string
   - `JWT_SECRET` - A strong random string for JWT signing
   - `JWT_EXPIRES_IN` - Token expiration (default: `7d`)

### 3. Deploy

Option A: **Via Vercel CLI**

```bash
npm install -g vercel
vercel
```

Option B: **Via Git Integration**

- Connect your Git repository to Vercel
- Push to main branch → automatic deployment

## Project Structure for Serverless

The project has been configured with:

- **`api/index.js`** - Serverless handler that exports the Express app
- **`vercel.json`** - Vercel configuration with routes and environment variables
- **`.vercelignore`** - Files to exclude from deployment (e.g., tester/)
- **`server.js`** - Modified to work both locally and as serverless

## Local Development

Development still works the same way:

```bash
npm run dev        # Watch mode
npm start          # Single run
npm run test:api   # Run tests against http://localhost:3000
```

## Testing

The test suite automatically works with both:

- **Local testing**: `npm run test:api` (targets http://localhost:3000)
- **Production testing**: `npm run test:api https://your-vercel-app.vercel.app`

## Architecture

### How It Works

1. **Local**: `server.js` runs as a traditional Node.js server
2. **Serverless (Vercel)**: `api/index.js` handles each request as a function invocation
3. **Database**: MongoDB connection is cached globally to persist across invocations

### Request Flow

```
Client Request
    ↓
Vercel Router (vercel.json)
    ↓
api/index.js (Express handler)
    ↓
Your Routes & Controllers
    ↓
MongoDB Atlas
```

## Key Features

✅ Full serverless support with Vercel  
✅ No code changes needed for tests  
✅ Automatic MongoDB connection pooling  
✅ Static file serving from `/public`  
✅ Environment variable management  
✅ Cold start optimized

## Troubleshooting

### MongoDB Connection Issues

If tests fail after deployment, check:

- `MONGODB_URI` is set correctly in Vercel environment variables
- MongoDB Atlas allows connections from Vercel IP ranges
- Try: `curl https://your-app.vercel.app/health`

### Tests Failing

Run tests against your deployed app:

```bash
npm run test:api https://your-app.vercel.app
```

### Static Files Not Loading

Verify `public/**` routes are configured in `vercel.json`

## Production Checklist

- [ ] Environment variables configured in Vercel
- [ ] MongoDB Atlas connection string is valid
- [ ] JWT_SECRET is strong and unique
- [ ] Tests pass locally: `npm run test:api`
- [ ] Tests pass on staging/production deployment
- [ ] Health check returns 200: `/health`

## Rolling Back

To revert to a previous deployment:

1. Go to Vercel dashboard → Deployments
2. Find the working deployment
3. Click **Promote to Production**

---

For more info: https://vercel.com/docs/frameworks/express
