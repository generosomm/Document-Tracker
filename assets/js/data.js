// Global Data Store
window.documents = []; 
window.users = [];
window.departments = [];
window.documentsLoaded = false;

// Fetch Documents
async function fetchDocuments() {
    try {
        const isPages = window.location.pathname.includes('/pages/');
        let apiPath = isPages ? '../assets/api/get_documents.php' : './assets/api/get_documents.php';

        if (window.location.pathname.includes('analytics.html')) {
            apiPath += '?type=analytics';
        } 
        else if (window.location.pathname.includes('records.html')) {
            apiPath += '?type=archive';
        } 
        else {
            apiPath += '?type=active'; 
        }

        const response = await fetch(apiPath); 
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const data = await response.json();
        window.documents = data;
        window.documentsLoaded = true;
        
        if (typeof window.updateDashboardStats === 'function') window.updateDashboardStats();
        if (typeof window.renderNewDocuments === 'function') window.renderNewDocuments();
        if (typeof window.loadDashboardData === 'function') window.loadDashboardData();

        if (typeof window.renderTable === 'function' && window.location.pathname.includes('tracking')) {
            window.renderTable(allDocs);
            if(typeof window.updateStats === 'function') window.updateStats();
        }

        if (typeof window.initDashboard === 'function') window.initDashboard(); 
        if (typeof window.renderAnalytics === 'function') window.renderAnalytics();

        if (typeof window.renderRecordsTable === 'function') window.renderRecordsTable();
        if (typeof window.fetchArchivedDocuments === 'function') window.fetchArchivedDocuments();

    } catch (error) {
        console.error("Error fetching documents:", error);
    }
}

// Fetch Departments
async function fetchDepartments() {
    try {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/get_departments.php' : './assets/api/get_departments.php';

        const response = await fetch(apiPath);
        const data = await response.json();
        
        window.departments = data; 

        if (typeof window.populateDeptOptions === 'function') {
            window.populateDeptOptions();
        }

    } catch (error) {
        console.error("Error fetching departments:", error);
    }
}

// Fetch Users
async function fetchUsers() {
    try {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/get_users.php' : './assets/api/get_users.php';
        const response = await fetch(apiPath);
        const data = await response.json();
        window.users = data;
    } catch (error) {
        console.error("Error fetching users:", error);
    }
}

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    fetchDocuments();
    fetchUsers();
    fetchDepartments();
});