# Ethereum Validator Dashboard - Deployment Guide

## Backend (Railway)

### 1. Create Railway Account

- Go to [railway.app](https://railway.app)
- Sign up/Sign in with GitHub

### 2. Deploy Backend

```bash
# Clone your repo to Railway
railway login
railway link
railway up
```

### 3. Set Environment Variables

In Railway dashboard:

- Go to your project
- Settings > Variables
- Add:
  - `BEACON_RPC` = `https://your-beacon-rpc-endpoint`
  - `NODE_ENV` = `production`

### 4. Get Backend URL

After deployment, copy the Railway URL (e.g., `https://your-app-name.up.railway.app`)

## Frontend (Vercel)

### 1. Create Vercel Account

- Go to [vercel.com](https://vercel.com)
- Sign up/Sign in with GitHub

### 2. Deploy Frontend

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel --prod
```

### 3. Update API URL

In Vercel dashboard:

- Go to your project
- Settings > Environment Variables
- Add build-time variable:
  - `NODE_ENV` = `production`

The frontend will automatically use the production API URL.

### 4. Custom Domain (Optional)

- In Vercel dashboard, go to Settings > Domains
- Add your custom domain

## Post-Deployment

1. Update the frontend's `config.js` with your Railway backend URL
2. Test the application
3. Monitor logs in Railway/Vercel dashboards

## Troubleshooting

- **Backend timeout**: Check Railway logs for timeout errors
- **CORS issues**: Ensure Railway URL is added to allowed origins
- **API not responding**: Verify environment variables are set correctly
