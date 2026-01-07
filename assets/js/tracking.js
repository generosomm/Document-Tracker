/* assets/js/tracking.js */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. USER & PERMISSIONS ---
    const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { role: 'Guest', name: 'Unknown' };

    if (currentUser.role === 'CAS') {
        const style = document.createElement('style');
        style.innerHTML = `button[onclick*="Sign"], .sign-action { display: none !important; }`;
        document.head.appendChild(style);
    }

    // --- 2. DATA & DOM ELEMENTS ---
    const documents = window.documents || []; 
    
    const tableBody = document.getElementById('tableBody');
    const countDisplay = document.getElementById('doc-count');
    const searchInput = document.getElementById('searchInput');
    const statusSelect = document.getElementById('statusFilter');
    const deptSelect = document.getElementById('deptFilter');
    
    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const dateLabel = document.getElementById('dateLabel');
    const dateOptions = document.querySelectorAll('.date-option');
    let currentDateRange = 'all';

    // --- 3. HELPER FUNCTIONS ---
    function getRelativeDate(daysAgo) {
        const d = new Date(); 
        d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    }

    function getStatusBadge(status) {
        const config = {
            released: { icon: 'ri-send-plane-fill', class: 'released' },
            completed: { icon: 'ri-checkbox-circle-line', class: 'completed' },
            progress: { icon: 'ri-loader-4-line', class: 'progress' },
            pending: { icon: 'ri-time-line', class: 'pending' },
            revision: { icon: 'ri-alert-line', class: 'revision' },
            rejected: { icon: 'ri-close-circle-line', class: 'rejected' }
        };
        const s = config[status.toLowerCase()] || config.progress;
        
        return `<span class="status-badge ${s.class}">
                    <i class="${s.icon}"></i> 
                    ${status.charAt(0).toUpperCase() + status.slice(1)}
                </span>`;
    }

    function updateStats() {
        const pending = documents.filter(d => d.status === 'pending').length;
        const progress = documents.filter(d => d.status === 'progress').length;
        const completed = documents.filter(d => d.status === 'completed' || d.status === 'released').length;
        const attention = documents.filter(d => d.status === 'revision' || d.status === 'rejected').length;

        const setStat = (id, val) => { 
            const el = document.getElementById(id); 
            if(el) el.innerText = val; 
        };
        setStat('stat-pending', pending);
        setStat('stat-progress', progress);
        setStat('stat-completed', completed);
        setStat('stat-attention', attention);
    }

    // --- 4. RENDER TABLE ---
    window.renderTable = function() {
        tableBody.innerHTML = '';
        
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const stat = statusSelect ? statusSelect.value : 'all';
        const dept = deptSelect ? deptSelect.value : 'all';

        const filteredDocs = documents.filter(doc => {
            const matchesSearch = doc.title.toLowerCase().includes(term) || doc.id.toLowerCase().includes(term);
            
            let matchesStatus = true;
            if (stat !== 'all') {
                if (stat === 'completed') matchesStatus = (doc.status === 'completed' || doc.status === 'released');
                else if (stat === 'revision') matchesStatus = (doc.status === 'revision' || doc.status === 'rejected');
                else matchesStatus = (doc.status === stat);
            }
            
            const matchesDept = (dept === 'all') ? true : doc.dept === dept;
            
            let matchesDate = true;
            if (currentDateRange !== 'all') {
                const today = getRelativeDate(0);
                if (currentDateRange === 'today') matchesDate = (doc.date === today);
                else if (currentDateRange === '7days') matchesDate = doc.date >= getRelativeDate(7);
                else if (currentDateRange === '30days') matchesDate = doc.date >= getRelativeDate(30);
            }
            
            return matchesSearch && matchesStatus && matchesDept && matchesDate;
        });

        if(countDisplay) countDisplay.textContent = filteredDocs.length;

        if(filteredDocs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: #94a3b8;">No documents found.</td></tr>`;
        } else {
            filteredDocs.forEach(doc => {
                const tr = document.createElement('tr');
                tr.style.cursor = 'pointer';
                
                tr.onclick = function(e) {
                    if(e.target.type !== 'checkbox' && !e.target.closest('.action-btn')) {
                        if(window.openDocViewer) window.openDocViewer(doc);
                    }
                };

                tr.innerHTML = `
                    <td><input type="checkbox"></td>
                    <td style="font-family:monospace; color:#64748b;">${doc.id}</td>
                    <td><div class="cell-content"><span class="row-title">${doc.title}</span></div></td>
                    <td style="font-weight:600; color:#334155;">${doc.dept}</td>
                    <td>${getStatusBadge(doc.status)}</td>
                    <td>${doc.category}</td>
                    <td>${doc.date}</td>
                    <td>
                        <div class="prog-container">
                            <div class="prog-bar-bg"><div class="prog-fill" style="width: ${doc.progress}%"></div></div>
                            <span class="prog-text">${doc.progress}%</span>
                        </div>
                    </td>
                    <td>${doc.assignee}</td>
                    <td style="white-space:nowrap;">
                        <button class="action-btn" onclick="if(window.openTimeline) { window.openTimeline('${doc.id}'); } event.stopPropagation();" title="View Timeline">A</button>
                        <button class="action-btn" onclick="if(window.openTransferModal) { window.openTransferModal('${doc.id}'); } event.stopPropagation();" title="Transfer"><i class="ri-share-forward-line"></i></button>
                    </td>
                `;
                tableBody.appendChild(tr);
            });
        }
    }

    // --- 5. EVENT LISTENERS ---
    if(searchInput) searchInput.addEventListener('input', renderTable);
    if(statusSelect) statusSelect.addEventListener('change', renderTable);
    if(deptSelect) deptSelect.addEventListener('change', renderTable);

    if(dateTrigger && dateDropdown) {
        dateTrigger.addEventListener('click', (e) => { 
            e.stopPropagation(); 
            dateDropdown.classList.toggle('show'); 
        });
        
        document.addEventListener('click', (e) => { 
            if (!dateTrigger.contains(e.target) && !dateDropdown.contains(e.target)) {
                dateDropdown.classList.remove('show'); 
            }
        });
        
        dateOptions.forEach(opt => {
            opt.addEventListener('click', () => {
                dateOptions.forEach(o => o.classList.remove('active'));
                opt.classList.add('active');
                if(dateLabel) dateLabel.innerText = opt.innerText;
                currentDateRange = opt.getAttribute('data-range');
                renderTable();
                dateDropdown.classList.remove('show');
            });
        });
    }

    window.filterData = function(status) {
        if(statusSelect) { 
            statusSelect.value = status; 
            renderTable(); 
        }
    };

    // --- 6. INIT ---
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status');
    if (initialStatus && statusSelect) statusSelect.value = initialStatus;

    renderTable();
    updateStats();
});