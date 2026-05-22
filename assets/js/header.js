document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
});

async function loadHeader() {
    const placeholder = document.getElementById("global-header");
    if (!placeholder) return;

    try {
        const isPages = window.location.pathname.includes('/pages/');
        const componentPath = isPages ? '../components/header.html' : 'components/header.html';

        const response = await fetch(componentPath);
        if (!response.ok) throw new Error("Failed to load header");

        const html = await response.text();
        placeholder.innerHTML = html;

        configureSuperAdminNav();
        setActiveLink();
        updateHeaderUserInfo();
        setupLogout();
        
        document.dispatchEvent(new Event('headerLoaded'));

        if (window.PermissionManager && typeof window.PermissionManager.init === 'function') {
            await window.PermissionManager.init();
        }
        // Remove or add submit button based on upload_document permission
        if (window.PermissionManager && typeof window.PermissionManager.can === 'function') {
            const submitBtn = document.getElementById('global-submit-btn');
            const hasPerm = window.PermissionManager.can('upload_document');
            if (submitBtn && !hasPerm) {
                submitBtn.parentNode && submitBtn.parentNode.removeChild(submitBtn);
            } else if (!submitBtn && hasPerm) {
                // Re-insert the button if permission is granted and it's missing
                // Find the header action container
                const headerActions = document.querySelector('.header-actions');
                if (headerActions) {
                    // Create the button
                    const btn = document.createElement('button');
                    btn.className = 'btn btn-light tooltip-trigger';
                    btn.id = 'global-submit-btn';
                    btn.setAttribute('data-tooltip', 'Submit Document');
                    btn.innerHTML = '<i class="ri-upload-2-line"></i> Submit Document';
                    btn.onclick = function() {
                        if (window.openSubmitDocumentModal) window.openSubmitDocumentModal();
                    };
                    headerActions.insertBefore(btn, headerActions.firstChild);
                }
            }
        }
    } catch (error) {
        console.error("Error loading header:", error);
    }
}

function configureSuperAdminNav() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    if (user.role === 'Super Administrator') {
        const navbar = document.querySelector('.navbar');
        
        if (navbar && !document.querySelector('a[data-page="admin.html"]')) {
            const adminLink = document.createElement('a');
            adminLink.href = 'admin.html';
            adminLink.className = 'nav-link tooltip-trigger';
            adminLink.setAttribute('data-page', 'admin.html');
            adminLink.setAttribute('data-tooltip', 'Admin Panel');
            adminLink.innerHTML = '<i class="ri-admin-line"></i> <span>Admin</span>';
            navbar.appendChild(adminLink);
        }
    }
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');
    let foundActive = false;
    links.forEach(link => {
        const page = link.getAttribute('data-page');
        if (currentPath.includes(page)) {
            link.classList.add('active');
            foundActive = true;
            // Save last active admin tab if on admin.html
            if (currentPath.includes('admin.html')) {
                localStorage.setItem('adminLastTab', page);
            }
        }
    });
    // Restore last admin tab if on admin.html and no tab is active
    if (currentPath.includes('admin.html') && !foundActive) {
        const lastTab = localStorage.getItem('adminLastTab');
        if (lastTab) {
            const lastTabLink = document.querySelector(`.nav-link[data-page="${lastTab}"]`);
            if (lastTabLink) {
                lastTabLink.classList.add('active');
            }
        }
    }
}

function updateHeaderUserInfo() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (user) {
        const nameEl = document.querySelector('.user-info .name');
        const roleEl = document.querySelector('.user-info .role');
        if (nameEl) nameEl.innerText = user.name;
        if (roleEl) roleEl.innerText = user.role;
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            showConfirm('Are you sure you want to log out?', () => {
                localStorage.removeItem('currentUser');
                const isPages = window.location.pathname.includes('/pages/');
                window.location.href = isPages ? 'login.html' : 'pages/login.html';
            });
        });
    }
}

// Update Pending Badge
window.updatePendingBadge = async function() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return;

    try {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/get_documents.php?type=active' : './assets/api/get_documents.php?type=active';
        
        const response = await fetch(apiPath);
        if (!response.ok) throw new Error('Failed to fetch documents');
        
        const allDocs = await response.json();
        if (!Array.isArray(allDocs)) return;
        
        const myDept = user.dept.trim().toLowerCase();
        const isSuperAdmin = user.role === 'Super Administrator';
        
        // Count pending documents for this user/department
        const pendingCount = allDocs.filter(doc => {
            const status = (doc.status || '').toLowerCase();
            const assignee = (doc.assignee || '').trim().toLowerCase();
            
            if (status !== 'pending') return false;
            
            // Super Admin sees all pending
            if (isSuperAdmin) return true;
            
            // Regular users see only their department's pending
            return assignee === myDept;
        }).length;

        const badge = document.getElementById('header-pending-badge');
        if (badge) {
            if (pendingCount > 0) {
                badge.innerText = pendingCount > 99 ? '99+' : pendingCount;
                badge.style.display = 'flex';
            } else {
                badge.style.display = 'none';
            }
        }
    } catch (e) { 
        console.error("Badge update failed:", e); 
    }
};

// Initial update and set interval
updatePendingBadge();
setInterval(updatePendingBadge, 10000);