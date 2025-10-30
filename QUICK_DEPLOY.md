# Quick Deploy to Railway

✅ **GitHub Repository Created:** https://github.com/raytelmatt/Azzure

## Deploy Now (5 minutes)

Railway web interface should have opened in your browser. Follow these steps:

### 1. Connect GitHub
- Click "Deploy from GitHub repo"
- Authorize Railway to access your GitHub
- Select **Azzure** repository

### 2. Add Database
- In your Railway project, click "New"
- Select "Database" → "Add PostgreSQL"
- Railway will automatically connect it

### 3. Deploy
- Railway auto-detects your Python app
- Click "Deploy" or wait for auto-deploy
- It will use your `Procfile` and `requirements.txt`

### 4. Get Your URL
- Railway provides a public URL like `https://azzure-production.up.railway.app`
- Click "Settings" → "Generate Domain" for a custom domain (optional)

## Test Your Deployment

Once deployed, test with:

```bash
curl https://your-app.up.railway.app/api/health
```

Should return: `{"status":"healthy"}`

## Manual Instructions

If the browser didn't open:
1. Go to https://railway.app/new
2. Click "Deploy from GitHub"
3. Select the "raytelmatt/Azzure" repository
4. Add a PostgreSQL database
5. Deploy!

## What Railway Configures Automatically

- ✅ Detects Python runtime from `runtime.txt`
- ✅ Installs dependencies from `requirements.txt`
- ✅ Runs gunicorn from `Procfile`
- ✅ Sets `DATABASE_URL` for PostgreSQL
- ✅ Handles PostgreSQL URL conversion
- ✅ Creates tables on first run

## Troubleshooting

**Build fails:**
- Check Railway logs in the dashboard
- Ensure all dependencies are in `requirements.txt`

**Database connection error:**
- Verify PostgreSQL database is added
- Check `DATABASE_URL` environment variable in Railway settings

**Need help?**
- Railway docs: https://docs.railway.app
- Check logs: Railway dashboard → Deployments → View logs

