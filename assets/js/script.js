/* assets/js/script.js */

document.addEventListener('DOMContentLoaded', () => {
    
    // 1. CHECK LOGIN STATUS
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));

    // Redirect if not logged in and not on login page
    if (!currentUser && !window.location.href.includes('login.html')) {
        window.location.href = 'login.html';
        return;
    }

    // 2. SETUP USER SESSION
    if (currentUser) {
        updateUserInfo(currentUser);
        applyGlobalPermissions(currentUser);
        activateLogout();
    }

    // 3. INITIALIZE PAGE TRANSITIONS
    handlePageTransitions();

    // 4. GLOBAL LISTENER: OPEN SUBMIT MODAL
    // (The modal HTML/Logic is loaded by modal.js, we just trigger it here)
    document.addEventListener('click', function(e) {
        const btn = e.target.closest('#global-submit-btn');
        if (btn) {
            const modal = document.getElementById('submit-modal');
            if (modal) {
                modal.classList.add('active');
            } else {
                console.warn("Modal component not loaded yet.");
            }
        }
    });
});

// ==========================================
// CORE FUNCTIONS
// ==========================================

/**
 * Handles smooth page transitions (Content Fade Out)
 * Intercepts navigation clicks to animate MAIN CONTENT ONLY.
 */
function handlePageTransitions() {
    // Wait slightly for header.js to inject nav links
    setTimeout(() => {
        const navLinks = document.querySelectorAll('.nav-link');

        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                const targetUrl = link.href;
                
                // Only animate if it's a real page change (not hash link or same page)
                if (targetUrl && !targetUrl.includes('#') && targetUrl !== window.location.href) {
                    e.preventDefault(); // Stop immediate load

                    // 1. Target ONLY the main content (Leaving Header alone)
                    const mainContent = document.querySelector('main');
                    if (mainContent) {
                        mainContent.classList.add('page-exiting');
                    }

                    // 2. Wait 150ms for animation to finish, then go
                    setTimeout(() => {
                        window.location.href = targetUrl;
                    }, 150);
                }
            });
        });
    }, 100); 
}

/**
 * Updates global user info display (Fallback)
 */
function updateUserInfo(user) {
    const nameEls = document.querySelectorAll('.user-info .name');
    const roleEls = document.querySelectorAll('.user-info .role');
    
    nameEls.forEach(el => el.innerText = user.name);
    roleEls.forEach(el => el.innerText = user.role);
}

/**
 * Applies role-based UI permissions
 */
function applyGlobalPermissions(user) {
    // Super Admin: Add Admin Link
    if (user.role === 'Super Administrator') {
        setTimeout(() => {
            const navbar = document.querySelector('.navbar');
            if (navbar && !document.getElementById('admin-link')) {
                const a = document.createElement('a');
                a.id = 'admin-link'; a.className = 'nav-link';
/*                a.innerHTML = '<i class="ri-admin-line"></i> Admin'; */
                a.href = '#'; 
                navbar.appendChild(a);
            }
        }, 500);
    }
    
    // CAS: Hide Signing Buttons
    if (user.role === 'CAS') {
        const style = document.createElement('style');
        style.innerHTML = `.btn-sign, button[onclick*="Sign"], .sign-action { display: none !important; }`;
        document.head.appendChild(style);
    }
}

/**
 * Global Logout Logic
 */
function activateLogout() {
    const logoutBtn = document.querySelector('.ri-logout-box-r-line');
    if (logoutBtn) {
        const container = logoutBtn.parentElement;
        container.style.cursor = 'pointer';
        
        // Clone to remove potential duplicate listeners
        const newBtn = container.cloneNode(true);
        container.parentNode.replaceChild(newBtn, container);
        
        newBtn.addEventListener('click', () => {
            if (confirm('Are you sure you want to log out?')) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }
}