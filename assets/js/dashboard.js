// Global State
let isPendingListExpanded = false;
let currentSortOrder = 'newest';
let memoTypeFilter = 'all';
let memoAudienceFilter = 'all';

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load initial data
    if (window.loadMemos) window.loadMemos();
    if (window.loadDashboardData) window.loadDashboardData();

    const sortBtn = document.getElementById('btn-sort-new');
    if (sortBtn) {
        sortBtn.onclick = () => {
            currentSortOrder = currentSortOrder === 'newest' ? 'oldest' : 'newest';
            sortBtn.innerHTML = currentSortOrder === 'newest' ? '<i class="ri-sort-desc"></i>' : '<i class="ri-sort-asc"></i>';
            sortBtn.title = currentSortOrder === 'newest' ? 'Sort: Newest First' : 'Sort: Oldest First';
            window.loadDashboardData();
        };
    }
});

// Filter Helpers
function getAllRelevantDocuments(allDocs) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return [];
    if (user.role === 'Super Administrator') return allDocs;

    const myDept = user.dept.trim().toLowerCase();
    
    return allDocs.filter(doc => 
        (doc.assignee && doc.assignee.trim().toLowerCase() === myDept) || 
        (doc.dept && doc.dept.trim().toLowerCase() === myDept)
    );
}

function getMyPendingActionItems(allDocs) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user) return [];
    
    return allDocs.filter(doc => 
        doc.status.toLowerCase() === 'pending' &&
        doc.assignee && 
        doc.assignee.trim().toLowerCase() === user.dept.trim().toLowerCase()
    );
}

// Relative Time
function getRelativeTime(dateString) {
    if (!dateString) return '';
    const date = new Date(dateString.replace(/-/g, '/'));
    const now = new Date();
    const diff = Math.floor((now - date) / 1000);

    if (diff < 60) return 'Just now';
    const minutes = Math.floor(diff / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return days === 1 ? '1d ago' : `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    return `${minutes}m ago`;
}

// Load Dashboard Data
window.loadDashboardData = async function () {
    const listContainer = document.getElementById('new-docs-list');
    const badge = document.getElementById('new-docs-badge');

    if (listContainer && listContainer.children.length === 0) {
        listContainer.innerHTML = `
            <div style="padding:20px; text-align:center; color:#94a3b8;">
                <i class="ri-loader-4-line ri-spin"></i> Checking...
            </div>`;
    }

    try {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages
            ? '../assets/api/get_documents.php'
            : './assets/api/get_documents.php';

        const response = await fetch(apiPath + '?type=active');
        const allDocs = await response.json();

        updateDashboardStats(allDocs);

        const user = JSON.parse(localStorage.getItem('currentUser'));
        let listDocs = [];
        
        if (user && user.role === 'Super Administrator') {
            listDocs = allDocs.filter(d => d.status.toLowerCase() === 'pending');
        } else {
            listDocs = getMyPendingActionItems(allDocs);
        }

        listDocs.sort((a, b) => {
            const da = new Date(a.date.replace(/-/g, '/'));
            const db = new Date(b.date.replace(/-/g, '/'));
            return currentSortOrder === 'newest' ? db - da : da - db;
        });

        if (badge) {
            badge.innerText = `${listDocs.length} Pending`;
            badge.style.backgroundColor = listDocs.length > 0 ? '#ef4444' : '#64748b';
        }

        if (listContainer) {
            listContainer.innerHTML = '';

            if (listDocs.length === 0) {
                listContainer.innerHTML = `
                    <div style="padding:2rem; text-align:center; color:#94a3b8; font-size:0.85rem;">
                        All caught up! No pending documents for you.
                    </div>`;
                return;
            }

            const limit = 5;
            const hasMore = listDocs.length > limit;
            const docsToShow = isPendingListExpanded ? listDocs : listDocs.slice(0, limit);

            docsToShow.forEach(doc => {
                const item = document.createElement('div');
                item.className = 'list-item clickable';
                item.onclick = () => {
                    if (window.openDocViewer) window.openDocViewer(doc);
                };

                let deptColor = '#e0f2fe', deptText = '#0284c7';
                
                item.innerHTML = `
                    <div class="icon-box blue"><i class="ri-file-text-line"></i></div>
                    <div class="item-content">
                        <div class="item-head">
                            <h4 class="item-title">${doc.title}</h4>
                            <span class="item-ref">${doc.id}</span>
                        </div>
                        <div class="item-meta-row">
                            <span style="font-size:0.65rem; background:${deptColor}; color:${deptText}; padding:1px 5px; border-radius:3px; font-weight:600;">
                                From: ${doc.dept}
                            </span>
                            <span class="relative-time">${getRelativeTime(doc.date)}</span>
                        </div>
                    </div>
                    <i class="ri-arrow-right-s-line" style="color:#cbd5e1; font-size:1.1rem;"></i>
                `;
                listContainer.appendChild(item);
            });

            if (hasMore) {
                const btnContainer = document.createElement('div');
                btnContainer.style.textAlign = 'center';
                btnContainer.style.padding = '8px 0 0 0';

                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'view-all-btn';
                toggleBtn.innerHTML = isPendingListExpanded
                    ? 'Show Less <i class="ri-arrow-up-s-line"></i>'
                    : `View All (${listDocs.length}) <i class="ri-arrow-down-s-line"></i>`;

                toggleBtn.onclick = () => {
                    isPendingListExpanded = !isPendingListExpanded;
                    window.loadDashboardData();
                };

                btnContainer.appendChild(toggleBtn);
                listContainer.appendChild(btnContainer);
            }
        }
    } catch (error) {
        console.error('Dashboard Error:', error);
        if (listContainer) {
            listContainer.innerHTML = '<div style="padding:10px; color:red; text-align:center;">Connection Failed</div>';
        }
    }
};

// Stats Update
function updateDashboardStats(docs) {
    if (!docs) return;

    const stats = {
        pending:   { submitted: 0, approval: 0, status: 'pending', label: 'Pending' },
        progress:  { submitted: 0, approval: 0, status: 'progress', label: 'In Progress' },
        completed: { submitted: 0, approval: 0, status: 'completed', label: 'Completed' },
        attention: { submitted: 0, approval: 0, status: 'revision', label: 'Needs Attention' }
    };

    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'Guest', dept: 'All', name: 'Unknown' };
    const myDept = (user.dept || '').trim().toLowerCase();
    const isSuperAdmin = user.role === 'Super Administrator';

    docs.forEach(doc => {
        const s = (doc.status || '').trim().toLowerCase();
        const docDept = (doc.dept || '').trim().toLowerCase();
        const docAssignee = (doc.assignee || '').trim().toLowerCase();
        const isCreatedByMe = docDept === myDept;
        const isCurrentlyWithMe = docAssignee === myDept;
        const isGlobalCompleted = (s === 'completed');

        // SUBMITTED: Simple status-based counting
        if (isCreatedByMe) {
            if (s === 'pending') stats.pending.submitted++;
            else if (s === 'progress' || s === 'signed' || s === 'in progress') stats.progress.submitted++;
            else if (s === 'completed') stats.completed.submitted++;
            else if (s === 'revision' || s === 'rejected') stats.attention.submitted++;
        }

        // APPROVAL: Match tracking.js sequential if-else logic exactly
        if (!isCreatedByMe || isSuperAdmin) {
            const hasProcessed = doc.timeline && doc.timeline.some(t => {
                return (t.role && t.role.toLowerCase().includes(myDept)) || (t.user && t.user === user.name);
            });

            if (isSuperAdmin) {
                // Super Admin sees all documents in approval
                if (s === 'pending') stats.pending.approval++;
                else if (s === 'progress' || s === 'signed' || s === 'in progress') stats.progress.approval++;
                else if (s === 'completed') stats.completed.approval++;
                else if (s === 'revision' || s === 'rejected') stats.attention.approval++;
            } else {
                // Regular users: use tracking.js sequential logic
                if (isCurrentlyWithMe && s === 'pending') {
                    stats.pending.approval++;
                }
                else if (isCurrentlyWithMe && (s === 'progress' || s === 'signed' || s === 'in progress')) {
                    stats.progress.approval++;
                }
                else if (hasProcessed && (isGlobalCompleted || !isCurrentlyWithMe) && s !== 'rejected') {
                    stats.completed.approval++;
                }
                else if (s === 'revision' || s === 'rejected') {
                    stats.attention.approval++;
                }
            }
        }
    });

    const renderStat = (cardId, data) => {
        const card = document.getElementById(cardId);
        
        if (card) {
            if (!card.classList.contains('expanded-card')) {
                card.classList.add('expanded-card');
                card.removeAttribute('onclick');
            }

            card.innerHTML = `
                <div class="stat-header">
                    <span>${data.label}</span>
                    <i class="${getIconClass(data.status)}"></i>
                </div>
                <div class="vertical-stat-container">
                    <div class="vert-stat-row" onclick="window.location.href='tracking.html?status=${data.status}&view=submitted'">
                        <span class="vert-label">Submitted</span>
                        <span class="vert-number">${data.submitted}</span>
                    </div>
                    <div class="vert-divider"></div>
                    <div class="vert-stat-row" onclick="window.location.href='tracking.html?status=${data.status}&view=approval'">
                        <span class="vert-label">Approval</span>
                        <span class="vert-number">${data.approval}</span>
                    </div>
                </div>
            `;
        }
    };

    renderStat('card-pending', stats.pending);
    renderStat('card-progress', stats.progress);
    renderStat('card-completed', stats.completed);
    renderStat('card-attention', stats.attention);
}

function getIconClass(status) {
    if(status === 'pending') return 'ri-time-line';
    if(status === 'progress') return 'ri-loader-4-line';
    if(status === 'completed') return 'ri-checkbox-circle-line';
    return 'ri-alert-line';
}

// Load Memos
window.loadMemos = async function () {
    const container = document.getElementById('memo-list-container');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const canManage = PermissionManager.can('upload_memo');

    try {
        const formData = new FormData();
        formData.append('action', 'get_memos');

        const apiPath = window.location.pathname.includes('/pages/')
            ? '../assets/api/memo_api.php'
            : './assets/api/memo_api.php';

        const res = await fetch(apiPath, { method: 'POST', body: formData });
        const json = await res.json();

        if (json.success && json.data.length > 0) {
            let filteredMemos = json.data;

            if (memoTypeFilter !== 'all') {
                filteredMemos = filteredMemos.filter(m => m.type === memoTypeFilter);
            }

            if (memoAudienceFilter === 'me' && user) {
                const userDept = user.dept.trim();
                filteredMemos = filteredMemos.filter(m => {
                    // Exclude memos posted for "All"
                    if (m.target_audience === 'All') return false;
                    // Only show memos where user's department is specifically targeted
                    const audiences = m.target_audience.split(',').map(a => a.trim());
                    return audiences.includes(userDept);
                });
            }

            filteredMemos.sort((a, b) => {
                const da = new Date(a.created_at.replace(/-/g, '/'));
                const db = new Date(b.created_at.replace(/-/g, '/'));
                return da - db; // Ascending order (oldest first)
            });

            container.innerHTML = '';

            if (filteredMemos.length === 0) {
                container.innerHTML = `<div style="padding:20px; text-align:center; color:#94a3b8; font-size:0.85rem;">No memos match the selected filters.</div>`;
                return;
            }

            filteredMemos.forEach(memo => {
                let iconClass = 'ri-notification-3-line', iconBg = 'orange';
                if (memo.type === 'Urgent') { iconBg = 'red'; iconClass = 'ri-alarm-warning-line'; }
                else if (memo.type === 'Holiday') { iconBg = 'purple'; iconClass = 'ri-calendar-event-line'; }

                const item = document.createElement('div');
                item.className = 'list-item clickable';
                
                item.onclick = () => { 
                    if (window.viewMemo) {
                        window.viewMemo(memo.id); 
                    } else {
                        console.error("viewMemo function not found in memo-modal.js");
                    }
                };

                // Only show delete button if user is the creator of this memo
                const isCreator = user && memo.created_by === user.name;
                const deleteBtn = isCreator
                    ? `<button onclick="deleteMemo(event, ${memo.id})" style="background:none; border:none; color:#ef4444; cursor:pointer; margin-left:auto;"><i class="ri-delete-bin-line"></i></button>`
                    : '';

                const attachIcon = memo.attachment ? `<i class="ri-attachment-2" style="color:#2563EB; font-size:0.8rem; margin-right:5px;"></i>` : '';
                
                const typeBadge = `<span class="memo-type-badge ${memo.type.toLowerCase()}">${memo.type}</span>`;

                item.innerHTML = `
                    <div class="icon-box ${iconBg}"><i class="${iconClass}"></i></div>
                    <div class="item-content">
                        <div class="item-head">
                            <h4 class="item-title">${memo.title}</h4>
                            <div style="display:flex; align-items:center; gap:5px;">
                                ${typeBadge}${attachIcon}${deleteBtn}
                            </div>
                        </div>
                        <p class="item-desc" style="display:-webkit-box; -webkit-line-clamp:1; -webkit-box-orient:vertical; overflow:hidden;">
                            ${memo.message}
                        </p>
                        <span class="item-meta">
                            <i class="ri-time-line"></i>
                            ${new Date(memo.created_at).toLocaleDateString()}
                        </span>
                    </div>`;
                container.appendChild(item);
            });
        } else {
            container.innerHTML = `<div style="padding:20px; text-align:center; color:#94a3b8; font-size:0.85rem;">No announcements.</div>`;
        }
    } catch (e) {
        container.innerHTML = '<div style="padding:10px; color:red; text-align:center;">Failed to load.</div>';
    }
};

// Filter Functions
window.applyMemoFilters = function() {
    const select = document.getElementById('memo-type-filter');
    if (select) {
        memoTypeFilter = select.value;
        window.loadMemos();
    }
};

window.setAudienceFilter = function(type) {
    memoAudienceFilter = type;
    
    const btnAll = document.getElementById('audience-all');
    const btnMe = document.getElementById('audience-me');
    
    if (type === 'all') {
        btnAll.classList.add('active');
        btnMe.classList.remove('active');
    } else {
        btnAll.classList.remove('active');
        btnMe.classList.add('active');
    }
    
    window.loadMemos();
};

// Delete Memo
window.deleteMemo = async function (e, id) {
    e.stopPropagation();
    
    showConfirm('Delete this memo?', async () => {
        const formData = new FormData();
        formData.append('action', 'delete_memo');
        formData.append('id', id);

        const apiPath = window.location.pathname.includes('/pages/')
            ? '../assets/api/memo_api.php'
            : './assets/api/memo_api.php';

        await fetch(apiPath, { method: 'POST', body: formData });
        showToast('Memo deleted successfully', 'success');
        window.loadMemos();
    });
};

// Auto Refresh - Dashboard and Badge
setInterval(() => {
    if (!document.hidden) {
        if (typeof window.loadDashboardData === 'function') {
            console.log("Auto-refreshing Dashboard...");
            window.loadDashboardData();
        }
        // Also refresh the header badge
        if (typeof window.updatePendingBadge === 'function') {
            window.updatePendingBadge();
        }
    }
}, 10000);