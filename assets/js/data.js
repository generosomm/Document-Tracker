/* assets/js/data.js */

// ==========================================
// 1. HELPER: DATE FORMATTER
// ==========================================
function getRelativeDate(daysAgo) {
    const d = new Date();
    d.setDate(d.getDate() - daysAgo);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// ==========================================
// 2. DEFAULT DOCUMENT DATA (Fallback)
// ==========================================
const defaultDocuments = [

    // --- A. IN PROGRESS DOCUMENTS (Active) ---
    { 
        id: 'DOC-PRO-001', title: 'Sanitation Services Agreement 2025', dept: 'GSO', status: 'progress', category: 'Contracts', 
        date: getRelativeDate(3), progress: 60, assignee: "City Accountant", finalizedBy: "-",
        timeline: [
            { user: 'System', role: 'Automated', action: 'Document Created', time: getRelativeDate(3) + ' 08:00 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "sanitation_contract_v1.pdf" (3.2MB).', meta: 'Source: Web Upload' },
            { user: 'City Legal', role: 'Legal', action: 'Reviewed & Approved', time: getRelativeDate(2) + ' 10:15 AM', icon: 'ri-scales-3-line', details: 'Legally cleared. No objectionable clauses found.', meta: 'Duration: 1 day' },
            { user: 'Budget Officer', role: 'Budget', action: 'Viewed', time: getRelativeDate(1) + ' 09:00 AM', icon: 'ri-eye-line', viewTag: 'View #1', details: 'Checking appropriation balance.', meta: 'Active for 12 mins' },
            { user: 'Budget Officer', role: 'Budget', action: 'Obligated', time: getRelativeDate(1) + ' 02:00 PM', icon: 'ri-money-dollar-circle-line', details: 'Funds obligated. ALOBS No. 2025-01-0042 issued.', meta: 'Amount: ₱450,000.00' },
            { user: 'Accountant', role: 'Finance', action: 'Received', time: getRelativeDate(0) + ' 08:30 AM', icon: 'ri-inbox-archive-line', viewTag: 'Current Stage', details: 'Document received for pre-audit.', meta: 'Status: Pending Audit' }
        ]
    },
    { 
        id: 'DOC-PRO-002', title: 'Department Reorganization Proposal', dept: 'HRMO', status: 'progress', category: 'Memos', 
        date: getRelativeDate(5), progress: 40, assignee: "Mayor's Office", finalizedBy: "-",
        timeline: [
            { user: 'HR Manager', role: 'Dept Head', action: 'Document Created', time: getRelativeDate(5) + ' 09:00 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "reorg_proposal_final.pdf".', meta: 'Source: HR Workstation' },
            { user: 'City Admin', role: 'Admin', action: 'Viewed', time: getRelativeDate(4) + ' 11:00 AM', icon: 'ri-eye-line', viewTag: 'View #1', details: 'Initial reading of the proposal structure.', meta: 'Active for 20 mins' },
            { user: 'City Admin', role: 'Admin', action: 'Endorsed', time: getRelativeDate(1) + ' 09:00 AM', icon: 'ri-share-forward-fill', details: 'Endorsed to the Local Chief Executive.', meta: 'Routing: Priority High' }
        ]
    },
    { 
        id: 'DOC-PRO-003', title: 'Electrical Upgrade Invoice #7782', dept: 'Engineering', status: 'progress', category: 'Invoices', 
        date: getRelativeDate(4), progress: 70, assignee: "Treasurer", finalizedBy: "-",
        timeline: [
            { user: 'Engr. Santos', role: 'Staff', action: 'Document Created', time: getRelativeDate(4) + ' 01:00 PM', icon: 'ri-file-pdf-line', details: 'Uploaded "invoice_7782_scanned.pdf".', meta: 'Project: Command Center Upgrade' },
            { user: 'Budget Staff', role: 'Staff', action: 'Obligated', time: getRelativeDate(3) + ' 10:00 AM', icon: 'ri-checkbox-circle-line', details: 'Chargeable against Capital Outlay.', meta: 'ALOBS: 2025-02-0012' },
            { user: 'Accountant', role: 'Finance', action: 'Certified', time: getRelativeDate(1) + ' 03:00 PM', icon: 'ri-check-double-line', details: 'Certified as to completeness of documents.', meta: 'DV No. 2025-02-0991' }
        ]
    },

    // --- B. COMPLETED DOCUMENTS (Full History) ---
    { 
        id: 'DOC-COM-001', title: 'Executive Order 2025-01: Health Protocols', dept: 'OCM', status: 'completed', category: 'Official Correspondence', 
        date: getRelativeDate(7), progress: 100, assignee: "Records", finalizedBy: "Mayor",
        timeline: [
            { user: 'Legal Staff', role: 'Staff', action: 'Document Created', time: getRelativeDate(7) + ' 08:00 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "EO_draft_clean.pdf".', meta: 'Draft Version: 1.0' },
            { user: 'City Admin', role: 'Admin', action: 'Approved', time: getRelativeDate(5) + ' 01:00 PM', icon: 'ri-check-double-line', details: 'Content verified. Ready for signature.', meta: 'Action: Recommended Approval' },
            { user: 'Mayor', role: 'Mayor', action: 'Signed', time: getRelativeDate(2) + ' 10:00 AM', icon: 'ri-pen-nib-line', details: 'Digitally signed using PNPKI Certificate.', meta: 'Hash: a1b2c3d4e5...' },
            { user: 'System', role: 'Automated', action: 'Archived', time: getRelativeDate(2) + ' 10:05 AM', icon: 'ri-archive-line', details: 'Document marked as completed.', meta: 'Location: Archive Server 1' }
        ]
    },
    { 
        id: 'DOC-COM-002', title: 'Payroll: Regular Employees (Jan 1-15)', dept: 'HRMO', status: 'completed', category: 'Invoices', 
        date: getRelativeDate(5), progress: 100, assignee: "Bank", finalizedBy: "Treasurer",
        timeline: [
            { user: 'HR Staff', role: 'Staff', action: 'Document Created', time: getRelativeDate(5) + ' 08:00 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "payroll_reg_jan1.pdf".', meta: 'Batch: 2025-001' },
            { user: 'Accountant', role: 'Head', action: 'Certified', time: getRelativeDate(4) + ' 02:00 PM', icon: 'ri-check-line', details: 'Certified correct. Withholding taxes deducted.', meta: 'Net Pay Verified' },
            { user: 'Treasurer', role: 'Head', action: 'Disbursed', time: getRelativeDate(3) + ' 09:00 AM', icon: 'ri-bank-card-line', details: 'Advice to Debit Account (ADA) transmitted.', meta: 'Ref: ADA-2025-012' }
        ]
    },
    { 
        id: 'DOC-COM-003', title: 'Business Permit: Jollibee Sto. Tomas', dept: 'BPLO', status: 'completed', category: 'Permits', 
        date: getRelativeDate(10), progress: 100, assignee: "Client", finalizedBy: "BPLO",
        timeline: [
            { user: 'Client', role: 'External', action: 'Document Created', time: getRelativeDate(10) + ' 09:00 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "renewal_app.pdf".', meta: 'Portal Upload' },
            { user: 'Treasury', role: 'Cashier', action: 'Paid', time: getRelativeDate(9) + ' 11:00 AM', icon: 'ri-money-dollar-circle-line', details: 'Payment received. OR# 9982112 issued.', meta: 'Mode: Cash' },
            { user: 'BPLO Head', role: 'Head', action: 'Released', time: getRelativeDate(9) + ' 01:30 PM', icon: 'ri-send-plane-fill', details: 'Permit printed and released to client.', meta: 'Plate Issued' }
        ]
    },

    // --- C. PENDING DOCUMENTS (New Uploads) ---
    { 
        id: 'DOC-PEN-001', title: 'HR Policy Update: Flexible Work', dept: 'HRMO', status: 'pending', category: 'Memos', 
        date: getRelativeDate(0), progress: 10, assignee: "City Admin", finalizedBy: "-",
        timeline: [
            { user: 'HR Staff', role: 'Staff', action: 'Document Created', time: getRelativeDate(0) + ' 08:30 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "hr_policy_flexi_draft.pdf".', meta: 'Version: Draft 1.0' },
            { user: 'HR Manager', role: 'Dept Head', action: 'Forwarded', time: getRelativeDate(0) + ' 09:00 AM', icon: 'ri-share-forward-fill', details: 'Approved at department level.', meta: 'Notes: Urgent' }
        ]
    },
    { 
        id: 'DOC-PEN-002', title: 'Q1 Office Supplies Request', dept: 'GSO', status: 'pending', category: 'Invoices', 
        date: getRelativeDate(0), progress: 10, assignee: "Budget Office", finalizedBy: "-",
        timeline: [
            { user: 'GSO Staff', role: 'Staff', action: 'Document Created', time: getRelativeDate(0) + ' 02:00 PM', icon: 'ri-file-pdf-line', details: 'Uploaded "supplies_req_2025.pdf".', meta: 'Items: 45' },
            { user: 'GSO Head', role: 'Dept Head', action: 'Viewed', time: getRelativeDate(0) + ' 02:15 PM', icon: 'ri-eye-line', viewTag: 'View #1', details: 'Checking inventory cross-reference.', meta: 'Session: #8821' }
        ]
    },

    // --- D. REJECTED DOCUMENTS (Issues Found) ---
    { 
        id: 'DOC-REJ-001', title: 'Event Proposal: City Concert 2025', dept: 'Tourism', status: 'rejected', category: 'Proposals', 
        date: getRelativeDate(4), progress: 0, assignee: "Origin", finalizedBy: "Budget",
        timeline: [
            { user: 'Organizer', role: 'External', action: 'Document Created', time: getRelativeDate(4) + ' 11:00 AM', icon: 'ri-file-pdf-line', details: 'Uploaded "concert_proposal_v1.pdf".', meta: 'Cost: ₱2.5M' },
            { user: 'Budget Officer', role: 'Budget', action: 'Rejected', time: getRelativeDate(3) + ' 09:10 AM', icon: 'ri-close-circle-line', details: 'Rejected: Project not found in current year AIP.', meta: 'Action: Return to Sender' }
        ]
    },
    { 
        id: 'DOC-REJ-002', title: 'Liquidation Report: Travel Allowance', dept: 'Admin', status: 'rejected', category: 'Reports', 
        date: getRelativeDate(2), progress: 0, assignee: "Staff", finalizedBy: "Accounting",
        timeline: [
            { user: 'Admin Staff', role: 'Staff', action: 'Document Created', time: getRelativeDate(2) + ' 01:00 PM', icon: 'ri-file-pdf-line', details: 'Uploaded "liquidation_baguio.pdf".', meta: 'Travel Order: TO-2025-01' },
            { user: 'Accountant', role: 'Head', action: 'Rejected', time: getRelativeDate(2) + ' 03:00 PM', icon: 'ri-error-warning-line', details: 'Rejected: Missing Certificate of Appearance.', meta: 'Deficiency: Documentary' }
        ]
    }
];

// ==========================================
// 3. PERSISTENCE LOGIC (CRITICAL FIX)
// ==========================================
// Always try to load from LocalStorage first.
// If empty, initialize with defaultDocuments and save them.
const storedDocs = localStorage.getItem('dts_documents');

if (storedDocs) {
    // Data exists in storage (including your new submissions)
    window.documents = JSON.parse(storedDocs);
} else {
    // First run: Load defaults and save them to storage so we can add to it later
    window.documents = defaultDocuments;
    localStorage.setItem('dts_documents', JSON.stringify(defaultDocuments));
}

// ==========================================
// 4. USER DATABASE (Mock Data)
// ==========================================
window.users = [
    { name: "Admin Officer", email: "admin@stotomas.gov.ph", password: "admin", role: "Super Administrator", dept: "CMIS" },
    { name: "Juan Dela Cruz", email: "head@stotomas.gov.ph", password: "head", role: "Department Head", dept: "OCM" },
    { name: "Maria Clara", email: "assist@stotomas.gov.ph", password: "assist", role: "Assistant Department Head", dept: "OCM" },
    { name: "Jose Rizal", email: "cas@stotomas.gov.ph", password: "cas", role: "CAS", dept: "Records" }
];