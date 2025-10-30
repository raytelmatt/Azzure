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
                <div class="item-card" style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <h4>${escapeHtml(doc.title)}</h4>
                        <p><strong>Type:</strong> ${escapeHtml(doc.document_type || 'N/A')}</p>
                        ${doc.original_filename ? `<p><strong>File:</strong> ${escapeHtml(doc.original_filename)}</p>` : ''}
                        ${doc.file_size ? `<p><strong>Size:</strong> ${formatFileSize(doc.file_size)}</p>` : ''}
                        ${doc.uploaded_at ? `<p><strong>Uploaded:</strong> ${new Date(doc.uploaded_at).toLocaleDateString()}</p>` : ''}
                    </div>
                    <div style="display: flex; gap: 10px;">
                        ${doc.file_path ? `<button onclick="viewDocument(${doc.id}, '${doc.title}')" style="padding: 8px 15px; background: #667eea; color: white; border: none; border-radius: 5px; cursor: pointer;">View</button>` : ''}
                        ${doc.file_path ? `<button onclick="downloadDocument(${doc.id})" style="padding: 8px 15px; background: #28a745; color: white; border: none; border-radius: 5px; cursor: pointer;">Download</button>` : ''}
                        <button onclick="deleteDocument(${doc.id})" style="padding: 8px 15px; background: #dc3545; color: white; border: none; border-radius: 5px; cursor: pointer;">Delete</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">No documents yet</p>'}
            <button class="btn-primary" onclick="showUploadModal(${entity.id})">+ Upload Document</button>
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

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatFileSize(bytes) {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function showUploadModal(entityId) {
    document.getElementById('upload-modal').style.display = 'block';
    document.getElementById('upload-modal').dataset.entityId = entityId;
}

function closeUploadModal() {
    document.getElementById('upload-modal').style.display = 'none';
}

async function uploadDocument(event) {
    event.preventDefault();
    
    const entityId = document.getElementById('upload-modal').dataset.entityId;
    const fileInput = document.getElementById('document-file');
    const title = document.getElementById('document-title').value || fileInput.files[0]?.name;
    const documentType = document.getElementById('document-type').value;
    
    if (!fileInput.files || !fileInput.files[0]) {
        alert('Please select a file');
        return;
    }
    
    const formData = new FormData();
    formData.append('file', fileInput.files[0]);
    formData.append('title', title);
    formData.append('document_type', documentType);
    
    try {
        const response = await fetch(`${API_URL}/entities/${entityId}/documents`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            closeUploadModal();
            document.getElementById('document-title').value = '';
            document.getElementById('document-type').value = '';
            document.getElementById('document-file').value = '';
            selectEntity(entityId);
        } else {
            const error = await response.json();
            alert('Error uploading document: ' + (error.error || 'Unknown error'));
        }
    } catch (error) {
        console.error('Error uploading document:', error);
        alert('Error uploading document');
    }
}

async function viewDocument(documentId, title) {
    const modal = document.getElementById('viewer-modal');
    modal.style.display = 'block';
    document.getElementById('viewer-title').textContent = title;
    document.getElementById('document-viewer').src = `${API_URL}/documents/${documentId}/download`;
}

function closeViewerModal() {
    document.getElementById('viewer-modal').style.display = 'none';
    document.getElementById('document-viewer').src = '';
}

async function downloadDocument(documentId) {
    const link = document.createElement('a');
    link.href = `${API_URL}/documents/${documentId}/download`;
    link.download = '';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

async function deleteDocument(documentId) {
    if (!confirm('Are you sure you want to delete this document?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/documents/${documentId}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            if (selectedEntityId) {
                selectEntity(selectedEntityId);
            }
        } else {
            alert('Error deleting document');
        }
    } catch (error) {
        console.error('Error deleting document:', error);
        alert('Error deleting document');
    }
}

// Close upload modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('create-modal');
    if (event.target == modal) {
        closeModal();
    }
    
    const uploadModal = document.getElementById('upload-modal');
    if (event.target == uploadModal) {
        closeUploadModal();
    }
    
    const viewerModal = document.getElementById('viewer-modal');
    if (event.target == viewerModal) {
        closeViewerModal();
    }
}

