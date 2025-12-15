document.addEventListener('DOMContentLoaded', () => {

    // --- 1. DYNAMIC DATE HELPER ---
    // This function generates a date string (YYYY-MM-DD) based on how many days ago it was.
    // Ensures "Today" filter always works, no matter when you test the system.
    function getRelativeDate(daysAgo) {
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }

    // --- 2. EXPANDED DATA SOURCE ---
    const documents = [
        // --- TODAY (0 Days Ago) ---
        { id: 'DOC-NEW-001', title: 'Urgent: City Festival Permit', desc: 'Permit application for the upcoming annual city festival...', dept: 'Licensing', status: 'pending', category: 'Permits & Licenses', date: getRelativeDate(0), progress: 10, assignee: "Unassigned" },
        { id: 'DOC-NEW-002', title: 'Daily Collection Report', desc: 'Consolidated report of daily tax collections...', dept: 'Treasury', status: 'completed', category: 'Reports', date: getRelativeDate(0), progress: 100, assignee: "Finance Team" },
        { id: 'DOC-NEW-003', title: 'Morning Staff Memo', desc: 'Memo regarding adjusted shift schedules for next week...', dept: 'HRMO', status: 'released', category: 'Memos', date: getRelativeDate(0), progress: 100, assignee: "HR Manager" },
        { id: 'DOC-NEW-004', title: 'IT System Patch Request', desc: 'Request for emergency server maintenance...', dept: 'IT', status: 'progress', category: 'Internal', date: getRelativeDate(0), progress: 40, assignee: "Sys Admin" },

        // --- LAST 7 DAYS (1-7 Days Ago) ---
        { id: 'DOC-WK-001', title: 'Weekly Sanitation Report', desc: 'Inspection results for public markets...', dept: 'Health', status: 'revision', category: 'Reports', date: getRelativeDate(2), progress: 60, assignee: "Inspector Diaz" },
        { id: 'DOC-WK-002', title: 'Procurement: Office Supplies', desc: 'Purchase request for Q1 office supplies...', dept: 'GSO', status: 'progress', category: 'Procurement', date: getRelativeDate(3), progress: 50, assignee: "Supply Officer" },
        { id: 'DOC-WK-003', title: 'Mayor’s Speech Draft', desc: 'Draft speech for the upcoming ribbon cutting...', dept: 'OCM', status: 'pending', category: 'Official Correspondence', date: getRelativeDate(4), progress: 20, assignee: "Comms Team" },
        { id: 'DOC-WK-004', title: 'Barangay Road Repair Request', desc: 'Request for materials for Brgy. San Felix road repair...', dept: 'Engineering', status: 'rejected', category: 'Resolutions', date: getRelativeDate(5), progress: 0, assignee: "City Engineer" },
        { id: 'DOC-WK-005', title: 'Administrative Order No. 2025-001', desc: 'Administrative order regarding city-wide policy...', dept: 'OCM', status: 'released', category: 'Memos', date: getRelativeDate(6), progress: 85, assignee: "Mayor's Office" },

        // --- LAST 28 DAYS (8-28 Days Ago) ---
        { id: 'DOC-MO-001', title: 'Monthly Budget Reconciliation', desc: 'Reconciliation of expenses vs budget for last month...', dept: 'Accounting', status: 'completed', category: 'Invoices', date: getRelativeDate(10), progress: 100, assignee: "Chief Accountant" },
        { id: 'DOC-MO-002', title: 'Business Permit Renewal - Batch A', desc: 'Batch processing of business permit renewals...', dept: 'BPLO', status: 'released', category: 'Permits & Licenses', date: getRelativeDate(15), progress: 100, assignee: "Licensing Officer" },
        { id: 'DOC-MO-003', title: 'Construction Permit - Commercial', desc: 'Building permit application for new mall annex...', dept: 'Engineering', status: 'progress', category: 'Permits & Licenses', date: getRelativeDate(20), progress: 75, assignee: "City Engineer" },
        { id: 'DOC-MO-004', title: 'Legal Opinion: Land Dispute', desc: 'Legal opinion regarding the municipal boundary dispute...', dept: 'Legal', status: 'completed', category: 'Legal Documents', date: getRelativeDate(25), progress: 100, assignee: "Atty. Santos" },
        { id: 'DOC-MO-005', title: 'Inter-Office Memo - Dept Coordination', desc: 'Memo regarding inter-department coordination...', dept: 'OCM', status: 'progress', category: 'Memos', date: getRelativeDate(27), progress: 50, assignee: "Maria Santos" },

        // --- LAST 60 DAYS (29-60 Days Ago) ---
        { id: 'DOC-QTR-001', title: 'Quarterly Audit Report', desc: 'Internal audit report for the previous quarter...', dept: 'Audit', status: 'revision', category: 'Reports', date: getRelativeDate(40), progress: 90, assignee: "Audit Team" },
        { id: 'DOC-QTR-002', title: 'City Development Plan 2025', desc: 'Comprehensive city development plan for fiscal year...', dept: 'Planning', status: 'pending', category: 'Reports', date: getRelativeDate(55), progress: 20, assignee: "Planning Team" },
        { id: 'DOC-QTR-003', title: 'Executive Order - COVID Response', desc: 'Executive order for enhanced health protocols...', dept: 'OCM', status: 'completed', category: 'Official Correspondence', date: getRelativeDate(35), progress: 100, assignee: "Mayor's Office" },
        { id: 'DOC-QTR-004', title: 'Contract Agreement - City Supplier', desc: 'Contract agreement with city supplier for materials...', dept: 'OCM', status: 'completed', category: 'Contracts', date: getRelativeDate(45), progress: 100, assignee: "Roberto Garcia" },

        // --- OLDER DOCUMENTS (>60 Days) ---
        { id: 'DOC-OLD-001', title: 'Annual Fiscal Report 2024', desc: 'Finalized fiscal report for the previous year...', dept: 'Treasury', status: 'released', category: 'Reports', date: getRelativeDate(100), progress: 100, assignee: "City Treasurer" },
        { id: 'DOC-OLD-002', title: 'Legislative Agenda 2024', desc: 'Proposed legislative agenda for the year 2024', dept: 'OCVM', status: 'progress', category: 'Reports', date: getRelativeDate(120), progress: 50, assignee: "Vice Mayor's Office" },
    ];

    const tableBody = document.getElementById('tableBody');
    const statusSelect = document.getElementById('statusFilter');
    const deptSelect = document.getElementById('deptFilter');
    const searchInput = document.getElementById('searchInput');
    const countDisplay = document.getElementById('doc-count');

    // Date Elements
    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const dateLabel = document.getElementById('dateLabel');
    const dateOptions = document.querySelectorAll('.date-option');
    const startDateInput = document.getElementById('startDate');
    const endDateInput = document.getElementById('endDate');
    const applyDateBtn = document.getElementById('applyDate');
    const clearDateBtn = document.getElementById('clearDate');

    let currentStatus = 'all';
    let currentDept = 'all';
    let currentDateRange = { type: 'all', start: null, end: null };

    // --- 3. RENDER FUNCTION ---
    function renderTable() {
        tableBody.innerHTML = '';
        
        const filteredDocs = documents.filter(doc => {
            // Status Filter
            let statusMatch = (currentStatus === 'all') ? true : 
                              (currentStatus === 'completed' ? (doc.status === 'completed' || doc.status === 'released') : doc.status === currentStatus);
            
            // Dept Filter
            let deptMatch = (currentDept === 'all') ? true : doc.dept === currentDept;

            // Search Filter
            let searchMatch = doc.title.toLowerCase().includes(searchInput.value.toLowerCase()) || 
                              doc.id.toLowerCase().includes(searchInput.value.toLowerCase());

            // Date Filter
            let dateMatch = true;
            if (currentDateRange.type !== 'all') {
                const docDate = new Date(doc.date);
                docDate.setHours(0,0,0,0);
                
                if (currentDateRange.start && currentDateRange.end) {
                    dateMatch = docDate >= currentDateRange.start && docDate <= currentDateRange.end;
                }
            }

            return statusMatch && deptMatch && searchMatch && dateMatch;
        });

        countDisplay.textContent = filteredDocs.length;

        if(filteredDocs.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: #94a3b8;">No documents found.</td></tr>`;
            return;
        }

        filteredDocs.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td style="font-family:monospace; color:#64748b;">${doc.id}</td>
                <td>
                    <div class="cell-content">
                        <span class="row-title">${doc.title}</span>
                        <span class="row-desc">${doc.desc}</span>
                    </div>
                </td>
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
                    <button class="action-btn">A</button>
                    <button class="action-btn"><i class="ri-arrow-right-line"></i></button>
                </td>
            `;
            tableBody.appendChild(tr);
        });
    }

    function getStatusBadge(status) {
        const config = {
            released:   { icon: 'ri-send-plane-fill', label: 'Released', class: 'released' },
            completed:  { icon: 'ri-checkbox-circle-line', label: 'Completed', class: 'completed' },
            progress:   { icon: 'ri-loader-4-line', label: 'In Progress', class: 'progress' },
            pending:    { icon: 'ri-time-line', label: 'Pending', class: 'pending' },
            revision:   { icon: 'ri-alert-line', label: 'For Revision', class: 'revision' },
            rejected:   { icon: 'ri-close-circle-line', label: 'Rejected', class: 'rejected' }
        };
        const s = config[status] || config.progress;
        return `<span class="status-badge ${s.class}"><i class="${s.icon}"></i> ${s.label}</span>`;
    }

    // --- 4. EVENT LISTENERS ---
    
    // Dropdown Toggle
    dateTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        dateDropdown.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
        if (!dateTrigger.contains(e.target) && !dateDropdown.contains(e.target)) {
            dateDropdown.classList.remove('show');
        }
    });

    // Option Selection
    dateOptions.forEach(opt => {
        opt.addEventListener('click', () => {
            dateOptions.forEach(o => o.classList.remove('active'));
            opt.classList.add('active');
            dateLabel.textContent = opt.textContent;
            
            const range = opt.getAttribute('data-range');
            const today = new Date();
            today.setHours(0,0,0,0);
            
            if (range === 'all') {
                currentDateRange = { type: 'all', start: null, end: null };
            } else if (range === 'today') {
                currentDateRange = { type: 'today', start: today, end: today };
            } else {
                const days = parseInt(range.replace('days', ''));
                const pastDate = new Date(today);
                pastDate.setDate(today.getDate() - days);
                currentDateRange = { type: 'range', start: pastDate, end: today };
            }
            
            // Clear inputs
            startDateInput.value = '';
            endDateInput.value = '';
            
            renderTable();
            dateDropdown.classList.remove('show');
        });
    });

    // Custom Date Apply
    applyDateBtn.addEventListener('click', () => {
        if(startDateInput.value && endDateInput.value) {
            const start = new Date(startDateInput.value);
            const end = new Date(endDateInput.value);
            start.setHours(0,0,0,0);
            end.setHours(0,0,0,0);

            currentDateRange = { type: 'custom', start: start, end: end };
            
            dateOptions.forEach(o => o.classList.remove('active'));
            dateLabel.textContent = "Custom Range";
            renderTable();
            dateDropdown.classList.remove('show');
        }
    });

    clearDateBtn.addEventListener('click', () => {
        startDateInput.value = '';
        endDateInput.value = '';
    });

    statusSelect.addEventListener('change', (e) => { currentStatus = e.target.value; renderTable(); });
    deptSelect.addEventListener('change', (e) => { currentDept = e.target.value; renderTable(); });
    searchInput.addEventListener('input', () => { renderTable(); });

    // Initial Load
    const urlParams = new URLSearchParams(window.location.search);
    const initialStatus = urlParams.get('status');
    if (initialStatus) {
        statusSelect.value = initialStatus;
        currentStatus = initialStatus;
    }
    renderTable();

    // Global Filter Access
    window.filterData = function(status) {
        statusSelect.value = status;
        currentStatus = status;
        renderTable();
    };
});