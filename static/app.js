const API_URL = 'https://web-production-f68b3.up.railway.app/api';

let selectedEntityId = null;
let currentEntityId = null;
let authToken = localStorage.getItem('authToken');
let currentUsername = localStorage.getItem('username');

// Check if user is logged in on page load
document.addEventListener('DOMContentLoaded', () => {
    if (authToken && currentUsername) {
        showMainApp();
    } else {
        document.getElementById('login-modal').style.display = 'block';
    }
});

async function handleLogin(event) {
    event.preventDefault();
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const errorDiv = document.getElementById('login-error');
    
    try {
        const response = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            authToken = data.access_token;
            currentUsername = data.username;
            localStorage.setItem('authToken', authToken);
            localStorage.setItem('username', currentUsername);
            showMainApp();
        } else {
            errorDiv.textContent = data.error || 'Login failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorDiv.textContent = 'Error connecting to server';
        errorDiv.style.display = 'block';
    }
}

async function handleRegister(event) {
    event.preventDefault();
    const username = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const errorDiv = document.getElementById('register-error');
    
    try {
        const response = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            alert('Account created successfully! Please login.');
            closeRegisterModal();
        } else {
            errorDiv.textContent = data.error || 'Registration failed';
            errorDiv.style.display = 'block';
        }
    } catch (error) {
        console.error('Registration error:', error);
        errorDiv.textContent = 'Error connecting to server';
        errorDiv.style.display = 'block';
    }
}

function showRegisterModal() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('register-modal').style.display = 'block';
}

function closeRegisterModal() {
    document.getElementById('register-modal').style.display = 'none';
    document.getElementById('login-modal').style.display = 'block';
}

function showMainApp() {
    document.getElementById('login-modal').style.display = 'none';
    document.getElementById('register-modal').style.display = 'none';
    document.getElementById('main-app').style.display = 'block';
    document.getElementById('user-greeting').textContent = `Welcome, ${currentUsername}!`;
    loadEntities();
}

function logout() {
    authToken = null;
    currentUsername = null;
    localStorage.removeItem('authToken');
    localStorage.removeItem('username');
    document.getElementById('main-app').style.display = 'none';
    document.getElementById('login-modal').style.display = 'block';
    document.getElementById('login-username').value = '';
    document.getElementById('login-password').value = '';
}

// Helper function for authenticated fetch requests
async function authFetch(url, options = {}) {
    const headers = {
        ...options.headers
    };
    
    // Don't set Content-Type if FormData (browser will set it with boundary)
    if (!(options.body instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
    }
    
    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }
    
    return fetch(url, {
        ...options,
        headers
    });
}

async function loadEntities() {
    try {
        const response = await authFetch(`${API_URL}/entities`);
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
        const response = await authFetch(`${API_URL}/entities/${id}`);
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
        <div class="entity-header" style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px;">
            <div style="flex: 1;">
                <h2>${escapeHtml(entity.name)}</h2>
                <p>${escapeHtml(entity.description || 'No description')}</p>
                <div style="margin-top: 15px; display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                    ${entity.ein ? `<p><strong>EIN:</strong> ${escapeHtml(entity.ein)}</p>` : ''}
                    ${entity.state_of_incorporation ? `<p><strong>State:</strong> ${escapeHtml(entity.state_of_incorporation)}</p>` : ''}
                    ${entity.date_of_incorporation ? `<p><strong>Incorporated:</strong> ${escapeHtml(entity.date_of_incorporation)}</p>` : ''}
                    ${entity.status ? `<p><strong>Status:</strong> <span style="padding: 4px 12px; border-radius: 6px; background: ${entity.status === 'active' ? 'linear-gradient(135deg, #2d7a5a 0%, #1d6a4a 100%)' : entity.status === 'inactive' ? 'linear-gradient(135deg, #5a6fa5 0%, #4a5f95 100%)' : 'linear-gradient(135deg, #9a4a4a 0%, #7a3a3a 100%)'}; color: ${entity.status === 'active' ? '#d0ffe8' : entity.status === 'inactive' ? '#e8f1ff' : '#ffe0e0'}; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${escapeHtml(entity.status).toUpperCase()}</span></p>` : ''}
                </div>
                ${entity.registered_address ? `<p style="margin-top: 5px;"><strong>Address:</strong> ${escapeHtml(entity.registered_address)}</p>` : ''}
                ${entity.registered_phone ? `<p style="margin-top: 5px;"><strong>Phone:</strong> ${escapeHtml(entity.registered_phone)}</p>` : ''}
            </div>
            <button onclick="editEntity(${entity.id})" style="padding: 10px 20px; background: linear-gradient(135deg, #2d4a7a 0%, #1d3a6a 100%); color: #e8f1ff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s; font-weight: 600;">Edit Entity</button>
        </div>
        
        <div class="section">
            <h3>💳 Accounts (${entity.accounts.length})</h3>
            ${entity.accounts.length > 0 ? entity.accounts.map(acc => `
                <div class="item-card" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4>${escapeHtml(acc.account_name)}</h4>
                        <p><strong>Type:</strong> ${escapeHtml(acc.account_type || 'N/A')} | 
                           <strong>Balance:</strong> $${(acc.balance || 0).toLocaleString()}</p>
                        ${acc.account_number ? `<p><strong>Account #:</strong> ${escapeHtml(acc.account_number)}</p>` : ''}
                        ${acc.username ? `<p><strong>Username:</strong> ${escapeHtml(acc.username)}</p>` : ''}
                        ${acc.password ? `<p><strong>Password:</strong> <span id="pwd-${acc.id}" style="font-family: monospace;">********</span> <span onclick="toggleAccountPassword(${acc.id}, '${escapeHtml(acc.password)}')" style="cursor: pointer;">👁️</span></p>` : ''}
                        ${acc.account_url ? `<p><strong>URL:</strong> <a href="${escapeHtml(acc.account_url)}" target="_blank">${escapeHtml(acc.account_url)}</a></p>` : ''}
                        ${acc.notes ? `<p><em>${escapeHtml(acc.notes)}</em></p>` : ''}
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="editAccount(${acc.id})" style="padding: 8px 12px; background: linear-gradient(135deg, #2d4a7a 0%, #1d3a6a 100%); color: #e8f1ff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">Edit</button>
                        <button onclick="deleteAccount(${acc.id})" style="padding: 8px 12px; background: linear-gradient(135deg, #9a4a4a 0%, #7a3a3a 100%); color: #ffe0e0; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">Delete</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">No accounts yet</p>'}
            <button class="btn-primary" onclick="showAddAccountModal(${entity.id})">+ Add Account</button>
        </div>
        
        <div class="section">
            <h3>📋 Tasks (${entity.tasks.length})</h3>
            ${entity.tasks.length > 0 ? entity.tasks.map(task => `
                <div class="item-card" style="display: flex; justify-content: space-between; align-items: flex-start;">
                    <div style="flex: 1;">
                        <h4>${escapeHtml(task.title)}</h4>
                        <p><strong>Status:</strong> <span class="status-badge status-${task.status}">${escapeHtml(task.status)}</span> | 
                           <strong>Priority:</strong> ${escapeHtml(task.priority || 'N/A')}</p>
                        ${task.category ? `<p><strong>Category:</strong> ${escapeHtml(task.category)}</p>` : ''}
                        ${task.assigned_to ? `<p><strong>Assigned:</strong> ${escapeHtml(task.assigned_to)}</p>` : ''}
                        ${task.due_date ? `<p><strong>Due:</strong> ${new Date(task.due_date).toLocaleDateString()}</p>` : ''}
                        ${(task.estimated_hours || task.actual_hours) ? `<p><strong>Hours:</strong> Est: ${task.estimated_hours || 0}h, Act: ${task.actual_hours || 0}h</p>` : ''}
                        <p>${escapeHtml(task.description || 'No description')}</p>
                    </div>
                    <div style="display: flex; gap: 5px;">
                        <button onclick="editTask(${task.id})" style="padding: 8px 12px; background: linear-gradient(135deg, #2d4a7a 0%, #1d3a6a 100%); color: #e8f1ff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">Edit</button>
                        <button onclick="deleteTask(${task.id})" style="padding: 8px 12px; background: linear-gradient(135deg, #9a4a4a 0%, #7a3a3a 100%); color: #ffe0e0; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">Delete</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">No tasks yet</p>'}
            <button class="btn-primary" onclick="showAddTaskModal(${entity.id})">+ Add Task</button>
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
                        ${doc.file_path ? `<button onclick="viewDocument(${doc.id}, '${doc.title}')" style="padding: 8px 15px; background: linear-gradient(135deg, #2d4a7a 0%, #1d3a6a 100%); color: #e8f1ff; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">View</button>` : ''}
                        ${doc.file_path ? `<button onclick="downloadDocument(${doc.id})" style="padding: 8px 15px; background: linear-gradient(135deg, #2d7a5a 0%, #1d6a4a 100%); color: #d0ffe8; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">Download</button>` : ''}
                        <button onclick="deleteDocument(${doc.id})" style="padding: 8px 15px; background: linear-gradient(135deg, #9a4a4a 0%, #7a3a3a 100%); color: #ffe0e0; border: none; border-radius: 8px; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.2); transition: all 0.3s;">Delete</button>
                    </div>
                </div>
            `).join('') : '<p class="empty-state">No documents yet</p>'}
            <button class="btn-primary" onclick="showUploadModal(${entity.id})">+ Upload Document</button>
        </div>
    `;
}

function showCreateEntityForm() {
    currentEntityId = null;
    document.getElementById('entity-modal-title').textContent = 'Create Entity';
    document.getElementById('entity-submit-btn').textContent = 'Create';
    document.getElementById('create-modal').style.display = 'block';
    // Clear form
    document.getElementById('entity-name').value = '';
    document.getElementById('entity-description').value = '';
    document.getElementById('entity-ein').value = '';
    document.getElementById('entity-state').value = '';
    document.getElementById('entity-date').value = '';
    document.getElementById('entity-address').value = '';
    document.getElementById('entity-phone').value = '';
}

async function editEntity(entityId) {
    try {
        const response = await authFetch(`${API_URL}/entities/${entityId}`);
        const entity = await response.json();
        currentEntityId = entityId;
        document.getElementById('entity-modal-title').textContent = 'Edit Entity';
        document.getElementById('entity-submit-btn').textContent = 'Save';
        document.getElementById('create-modal').style.display = 'block';
        document.getElementById('entity-name').value = entity.name;
        document.getElementById('entity-description').value = entity.description || '';
        document.getElementById('entity-ein').value = entity.ein || '';
        document.getElementById('entity-state').value = entity.state_of_incorporation || '';
        document.getElementById('entity-date').value = entity.date_of_incorporation || '';
        document.getElementById('entity-address').value = entity.registered_address || '';
        document.getElementById('entity-phone').value = entity.registered_phone || '';
        document.getElementById('entity-status').value = entity.status || 'active';
    } catch (error) {
        console.error('Error loading entity:', error);
        alert('Error loading entity details');
    }
}

function closeModal() {
    document.getElementById('create-modal').style.display = 'none';
    currentEntityId = null;
}

async function handleEntitySubmit(event) {
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
        const url = currentEntityId 
            ? `${API_URL}/entities/${currentEntityId}`
            : `${API_URL}/entities`;
        const method = currentEntityId ? 'PUT' : 'POST';
        
        const response = await authFetch(url, {
            method: method,
            body: JSON.stringify({ 
                name, description, ein, state_of_incorporation: state, 
                date_of_incorporation: date, registered_address: address, 
                registered_phone: phone, status 
            })
        });
        
        if (response.ok) {
            closeModal();
            if (currentEntityId) {
                showSuccessMessage('Entity updated successfully!');
                selectEntity(currentEntityId);
            } else {
                showSuccessMessage('Entity created successfully!');
                loadEntities();
            }
        } else {
            alert('Error saving entity');
        }
    } catch (error) {
        console.error('Error saving entity:', error);
        alert('Error saving entity');
    }
}

function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showSuccessMessage(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(135deg, #2d7a5a 0%, #1d6a4a 100%);
        color: #d0ffe8;
        padding: 15px 25px;
        border-radius: 10px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.4);
        z-index: 10000;
        animation: slideIn 0.3s ease-out;
        border: 1px solid rgba(255,255,255,0.2);
    `;
    notification.textContent = message;
    
    // Add animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from {
                transform: translateX(400px);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        @keyframes slideOut {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(400px);
                opacity: 0;
            }
        }
    `;
    document.head.appendChild(style);
    
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(notification);
            document.head.removeChild(style);
        }, 300);
    }, 3000);
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
        const response = await authFetch(`${API_URL}/entities/${entityId}/documents`, {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            closeUploadModal();
            document.getElementById('document-title').value = '';
            document.getElementById('document-type').value = '';
            document.getElementById('document-file').value = '';
            showSuccessMessage('Document uploaded successfully!');
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
    // Use token-based URL for iframe compatibility
    document.getElementById('document-viewer').src = `${API_URL}/documents/${documentId}/token/${authToken}`;
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
        const response = await authFetch(`${API_URL}/documents/${documentId}`, {
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

// Account management functions
let currentAccountId = null;

function showAddAccountModal(entityId) {
    currentAccountId = null;
    document.getElementById('account-modal-title').textContent = 'Add Account';
    document.getElementById('account-modal').dataset.entityId = entityId;
    document.getElementById('account-modal').style.display = 'block';
    // Clear form
    document.getElementById('account-name').value = '';
    document.getElementById('account-number').value = '';
    document.getElementById('account-balance').value = '';
    document.getElementById('account-type').value = '';
    document.getElementById('account-username').value = '';
    document.getElementById('account-password').value = '';
    document.getElementById('account-url').value = '';
    document.getElementById('account-notes').value = '';
}

async function editAccount(accountId) {
    try {
        const response = await authFetch(`${API_URL}/accounts/${accountId}`);
        const account = await response.json();
        currentAccountId = accountId;
        document.getElementById('account-modal-title').textContent = 'Edit Account';
        document.getElementById('account-modal').dataset.entityId = account.entity_id;
        document.getElementById('account-modal').style.display = 'block';
        document.getElementById('account-name').value = account.account_name;
        document.getElementById('account-number').value = account.account_number || '';
        document.getElementById('account-balance').value = account.balance || 0;
        document.getElementById('account-type').value = account.account_type || '';
        document.getElementById('account-username').value = account.username || '';
        document.getElementById('account-password').value = '';
        document.getElementById('account-url').value = account.account_url || '';
        document.getElementById('account-notes').value = account.notes || '';
    } catch (error) {
        console.error('Error loading account:', error);
        alert('Error loading account details');
    }
}

function closeAccountModal() {
    document.getElementById('account-modal').style.display = 'none';
}

async function handleAccountSubmit(event) {
    event.preventDefault();
    const entityId = document.getElementById('account-modal').dataset.entityId;
    const data = {
        account_name: document.getElementById('account-name').value,
        account_number: document.getElementById('account-number').value,
        balance: parseFloat(document.getElementById('account-balance').value) || 0,
        account_type: document.getElementById('account-type').value,
        username: document.getElementById('account-username').value,
        password: document.getElementById('account-password').value,
        account_url: document.getElementById('account-url').value,
        notes: document.getElementById('account-notes').value
    };
    
    try {
        const url = currentAccountId 
            ? `${API_URL}/accounts/${currentAccountId}`
            : `${API_URL}/entities/${entityId}/accounts`;
        const method = currentAccountId ? 'PUT' : 'POST';
        
        const response = await authFetch(url, {
            method: method,
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeAccountModal();
            selectEntity(entityId);
        } else {
            alert('Error saving account');
        }
    } catch (error) {
        console.error('Error saving account:', error);
        alert('Error saving account');
    }
}

async function deleteAccount(accountId) {
    if (!confirm('Are you sure you want to delete this account?')) return;
    
    try {
        const response = await authFetch(`${API_URL}/accounts/${accountId}`, { method: 'DELETE' });
        if (response.ok && selectedEntityId) {
            selectEntity(selectedEntityId);
        } else {
            alert('Error deleting account');
        }
    } catch (error) {
        console.error('Error deleting account:', error);
        alert('Error deleting account');
    }
}

function toggleAccountPassword(accountId, decryptedPassword) {
    const pwdSpan = document.getElementById(`pwd-${accountId}`);
    if (pwdSpan.textContent === '********') {
        pwdSpan.textContent = decryptedPassword;
    } else {
        pwdSpan.textContent = '********';
    }
}

// Task management functions
let currentTaskId = null;

function showAddTaskModal(entityId) {
    currentTaskId = null;
    document.getElementById('task-modal-title').textContent = 'Add Task';
    document.getElementById('task-modal').dataset.entityId = entityId;
    document.getElementById('task-modal').style.display = 'block';
    // Clear form
    document.getElementById('task-title').value = '';
    document.getElementById('task-description').value = '';
    document.getElementById('task-status').value = 'pending';
    document.getElementById('task-priority').value = '';
    document.getElementById('task-category').value = '';
    document.getElementById('task-assigned').value = '';
    document.getElementById('task-start-date').value = '';
    document.getElementById('task-due-date').value = '';
    document.getElementById('task-estimated-hours').value = '';
    document.getElementById('task-actual-hours').value = '';
    document.getElementById('task-completion-date').value = '';
    document.getElementById('task-dependencies').value = '';
}

async function editTask(taskId) {
    try {
        const response = await authFetch(`${API_URL}/tasks/${taskId}`);
        const task = await response.json();
        currentTaskId = taskId;
        document.getElementById('task-modal-title').textContent = 'Edit Task';
        document.getElementById('task-modal').dataset.entityId = task.entity_id;
        document.getElementById('task-modal').style.display = 'block';
        document.getElementById('task-title').value = task.title;
        document.getElementById('task-description').value = task.description || '';
        document.getElementById('task-status').value = task.status;
        document.getElementById('task-priority').value = task.priority || '';
        document.getElementById('task-category').value = task.category || '';
        document.getElementById('task-assigned').value = task.assigned_to || '';
        document.getElementById('task-start-date').value = task.start_date || '';
        document.getElementById('task-due-date').value = task.due_date || '';
        document.getElementById('task-estimated-hours').value = task.estimated_hours || '';
        document.getElementById('task-actual-hours').value = task.actual_hours || '';
        document.getElementById('task-completion-date').value = task.completion_date || '';
        document.getElementById('task-dependencies').value = task.dependencies ? task.dependencies.join(', ') : '';
    } catch (error) {
        console.error('Error loading task:', error);
        alert('Error loading task details');
    }
}

function closeTaskModal() {
    document.getElementById('task-modal').style.display = 'none';
}

async function handleTaskSubmit(event) {
    event.preventDefault();
    const entityId = document.getElementById('task-modal').dataset.entityId;
    const dependenciesInput = document.getElementById('task-dependencies').value;
    const dependencies = dependenciesInput ? dependenciesInput.split(',').map(d => d.trim()).filter(d => d) : [];
    
    const data = {
        title: document.getElementById('task-title').value,
        description: document.getElementById('task-description').value,
        status: document.getElementById('task-status').value,
        priority: document.getElementById('task-priority').value,
        category: document.getElementById('task-category').value,
        assigned_to: document.getElementById('task-assigned').value,
        start_date: document.getElementById('task-start-date').value,
        due_date: document.getElementById('task-due-date').value,
        estimated_hours: parseFloat(document.getElementById('task-estimated-hours').value) || null,
        actual_hours: parseFloat(document.getElementById('task-actual-hours').value) || null,
        completion_date: document.getElementById('task-completion-date').value,
        dependencies: dependencies
    };
    
    try {
        const url = currentTaskId 
            ? `${API_URL}/tasks/${currentTaskId}`
            : `${API_URL}/entities/${entityId}/tasks`;
        const method = currentTaskId ? 'PUT' : 'POST';
        
        const response = await authFetch(url, {
            method: method,
            body: JSON.stringify(data)
        });
        
        if (response.ok) {
            closeTaskModal();
            selectEntity(entityId);
        } else {
            alert('Error saving task');
        }
    } catch (error) {
        console.error('Error saving task:', error);
        alert('Error saving task');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) return;
    
    try {
        const response = await authFetch(`${API_URL}/tasks/${taskId}`, { method: 'DELETE' });
        if (response.ok && selectedEntityId) {
            selectEntity(selectedEntityId);
        } else {
            alert('Error deleting task');
        }
    } catch (error) {
        console.error('Error deleting task:', error);
        alert('Error deleting task');
    }
}

// Close all modals when clicking outside
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
    
    const accountModal = document.getElementById('account-modal');
    if (event.target == accountModal) {
        closeAccountModal();
    }
    
    const taskModal = document.getElementById('task-modal');
    if (event.target == taskModal) {
        closeTaskModal();
    }
}

