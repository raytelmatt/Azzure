from flask import Flask, request, jsonify, send_from_directory
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from datetime import datetime
import os

app = Flask(__name__, static_folder='static', static_url_path='')
CORS(app)

# Database configuration
DATABASE_URL = os.getenv('DATABASE_URL', 'sqlite:///entity_tracker.db')
# Handle PostgreSQL URL format for older drivers
if DATABASE_URL.startswith('postgres://'):
    DATABASE_URL = DATABASE_URL.replace('postgres://', 'postgresql://', 1)
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)


# Models
class Entity(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    accounts = db.relationship('Account', backref='entity', lazy=True, cascade='all, delete-orphan')
    tasks = db.relationship('Task', backref='entity', lazy=True, cascade='all, delete-orphan')
    documents = db.relationship('Document', backref='entity', lazy=True, cascade='all, delete-orphan')
    
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'description': self.description,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Account(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entity.id'), nullable=False)
    account_name = db.Column(db.String(100), nullable=False)
    account_number = db.Column(db.String(50))
    balance = db.Column(db.Float, default=0.0)
    account_type = db.Column(db.String(50))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'entity_id': self.entity_id,
            'account_name': self.account_name,
            'account_number': self.account_number,
            'balance': self.balance,
            'account_type': self.account_type,
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
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Document(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    entity_id = db.Column(db.Integer, db.ForeignKey('entity.id'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    file_path = db.Column(db.String(500))
    document_type = db.Column(db.String(100))
    uploaded_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def to_dict(self):
        return {
            'id': self.id,
            'entity_id': self.entity_id,
            'title': self.title,
            'file_path': self.file_path,
            'document_type': self.document_type,
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
    entity = Entity(
        name=data['name'],
        description=data.get('description')
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
        account_type=data.get('account_type')
    )
    db.session.add(account)
    db.session.commit()
    return jsonify(account.to_dict()), 201


@app.route('/api/accounts/<int:account_id>', methods=['PUT'])
def update_account(account_id):
    account = Account.query.get_or_404(account_id)
    data = request.json
    account.account_name = data.get('account_name', account.account_name)
    account.account_number = data.get('account_number', account.account_number)
    account.balance = data.get('balance', account.balance)
    account.account_type = data.get('account_type', account.account_type)
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
    task = Task(
        entity_id=entity_id,
        title=data['title'],
        description=data.get('description'),
        status=data.get('status', 'pending'),
        priority=data.get('priority'),
        due_date=due_date
    )
    db.session.add(task)
    db.session.commit()
    return jsonify(task.to_dict()), 201


@app.route('/api/tasks/<int:task_id>', methods=['PUT'])
def update_task(task_id):
    task = Task.query.get_or_404(task_id)
    data = request.json
    task.title = data.get('title', task.title)
    task.description = data.get('description', task.description)
    task.status = data.get('status', task.status)
    task.priority = data.get('priority', task.priority)
    if data.get('due_date'):
        task.due_date = datetime.strptime(data['due_date'], '%Y-%m-%d').date()
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
def create_document(entity_id):
    Entity.query.get_or_404(entity_id)
    data = request.json
    document = Document(
        entity_id=entity_id,
        title=data['title'],
        file_path=data.get('file_path'),
        document_type=data.get('document_type')
    )
    db.session.add(document)
    db.session.commit()
    return jsonify(document.to_dict()), 201


@app.route('/api/documents/<int:document_id>', methods=['PUT'])
def update_document(document_id):
    document = Document.query.get_or_404(document_id)
    data = request.json
    document.title = data.get('title', document.title)
    document.file_path = data.get('file_path', document.file_path)
    document.document_type = data.get('document_type', document.document_type)
    db.session.commit()
    return jsonify(document.to_dict())


@app.route('/api/documents/<int:document_id>', methods=['DELETE'])
def delete_document(document_id):
    document = Document.query.get_or_404(document_id)
    db.session.delete(document)
    db.session.commit()
    return '', 204


@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({'status': 'healthy'})


# Serve static files
@app.route('/')
def index():
    return send_from_directory('static', 'index.html')


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


if __name__ == '__main__':
    port = int(os.environ.get('PORT', 8000))
    app.run(debug=False, host='0.0.0.0', port=port)
