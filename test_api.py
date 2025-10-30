import requests
import json

BASE_URL = 'http://localhost:8000/api'

def test_api():
    print("Testing Entity Tracking API\n")
    
    # Create entity
    print("1. Creating entity...")
    entity_data = {
        "name": "Acme Corporation",
        "description": "A technology company"
    }
    response = requests.post(f"{BASE_URL}/entities", json=entity_data)
    entity = response.json()
    entity_id = entity['id']
    print(f"Created entity: {entity['name']} (ID: {entity_id})\n")
    
    # Create account
    print("2. Creating account...")
    account_data = {
        "account_name": "Main Checking",
        "account_number": "CHK001",
        "balance": 50000.00,
        "account_type": "checking"
    }
    response = requests.post(f"{BASE_URL}/entities/{entity_id}/accounts", json=account_data)
    account = response.json()
    print(f"Created account: {account['account_name']} (Balance: ${account['balance']})\n")
    
    # Create task
    print("3. Creating task...")
    task_data = {
        "title": "Review quarterly report",
        "description": "Review and approve Q4 financial report",
        "status": "pending",
        "priority": "high",
        "due_date": "2024-12-31"
    }
    response = requests.post(f"{BASE_URL}/entities/{entity_id}/tasks", json=task_data)
    task = response.json()
    print(f"Created task: {task['title']} (Status: {task['status']})\n")
    
    # Create document
    print("4. Creating document...")
    doc_data = {
        "title": "License Agreement",
        "file_path": "/docs/license.pdf",
        "document_type": "legal"
    }
    response = requests.post(f"{BASE_URL}/entities/{entity_id}/documents", json=doc_data)
    document = response.json()
    print(f"Created document: {document['title']}\n")
    
    # Get full entity details
    print("5. Retrieving entity with all related data...")
    response = requests.get(f"{BASE_URL}/entities/{entity_id}")
    full_entity = response.json()
    print(f"Entity: {full_entity['name']}")
    print(f"  Accounts: {len(full_entity['accounts'])}")
    print(f"  Tasks: {len(full_entity['tasks'])}")
    print(f"  Documents: {len(full_entity['documents'])}\n")
    
    print("API test completed successfully!")

if __name__ == '__main__':
    try:
        test_api()
    except requests.exceptions.ConnectionError:
        print("Error: Could not connect to API. Make sure the Flask app is running.")
    except Exception as e:
        print(f"Error: {e}")

