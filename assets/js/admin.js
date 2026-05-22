// API URLs
const API_URL = '../assets/api/admin_api.php';
const ADD_USER_API = '../assets/api/admin_add_user.php'; 
const DELETE_DOC_API = '../assets/api/delete_document.php'; 

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'Super Administrator') {
        window.location.href = 'dashboard.html';
        return;
    }
    // Restore last admin tab if available (only once)
    if (window.location.pathname.includes('admin.html')) {
        const lastTab = localStorage.getItem('adminLastTab');
        if (lastTab) {
            setTimeout(() => {
                const tabBtn = document.querySelector(`.tab-btn[data-tab="${lastTab}"]`);
                if (tabBtn) tabBtn.click();
            }, 100);
        }
    }
    window.refreshAllData();
});

// Global State
let globalDepts = [];
let globalUsers = [];
let currentRouteBuild = [];
let dragSrcEl = null;

// Global API Helper
window.postData = async function(payload, customUrl = null) {
    try {
        const targetUrl = customUrl || API_URL;
        let body = (payload instanceof FormData) ? payload : JSON.stringify(payload);
        const headers = (payload instanceof FormData) ? {} : { 'Content-Type': 'application/json' };
        const res = await fetch(targetUrl, { method: 'POST', headers: headers, body: body });
        return await res.json();
    } catch (err) {
        console.error("Connection Error:", err);
        return { success: false, message: "Connection Error" };
    }
};

// Data Fetching
window.refreshAllData = async function() {
    try {
        const res = await window.postData({ action: 'get_all_data' });
        if (res) {
            globalDepts = res.departments;
            globalUsers = res.users;
            
            renderUserList(res.users);
            renderDeptList(res.departments);
            renderRouteList(res.routes);
            populateDeptDropdowns(res.departments);
            populateRoleDropdowns();
            populateRouteChips(res.departments);
            loadPermissions();
            
            const countEl = document.getElementById('user-count');
            if(countEl) countEl.innerText = res.users.length;
        }
    } catch (error) {
        console.error("Admin Load Error:", error);
    }
};

// Edit User
window.editUser = function(id) {
    const user = globalUsers.find(u => u.id == id);
    if (!user) {
        showToast('User data not found. Please refresh.', 'error');
        return;
    }

    document.getElementById('edit-user-id').value = user.id;
    document.getElementById('edit-name').value = user.name;
    document.getElementById('edit-email').value = user.email; 
    
    setTimeout(() => {
        document.getElementById('edit-role').value = user.role;
        document.getElementById('edit-dept').value = user.dept;
    }, 100);

    document.getElementById('edit-user-modal').classList.add('active');
};

// Render Functions
function renderUserList(users) {
    const tbody = document.getElementById('user-list-body');
    if (!users.length) { tbody.innerHTML = '<tr><td colspan="4" class="text-center">No users found.</td></tr>'; return; }
    
    tbody.innerHTML = users.map(u => {
        const displayRole = u.role ? u.role : '<span style="color:red;">No Role Assigned</span>';
        
        let cls = 'badge-green';
        if (u.role.includes('Super')) cls = 'badge-purple';
        else if (u.role.includes('Head')) cls = 'badge-blue';
        
        return `<tr>
            <td><strong>${u.name}</strong><br><small style="color:#94a3b8">${u.email}</small></td>
            <td><span class="badge ${cls}">${displayRole}</span></td>
            <td>${u.dept || '-'}</td>
            <td style="text-align:center;">
                <button class="btn-icon" onclick="editUser(${u.id})" title="Edit"><i class="ri-pencil-line"></i></button>
                <button class="btn-icon" onclick="deleteUser(${u.id})" title="Delete"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function renderDeptList(depts) {
    const tbody = document.getElementById('dept-list-body');
    if (!depts.length) { tbody.innerHTML = '<tr><td colspan="2" class="text-center">No departments found.</td></tr>'; return; }
    
    tbody.innerHTML = depts.map(d => {
        const safeName = d.name.replace(/'/g, "\\'");
        return `<tr>
            <td><div style="display:flex;align-items:center;gap:10px;"><div style="width:32px;height:32px;background:#eff6ff;color:#2563eb;border-radius:6px;display:flex;align-items:center;justify-content:center;"><i class="ri-building-line"></i></div><span style="font-weight:500;">${d.name}</span></div></td>
            <td style="text-align:center;">
                <button class="btn-icon" onclick="editDept(${d.id}, '${safeName}')" title="Edit"><i class="ri-pencil-line"></i></button>
                <button class="btn-icon" onclick="deleteDept(${d.id})" title="Delete"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>`;
    }).join('');
}

function renderRouteList(routes) {
    const tbody = document.getElementById('route-list-body');
    if(!routes.length) { tbody.innerHTML = '<tr><td colspan="3" class="text-center">No routes configured.</td></tr>'; return; }
    
    tbody.innerHTML = routes.map(r => {
        const seq = Array.isArray(r.sequence) ? r.sequence : [];
        const seqHtml = seq.map((step, idx) => 
            `<span style="display:inline-flex; align-items:center;"><span class="badge badge-gray">${step}</span>${idx < seq.length - 1 ? '<i class="ri-arrow-right-line" style="margin:0 6px; color:#cbd5e1;"></i>' : ''}</span>`
        ).join('');

        return `<tr>
            <td><strong>${r.category}</strong></td>
            <td>${seqHtml}</td>
            <td style="text-align:center;">
                <button class="btn-icon" onclick="editRoute(${r.id})" title="Edit"><i class="ri-pencil-line"></i></button>
                <button class="btn-icon" onclick="deleteRoute(${r.id})" title="Delete"><i class="ri-delete-bin-line"></i></button>
            </td>
        </tr>`;
    }).join('');
}

// Route Builder and Chips Logic
function populateDeptDropdowns(depts) {
    const html = depts.map(d => `<option value="${d.name}">${d.name}</option>`).join('');
    document.querySelectorAll('.dept-dropdown').forEach(s => s.innerHTML = html);
}

function populateRouteChips(depts) {
    const container = document.getElementById('dept-chips-container');
    container.innerHTML = depts.map(d => 
        `<div class="chip" onclick="addToRoute('${d.name}')"><i class="ri-add-line"></i> ${d.name}</div>`
    ).join('');
}

window.filterDeptChips = function() {
    const term = document.getElementById('dept-search').value.toLowerCase();
    const chips = document.querySelectorAll('#dept-chips-container .chip');
    chips.forEach(chip => {
        const text = chip.innerText.toLowerCase();
        chip.style.display = text.includes(term) ? 'flex' : 'none';
    });
};

window.addToRoute = (d) => { currentRouteBuild.push(d); renderRouteViz(); };

function renderRouteViz() {
    const v = document.getElementById('route-viz');
    if(!currentRouteBuild.length) { 
        v.innerHTML = '<span class="placeholder" style="color:#94a3b8; font-style:italic; padding: 20px; text-align:center;">Select departments from the left to build the chain...</span>'; 
        return; 
    }
    
    v.innerHTML = currentRouteBuild.map((d, i) => `
        <div class="route-step-card" draggable="true" ondragstart="handleDragStart(event, ${i})" ondragover="handleDragOver(event)" ondrop="handleDrop(event, ${i})">
            <div style="display:flex; align-items:center; gap:10px;">
                <div class="step-handle"><i class="ri-drag-move-2-line"></i></div>
                <div class="step-idx">${i + 1}</div>
                <strong>${d}</strong>
            </div>
            <button class="btn-icon-sm" onclick="removeRouteStep(${i})" title="Remove"><i class="ri-close-line"></i></button>
        </div>
    `).join('<div style="text-align:center; color:#cbd5e1;"><i class="ri-arrow-down-line"></i></div>');
}

window.handleDragStart = (e, index) => {
    dragSrcEl = index;
    e.dataTransfer.effectAllowed = 'move';
    e.target.style.opacity = '0.4';
};

window.handleDragOver = (e) => {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
};

window.handleDrop = (e, targetIndex) => {
    if (e.stopPropagation) e.stopPropagation();
    
    if (dragSrcEl !== targetIndex) {
        const movedItem = currentRouteBuild[dragSrcEl];
        currentRouteBuild.splice(dragSrcEl, 1);
        currentRouteBuild.splice(targetIndex, 0, movedItem);
        renderRouteViz();
    }
    return false;
};

window.removeRouteStep = (index) => {
    currentRouteBuild.splice(index, 1);
    renderRouteViz();
};

window.clearRoute = () => { 
    currentRouteBuild = []; 
    renderRouteViz(); 
    const btn = document.getElementById('btn-save-route');
    btn.innerText = "Save Workflow";
    btn.dataset.mode = 'add';
    document.getElementById('route-cat').value = '';
};

window.editRoute = async (id) => {
    const res = await window.postData({ action: 'get_route', id: id });
    if(res && res.success) {
        document.getElementById('route-cat').value = res.data.category;
        currentRouteBuild = (typeof res.data.route_sequence === 'string') ? JSON.parse(res.data.route_sequence) : res.data.route_sequence;
        renderRouteViz();
        const btn = document.getElementById('btn-save-route');
        btn.innerText = "Update Workflow";
        btn.dataset.mode = 'update';
        btn.dataset.id = id;
        
        switchTab('routes');
    }
};

window.saveRoute = async () => {
    const cat = document.getElementById('route-cat').value;
    const btn = document.getElementById('btn-save-route');
    if(!cat || currentRouteBuild.length < 2) {
        showToast('Invalid route: Name required & min 2 steps.', 'warning');
        return;
    }
    const payload = { action: 'save_route', category: cat, sequence: currentRouteBuild };
    if(btn.dataset.mode === 'update') payload.id = btn.dataset.id;
    
    const res = await window.postData(payload);
    if(res && res.success) { 
        showToast(res.message, 'success');
        clearRoute(); 
        window.refreshAllData(); 
    }
};

// Add Forms Logic
window.setupFormListeners = function() {

    const editRoleForm = document.getElementById('form-edit-role');
    if (editRoleForm) {
        editRoleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldName = document.getElementById('edit-role-old-name').value;
            const newName = document.getElementById('edit-role-new-name').value;

            const res = await window.postData({ 
                action: 'update_role', 
                old_name: oldName,
                new_name: newName
            });
            
            if(res && res.success) { 
                showToast(res.message, 'success');
                closeAdminModal('edit-role-modal');
                window.refreshAllData();
            } else {
                showToast(res ? res.message : 'Error updating role', 'error');
            }
        });
    }
    
    const regForm = document.getElementById('form-pre-approve'); 
    if (regForm) {
        const newForm = regForm.cloneNode(true);
        regForm.parentNode.replaceChild(newForm, regForm);
        
        newForm.addEventListener('submit', async (e) => {
            e.preventDefault(); 
            const type = document.getElementById('reg-type').value;
            const email = document.getElementById('reg-email').value.trim();
            const pass = document.getElementById('reg-password').value.trim();

            if (type === 'google' && !email.toLowerCase().endsWith('@gmail.com')) {
                showToast('RESTRICTED: Google Accounts must use @gmail.com', 'error');
                return;
            }
            if (pass.length < 1) {
                showToast('Please assign a password.', 'warning');
                return;
            }

            const formData = new FormData();
            formData.append('account_type', type);
            formData.append('password', pass);
            formData.append('name', document.getElementById('reg-name').value);
            formData.append('email', email);
            formData.append('role', document.getElementById('reg-role').value);
            formData.append('dept', document.getElementById('reg-dept').value);

            const res = await window.postData(formData, ADD_USER_API);
            if(res && res.success) { 
                showToast(res.message, 'success');
                newForm.reset(); 
                if (typeof closeAdminModal === 'function') closeAdminModal('add-user-modal');
                window.refreshAllData(); 
            } else { 
                showToast(res ? res.message : 'Error adding user', 'error');
            }
        });
    }

    const deptForm = document.getElementById('form-dept');
    if (deptForm) {
        const newDeptForm = deptForm.cloneNode(true);
        deptForm.parentNode.replaceChild(newDeptForm, deptForm);

        newDeptForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const res = await window.postData({ 
                action: 'add_dept', 
                name: document.getElementById('new-dept-name').value 
            });
            if(res && res.success) { 
                showToast(res.message, 'success');
                document.getElementById('new-dept-name').value=''; 
                if (typeof closeAdminModal === 'function') closeAdminModal('add-dept-modal');
                window.refreshAllData(); 
            } else { 
                showToast(res ? res.message : 'Error adding department', 'error');
            }
        });
    }

    // Edit User Form is now handled in admin-modals.js

    const roleForm = document.getElementById('form-role');
    if (roleForm) {
        const newRoleForm = roleForm.cloneNode(true);
        roleForm.parentNode.replaceChild(newRoleForm, roleForm);

        newRoleForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const roleName = document.getElementById('new-role-name').value;
            
            const res = await window.postData({ 
                action: 'add_role', 
                role_name: roleName 
            });
            
            if(res && res.success) { 
                showToast(res.message, 'success');
                document.getElementById('new-role-name').value = '';
                if (typeof closeAdminModal === 'function') closeAdminModal('add-role-modal');
                
                window.refreshAllData();
                
                switchTab('roles');
            } else {
                showToast(res ? res.message : 'Error adding role', 'error');
            }
        });
    }
}

// Delete Logic
// Delete Logic
window.deleteUser = async (id) => { 
    showConfirm('Delete this user?', async () => {
        await window.postData({action:'delete_user', id}); 
        showToast('User deleted', 'success');
        window.refreshAllData();
    });
};

window.deleteDept = async (id) => { 
    showConfirm('Delete this department?', async () => {
        await window.postData({action:'delete_dept', id}); 
        showToast('Department deleted', 'success');
        window.refreshAllData();
    });
};

window.deleteRoute = async (id) => { 
    showConfirm('Delete this route?', async () => {
        await window.postData({action:'delete_route', id}); 
        showToast('Route deleted', 'success');
        window.refreshAllData();
    });
};

window.deleteRole = async (roleName) => { 
    if (roleName === 'Super Administrator') {
        showToast('Cannot delete Super Administrator role', 'error');
        return;
    }
    showConfirm(`Delete role "${roleName}"?`, async () => {
        const res = await window.postData({action:'delete_role', role_name: roleName}); 
        if (res && res.success) {
            showToast('Role deleted', 'success');
            window.refreshAllData();
        } else {
            showToast(res ? res.message : 'Error deleting role', 'error');
        }
    });
};

// Helper Functions
window.togglePasswordPlaceholder = function() {
    const type = document.getElementById('reg-type');
    const passInput = document.getElementById('reg-password');
    if (type && passInput) {
        passInput.placeholder = (type.value === 'google') ? "Set login password for Google user" : "Set login password for local user";
    }
};

window.switchTab = (t) => {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));
    const activePane = document.getElementById('tab-' + t);
    if (activePane) activePane.classList.add('active');
    // Use data-tab attribute for tab buttons
    const activeBtn = document.querySelector(`.tab-btn[data-tab="${t}"]`);
    if (activeBtn) activeBtn.classList.add('active');
    // Save last active admin tab (only once)
    if (window.location.pathname.includes('admin.html')) {
        localStorage.setItem('adminLastTab', t);
    }
};

window.openAddUserModal = function() {
    const modal = document.getElementById('add-user-modal');
    if (!modal) {
        console.warn('Modal not found. Ensure admin-modals.js is loading correctly.');
        showToast('System initializing. Please wait a second and try again.', 'info');
        return;
    }
    modal.classList.add('active');
    const form = document.getElementById('form-pre-approve');
    if(form) form.reset();
    if(window.togglePasswordPlaceholder) window.togglePasswordPlaceholder();
};

window.openAddDeptModal = function() {
    const modal = document.getElementById('add-dept-modal');
    if (!modal) {
        showToast('System initializing. Please try again.', 'info');
        return;
    }
    modal.classList.add('active');
    const form = document.getElementById('form-dept');
    if(form) form.reset();
};

// Permissions Logic
async function loadPermissions() {
    const res = await window.postData({ action: 'get_permissions' });
    if(res && res.success) {
        renderPermissionTable(res.roles, res.features, res.permissions);
    }
}

function renderPermissionTable(roles, features, currentPerms) {
    const thead = document.getElementById('perm-table-head');
    const tbody = document.getElementById('perm-list-body');
    
    if(!thead || !tbody) return;

    const featureKeys = Object.keys(features);
    let headHtml = `<tr><th style="text-align:left; padding:12px; min-width: 250px;">Role Name</th>`;
    featureKeys.forEach(key => {
        headHtml += `<th class="text-center" style="padding:12px; width: 120px; font-size: 0.75rem;">${features[key]}</th>`;
    });
    headHtml += `</tr>`;
    thead.innerHTML = headHtml;

    tbody.innerHTML = '';
    
    roles.forEach(role => {
        const isSuper = (role === 'Super Administrator');

        const actions = isSuper ? '' : `
            <div style="margin-left:auto; display:flex; gap:5px;">
                <button class="btn-icon-sm" style="color:var(--primary);" onclick="editRoleName('${role}')" title="Rename Role">
                    <i class="ri-pencil-line"></i>
                </button>
                <button class="btn-icon-sm" style="color:#ef4444;" onclick="deleteRole('${role}')" title="Delete Role">
                    <i class="ri-delete-bin-line"></i>
                </button>
            </div>
        `;

        let rowHtml = `<tr>
            <td style="padding:12px; display:flex; align-items:center; height: 50px;">
                <span style="font-weight:600; color:#1e293b;">${role}</span>
                ${actions}
            </td>`;
        
        featureKeys.forEach(key => {
            const isEnabled = (currentPerms[role] && currentPerms[role][key] == 1);
            const isChecked = isEnabled ? 'checked' : '';
            const safeRole = role.replace(/\s+/g, '');
            const toggleId = `perm-${safeRole}-${key}`;
            
            const isProtected = (isSuper && key === 'manage_system');
            const disabledAttr = isProtected ? 'disabled' : '';
            const lockIcon = isProtected ? '<i class="ri-lock-fill" style="color:#f59e0b; margin-left:4px; font-size:0.9rem;" title="Protected: Cannot disable system access for Super Administrator"></i>' : '';
            const cursorStyle = isProtected ? 'cursor: not-allowed; opacity: 0.6;' : '';
            
            rowHtml += `
                <td style="text-align:center; vertical-align:middle; background: ${isEnabled ? '#f0fdf4' : 'transparent'}; position:relative;">
                    <label class="switch" style="${cursorStyle}">
                        <input type="checkbox" id="${toggleId}" ${isChecked} ${disabledAttr}
                            onchange="togglePermission('${role}', '${key}', this.checked)">
                        <span class="slider round"></span>
                    </label>
                    ${lockIcon}
                </td>`;
        });
        
        rowHtml += '</tr>';
        tbody.innerHTML += rowHtml;
    });
}

window.editRoleName = function(roleName) {
    document.getElementById('edit-role-old-name').value = roleName;
    document.getElementById('edit-role-new-name').value = roleName;
    
    document.getElementById('edit-role-modal').classList.add('active');
};

window.togglePermission = async (role, feature, isEnabled) => {
    if (role === 'Super Administrator' && feature === 'manage_system' && !isEnabled) {
        showToast('Security Lock: Cannot disable System Config for Super Administrator.', 'warning');
        const safeRole = role.replace(/\s+/g, '');
        const toggleId = `perm-${safeRole}-${feature}`;
        const checkbox = document.getElementById(toggleId);
        if (checkbox) checkbox.checked = true;
        return;
    }
    
    const val = isEnabled ? 1 : 0;
    await window.postData({ 
        action: 'update_permission', 
        role: role, 
        feature: feature, 
        enabled: val 
    });
    console.log(`Updated ${role} - ${feature} to ${val}`);
};

window.openAddRoleModal = function() {
    const modal = document.getElementById('add-role-modal');
    if (!modal) {
        showToast('System initializing. Please try again.', 'info');
        return;
    }
    modal.classList.add('active');
    const form = document.getElementById('form-role');
    if(form) form.reset();
};

async function populateRoleDropdowns() {
    const res = await window.postData({ action: 'get_permissions' });
    
    if(res && res.success && res.roles) {
        const options = res.roles.map(r => `<option value="${r}">${r}</option>`).join('');
        
        const dropdowns = document.querySelectorAll('.role-dropdown');
        dropdowns.forEach(s => {
            s.innerHTML = `<option value="" disabled selected>Select Role</option>` + options;
        });

        const regRole = document.getElementById('reg-role');
        if(regRole) regRole.innerHTML = `<option value="" disabled selected>Select Role</option>` + options;

        const editRole = document.getElementById('edit-user-role');
        if(editRole) editRole.innerHTML = `<option value="" disabled selected>Select Role</option>` + options;
    }
}
