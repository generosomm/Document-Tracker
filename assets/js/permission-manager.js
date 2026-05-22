const PermissionManager = {
    features: [],
    initialized: false,

    init: async function() {
        if (this.initialized) {
            console.log("Permission Manager already initialized, re-applying permissions");
            this.applyPermissions();
            return;
        }

        try {
            const path = window.location.pathname.includes('/pages/') 
                ? '../assets/api/check_permission.php' 
                : './assets/api/check_permission.php';

            // Ensure session cookie is sent for PHP session recognition
            const res = await fetch(path, { credentials: 'include' });
            const data = await res.json();

            console.log("Permission Manager Response:", data);

            if (data.success) {
                this.features = data.features;
                this.initialized = true;
                console.log("Allowed features:", this.features);
                this.applyPermissions();
            } else {
                console.error("Permission check returned success=false");
            }
        } catch (e) {
            console.error("Permission Check Failed:", e);
        }
    },

    applyPermissions: function() {
        const restrictedElements = document.querySelectorAll('[data-require-feature]');
        
        console.log(`Applying permissions to ${restrictedElements.length} elements`);

        restrictedElements.forEach(el => {
            const requiredFeature = el.dataset.requireFeature;
            
            console.log(`Checking element:`, el, `Required: ${requiredFeature}, Has permission:`, this.features.includes(requiredFeature));
            
            if (this.features.includes(requiredFeature)) {
                el.classList.add('permission-granted');
                
                if(el.style.display === 'none') el.style.display = '';
                
                console.log(`✓ Permission granted for: ${requiredFeature}`);
            } else {
                el.style.display = 'none';
                console.log(`✗ Permission denied for: ${requiredFeature}`);
            }
        });
        
        this.checkPageAccess();
    },

    checkPageAccess: function() {
        const path = window.location.pathname;
        
        const pagePermissions = {
            'dashboard.html': { feature: 'view_dashboard', name: 'Dashboard' },
            'tracking.html': { feature: 'view_tracking', name: 'Document Tracking' },
            'records.html': { feature: 'view_records', name: 'Records' },
            'analytics.html': { feature: 'view_analytics', name: 'Analytics' },
            'admin.html': { feature: 'manage_system', name: 'Admin Panel' }
        };

        for (const [page, config] of Object.entries(pagePermissions)) {
            if (path.includes(page) && !this.features.includes(config.feature)) {
                showToast(`Access Denied: You do not have permission to view ${config.name}.`, 'error');
                
                if (this.features.includes('view_dashboard')) {
                    window.location.href = 'dashboard.html';
                } else if (this.features.includes('manage_system')) {
                    window.location.href = 'admin.html';
                } else {
                    localStorage.removeItem('currentUser');
                    window.location.href = 'login.html';
                }
                break;
            }
        }
    },
    
    can: function(featureKey) {
        return this.features.includes(featureKey);
    }
};

window.PermissionManager = PermissionManager;

document.addEventListener('DOMContentLoaded', () => {
    PermissionManager.init();
});