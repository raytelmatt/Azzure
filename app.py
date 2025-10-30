from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from flask_migrate import Migrate
from datetime import datetime
import os
from werkzeug.utils import secure_filename
import uuid
import json

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Database configuration
# Use the Railway PostgreSQL database URL
RAILWAY_POSTGRES_URL = 'postgresql://postgres:gxbCgcwLxaZRIrdiXnmZomSVimsdYdSj@mainline.proxy.rlwy.net:44233/railway'
DATABASE_URL = os.getenv('DATABASE_URL', RAILWAY_POSTGRES_URL)
# Handle PostgreSQL URL format for older drivers
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Log database configuration (for debugging - remove in production)
print(f"=== DATABASE CONFIGURATION ===")
print(f"Database URL: {DATABASE_URL[:50]}..." if len(DATABASE_URL) > 50 else DATABASE_URL)
print(f"Using PostgreSQL: {'postgresql://' in DATABASE_URL.lower() or 'postgres://' in DATABASE_URL.lower()}")
print(f"===============================")

db = SQLAlchemy(app)
migrate = Migrate(app, db)

# File upload configuration
UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif'}
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # 16MB max file size

# Create upload folder if it doesn't exist
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS



# Models
class Entity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    ein = db.Column(db.String(50))
    registered_address = db.Column(db.String(500))
    registered_phone = db.Column(db.String(50))
    state_of_incorporation = db.Column(db.String(100))
    status = db.Column(db.String(50), default='active')
    date_of_incorporation = db.Column(db.Date)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    accounts = db.relationship('Account', backref='entity', lazy=True, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='entity', lazy=True, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='entity', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'ein': self.ein,
            'registered_address': self.registered_address,
            'registered_phone': self.registered_phone,
            'state_of_incorporation': self.state_of_incorporation,
            'status': self.status,
            'date_of_incorporation': self.date_of_incorporation.isoformat() if self.date_of_incorporation else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entity.id'), nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(50))
    balance = db.Column(db.Float, default=0.0)
    account_type = db.Column(db.String(50))
    username = db.Column(db.String(100))
    password = db.Column(db.Text)
    account_url = db.Column(db.String(500))
    notes = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'entity_id': self.entity_id,
            'account_name': self.account_name,
            'account_number': self.account_number,
            'balance': self.balance,
            'account_type': self.account_type,
            'username': self.username,
            'password': self.password,
            'account_url': self.account_url,
            'notes': self.notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Task(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entity.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    status = db.Column(db.String(50), default='pending')
    priority = db.Column(db.String(50))
    due_date = db.Column(db.Date)
    category = db.Column(db.String(100))
    assigned_to = db.Column(db.String(100))
    estimated_hours = db.Column(db.Float)
    actual_hours = db.Column(db.Float)
    start_date = db.Column(db.Date)
    completion_date = db.Column(db.Date)
    dependencies = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'entity_id': self.entity_id,
            'title': self.title,
            'description': self.description,
            'status': self.status,
            'priority': self.priority,
            'due_date': self.due_date.isoformat() if self.due_date else None,
            'category': self.category,
            'assigned_to': self.assigned_to,
            'estimated_hours': self.estimated_hours,
            'actual_hours': self.actual_hours,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'completion_date': self.completion_date.isoformat() if self.completion_date else None,
            'dependencies': json.loads(self.dependencies) if self.dependencies else None,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entity.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(500))
    original_filename = db.Column(db.String(500))
    document_type = db.Column(db.String(100))
    file_size = db.Column(db.Integer)
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'entity_id': self.entity_id,
            'title': self.title,
            'file_path': self.file_path,
            'original_filename': self.original_filename,
            'document_type': self.document_type,
            'file_size': self.file_size,
            'uploaded_at': self.uploaded_at.isoformat() if self.uploaded_at else None
        }


# Entity endpoints
@app.route('/api/entities', methods=['GET'])
def get_entities():
    entities = Entity.query.all()
    return jsonify([e.to_dict() for e in entities])


@app.route('/api/entities/<int:entity_id>', methods=['GET'])
def get_entity(entity_id):
    entity = Entity.query.get_or_404(entity_id)
    result = entity.to_dict()
    result['accounts'] = [a.to_dict() for a in entity.accounts]
    result['tasks'] = [t.to_dict() for t in entity.tasks]
    result['documents'] = [d.to_dict() for d in entity.documents]
    return jsonify(result)


@app.route('/api/entities', methods=['POST'])
def create_entity():
    data = request.json
    incorporation_date = datetime.strptime(data['date_of_incorporation'], '%Y-%m-%d').date() if data.get('date_of_incorporation') else None
    entity = Entity(
        name=data['name'],
        description=data.get('description'),
        ein=data.get('ein'),
        registered_address=data.get('registered_address'),
        registered_phone=data.get('registered_phone'),
        state_of_incorporation=data.get('state_of_incorporation'),
        status=data.get('status', 'active'),
        date_of_incorporation=incorporation_date
    )
    db.session.add(entity)
    db.session.commit()
    return jsonify(entity.to_dict()), 201


@app.route('/api/entities/<int:entity_id>', methods=['PUT'])
def update_entity(entity_id):
    entity = Entity.query.get_or_404(entity_id)
    data = request.json
    entity.name = data.get('name', entity.name)
    entity.description = data.get('description', entity.description)
    entity.ein = data.get('ein', entity.ein)
    entity.registered_address = data.get('registered_address', entity.registered_address)
    entity.registered_phone = data.get('registered_phone', entity.registered_phone)
    entity.state_of_incorporation = data.get('state_of_incorporation', entity.state_of_incorporation)
    entity.status = data.get('status', entity.status)
    if data.get('date_of_incorporation'):
        entity.date_of_incorporation = datetime.strptime(data['date_of_incorporation'], '%Y-%m-%d').date()
    db.session.commit()
    return jsonify(entity.to_dict())


@app.route('/api/entities/<int:entity_id>', methods=['DELETE'])
def delete_entity(entity_id):
    entity = Entity.query.get_or_404(entity_id)
    db.session.delete(entity)
    db.session.commit()
    return '', 204


# Account endpoints
@app.route('/api/entities/<int:entity_id>/accounts', methods=['GET'])
def get_accounts(entity_id):
    entity = Entity.query.get_or_404(entity_id)
    return jsonify([a.to_dict() for a in entity.accounts])


@app.route('/api/entities/<int:entity_id>/accounts', methods=['POST'])
def create_account(entity_id):
    Entity.query.get_or_404(entity_id)
    data = request.json
    account = Account(
        entity_id=entity_id,
        account_name=data['account_name'],
        account_number=data.get('account_number'),
        balance=data.get('balance', 0.0),
        account_type=data.get('account_type'),
        username=data.get('username'),
        password=data.get('password'),
        account_url=data.get('account_url'),
        notes=data.get('notes')
    )
    db.session.add(account)
    db.session.commit()
    return jsonify(account.to_dict()), 201


@app.route('/api/accounts/<int:account_id>', methods=['GET'])
def get_account(account_id):
    account = Account.query.get_or_404(account_id)
    return jsonify(account.to_dict())


@app.route('/api/accounts/<int:account_id>', methods=['PUT'])
def update_account(account_id):
    account = Account.query.get_or_404(account_id)
    data = request.json
    account.account_name = data.get('account_name', account.account_name)
    account.account_number = data.get('account_number', account.account_number)
    account.balance = data.get('balance', account.balance)
    account.account_type = data.get('account_type', account.account_type)
    account.username = data.get('username', account.username)
    if data.get('password'):
        account.password = data['password']
    account.account_url = data.get('account_url', account.account_url)
    account.notes = data.get('notes', account.notes)
    db.session.commit()
    return jsonify(account.to_dict())


@app.route('/api/accounts/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    account = Account.query.get_or_404(account_id)
    db.session.delete(account)
    db.session.commit()
    return '', 204


# Task endpoints
@app.route('/api/entities/<int:entity_id>/tasks', methods=['GET'])
def get_tasks(entity_id):
    entity = Entity.query.get_or_404(entity_id)
    return jsonify([t.to_dict() for t in entity.tasks])


@app.route('/api/entities/<int:entity_id>/tasks', methods=['POST'])
def create_task(entity_id):
    Entity.query.get_or_404(entity_id)
    data = request.json
    due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date() if data.get('due_date') else None
    start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date() if data.get('start_date') else None
    completion_date = datetime.strptime(data['completion_date'], '%Y-%m-%d').date() if data.get('completion_date') else None
    dependencies_json = json.dumps(data.get('dependencies')) if data.get('dependencies') else None
    task = Task(
        entity_id=entity_id,
        title=data['title'],
        description=data.get('description'),
        status=data.get('status', 'pending'),
        priority=data.get('priority'),
        due_date=due_date,
        category=data.get('category'),
        assigned_to=data.get('assigned_to'),
        estimated_hours=data.get('estimated_hours'),
        actual_hours=data.get('actual_hours'),
        start_date=start_date,
        completion_date=completion_date,
        dependencies=dependencies_json
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route('/api/tasks/<int:task_id>', methods=['GET'])
def get_task(task_id):
    task = Task.query.get_or_404(task_id)
    return jsonify(task.to_dict())


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)
    task.category = data.get('category', task.category)
    task.assigned_to = data.get('assigned_to', task.assigned_to)
    task.estimated_hours = data.get('estimated_hours', task.estimated_hours)
    task.actual_hours = data.get('actual_hours', task.actual_hours)
    if data.get('due_date'):
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
    if data.get('start_date'):
        task.start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    if data.get('completion_date'):
        task.completion_date = datetime.strptime(data['completion_date'], '%Y-%m-%d').date()
    if data.get('dependencies'):
        task.dependencies = json.dumps(data['dependencies'])
    db.session.commit()
    return jsonify(task.to_dict())


@app.route('/api/tasks/<int:task_id>', methods=['DELETE'])
def delete_task(task_id):
    task = Task.query.get_or_404(task_id)
    db.session.delete(task)
    db.session.commit()
    return '', 204


# Document endpoints
@app.route('/api/entities/<int:entity_id>/documents', methods=['GET'])
def get_documents(entity_id):
    entity = Entity.query.get_or_404(entity_id)
    return jsonify([d.to_dict() for d in entity.documents])


@app.route('/api/entities/<int:entity_id>/documents', methods=['POST'])
def upload_document(entity_id):
    Entity.query.get_or_404(entity_id)
    
    if 'file' not in request.files:
        return jsonify({'error': 'No file provided'}), 400
    
    file = request.files['file']
    title = request.form.get('title', file.filename)
    document_type = request.form.get('document_type', '')
    
    if file.filename == '':
        return jsonify({'error': 'No file selected'}), 400
    
    if file and allowed_file(file.filename):
        # Generate unique filename
        ext = file.filename.rsplit('.', 1)[1].lower()
        filename = f"{uuid.uuid4()}.{ext}"
        filepath = os.path.join(UPLOAD_FOLDER, filename)
        file.save(filepath)
        
        # Get file size
        file_size = os.path.getsize(filepath)
        
        # Create document record
        document = Document(
            entity_id=entity_id,
            title=title,
            file_path=filepath,
            original_filename=file.filename,
            document_type=document_type,
            file_size=file_size
        )
        db.session.add(document)
        db.session.commit()
        return jsonify(document.to_dict()), 201
    
    return jsonify({'error': 'File type not allowed'}), 400


@app.route('/api/documents/<int:document_id>', methods=['PUT'])
def update_document(document_id):
    document = Document.query.get_or_404(document_id)
    data = request.json
    document.title = data.get('title', document.title)
    document.document_type = data.get('document_type', document.document_type)
    db.session.commit()
    return jsonify(document.to_dict())


@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    # Delete file from filesystem
    if document.file_path and os.path.exists(document.file_path):
        os.remove(document.file_path)
    
    db.session.delete(document)
    db.session.commit()
    return '', 204


@app.route('/api/documents/<int:document_id>/download', methods=['GET'])
def download_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    if not document.file_path or not os.path.exists(document.file_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_from_directory(
        os.path.dirname(document.file_path),
        os.path.basename(document.file_path),
        download_name=document.original_filename or document.title,
        as_attachment=True
    )


@app.route('/api/documents/<int:document_id>/view', methods=['GET'])
def view_document(document_id):
    document = Document.query.get_or_404(document_id)
    
    if not document.file_path or not os.path.exists(document.file_path):
        return jsonify({'error': 'File not found'}), 404
    
    return send_from_directory(
        os.path.dirname(document.file_path),
        os.path.basename(document.file_path),
        as_attachment=False
    )


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})


# Serve static files
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


@app.route('/uploads/<filename>')
def serve_upload(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)


@app.route('/api/info', methods=['GET'])
def api_info():
    return jsonify({
        'message': 'Entity Tracking API',
        'version': '1.0.0',
        'endpoints': {
            'entities': '/api/entities',
            'health': '/api/health'
        }
    })


# Initialize database
with app.app_context():
    db.create_all()
    print("Database tables initialized")


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(debug=False, host='0.0.0.0', port=port)
