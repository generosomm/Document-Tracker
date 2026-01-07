document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET DATA FROM SHARED SOURCE ---
    // Filter only "Archived" statuses: completed, released, rejected
    const allDocs = window.documents || [];
    const archives = allDocs.filter(doc => 
        ['completed', 'released', 'rejected'].includes(doc.status.toLowerCase())
    );

    // --- 2. DOM ELEMENTS ---
    const tableBody = document.getElementById('tableBody');
    const countDisplay = document.getElementById('doc-count');
    const searchInput = document.getElementById('searchInput');
    const statusSelect = document.getElementById('statusFilter');
    const deptSelect = document.getElementById('deptFilter');

    // Date Dropdown Elements
    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const dateLabel = document.getElementById('dateLabel');
    const dateOptions = document.querySelectorAll('.date-option');
    let currentDateRange = 'all';

    // --- 3. HELPER: DATES ---
    function getRelativeDate(daysAgo) {
        const d = new Date(); d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    }

    // --- 4. RENDER FUNCTION ---
    function renderTable() {
        tableBody.innerHTML = '';

        // Get filter values
        const term = searchInput ? searchInput.value.toLowerCase() : '';
        const stat = statusSelect ? statusSelect.value : 'all';
        const dept = deptSelect ? deptSelect.value : 'all';

        const filtered = archives.filter(doc => {
            // 1. Text Search
            const searchMatch = doc.title.toLowerCase().includes(term) || 
                                doc.id.toLowerCase().includes(term);
            
            // 2. Status Filter
            const statusMatch = (stat === 'all') ? true : doc.status === stat;
            
            // 3. Dept Filter
            const deptMatch = (dept === 'all') ? true : doc.dept === dept;

            // 4. Date Filter (Check 'dateFinalized')
            let dateMatch = true;
            if (currentDateRange !== 'all') {
                const docDate = doc.dateFinalized || doc.date; // Fallback
                const today = getRelativeDate(0);

                if (currentDateRange === 'today') {
                    dateMatch = (docDate === today);
                } 
                else if (currentDateRange === '7days') {
                    dateMatch = docDate >= getRelativeDate(7);
                } 
                else if (currentDateRange === '30days') {
                    dateMatch = docDate >= getRelativeDate(30);
                } 
                else if (currentDateRange === 'year') {
                    const currentYear = new Date().getFullYear().toString();
                    dateMatch = docDate.startsWith(currentYear);
                }
            }

            return searchMatch && statusMatch && deptMatch && dateMatch;
        });

        // Update Counter
        if(countDisplay) countDisplay.textContent = filtered.length;

        // Empty State
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: #94a3b8;">No archived records found matching filters.</td></tr>`;
            return;
        }

        // Render Rows
        filtered.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td style="font-family:monospace; color:#64748b;">${doc.id.replace('DOC-', '')}</td>
                <td>
                    <div class="cell-content">
                        <span class="row-title">${doc.title}</span>
                    </div>
                </td>
                <td style="font-weight:600; color:#334155;">${doc.dept}</td>
                <td>${getStatusBadge(doc.status)}</td>
                <td>${doc.category}</td>
                <td>${doc.date}</td>
                <td><span class="finalized-date">${doc.dateFinalized || '-'}</span></td>
                <td>${doc.finalizedBy || '-'}</td>
                <td style="white-space:nowrap;">
                    <button class="action-btn"><i class="ri-eye-line"></i></button>
                    <button class="action-btn"><i class="ri-download-line"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function getStatusBadge(status) {
        const config = {
            released:   { icon: 'ri-send-plane-fill', label: 'Released', class: 'released' },
            completed:  { icon: 'ri-checkbox-circle-line', label: 'Completed', class: 'completed' },
            rejected:   { icon: 'ri-close-circle-line', label: 'Rejected', class: 'rejected' }
        };
        const s = config[status.toLowerCase()] || config.completed;
        return `<span class="status-badge ${s.class}"><i class="${s.icon}"></i> ${s.label}</span>`;
    }

    // --- 5. EVENT LISTENERS ---
    
    if(searchInput) searchInput.addEventListener('input', renderTable);
    if(statusSelect) statusSelect.addEventListener('change', renderTable);
    if(deptSelect) deptSelect.addEventListener('change', renderTable);

    // Date Dropdown
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

    // --- 6. INITIAL RENDER ---
    renderTable();
});