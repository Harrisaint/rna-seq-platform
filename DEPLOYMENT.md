# RNA-seq Platform Deployment Guide

This guide covers deploying the RNA-seq Platform to Render (backend) and Vercel (frontend).

## Prerequisites

1. GitHub repository with your code
2. Render account (free tier available)
3. Vercel account (free tier available)

## Backend Deployment (Render)

### Option 1: Using Render Dashboard (Recommended)

1. **Connect your GitHub repository to Render:**
   - Go to [render.com](arehttps://render.com) and sign in
   - Click "New +" → "Web Service"
   - Connect your GitHub repository

2. **Configure the service:**
   - **Name**: `rna-seq-platform-api`
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
   - **Working Directory**: `api`

3. **Set Environment Variables:**
   - `ALLOWED_ORIGINS`: `https://your-frontend-domain.vercel.app,http://localhost:5173`

4. **Deploy:**
   - Click "Create Web Service"
   - Render will automatically deploy your backend
   - Note the URL (e.g., `https://rna-seq-platform-api.onrender.com`)

### Option 2: Using render.yaml (Alternative)

If you prefer using the `render.yaml` file:
1. Push your code to GitHub
2. In Render dashboard, create a new "Blueprint"
3. Connect your repository
4. Render will automatically detect and use the `render.yaml` configuration

## Frontend Deployment (Vercel)

1. **Connect your GitHub repository to Vercel:**
   - Go to [vercel.com](https://vercel.com) and sign in
   - Click "New Project"
   - Import your GitHub repository

2. **Configure the project:**
   - **Framework Preset**: Vite
   - **Root Directory**: `web-new`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

3. **Set Environment Variables:**
   - `VITE_API_URL`: `https://your-backend-url.onrender.com` (from step above)

4. **Deploy:**
   - Click "Deploy"
   - Vercel will automatically deploy your frontend
   - Note the URL (e.g., `https://rna-seq-platform-web.vercel.app`)

## Post-Deployment Setup

1. **Update Backend CORS:**
   - Go back to Render dashboard
   - Update the `ALLOWED_ORIGINS` environment variable to include your Vercel URL
   - Redeploy the backend

2. **Test the deployment:**
   - Visit your Vercel frontend URL
   - Check that it can connect to the Render backend
   - Verify all API endpoints are working

## File Storage Considerations

The current setup uses local file storage. For production, consider:

1. **Database Integration**: Add a PostgreSQL database on Render
2. **File Storage**: Use AWS S3 or similar for storing data files
3. **Environment Variables**: Configure file paths and storage settings

## Monitoring and Maintenance

1. **Render Free Tier Limits:**
   - Services sleep after 15 minutes of inactivity
   - Cold starts may take 30-60 seconds
   - Consider upgrading for production use

2. **Vercel Free Tier:**
   - 100GB bandwidth per month
   - Unlimited deployments
   - Automatic HTTPS

## Troubleshooting

### Common Issues:

1. **CORS Errors:**
   - Ensure `ALLOWED_ORIGINS` includes your Vercel domain
   - Check that the environment variable is set correctly

2. **Build Failures:**
   - Verify all dependencies are in `requirements.txt`
   - Check Python version compatibility

3. **API Connection Issues:**
   - Verify the `VITE_API_URL` environment variable
   - Check that the backend URL is accessible

### Useful Commands:

```bash
# Test backend locally
cd api
python -m uvicorn app.main:app --reload

# Test frontend locally
cd web-new
npm run dev

# Check backend logs (Render dashboard)
# Check frontend logs (Vercel dashboard)
```

## Next Steps

1. Set up the data pipeline to populate the platform with real data
2. Configure automated deployments on code changes
3. Set up monitoring and logging
4. Consider upgrading to paid tiers for production use
