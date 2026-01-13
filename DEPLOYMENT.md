# BookFlow Pro - Production Deployment Guide

## Prerequisites

- Node.js 20+ and pnpm installed
- Supabase account with production database
- Deployment platform account (Vercel/Netlify/VPS)

## Local Verification

### 1. Install Dependencies

```bash
cd /Users/youh4ck3dme/projekty-pwa/booking
pnpm install
```

### 2. Configure Environment

Create `.env` file:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 3. Run Tests

```bash
# Unit tests
pnpm test

# E2E tests
pnpm test:e2e
```

### 4. Build for Production

```bash
pnpm build
```

## Deployment

### OPTION 1: Vercel (Recommended)

1. **Install Vercel CLI**

```bash
npm i -g vercel
```

1. **Deploy**

```bash
vercel --prod
```

1. **Set Environment Variables** (via Vercel Dashboard)

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

1. **Verify PWA**

- Visit deployed URL
- Click "Add to Home Screen" on mobile
- Test offline functionality

### OPTION 2: Netlify

1. **Install Netlify CLI**

```bash
npm i -g netlify-cli
```

1. **Deploy**

```bash
netlify deploy --prod --dir=dist
```

1. **Configure** (netlify.toml already configured)

### OPTION 3: Custom VPS

1. **Build Application**

```bash
pnpm build
```

1. **Upload `dist/` folder** to your server

1. **Configure Nginx**

```nginx
server {
    listen 80;
    server_name your-domain.com;
    root /var/www/bookflow/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}
```

## Post-Deployment

### Health Checks

- ✅ Application loads correctly
- ✅ Login/Registration works
- ✅ Booking creation functional
- ✅ Admin features accessible
- ✅ PWA installable on mobile
- ✅ Offline mode works
- ✅ Service worker registered

### Performance

Run Lighthouse audit:

- Performance: >90
- Accessibility: >95
- Best Practices: >90
- PWA: 100

## Monitoring

- Monitor Supabase logs for errors
- Set up error tracking (Sentry)
- Configure analytics (Google Analytics)

## Support

For issues, check:

- Browser console for errors
- Network tab for failed API calls

## BookFlow Pro API Server Deployment

The API Server (`/api` directory) must be deployed separately to handle requests from the WordPress Plugin.

### Environment Variables for API

Ensure your production environment has these variables:

```env
PORT=3000
NODE_ENV=production
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
CORS_ORIGINS=https://your-wordpress-site.com,http://localhost:3000
```

### Deploying to Railway/Render/Heroku

1.  **Root Directory**: Set the build root to `api/`.
2.  **Build Command**: `pnpm install && pnpm build`
3.  **Start Command**: `pnpm start`

---

## WordPress Plugin Installation

1.  **Download**: Get the latest `bookflow-pro.zip` from your build artifacts.
2.  **Install**: In WordPress Admin, go to **Plugins > Add New > Upload Plugin**.
3.  **Configure**:
    - Go to **Settings > BookFlow Pro**.
    - **API URL**: Enter the URL of your deployed API Server (e.g., `https://api.bookflow.com`).
    - **API Key**: Generate one using the Supabase SQL function `generate_api_key('Production Site')`.
4.  **Test**: Click "Test Connection" to verify.
