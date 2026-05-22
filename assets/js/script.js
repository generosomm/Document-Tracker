// Global Toast Notification
window.showToast = function(message, type = 'success') {
    let container = document.getElementById('global-toast-container');
    
    if (!container) {
        container = document.createElement('div');
        container.id = 'global-toast-container';
        document.body.appendChild(container);
    }

    const icons = {
        success: 'ri-checkbox-circle-fill',
        error: 'ri-error-warning-fill',
        warning: 'ri-alert-fill',
        info: 'ri-information-fill'
    };

    const toast = document.createElement('div');
    toast.className = `toast-message ${type}`;
    toast.innerHTML = `
        <i class="${icons[type] || icons.info} toast-icon"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    requestAnimationFrame(() => {
        toast.classList.add('show');
    });

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    }, 3000);
};

// Custom Confirm Dialog
window.showConfirm = function(message, onConfirm, onCancel) {
    let overlay = document.getElementById('confirm-overlay');
    
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'confirm-overlay';
        overlay.className = 'confirm-overlay';
        overlay.innerHTML = `
            <div class="confirm-dialog">
                <div class="confirm-icon">
                    <i class="ri-question-line"></i>
                </div>
                <div class="confirm-message"></div>
                <div class="confirm-buttons">
                    <button class="confirm-btn confirm-cancel">Cancel</button>
                    <button class="confirm-btn confirm-yes">Yes</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    }

    const messageEl = overlay.querySelector('.confirm-message');
    const yesBtn = overlay.querySelector('.confirm-yes');
    const cancelBtn = overlay.querySelector('.confirm-cancel');

    messageEl.textContent = message;

    const cleanup = () => {
        overlay.classList.remove('active');
        yesBtn.replaceWith(yesBtn.cloneNode(true));
        cancelBtn.replaceWith(cancelBtn.cloneNode(true));
    };

    overlay.querySelector('.confirm-yes').onclick = () => {
        cleanup();
        if (onConfirm) onConfirm();
    };

    overlay.querySelector('.confirm-cancel').onclick = () => {
        cleanup();
        if (onCancel) onCancel();
    };

    overlay.classList.add('active');
};

// Initialization and Auth
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser'));
    const isLoginPage = window.location.href.includes('login.html');

    if (!currentUser && !isLoginPage) {
        const isPages = window.location.pathname.includes('/pages/');
        window.location.href = isPages ? 'login.html' : 'pages/login.html';
        return;
    }

    document.addEventListener('headerLoaded', () => {
        if (currentUser) {
            updateUserInfo(currentUser); 
            applyGlobalPermissions(currentUser);
        }
        setupSubmitModalTrigger();
        activateLogout();
        handlePageTransitions(); 
    });
});

// Core Functions
function handlePageTransitions() {
    const links = document.querySelectorAll('a:not([target="_blank"]):not([href^="#"])');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            const target = link.href;
            if (target && target !== window.location.href && !target.includes('javascript:')) {
                e.preventDefault(); 
                document.querySelector('main')?.classList.add('page-exiting');
                setTimeout(() => window.location.href = target, 300);
            }
        });
    });
}

function setupSubmitModalTrigger() {
    const btn = document.getElementById('global-submit-btn');
    if (btn) btn.addEventListener('click', () => {
        document.getElementById('submit-modal')?.classList.add('active');
    });
}

function updateUserInfo(user) {
    document.querySelectorAll('.user-info .name').forEach(el => el.innerText = user.name);
    document.querySelectorAll('.user-info .role').forEach(el => el.innerText = user.role);
}

function applyGlobalPermissions(user) {
    if (user.role === 'CAS') {
        const style = document.createElement('style');
        style.innerHTML = `.btn-sign, button[onclick*="Sign"], .sign-action { display: none !important; }`;
        document.head.appendChild(style);
    }
}

function activateLogout() {
    const btn = document.getElementById('logout-btn');
    if (btn) {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', () => {
            showConfirm('Are you sure you want to log out?', () => {
                localStorage.removeItem('currentUser');
                const isPages = window.location.pathname.includes('/pages/');
                fetch(isPages ? '../assets/api/logout.php' : './assets/api/logout.php');
                window.location.href = isPages ? 'login.html' : 'pages/login.html';
            });
        });
    }
}