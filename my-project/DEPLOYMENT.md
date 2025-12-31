# Deployment Guide for Render

## Overview

This application consists of:
- **Frontend**: React app (Static Site on Render)
- **Backend**: Python FastAPI (Web Service on Render)

## Step-by-Step Deployment

### 1. Backend Deployment

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: `stock-portfolio-backend`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r src/backend/requirements.txt`
   - **Start Command**: `cd src/backend && uvicorn main:app --host 0.0.0.0 --port $PORT`
   - **Root Directory**: Leave empty (or set to project root)

5. Add Environment Variables:
   ```
   SUPABASE_URL=your_supabase_url
   SUPABASE_ANON_KEY=your_supabase_anon_key
   POLYGON_API_KEY=your_polygon_api_key
   POLYGON_BASE_URL=https://api.polygon.io
   ALLOWED_ORIGINS=https://your-frontend.onrender.com
   ```
   ⚠️ **Note**: Set `ALLOWED_ORIGINS` after frontend is deployed

6. Click **Create Web Service**
7. Copy the backend URL (e.g., `https://stock-portfolio-backend.onrender.com`)

### 2. Frontend Deployment

1. In Render Dashboard, click **New +** → **Static Site**
2. Connect your GitHub repository
3. Configure:
   - **Name**: `stock-portfolio-frontend`
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: `dist`

4. Add Environment Variables:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   VITE_API_BASE_URL=https://your-backend.onrender.com
   ```
   ⚠️ **Important**: Use the backend URL from step 1

5. Click **Create Static Site**
6. Copy the frontend URL (e.g., `https://stock-portfolio-frontend.onrender.com`)

### 3. Update Backend CORS

1. Go back to your backend service settings
2. Update the `ALLOWED_ORIGINS` environment variable:
   ```
   ALLOWED_ORIGINS=https://your-frontend.onrender.com
   ```
3. Save changes (backend will automatically redeploy)

### 4. Verify Deployment

1. Visit your frontend URL
2. Check browser console for any CORS errors
3. Test authentication and stock data fetching

## Environment Variables Reference

### Backend (Web Service)
| Variable | Description | Example |
|----------|-------------|---------|
| `SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `POLYGON_API_KEY` | Polygon.io API key | `xxx` |
| `POLYGON_BASE_URL` | Polygon API base URL | `https://api.polygon.io` |
| `ALLOWED_ORIGINS` | Frontend URL for CORS | `https://your-app.onrender.com` |
| `PORT` | Server port (auto-set by Render) | `10000` |

### Frontend (Static Site)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://xxx.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJ...` |
| `VITE_API_BASE_URL` | Backend API URL | `https://your-backend.onrender.com` |

## Troubleshooting

### CORS Errors
- Ensure `ALLOWED_ORIGINS` in backend matches your frontend URL exactly
- Check for trailing slashes
- Verify both services are deployed

### API Connection Errors
- Verify `VITE_API_BASE_URL` points to your backend URL
- Check backend logs in Render dashboard
- Ensure backend is running (not sleeping)

### Build Failures
- Check build logs in Render dashboard
- Verify all dependencies are in `requirements.txt` (backend) and `package.json` (frontend)
- Ensure Python version compatibility

## Notes

- Render free tier services **sleep after 15 minutes** of inactivity
- First request after sleep may be slow (cold start)
- Consider upgrading to paid tier for always-on services
- Backend URL format: `https://your-service.onrender.com`
- Frontend URL format: `https://your-service.onrender.com`

