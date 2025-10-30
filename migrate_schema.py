from app import app, db
from sqlalchemy import text

def migrate_database():
    with app.app_context():
        try:
            # Check if Account table exists and get its columns
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'account'
            """))
            existing_columns = {row[0] for row in result}
            
            print(f"Existing columns: {existing_columns}")
            
            # Add missing columns for Account
            if 'username' not in existing_columns:
                print("Adding username column to Account...")
                db.session.execute(text("ALTER TABLE account ADD COLUMN username VARCHAR(100)"))
            
            if 'password' not in existing_columns:
                print("Adding password column to Account...")
                db.session.execute(text("ALTER TABLE account ADD COLUMN password TEXT"))
            
            if 'account_url' not in existing_columns:
                print("Adding account_url column to Account...")
                db.session.execute(text("ALTER TABLE account ADD COLUMN account_url VARCHAR(500)"))
            
            if 'notes' not in existing_columns:
                print("Adding notes column to Account...")
                db.session.execute(text("ALTER TABLE account ADD COLUMN notes TEXT"))
            
            # Check Task table
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'task'
            """))
            existing_task_columns = {row[0] for row in result}
            
            print(f"Existing Task columns: {existing_task_columns}")
            
            # Add missing columns for Task
            if 'category' not in existing_task_columns:
                print("Adding category column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN category VARCHAR(100)"))
            
            if 'assigned_to' not in existing_task_columns:
                print("Adding assigned_to column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN assigned_to VARCHAR(100)"))
            
            if 'estimated_hours' not in existing_task_columns:
                print("Adding estimated_hours column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN estimated_hours FLOAT"))
            
            if 'actual_hours' not in existing_task_columns:
                print("Adding actual_hours column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN actual_hours FLOAT"))
            
            if 'start_date' not in existing_task_columns:
                print("Adding start_date column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN start_date DATE"))
            
            if 'completion_date' not in existing_task_columns:
                print("Adding completion_date column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN completion_date DATE"))
            
            if 'dependencies' not in existing_task_columns:
                print("Adding dependencies column to Task...")
                db.session.execute(text("ALTER TABLE task ADD COLUMN dependencies TEXT"))
            
            # Check Entity table
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'entity'
            """))
            existing_entity_columns = {row[0] for row in result}
            
            print(f"Existing Entity columns: {existing_entity_columns}")
            
            # Add missing columns for Entity
            if 'ein' not in existing_entity_columns:
                print("Adding ein column to Entity...")
                db.session.execute(text("ALTER TABLE entity ADD COLUMN ein VARCHAR(50)"))
            
            if 'registered_address' not in existing_entity_columns:
                print("Adding registered_address column to Entity...")
                db.session.execute(text("ALTER TABLE entity ADD COLUMN registered_address VARCHAR(500)"))
            
            if 'registered_phone' not in existing_entity_columns:
                print("Adding registered_phone column to Entity...")
                db.session.execute(text("ALTER TABLE entity ADD COLUMN registered_phone VARCHAR(50)"))
            
            if 'state_of_incorporation' not in existing_entity_columns:
                print("Adding state_of_incorporation column to Entity...")
                db.session.execute(text("ALTER TABLE entity ADD COLUMN state_of_incorporation VARCHAR(100)"))
            
            if 'status' not in existing_entity_columns:
                print("Adding status column to Entity...")
                db.session.execute(text("ALTER TABLE entity ADD COLUMN status VARCHAR(50) DEFAULT 'active'"))
            
            if 'date_of_incorporation' not in existing_entity_columns:
                print("Adding date_of_incorporation column to Entity...")
                db.session.execute(text("ALTER TABLE entity ADD COLUMN date_of_incorporation DATE"))
            
            # Check Document table
            result = db.session.execute(text("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name = 'document'
            """))
            existing_doc_columns = {row[0] for row in result}
            
            print(f"Existing Document columns: {existing_doc_columns}")
            
            # Add missing columns for Document
            if 'original_filename' not in existing_doc_columns:
                print("Adding original_filename column to Document...")
                db.session.execute(text("ALTER TABLE document ADD COLUMN original_filename VARCHAR(500)"))
            
            if 'file_size' not in existing_doc_columns:
                print("Adding file_size column to Document...")
                db.session.execute(text("ALTER TABLE document ADD COLUMN file_size INTEGER"))
            
            db.session.commit()
            print("Migration completed successfully!")
            
        except Exception as e:
            print(f"Migration error: {e}")
            db.session.rollback()
            # If tables don't exist yet, create them
            print("Creating tables from scratch...")
            db.create_all()
            print("Tables created successfully!")

if __name__ == '__main__':
    migrate_database()

