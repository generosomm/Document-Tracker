// Load Admin Modals
document.addEventListener('DOMContentLoaded', () => {
    loadAdminModals();
});

async function loadAdminModals() {
    try {
        if (document.getElementById('edit-user-modal')) return;

        const response = await fetch('../components/admin-modals.html'); 
        if (!response.ok) throw new Error("Failed to load admin modals");
        
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        
        if(window.refreshAllData) window.refreshAllData();

        setupOutsideClickListeners();

        if (window.setupFormListeners) {
            console.log("Modals loaded. Attaching listeners...");
            window.setupFormListeners();
        }
        
    } catch (e) {
        console.error("Modal Loader Error:", e);
    }
}

// Setup Outside Click Listeners
function setupOutsideClickListeners() {
    const overlays = document.querySelectorAll('.modal-overlay');
    overlays.forEach(overlay => {
        overlay.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAdminModal(this.id);
            }
        });
    });
}

// Modal Controls
window.closeAdminModal = function(modalId) {
    const m = document.getElementById(modalId);
    if(m) m.classList.remove('active');
};

// Edit User
window.editUser = async function(id) {
    const modal = document.getElementById('edit-user-modal');
    if (!modal) {
        showToast('Edit modal not loaded yet. Please refresh.', 'error');
        return;
    }

    const res = await window.postData({ action: 'get_user', id: id });
    
    if(res && res.success) {
        const u = res.data;
        
        const safeSet = (eid, val) => {
            const el = document.getElementById(eid);
            if(el) el.value = val;
            else console.warn(`Element #${eid} not found`);
        };

        safeSet('edit-user-id', u.id);
        safeSet('edit-user-name', u.name);
        safeSet('edit-user-email', u.email);
        
        setTimeout(() => {
            safeSet('edit-user-role', u.role);
            safeSet('edit-user-dept', u.dept);
        }, 50);
        
        const typeField = document.getElementById('edit-user-type');
        if(typeField) typeField.value = (u.account_type || 'local').toUpperCase();

        const passField = document.getElementById('edit-user-pass');
        if(passField) passField.value = ''; 
        
        modal.classList.add('active');
    } else {
        showToast('Error fetching user data.', 'error');
    }
};

// Submit User Update
window.submitUserUpdate = async function() {
    const id = document.getElementById('edit-user-id').value;
    const name = document.getElementById('edit-user-name').value;
    const email = document.getElementById('edit-user-email').value;
    const role = document.getElementById('edit-user-role').value;
    const dept = document.getElementById('edit-user-dept').value;
    const pass = document.getElementById('edit-user-pass').value;

    const payload = {
        action: 'update_user',
        id: id,
        name: name,
        email: email,
        role: role,
        dept: dept,
        password: pass
    };

    const res = await window.postData(payload);
    if(res && res.success) {
        showToast(res.message, 'success');
        closeAdminModal('edit-user-modal');
        if(window.refreshAllData) window.refreshAllData(); 
    } else if(res) {
        showToast(res.message, 'error');
    }
};

// Edit Department
window.editDept = function(id, currentName) {
    document.getElementById('edit-dept-id').value = id;
    document.getElementById('edit-dept-name').value = currentName;
    document.getElementById('edit-dept-modal').classList.add('active');
};

window.submitDeptUpdate = async function() {
    const payload = {
        action: 'update_dept',
        id: document.getElementById('edit-dept-id').value,
        name: document.getElementById('edit-dept-name').value
    };
    
    const res = await window.postData(payload);
    if(res && res.success) {
        showToast(res.message, 'success');
        closeAdminModal('edit-dept-modal');
        if(window.refreshAllData) window.refreshAllData();
    } else if(res) {
        showToast(res.message, 'error');
    }
};