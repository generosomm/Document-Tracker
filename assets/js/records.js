// Global State
window.currentDateRange = 'all'; 
window.archivedDocs = [];
window.activeTab = 'all';

// Initialization

document.addEventListener('DOMContentLoaded', () => {
    populateDeptOptions();
    fetchArchivedDocuments();
    initFilters();
    initTabs();
    
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.filter-group.relative')) {
            document.getElementById('dateDropdown')?.classList.remove('show');
        }
    });
});

// Auto Search
const urlParams = new URLSearchParams(window.location.search);
    const searchId = urlParams.get('search');

    function performAutoSearch() {
        if (!searchId) return;

        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.value = searchId; 
            
            const checkData = setInterval(() => {
                if (window.archivedDocs && window.archivedDocs.length > 0) {
                    clearInterval(checkData);
                    console.log("Auto-searching Records for:", searchId);
                    renderTable(window.archivedDocs); // Trigger render
                }
            }, 200);

            setTimeout(() => clearInterval(checkData), 5000);
        }
    }
    performAutoSearch();

// Fetch Data
async function fetchArchivedDocuments() {
    const tableBody = document.getElementById('tableBody');
    if(tableBody) tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; padding:30px; color:#64748b;"><i class="ri-loader-4-line ri-spin"></i> Loading archives...</td></tr>';

    try {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/get_documents.php?type=archive' : './assets/api/get_documents.php?type=archive';

        const response = await fetch(apiPath);
        const data = await response.json();

        window.archivedDocs = Array.isArray(data) ? data : []; 
        updateStats(window.archivedDocs);
        renderTable(window.archivedDocs);

    } catch (error) {
        console.error("Fetch error:", error);
        if(tableBody) tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center; color:#ef4444;">Failed to load records.</td></tr>';
    }
}

// Stats Logic
function updateStats(docs) {
    const counts = { completed: 0, released: 0, rejected: 0, total: docs.length };
    
    docs.forEach(d => {
        const s = (d.status || '').toLowerCase();
        if(s === 'completed') counts.completed++;
        else if(s === 'released') counts.released++;
        else if(s === 'rejected') counts.rejected++;
    });

    const set = (id, val) => { const el = document.getElementById(id); if(el) el.innerText = val; };
    set('stat-completed', counts.completed);
    set('stat-released', counts.released);
    set('stat-rejected', counts.rejected);
    set('stat-total', counts.total);
}

// Initialize Tabs
function initTabs() {
    const tabs = document.querySelectorAll('.tab-btn-records');
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            window.activeTab = tab.dataset.tab;
            renderTable(window.archivedDocs);
        });
    });
}

// Render Table
function renderTable(docs) {
    const tbody = document.getElementById('tableBody');
    const countDisplay = document.getElementById('doc-count');
    if (!tbody) return;
    
    tbody.innerHTML = '';

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userName = user ? user.name : '';
    const userDept = user ? user.dept : '';

    const term = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const status = document.getElementById('statusFilter')?.value || 'all';
    const dept = document.getElementById('deptFilter')?.value || 'all';

    let filtered = docs.filter(d => {
        const matchesText = (d.title||'').toLowerCase().includes(term) || 
                           (d.id||'').toLowerCase().includes(term) || 
                           (d.description||'').toLowerCase().includes(term);
        const matchesStatus = status === 'all' || (d.status||'').toLowerCase() === status;
        const matchesDept = dept === 'all' || d.dept === dept;
        const matchesDate = checkDateRange(d);
        
        let matchesTab = true;
        if (window.activeTab === 'uploaded') {
            matchesTab = (d.uploaded_by || '').toLowerCase() === userName.toLowerCase() || 
                        (d.dept || '').toLowerCase() === userDept.toLowerCase();
        } else if (window.activeTab === 'routed') {
            matchesTab = checkIfProcessedByMe(d, userDept, userName);
        }
        
        return matchesText && matchesStatus && matchesDept && matchesDate && matchesTab;
    });
    
    updateStats(filtered);

    filtered.sort((a, b) => {
        return getFinalizedDate(b) - getFinalizedDate(a);
    });

    if (countDisplay) countDisplay.innerText = filtered.length;

    if (filtered.length === 0) {
        tbody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding:3rem; color:#94a3b8;">No archived records found matching criteria.</td></tr>`;
        return;
    }

    filtered.forEach(doc => {
        const dateObj = getFinalizedDate(doc);
        const dateStr = dateObj.toISOString().split('T')[0];

        const tr = document.createElement('tr');
        tr.onclick = function(e) {
            if(!e.target.closest('.action-btn') && e.target.type !== 'checkbox') {
               window.openDocViewer(doc);
            }
        };

        tr.innerHTML = `
            <td><input type="checkbox"></td>
            <td class="col-id">${doc.id}</td>
            <td class="col-title" title="${doc.title}">${doc.title}</td>
            <td class="col-dept" title="${doc.dept}">${doc.dept}</td>
            <td>${getStatusBadge(doc.status)}</td>
            <td>${doc.category}</td>
            <td style="font-size:0.75rem">${doc.date}</td>
            <td style="font-size:0.75rem; font-weight:600;">${dateStr}</td>
            <td>${doc.finalized_by || '-'}</td>
            <td>
                <button class="action-btn" onclick="window.openDocViewer(${JSON.stringify(doc).replace(/"/g, '&quot;')})" title="View Details">
                    <i class="ri-eye-line"></i>
                </button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// 4. HELPERS

// Helper to get the actual Date object of when it was finalized
function getFinalizedDate(doc) {
    // If timeline exists, the latest entry (index 0) is the finalizing action
    if (doc.timeline && doc.timeline.length > 0) {
        return new Date(doc.timeline[0].time.replace(/-/g, "/"));
    }
    return new Date(doc.date.replace(/-/g, "/"));
}

function checkDateRange(doc) {
    if (window.currentDateRange === 'all') return true;
    
    const targetDate = getFinalizedDate(doc);
    const now = new Date();
    
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (window.currentDateRange === 'today') {
        return targetDate >= startOfToday;
    }
    if (window.currentDateRange === '7days') {
        const pastDate = new Date(startOfToday);
        pastDate.setDate(pastDate.getDate() - 7);
        return targetDate >= pastDate;
    }
    if (window.currentDateRange === '30days') {
        const pastDate = new Date(startOfToday);
        pastDate.setDate(pastDate.getDate() - 30);
        return targetDate >= pastDate;
    }
    if (window.currentDateRange === 'year') {
        return targetDate.getFullYear() === now.getFullYear();
    }
    return true;
}

function getStatusBadge(status) {
    const config = {
        released: { icon: 'ri-send-plane-fill', class: 'released' },
        completed: { icon: 'ri-checkbox-circle-fill', class: 'completed' },
        signed: { icon: 'ri-pen-nib-fill', class: 'completed' },
        progress: { icon: 'ri-loader-4-line', class: 'progress' },     // Blue
        pending: { icon: 'ri-time-line', class: 'pending' },           // Orange/Gray
        revision: { icon: 'ri-alert-line', class: 'revision' },        // Orange
        rejected: { icon: 'ri-close-circle-line', class: 'rejected' }  // Red
    };
    
    // Normalize status
    const sKey = (status || '').toLowerCase();
    
    // Map 'signed' to config or fallback to progress
    const s = config[sKey] || config.progress;
    
    // Format text (e.g., "Signed" instead of "signed")
    let label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    if(sKey === 'signed') label = "Signed (Ready)"; // Explicit label

    return `<span class="status-badge ${s.class}" style="${sKey === 'signed' ? 'background:#eff6ff; color:#2563eb; border:1px solid #bfdbfe;' : ''}"><i class="${s.icon}"></i> ${label}</span>`;
}

function toggleDateDropdown() { document.getElementById('dateDropdown')?.classList.toggle('show'); }

function setDateFilter(range) {
    window.currentDateRange = range;
    const labels = { 'all': 'All Time', 'today': 'Today', '7days': 'Last 7 Days', '30days': 'Last 30 Days', 'year': 'This Year' };
    document.getElementById('dateLabel').innerText = labels[range];
    
    document.querySelectorAll('.date-option').forEach(opt => opt.classList.remove('active'));
    event.target.classList.add('active');
    document.getElementById('dateDropdown').classList.remove('show');
    
    renderTable(window.archivedDocs);
}

// External Access for Stat Cards
window.filterData = function(status) {
    const sel = document.getElementById('statusFilter');
    if(sel) { sel.value = status; renderTable(window.archivedDocs); }
};

function initFilters() {
    document.getElementById('searchInput')?.addEventListener('input', () => renderTable(window.archivedDocs));
    document.getElementById('statusFilter')?.addEventListener('change', () => renderTable(window.archivedDocs));
    document.getElementById('deptFilter')?.addEventListener('change', () => renderTable(window.archivedDocs));
}

async function populateDeptOptions() {
    const select = document.getElementById('deptFilter');
    if(!select) return;
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const userDept = user ? user.dept : null;
    
    try {
        const isPages = window.location.pathname.includes('/pages/');
        const res = await fetch(isPages ? '../assets/api/get_departments.php' : './assets/api/get_departments.php');
        const depts = await res.json();
        if(Array.isArray(depts)) {
            select.innerHTML = '';
            
            const allOpt = document.createElement('option');
            allOpt.value = 'all';
            allOpt.textContent = 'All Departments';
            allOpt.selected = true;
            select.appendChild(allOpt);
            
            if (userDept) {
                const myDeptOpt = document.createElement('option');
                myDeptOpt.value = userDept;
                myDeptOpt.textContent = `My Department (${userDept})`;
                select.appendChild(myDeptOpt);
            }
            
            depts.forEach(d => {
                const opt = document.createElement('option');
                opt.value = d; 
                opt.textContent = d;
                select.appendChild(opt);
            });
        }
    } catch(e) {}
}

function checkIfProcessedByMe(doc, myDept, myName) {
    if (!doc.timeline || !Array.isArray(doc.timeline)) return false;
    const myDeptLower = myDept.toLowerCase();
    const myNameLower = myName.toLowerCase();
    
    return doc.timeline.some(t => {
        const roleMatch = t.role && t.role.toLowerCase().includes(myDeptLower);
        const userMatch = t.user && t.user.toLowerCase() === myNameLower;
        return roleMatch || userMatch;
    });
}

function exportRecords() { 
    showToast("Exporting feature coming soon!", "info"); 
}