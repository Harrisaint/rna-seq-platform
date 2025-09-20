# Vercel Deployment Troubleshooting Guide

## Common Vercel Errors and Solutions

### 1. Build Failures

#### `FUNCTION_INVOCATION_FAILED` (500)
**Symptoms**: Build process fails during deployment
**Causes**:
- Missing dependencies
- TypeScript compilation errors
- Build command issues

**Solutions**:
```bash
# Test build locally first
cd web-new
npm ci
npm run build

# Check for TypeScript errors
npx tsc --noEmit

# Verify all dependencies are installed
npm ls
```

#### `FUNCTION_INVOCATION_TIMEOUT` (504)
**Symptoms**: Build takes too long and times out
**Causes**:
- Large dependencies
- Inefficient build process
- Resource constraints

**Solutions**:
- Optimize bundle size (already configured in vite.config.ts)
- Use `npm ci` instead of `npm install` for faster installs
- Consider upgrading Vercel plan for more resources

#### `FUNCTION_PAYLOAD_TOO_LARGE` (413)
**Symptoms**: Build output exceeds size limits
**Causes**:
- Large static assets
- Unoptimized dependencies
- Source maps included

**Solutions**:
- Disable source maps in production (already configured)
- Use manual chunking (already configured)
- Optimize images and assets

### 2. Runtime Errors

#### `ROUTER_CANNOT_MATCH` (502)
**Symptoms**: 502 errors on page refresh or direct URL access
**Causes**:
- SPA routing not configured
- Missing catch-all route

**Solutions**:
- Ensure vercel.json has proper routing (already configured)
- Test with: `curl -I https://your-app.vercel.app/some-route`

#### `NOT_FOUND` (404)
**Symptoms**: 404 errors for valid routes
**Causes**:
- Missing files
- Incorrect build output
- Routing misconfiguration

**Solutions**:
- Verify build output in `web-new/dist`
- Check that all assets are built correctly
- Ensure index.html exists in dist folder

### 3. Environment and Configuration Issues

#### `BODY_NOT_A_STRING_FROM_FUNCTION` (502)
**Symptoms**: API responses not properly formatted
**Causes**:
- Backend returning non-string responses
- CORS issues
- API endpoint misconfiguration

**Solutions**:
- Check backend API responses
- Verify CORS configuration
- Test API endpoints directly

#### `DNS_HOSTNAME_NOT_FOUND` (502)
**Symptoms**: Cannot resolve backend URL
**Causes**:
- Incorrect API URL
- Backend not deployed
- Environment variable not set

**Solutions**:
- Verify `VITE_API_URL` environment variable
- Check backend deployment status
- Test API URL accessibility

### 4. Performance Issues

#### `FUNCTION_THROTTLED` (503)
**Symptoms**: Too many requests, rate limited
**Causes**:
- High traffic
- Inefficient API calls
- Free tier limits

**Solutions**:
- Implement request caching
- Optimize API calls
- Consider upgrading Vercel plan

#### `EDGE_FUNCTION_INVOCATION_TIMEOUT` (504)
**Symptoms**: Edge functions timing out
**Causes**:
- Long-running operations
- Resource constraints

**Solutions**:
- Move heavy operations to backend
- Optimize function performance
- Use background jobs for long tasks

## Debugging Steps

### 1. Check Build Logs
```bash
# In Vercel dashboard:
# Go to your project → Deployments → Click on failed deployment → View Function Logs
```

### 2. Test Locally
```bash
# Test the exact build process
cd web-new
npm ci
npm run build
npm run preview

# Test API connectivity
curl -I $VITE_API_URL/health
```

### 3. Verify Environment Variables
```bash
# In Vercel dashboard:
# Go to Settings → Environment Variables
# Ensure VITE_API_URL is set correctly
```

### 4. Check Network Tab
- Open browser dev tools
- Check for failed requests
- Look for CORS errors
- Verify API responses

## Prevention Strategies

### 1. Pre-deployment Checks
```bash
# Add to package.json scripts
"predeploy": "npm run build && npm run test",
"test": "echo 'Add your tests here'"
```

### 2. Environment Validation
```typescript
// Add to your app initialization
const apiUrl = import.meta.env.VITE_API_URL;
if (!apiUrl) {
  console.error('VITE_API_URL environment variable is not set');
}
```

### 3. Error Boundaries
```typescript
// Add React error boundaries to catch runtime errors
import { ErrorBoundary } from 'react-error-boundary';

function ErrorFallback({error}: {error: Error}) {
  return (
    <div role="alert">
      <h2>Something went wrong:</h2>
      <pre>{error.message}</pre>
    </div>
  );
}
```

## Monitoring and Alerts

### 1. Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor Core Web Vitals
- Track error rates

### 2. Custom Error Tracking
```typescript
// Add error tracking
window.addEventListener('error', (event) => {
  console.error('Global error:', event.error);
  // Send to your error tracking service
});
```

### 3. Health Checks
```typescript
// Add health check endpoint
export const healthCheck = async () => {
  try {
    const response = await fetch(`${BASE}/health`);
    return response.ok;
  } catch {
    return false;
  }
};
```

## Quick Fixes for Common Issues

### Issue: Build fails with TypeScript errors
```bash
# Fix TypeScript errors
cd web-new
npx tsc --noEmit
# Fix any reported errors
```

### Issue: CORS errors
```python
# In your backend (api/app/main.py)
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-app.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### Issue: Environment variables not working
```bash
# In Vercel dashboard:
# Settings → Environment Variables
# Add: VITE_API_URL = https://your-backend-url.onrender.com
# Redeploy
```

### Issue: Static assets not loading
```typescript
// In vite.config.ts - ensure proper base path
export default defineConfig({
  base: './', // or your subdirectory path
  // ... rest of config
});
```

## Emergency Rollback

If deployment fails:
1. Go to Vercel dashboard
2. Navigate to Deployments
3. Find last working deployment
4. Click "Promote to Production"
5. Investigate the failed deployment

## Getting Help

1. **Vercel Documentation**: https://vercel.com/docs
2. **Vercel Community**: https://github.com/vercel/vercel/discussions
3. **Check Function Logs**: In Vercel dashboard under your deployment
4. **Test Locally**: Always test build process locally first

## Best Practices

1. **Always test locally** before deploying
2. **Use environment variables** for configuration
3. **Implement proper error handling**
4. **Monitor your deployments**
5. **Keep dependencies updated**
6. **Use TypeScript** for better error catching
7. **Implement health checks**
8. **Set up proper logging**
