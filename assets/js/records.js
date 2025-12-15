document.addEventListener('DOMContentLoaded', () => {
    console.log("Records System: Starting..."); // Check your browser console (F12) for this

    // --- 1. SAFE DATE HELPER ---
    // Gets a string date (YYYY-MM-DD) relative to today
    function getRelativeDate(daysAgo) {
        const d = new Date();
        d.setDate(d.getDate() - daysAgo);
        const year = d.getFullYear();
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const day = String(d.getDate()).padStart(2, '0');
        return year + '-' + month + '-' + day;
    }

    // --- 2. DATA SOURCE ---
    const archives = [
        { id: 'DOC-2025-001', title: 'Urgent Festival Permit', desc: 'Finalized permit for city festival...', dept: 'OCM', status: 'released', category: 'Permits', created: getRelativeDate(2), finalized: getRelativeDate(0), assignee: "Licensing Officer" },
        { id: 'DOC-2025-002', title: 'Daily Revenue Report', desc: 'Consolidated revenue report...', dept: 'CAO', status: 'completed', category: 'Reports', created: getRelativeDate(1), finalized: getRelativeDate(0), assignee: "City Accountant" },
        { id: 'DOC-2024-001', title: 'Administrative Order No. 2024-001', desc: 'Administrative order regarding policy...', dept: 'OCM', status: 'released', category: 'Memos', created: getRelativeDate(6), finalized: getRelativeDate(4), assignee: "Mayor's Office" },
        { id: 'DOC-2024-002', title: 'Executive Order - COVID-19', desc: 'Executive order for health protocols...', dept: 'OCM', status: 'completed', category: 'Official Correspondence', created: getRelativeDate(7), finalized: getRelativeDate(5), assignee: "Mayor's Office" },
        { id: 'DOC-2024-012', title: 'Committee Report - Public Safety', desc: 'Report from the public safety committee', dept: 'OCVM', status: 'completed', category: 'Reports', created: getRelativeDate(15), finalized: getRelativeDate(14), assignee: "Atty. Ramon Diaz" },
        { id: 'DOC-2024-010', title: 'Rejected Proposal - City Event', desc: 'Proposal rejected due to budget...', dept: 'OCM', status: 'rejected', category: 'Reports', created: getRelativeDate(20), finalized: getRelativeDate(19), assignee: "Elena Cruz" },
        { id: 'DOC-2023-099', title: 'Annual Budget Report 2023', desc: 'Finalized annual budget report...', dept: 'CAO', status: 'completed', category: 'Reports', created: getRelativeDate(400), finalized: getRelativeDate(365), assignee: "City Accountant" },
        { id: 'DOC-OLD-055', title: 'Barangay Road Resolution', desc: 'Resolution for immediate repair...', dept: 'SP', status: 'rejected', category: 'Resolutions', created: getRelativeDate(60), finalized: getRelativeDate(55), assignee: "City Council" }
    ];

    // --- 3. GET ELEMENTS (With Safety Checks) ---
    const tableBody = document.getElementById('tableBody');
    const countDisplay = document.getElementById('doc-count');
    const searchInput = document.getElementById('searchInput');
    const statusSelect = document.getElementById('statusFilter');
    const deptSelect = document.getElementById('deptFilter');
    
    // Date Elements
    const dateTrigger = document.getElementById('dateTrigger');
    const dateDropdown = document.getElementById('dateDropdown');
    const dateLabel = document.getElementById('dateLabel');
    const dateOptions = document.querySelectorAll('.date-option');

    // Global State
    let currentDateRange = 'all';

    // --- 4. RENDER FUNCTION ---
    function renderTable() {
        if (!tableBody) {
            console.error("Error: tableBody element not found!");
            return;
        }

        tableBody.innerHTML = '';

        const filtered = archives.filter(doc => {
            // Safe value checks
            const searchVal = searchInput ? searchInput.value.toLowerCase() : '';
            const statusVal = statusSelect ? statusSelect.value : 'all';
            const deptVal = deptSelect ? deptSelect.value : 'all';

            // 1. Text Search
            const searchMatch = !searchVal || 
                                doc.title.toLowerCase().includes(searchVal) || 
                                doc.id.toLowerCase().includes(searchVal);
            
            // 2. Status Filter
            const statusMatch = (statusVal === 'all') ? true : doc.status === statusVal;
            
            // 3. Dept Filter
            const deptMatch = (deptVal === 'all') ? true : doc.dept === deptVal;

            // 4. Date Filter
            let dateMatch = true;
            if (currentDateRange !== 'all') {
                const docDate = doc.finalized; // "YYYY-MM-DD"
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

        // Update Count
        if (countDisplay) countDisplay.textContent = filtered.length;

        // Empty State
        if (filtered.length === 0) {
            tableBody.innerHTML = `<tr><td colspan="10" style="text-align:center; padding: 2rem; color: #94a3b8;">No records found.</td></tr>`;
            return;
        }

        // Generate Rows
        filtered.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><input type="checkbox"></td>
                <td style="font-family:monospace; color:#64748b;">${doc.id.replace('DOC-', '')}</td>
                <td>
                    <div class="cell-content">
                        <span class="row-title">${doc.title}</span>
                        <span class="row-desc">${doc.desc}</span>
                    </div>
                </td>
                <td style="font-weight:600; color:#334155;">${doc.dept}</td>
                <td>${getStatusBadge(doc.status)}</td>
                <td>${doc.category}</td>
                <td>${doc.created}</td>
                <td><span class="finalized-date">${doc.finalized}</span></td>
                <td>${doc.assignee}</td>
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
        const s = config[status] || config.completed;
        return `<span class="status-badge ${s.class}"><i class="${s.icon}"></i> ${s.label}</span>`;
    }

    // --- 5. EVENT LISTENERS (Safety Wrapped) ---
    
    if (searchInput) searchInput.addEventListener('input', renderTable);
    if (statusSelect) statusSelect.addEventListener('change', renderTable);
    if (deptSelect) deptSelect.addEventListener('change', renderTable);

    // Date Logic
    if (dateTrigger && dateDropdown) {
        dateTrigger.addEventListener('click', (e) => {
            e.stopPropagation(); // Stops click from closing immediately
            dateDropdown.classList.toggle('show');
            console.log("Dropdown Toggled"); // Debug log
        });

        document.addEventListener('click', (e) => {
            if (!dateTrigger.contains(e.target) && !dateDropdown.contains(e.target)) {
                dateDropdown.classList.remove('show');
            }
        });

        if (dateOptions) {
            dateOptions.forEach(opt => {
                opt.addEventListener('click', () => {
                    // Update Active Class
                    dateOptions.forEach(o => o.classList.remove('active'));
                    opt.classList.add('active');
                    
                    // Update Text
                    if(dateLabel) dateLabel.textContent = opt.textContent;
                    
                    // Update Logic
                    currentDateRange = opt.getAttribute('data-range');
                    renderTable();
                    
                    // Close
                    dateDropdown.classList.remove('show');
                });
            });
        }
    } else {
        console.error("Date Dropdown elements not found in HTML");
    }

    // --- 6. START ---
    renderTable();
});