# Deployment Guide

Your entity tracking app is ready to deploy. Choose one of these options:

## Option 1: Railway (Fastest & Easiest)

1. **Push to GitHub:**
```bash
git remote add origin <your-github-repo-url>
git branch -M main
git push -u origin main
```

2. Go to [railway.app](https://railway.app) and sign in with GitHub

3. Click "New Project" → "Deploy from GitHub repo"

4. Select your repository

5. Click "Add Database" → "PostgreSQL"

6. Railway automatically detects your config and deploys

**Done!** Your app will be live at `https://your-app.up.railway.app`

## Option 2: Render

1. **Push to GitHub** (same as step 1 above)

2. Go to [render.com](https://render.com) and sign in with GitHub

3. Click "New +" → "Web Service"

4. Connect your GitHub repository

5. Render auto-detects `render.yaml` and creates the database

**Done!** Your app will be live at `https://entity-tracker.onrender.com`

## Option 3: Heroku

1. **Install Heroku CLI:**
```bash
brew install heroku/brew/heroku
```

2. **Login:**
```bash
heroku login
```

3. **Create app:**
```bash
heroku create your-app-name
```

4. **Add PostgreSQL:**
```bash
heroku addons:create heroku-postgresql:mini
```

5. **Deploy:**
```bash
git push heroku main
```

6. **Open app:**
```bash
heroku open
```

## Verify Deployment

Once deployed, visit your app URL and check:
- Root: `https://your-app.com/` (should show API info)
- Health: `https://your-app.com/api/health` (should return `{"status":"healthy"}`)

## Environment Variables

All platforms automatically set `DATABASE_URL` when you add a PostgreSQL database. No manual configuration needed.

## Need Help?

- Railway docs: https://docs.railway.app
- Render docs: https://render.com/docs
- Heroku docs: https://devcenter.heroku.com

