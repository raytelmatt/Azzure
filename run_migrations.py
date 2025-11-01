from app import app, db, User
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
            
            # Create initial admin user if it doesn't exist
            admin_user = User.query.filter_by(username='iahmatt').first()
            if not admin_user:
                print("MIGRATION: Creating initial admin user 'iahmatt'...")
                admin_user = User(username='iahmatt', email='iahmatt@entuq.com')
                admin_user.set_password('raffle')
                db.session.add(admin_user)
                db.session.commit()
                print("MIGRATION: Admin user created successfully!")
            else:
                print("MIGRATION: Admin user 'iahmatt' already exists")
            
            return True
    except Exception as e:
        print(f"MIGRATION ERROR: Error creating tables: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = run_migrations()
    sys.exit(0 if success else 1)

