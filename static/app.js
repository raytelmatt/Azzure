const API_URL = 'https://web-production-f68b3.up.railway.app/api';

let selectedEntityId = null;

// Load entities on page load
document.addEventListener('DOMContentLoaded', () => {
    loadEntities();
});

async function loadEntities() {
    try {
        const response = await fetch(`${API_URL}/entities`);
        const entities = await response.json();
        displayEntities(entities);
    } catch (error) {
        console.error('Error loading entities:', error);
        document.getElementById('entities-list').innerHTML = '<p class="empty-state">Error loading entities</p>';
    }
}

function displayEntities(entities) {
    const container = document.getElementById('entities-list');
    
    if (entities.length === 0) {
        container.innerHTML = '<p class="empty-state">No entities yet. Create one!</p>';
        return;
    }
    
    container.innerHTML = entities.map(entity => `
        <div class="entity-item" onclick="selectEntity(${entity.id})">
            <h3>${escapeHtml(entity.name)}</h3>
            <p>${escapeHtml(entity.description || 'No description')}</p>
        </div>
    `).join('');
}

async function selectEntity(id) {
    selectedEntityId = id;
    
    // Update active state
    document.querySelectorAll('.entity-item').forEach(item => {
        item.classList.remove('active');
    });
    event.currentTarget.classList.add('active');
    
    // Load entity details
    try {
        const response = await fetch(`${API_URL}/entities/${id}`);
        const entity = await response.json();
        displayEntityDetails(entity);
    } catch (error) {
        console.error('Error loading entity:', error);
        document.getElementById('entity-details').innerHTML = '<p>Error loading entity details</p>';
    }
}

function displayEntityDetails(entity) {
    const container = document.getElementById('entity-details');
    const welcome = document.getElementById('welcome');
    
    welcome.style.display = 'none';
    container.style.display = 'block';
    
    container.innerHTML = `
        <div class="entity-header">
            <h2>${escapeHtml(entity.name)}</h2>
            <p>${escapeHtml(entity.description || 'No description')}</p>
            <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                ${entity.ein ? `<p><strong>EIN:</strong> ${escapeHtml(entity.ein)}</p>` : ''}
                ${entity.state_of_incorporation ? `<p><strong>State:</strong> ${escapeHtml(entity.state_of_incorporation)}</p>` : ''}
                ${entity.date_of_incorporation ? `<p><strong>Incorporated:</strong> ${escapeHtml(entity.date_of_incorporation)}</p>` : ''}
                ${entity.status ? `<p><strong>Status:</strong> <span style="padding: 4px 12px; border-radius: 4px; background: ${entity.status === 'active' ? '#d4edda' : entity.status === 'inactive' ? '#fff3cd' : '#f8d7da'}; color: ${entity.status === 'active' ? '#155724' : entity.status === 'inactive' ? '#856404' : '#721c24'};">${escapeHtml(entity.status).toUpperCase()}</span></p>` : ''}
            </div>
            ${entity.registered_address ? `<p style="margin-top: 5px;"><strong>Address:</strong> ${escapeHtml(entity.registered_address)}</p>` : ''}
            ${entity.registered_phone ? `<p style="margin-top: 5px;"><strong>Phone:</strong> ${escapeHtml(entity.registered_phone)}</p>` : ''}
        </div>
        
        <div class="section">
            <h3>💳 Accounts (${entity.accounts.length})</h3>
            ${entity.accounts.length > 0 ? entity.accounts.map(acc => `
                <div class="item-card">
                    <h4>${escapeHtml(acc.account_name)}</h4>
                    <p><strong>Type:</strong> ${escapeHtml(acc.account_type || 'N/A')} | 
                       <strong>Balance:</strong> $${acc.balance.toLocaleString()}</p>
                    <p><strong>Account #:</strong> ${escapeHtml(acc.account_number || 'N/A')}</p>
                </div>
            `).join('') : '<p class="empty-state">No accounts yet</p>'}
            <button class="btn-primary" onclick="alert('Add account feature coming soon')">+ Add Account</button>
        </div>
        
        <div class="section">
            <h3>📋 Tasks (${entity.tasks.length})</h3>
            ${entity.tasks.length > 0 ? entity.tasks.map(task => `
                <div class="item-card">
                    <h4>${escapeHtml(task.title)}</h4>
                    <p><strong>Status:</strong> ${escapeHtml(task.status)} | 
                       <strong>Priority:</strong> ${escapeHtml(task.priority || 'N/A')}</p>
                    <p>${escapeHtml(task.description || 'No description')}</p>
                </div>
            `).join('') : '<p class="empty-state">No tasks yet</p>'}
            <button class="btn-primary" onclick="alert('Add task feature coming soon')">+ Add Task</button>
        </div>
        
        <div class="section">
            <h3>📄 Documents (${entity.documents.length})</h3>
            ${entity.documents.length > 0 ? entity.documents.map(doc => `
                <div class="item-card">
                    <h4>${escapeHtml(doc.title)}</h4>
                    <p><strong>Type:</strong> ${escapeHtml(doc.document_type || 'N/A')}</p>
                    <p><strong>Path:</strong> ${escapeHtml(doc.file_path || 'N/A')}</p>
                </div>
            `).join('') : '<p class="empty-state">No documents yet</p>'}
            <button class="btn-primary" onclick="alert('Add document feature coming soon')">+ Add Document</button>
        </div>
    `;
}

function showCreateEntityForm() {
    document.getElementById('create-modal').style.display = 'block';
}

function closeModal() {
    document.getElementById('create-modal').style.display = 'none';
}

async function createEntity(event) {
    event.preventDefault();
    
    const name = document.getElementById('entity-name').value;
    const description = document.getElementById('entity-description').value;
    const ein = document.getElementById('entity-ein').value;
    const state = document.getElementById('entity-state').value;
    const date = document.getElementById('entity-date').value;
    const address = document.getElementById('entity-address').value;
    const phone = document.getElementById('entity-phone').value;
    const status = document.getElementById('entity-status').value;
    
    try {
        const response = await fetch(`${API_URL}/entities`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                name, description, ein, state_of_incorporation: state, 
                date_of_incorporation: date, registered_address: address, 
                registered_phone: phone, status 
            })
        });
        
        if (response.ok) {
            closeModal();
            document.getElementById('entity-name').value = '';
            document.getElementById('entity-description').value = '';
            document.getElementById('entity-ein').value = '';
            document.getElementById('entity-state').value = '';
            document.getElementById('entity-date').value = '';
            document.getElementById('entity-address').value = '';
            document.getElementById('entity-phone').value = '';
            loadEntities();
        } else {
            alert('Error creating entity');
        }
    } catch (error) {
        console.error('Error creating entity:', error);
        alert('Error creating entity');
    }
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('create-modal');
    if (event.target == modal) {
        closeModal();
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

