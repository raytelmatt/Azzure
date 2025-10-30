# Database Reset Issue - Fix Required

Your entities disappeared because Railway is using temporary storage that gets wiped on each redeploy.

## Quick Fix: Add PostgreSQL Database

1. Go to https://railway.app/project
2. Click on your Azzure project
3. Click **"+ New"** → **"Database"** → **"Add PostgreSQL"**
4. Railway will automatically:
   - Create a PostgreSQL database
   - Set `DATABASE_URL` environment variable
   - Make data persist across deployments

## Why This Happened

- Without `DATABASE_URL`, the app uses SQLite (`entity_tracker.db`)
- SQLite files are stored in the container filesystem
- Railway containers are ephemeral - they reset on each deploy
- Your data was lost when the container restarted

## After Adding PostgreSQL

Once you add the database:
- Railway will automatically set the `DATABASE_URL` environment variable
- Your app will connect to persistent PostgreSQL
- All future data will survive deployments
- The app will automatically recreate tables on first connection

## Verify It's Working

After adding the database and redeploying, check:
```bash
curl https://web-production-f68b3.up.railway.app/api/entities
```

This should now show your entities and persist them across deployments.

