/* assets/js/header.js */

document.addEventListener("DOMContentLoaded", () => {
    loadHeader();
});

async function loadHeader() {
    // 1. Find Placeholder
    const placeholder = document.getElementById("global-header");
    if (!placeholder) return;

    try {
        // 2. Fetch the HTML Component
        // IMPORTANT: Path matches ../components/ because scripts run from pages/ folder
        const response = await fetch('../components/header.html'); 
        
        if (!response.ok) throw new Error("Failed to load header");

        // 3. Inject HTML into the page
        const html = await response.text();
        placeholder.innerHTML = html; 

        // 4. Run Header Logic (Active State, User Info, Logout)
        setActiveLink();
        updateHeaderUserInfo();
        setupLogout();

    } catch (error) {
        console.error("Error loading header:", error);
    }
}

function setActiveLink() {
    const currentPath = window.location.pathname;
    const links = document.querySelectorAll('.nav-link');

    links.forEach(link => {
        const page = link.getAttribute('data-page');
        // Highlight link if URL matches data-page attribute
        if (currentPath.includes(page)) {
            link.classList.add('active');
        }
    });
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
            if (confirm("Are you sure you want to log out?")) {
                localStorage.removeItem('currentUser');
                window.location.href = 'login.html';
            }
        });
    }
}