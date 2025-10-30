# Entity Tracking App

A Flask-based REST API for tracking entities, their accounts, tasks, and documents.

## Features

- **Entities**: Core entities to track
- **Accounts**: Financial accounts associated with entities
- **Tasks**: Tasks and to-dos for each entity
- **Documents**: Document management per entity

## Setup

1. Install dependencies:
```bash
pip install -r requirements.txt
```

2. Run the app:
```bash
python app.py
```

3. API will be available at `http://localhost:8000`

## Database Configuration

By default, the app uses SQLite. For production hosting with PostgreSQL:

Set the `DATABASE_URL` environment variable:
```bash
export DATABASE_URL='postgresql://user:password@host:port/database'
```

Or create a `.env` file:
```
DATABASE_URL=postgresql://user:password@host:port/database
```

## API Endpoints

### Entities
- `GET /api/entities` - List all entities
- `GET /api/entities/<id>` - Get entity with all related data
- `POST /api/entities` - Create entity
- `PUT /api/entities/<id>` - Update entity
- `DELETE /api/entities/<id>` - Delete entity

### Accounts
- `GET /api/entities/<id>/accounts` - List accounts for entity
- `POST /api/entities/<id>/accounts` - Create account
- `PUT /api/accounts/<id>` - Update account
- `DELETE /api/accounts/<id>` - Delete account

### Tasks
- `GET /api/entities/<id>/tasks` - List tasks for entity
- `POST /api/entities/<id>/tasks` - Create task
- `PUT /api/tasks/<id>` - Update task
- `DELETE /api/tasks/<id>` - Delete task

### Documents
- `GET /api/entities/<id>/documents` - List documents for entity
- `POST /api/entities/<id>/documents` - Create document
- `PUT /api/documents/<id>` - Update document
- `DELETE /api/documents/<id>` - Delete document

## Example Usage

Create an entity:
```bash
curl -X POST http://localhost:8000/api/entities \
  -H "Content-Type: application/json" \
  -d '{"name": "Acme Corp", "description": "Technology company"}'
```

Add a task:
```bash
curl -X POST http://localhost:8000/api/entities/1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Review contract", "status": "pending", "priority": "high"}'
```

## Deployment

### Railway (Recommended)

1. Push to GitHub
2. Go to [railway.app](https://railway.app) and create new project
3. Deploy from GitHub repo
4. Add PostgreSQL database
5. Railway auto-detects config

### Render

1. Push to GitHub
2. Go to [render.com](https://render.com) and create new Web Service
3. Connect to GitHub repo
4. Render auto-detects `render.yaml` config
5. Creates PostgreSQL database automatically

### Heroku

1. Install Heroku CLI: `brew install heroku/brew/heroku`
2. Login: `heroku login`
3. Create app: `heroku create your-app-name`
4. Add PostgreSQL: `heroku addons:create heroku-postgresql:mini`
5. Deploy: `git push heroku main`

### Environment Variables

Set `DATABASE_URL` to your PostgreSQL connection string. All platforms provide this automatically when you add a database.

