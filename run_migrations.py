from app import app, db
import sys
import os

def run_migrations():
    """Run database migrations on deployment"""
    try:
        # Log database connection
        database_url = os.getenv('DATABASE_URL', 'NOT_SET')
        print(f"MIGRATION: Database URL configured: {database_url[:50]}...")
        
        with app.app_context():
            # Try to create all tables
            print("MIGRATION: Creating database tables...")
            db.create_all()
            print("MIGRATION: Database tables created successfully!")
            
            # List created tables
            from sqlalchemy import inspect
            inspector = inspect(db.engine)
            tables = inspector.get_table_names()
            print(f"MIGRATION: Created tables: {tables}")
            
            return True
    except Exception as e:
        print(f"MIGRATION ERROR: Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = run_migrations()
    sys.exit(0 if success else 1)

