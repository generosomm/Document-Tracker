// Global State
window.allDocuments = [];
window.currentViewMode = 'submitted';
window.currentStatusFilter = 'all';
window.currentDateRange = 'all';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'Guest', dept: 'All' };
    
    const isSuperAdmin = currentUser.role === 'Super Administrator';
    const isCMIS = currentUser.dept && currentUser.dept.toUpperCase().includes('CMIS');
    
    const deptFilterGroup = document.getElementById('deptFilterGroup');
    const thAssignedTo = document.getElementById('thAssignedTo');

    if (deptFilterGroup && !isSuperAdmin && !isCMIS) {
        deptFilterGroup.style.display = 'none';
        if(thAssignedTo) thAssignedTo.style.display = 'none';
    }

    if(window.populateDeptOptions) window.populateDeptOptions(currentUser);
    
    const urlParams = new URLSearchParams(window.location.search);
    const urlMode = urlParams.get('view'); 
    const urlStatus = urlParams.get('status');

    if(urlMode && (urlMode === 'submitted' || urlMode === 'approval')) {
        switchTrackingMode(urlMode);
    } else {
        switchTrackingMode('submitted');
    }

    if(urlStatus) window.currentStatusFilter = urlStatus;

    setupEventListeners();
    fetchDocuments();

    setInterval(() => {
        if (!document.hidden) fetchDocuments(true);
    }, 10000);
});

// View Mode Logic
window.switchTrackingMode = function(mode) {
    window.currentViewMode = mode;
    window.currentStatusFilter = 'all';

    document.querySelectorAll('.view-tab').forEach(btn => btn.classList.remove('active'));
    const activeBtn = document.getElementById(`btn-mode-${mode}`);
    if(activeBtn) activeBtn.classList.add('active');

    updateCardDescriptions(mode);
    applyFilters();
};

function updateCardDescriptions(mode) {
    if (mode === 'submitted') {
        setText('desc-pending', "Submitted, not yet opened");
        setText('desc-progress', "Being reviewed by others");
        setText('desc-completed', "Routing finished");
        setText('desc-attention', "Returned to you");
    } else {
        setText('desc-pending', "Received, waiting for you");
        setText('desc-progress', "You are reviewing this");
        setText('desc-completed', "You signed/approved");
        setText('desc-attention', "Urgent / Overdue");
    }
}

function setText(id, text) {
    const el = document.getElementById(id);
    if(el) el.innerText = text;
}

window.applyStatusFilter = function(status) {
    if (window.currentStatusFilter === status) {
        window.currentStatusFilter = 'all';
        document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-filter'));
    } else {
        window.currentStatusFilter = status;
        document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-filter'));
        const activeCard = document.getElementById(`card-${status}`);
        if(activeCard) activeCard.classList.add('active-filter');
    }
    
    const statusSelect = document.getElementById('statusFilter');
    if(statusSelect) statusSelect.value = window.currentStatusFilter;

    applyFilters();
};

// Fetch and Data Handling
async function fetchDocuments(isSilent = false) {
    const tableBody = document.getElementById('tableBody');
    if(!isSilent && tableBody && window.allDocuments.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align: center; padding: 40px; color: #94a3b8;">
            <i class="ri-loader-4-line ri-spin" style="font-size: 2rem;"></i><br>Loading...
        </td></tr>`;
    }

    try {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/get_documents.php' : './assets/api/get_documents.php';

        const response = await fetch(apiPath + '?type=active');
        const data = await response.json();

        window.allDocuments = Array.isArray(data) ? data : [];
        
        populateCategoryOptions();
        applyFilters(); 

    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

function populateCategoryOptions() {
    const select = document.getElementById('categoryFilter');
    if (!select) return;

    const currentVal = select.value;
    const uniqueCategories = [...new Set(window.allDocuments.map(d => d.category))].filter(Boolean).sort();

    select.innerHTML = '<option value="all">All Categories</option>';
    
    uniqueCategories.forEach(cat => {
        const option = document.createElement('option');
        option.value = cat;
        option.textContent = cat;
        select.appendChild(option);
    });

    if (uniqueCategories.includes(currentVal)) {
        select.value = currentVal;
    }
}

// Core Filtering Logic
function applyFilters() {
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'Guest', dept: 'All', name: 'Unknown' };
    const myDept = (user.dept || '').trim().toLowerCase();
    const isSuperAdmin = user.role === 'Super Administrator';

    const searchTerm = document.getElementById('searchInput')?.value.toLowerCase() || '';
    const categoryVal = document.getElementById('categoryFilter')?.value || 'all';
    
    const statusDropdownVal = document.getElementById('statusFilter')?.value;
    if (statusDropdownVal && statusDropdownVal !== window.currentStatusFilter) {
    }

    let modeFilteredDocs = window.allDocuments.filter(doc => {
        if (isSuperAdmin) return true; 

        const docDept = (doc.dept || '').trim().toLowerCase();
        const docAssignee = (doc.assignee || '').trim().toLowerCase();
        const isWithMe = docAssignee === myDept;
        const isCreatedByMe = docDept === myDept;

        if (window.currentViewMode === 'submitted') {
            return isCreatedByMe;
        } else {
            if (isCreatedByMe) return false; 
            if (isWithMe) return true;
            if (checkIfProcessed(doc, myDept, user.name)) return true;
            return false;
        }
    });

    updateStatusCounts(modeFilteredDocs, myDept, window.currentViewMode);

    let finalDocs = modeFilteredDocs.filter(doc => {
        const s = (doc.status || '').toLowerCase();
        const isWithMe = (doc.assignee || '').toLowerCase() === myDept;
        const isGlobalCompleted = (s === 'completed');

        let matchesStatus = true;
        if (window.currentStatusFilter !== 'all') {
            if (window.currentViewMode === 'approval' && !isSuperAdmin) {
                if (window.currentStatusFilter === 'pending') matchesStatus = (isWithMe && s === 'pending');
                else if (window.currentStatusFilter === 'progress') matchesStatus = (isWithMe && (s === 'progress' || s === 'signed' || s === 'in progress'));
                else if (window.currentStatusFilter === 'completed') {
                    const iProcessed = checkIfProcessed(doc, myDept, user.name);
                    matchesStatus = (iProcessed && (isGlobalCompleted || !isWithMe) && s !== 'rejected');
                }
                else if (window.currentStatusFilter === 'attention') matchesStatus = (s === 'revision' || s === 'rejected');
                else if (window.currentStatusFilter === 'revision') matchesStatus = (s === 'revision');
            } else {
                if (window.currentStatusFilter === 'pending') matchesStatus = (s === 'pending');
                else if (window.currentStatusFilter === 'progress') matchesStatus = (s === 'progress' || s === 'signed' || s === 'in progress');
                else if (window.currentStatusFilter === 'completed') matchesStatus = (s === 'completed');
                else if (window.currentStatusFilter === 'attention') matchesStatus = (s === 'revision' || s === 'rejected');
                else if (window.currentStatusFilter === 'revision') matchesStatus = (s === 'revision');
            }
        }
        if (!matchesStatus) return false;

        if (searchTerm) {
            const idMatch = (doc.id || '').toLowerCase().includes(searchTerm);
            const titleMatch = (doc.title || '').toLowerCase().includes(searchTerm);
            const descMatch = (doc.description || '').toLowerCase().includes(searchTerm);
            if (!idMatch && !titleMatch && !descMatch) return false;
        }

        if (categoryVal !== 'all' && doc.category !== categoryVal) return false;

        if (window.currentDateRange !== 'all') {
            const docDateStr = doc.date ? doc.date.split(' ')[0] : '';
            const today = new Date().toISOString().split('T')[0];
            
            if (window.currentDateRange === 'today') {
                if (docDateStr !== today) return false;
            } else if (window.currentDateRange === '7days') {
                if (docDateStr < getRelativeDate(7)) return false;
            } else if (window.currentDateRange === '30days') {
                if (docDateStr < getRelativeDate(30)) return false;
            } else if (window.currentDateRange === 'custom') {
                const start = document.getElementById('startDate')?.value;
                const end = document.getElementById('endDate')?.value;
                if (start && end && (docDateStr < start || docDateStr > end)) return false;
            }
        }

        return true;
    });

    renderTable(finalDocs);
}

function updateStatusCounts(docs, myDept, mode) {
    const counts = { pending: 0, progress: 0, completed: 0, attention: 0 };
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isSuperAdmin = user.role === 'Super Administrator';

    docs.forEach(doc => {
        const s = (doc.status || '').toLowerCase();
        const isWithMe = (doc.assignee || '').toLowerCase() === myDept;
        const isGlobalCompleted = (s === 'completed');

        if (mode === 'approval' && !isSuperAdmin) {
            const iProcessed = checkIfProcessed(doc, myDept, user.name);
            if (isWithMe && s === 'pending') counts.pending++;
            else if (isWithMe && (s === 'progress' || s === 'signed' || s === 'in progress')) counts.progress++;
            else if (iProcessed && (isGlobalCompleted || !isWithMe) && s !== 'rejected') counts.completed++;
            else if (s === 'revision' || s === 'rejected') counts.attention++;
        } else {
            if (s === 'pending') counts.pending++;
            else if (s === 'progress' || s === 'signed' || s === 'in progress') counts.progress++;
            else if (s === 'completed') counts.completed++;
            else if (s === 'revision' || s === 'rejected') counts.attention++;
        }
    });

    setText('count-pending', counts.pending);
    setText('count-progress', counts.progress);
    setText('count-completed', counts.completed);
    setText('count-attention', counts.attention);
}

function checkIfProcessed(doc, myDept, myName) {
    if (!doc.timeline || !Array.isArray(doc.timeline)) return false;
    return doc.timeline.some(t => {
        const roleMatch = t.role && t.role.toLowerCase().includes(myDept);
        const userMatch = t.user && t.user === myName;
        return roleMatch || userMatch;
    });
}

function getRelativeDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    return d.toISOString().split('T')[0];
}

// Render Table and Badges
function renderTable(docs) {
    const tableBody = document.getElementById('tableBody');
    const countDisplay = document.getElementById('doc-count');
    
    if(countDisplay) countDisplay.textContent = docs.length;
    if(!tableBody) return;
    
    tableBody.innerHTML = '';

    if(docs.length === 0) {
        tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 3rem; color: #94a3b8;">
            <i class="ri-folder-open-line" style="font-size: 2rem; display: block; margin-bottom: 10px;"></i>
            No documents found.
        </td></tr>`;
        return;
    }

    docs.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));

    docs.forEach(doc => {
        const user = JSON.parse(localStorage.getItem('currentUser')) || {};
        const myDept = (user.dept || '').trim().toLowerCase();
        let locationHtml = '';

        if (doc.assignee && doc.assignee.toLowerCase().includes(myDept)) {
             locationHtml = `<span class="loc-badge mine">With You</span>`;
        } else {
             let loc = doc.assignee || 'Unassigned';
             const match = loc.match(/\((.*?)\)/); 
             if (match) loc = match[1];
             locationHtml = `<span class="loc-badge other"><i class="ri-map-pin-line"></i> ${loc}</span>`;
        }

        const tr = document.createElement('tr');
        tr.onclick = (e) => { 
            if(!e.target.closest('.action-btn') && e.target.type !== 'checkbox') {
                if(window.openDocViewer) window.openDocViewer(doc); 
            }
        };

        tr.innerHTML = `
            <td><input type="checkbox"></td>
            <td style="font-family:monospace; color:#64748b; font-size:0.8rem;">${doc.id}</td>
            <td><div class="row-title" style="font-weight:600; color:#334155;">${doc.title}</div></td>
            <td style="font-size:0.8rem;">${doc.dept}</td>
            <td>
                <div style="display:flex; align-items:center; gap:6px;">
                    ${getStatusBadge(doc.status)}
                    ${locationHtml}
                </div>
            </td>
            <td>${doc.category}</td>
            <td style="white-space:nowrap;">${doc.date}</td>
            <td>
                <div class="prog-container" style="width:70px;">
                    <div class="prog-bar-bg"><div class="prog-fill" style="width: ${doc.progress}%"></div></div>
                    <span class="prog-text">${doc.progress}%</span>
                </div>
            </td>
            <td class="td-assignee" style="color:#2563EB; font-weight:600; font-size:0.8rem;">${doc.assignee}</td>
            <td style="white-space:nowrap; display: flex; gap: 4px;">
                <button class="action-btn" data-require-feature="view_timeline" onclick="window.openTimeline('${doc.id}'); event.stopPropagation();" title="Timeline"><i class="ri-history-line"></i></button>
                <button class="action-btn" onclick="window.openTransferModal('${doc.id}'); event.stopPropagation();" title="Transfer"><i class="ri-share-forward-line"></i></button>
                ${(user.role === 'Super Administrator') ? `<button class="action-btn del" onclick="window.deleteDocument('${doc.id}')"><i class="ri-delete-bin-line"></i></button>` : ''}
            </td>
        `;
        tableBody.appendChild(tr);
    });

    // Re-apply permissions to dynamically created elements
    if (window.PermissionManager && window.PermissionManager.initialized) {
        window.PermissionManager.applyPermissions();
    }
}

function getStatusBadge(status) {
    const s = (status || 'pending').toLowerCase();
    const map = {
        'pending': { icon: 'ri-time-line', cls: 'pending' },
        'progress': { icon: 'ri-loader-4-line', cls: 'progress' },
        'signed': { icon: 'ri-pen-nib-fill', cls: 'signed' },
        'completed': { icon: 'ri-checkbox-circle-fill', cls: 'completed' },
        'released': { icon: 'ri-send-plane-fill', cls: 'released' },
        'revision': { icon: 'ri-alert-line', cls: 'revision' },
        'rejected': { icon: 'ri-close-circle-line', cls: 'rejected' }
    };
    const c = map[s] || map['pending'];
    let label = s.charAt(0).toUpperCase() + s.slice(1);
    if(s === 'in progress') label = 'In Progress';
    return `<span class="status-badge ${c.cls}"><i class="${c.icon}"></i> ${label}</span>`;
}

// Event Listeners
function setupEventListeners() {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);

    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) categoryFilter.addEventListener('change', applyFilters);

    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', (e) => {
            window.currentStatusFilter = e.target.value;
            document.querySelectorAll('.stat-card').forEach(c => c.classList.remove('active-filter'));
            applyFilters();
        });
    }

    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const customContainer = document.getElementById('customDateInputs');
    
    if (dateTrigger && dateDropdown) {
        dateTrigger.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            dateDropdown.classList.toggle('show'); 
        });

        document.addEventListener('click', (e) => {
            if (!dateTrigger.contains(e.target) && !dateDropdown.contains(e.target)) {
                dateDropdown.classList.remove('show');
            }
        });

        const options = dateDropdown.querySelectorAll('.date-option');
        options.forEach(opt => {
            opt.addEventListener('click', (e) => {
                e.stopPropagation();
                const range = opt.getAttribute('data-range');
                
                options.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');

                if (range === 'custom') {
                    if(customContainer) customContainer.style.display = 'flex';
                } else {
                    if(customContainer) customContainer.style.display = 'none';
                    window.currentDateRange = range;
                    document.getElementById('dateLabel').innerText = opt.innerText;
                    dateDropdown.classList.remove('show');
                    applyFilters();
                }
            });
        });

        const applyBtn = document.getElementById('applyCustomDate');
        if(applyBtn) {
            applyBtn.addEventListener('click', () => {
                const s = document.getElementById('startDate').value;
                const e = document.getElementById('endDate').value;
                if(s && e) {
                    window.currentDateRange = 'custom';
                    document.getElementById('dateLabel').innerText = `${s} - ${e}`;
                    dateDropdown.classList.remove('show');
                    applyFilters();
                } else {
                    showToast("Please select both start and end dates.", "warning");
                }
            });
        }
    }
}

// Helper Functions
window.deleteDocument = async function(docId) { 
    showConfirm("Delete this document?", async () => {
        showToast("Document deletion feature coming soon", "info");
    });
};
function populateDeptOptions(userArg) {};