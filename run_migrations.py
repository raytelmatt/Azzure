from app import app, db
import sys

def run_migrations():
    """Run database migrations on deployment"""
    try:
        with app.app_context():
            # Try to create all tables
            print("Creating database tables...")
            db.create_all()
            print("Database tables created successfully!")
            return True
    except Exception as e:
        print(f"Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = run_migrations()
    sys.exit(0 if success else 1)

