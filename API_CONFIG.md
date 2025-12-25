# API Configuration Guide

## Overview

The frontend automatically detects the appropriate backend API URL based on the environment:

- **Local Development**: `http://127.0.0.1:8000` (Django dev server)
- **Production**: `https://esim-status-checker-backend.onrender.com`

## Environment Variables

You can override the auto-detection by setting the `REACT_APP_API_BASE_URL` environment variable:

### Local Development (.env.local)
```bash
# Override auto-detection (optional)
REACT_APP_API_BASE_URL=http://127.0.0.1:8000

# Or use localhost
REACT_APP_API_BASE_URL=http://localhost:8000
```

### Production (.env.production)
```bash
REACT_APP_API_BASE_URL=https://esim-status-checker-backend.onrender.com
```

## Auto-Detection Logic

The system uses the following logic to determine the API URL:

1. **Environment Variable**: If `REACT_APP_API_BASE_URL` is set, use it
2. **Hostname Detection**: 
   - If hostname is `localhost` or `127.0.0.1` → Use `http://127.0.0.1:8000`
   - Otherwise → Use production URL

## Development Setup

### Backend (Django)
```bash
cd esim_checker_backend
python manage.py runserver 127.0.0.1:8000
```

### Frontend (React)
```bash
cd esim_checker_frontend
npm start
# Runs on http://localhost:3000
```

The frontend will automatically connect to the Django backend at `http://127.0.0.1:8000`.

## CORS Configuration

The backend is configured to accept requests from:
- `http://localhost:3000` (React dev server)
- `http://127.0.0.1:3000` (React dev server)
- `http://localhost:3001` (Alternative port)
- `http://127.0.0.1:3001` (Alternative port)
- `https://checkmysim.com` (Production domain)
- `https://esim-checker-frontend.vercel.app` (Vercel deployment)

## Debugging

The API configuration includes debug logging in development mode. Check the browser console for:

```
🔧 API Configuration: {
  hostname: "localhost",
  apiBaseUrl: "http://127.0.0.1:8000",
  environment: "development",
  envVariable: "Not set"
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Ensure the Django backend is running and CORS is properly configured
2. **Connection Refused**: Check that the backend is running on the expected port
3. **Wrong API URL**: Verify the environment variable or auto-detection logic

### Manual Override

If auto-detection fails, you can manually set the API URL:

```bash
# In your terminal before starting React
export REACT_APP_API_BASE_URL=http://127.0.0.1:8000
npm start
```

Or create a `.env.local` file with:
```
REACT_APP_API_BASE_URL=http://127.0.0.1:8000
```