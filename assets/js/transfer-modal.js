/* assets/js/transfer-modal.js */

document.addEventListener("DOMContentLoaded", () => {
    loadTransferModal();
});

async function loadTransferModal() {
    if (document.getElementById('transfer-modal')) return;

    try {
        const response = await fetch('../components/transfer-modal.html');
        if (!response.ok) throw new Error("Failed to load transfer modal");
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        initTransferLogic();
    } catch (error) {
        console.error("Error loading transfer modal:", error);
    }
}

function initTransferLogic() {
    const modal = document.getElementById('transfer-modal');
    const closeBtn = document.getElementById('close-transfer-modal');
    const cancelBtn = document.getElementById('cancel-transfer-btn');
    const form = document.getElementById('transfer-form');

    // 1. Open Function (Global)
    window.openTransferModal = function(docId) {
        const docs = window.documents || [];
        const doc = docs.find(d => d.id === docId);
        
        if (!doc) return;

        // Populate Modal
        document.getElementById('transfer-doc-id').value = doc.id;
        document.getElementById('transfer-doc-title').innerText = doc.title;
        document.getElementById('transfer-current-status').innerText = doc.dept; // Show current dept as status
        
        // Clear previous inputs
        document.getElementById('transfer-dept-select').value = "";
        document.getElementById('transfer-remarks').value = "";

        modal.classList.add('active');
    };

    // 2. Close Functions
    const closeModal = () => modal.classList.remove('active');
    if(closeBtn) closeBtn.onclick = closeModal;
    if(cancelBtn) cancelBtn.onclick = closeModal;

    // 3. Submit Logic (LocalStorage)
    if(form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            const docId = document.getElementById('transfer-doc-id').value;
            const newDept = document.getElementById('transfer-dept-select').value;
            const remarks = document.getElementById('transfer-remarks').value;
            
            // Get Current User
            const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Unknown', role: 'Staff' };

            // Find and Update Doc
            const docs = window.documents || [];
            const docIndex = docs.findIndex(d => d.id === docId);

            if (docIndex !== -1) {
                const doc = docs[docIndex];
                const oldDept = doc.dept;

                // Update Fields
                doc.dept = newDept;
                doc.assignee = newDept; // Assign to the dept head/office
                doc.status = 'progress'; 
                
                // Add Timeline Entry
                const now = new Date();
                const dateStr = now.toISOString().split('T')[0];
                const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                const timelineEvent = {
                    user: currentUser.name,
                    role: currentUser.role,
                    action: 'Transferred',
                    time: `${dateStr} ${timeStr}`,
                    icon: 'ri-share-forward-fill',
                    details: `Transferred from ${oldDept} to ${newDept}.`,
                    meta: `Remarks: ${remarks}`,
                    ctx: 'ctx-action' // For styling in timeline
                };

                // Add to start of timeline array
                if(!doc.timeline) doc.timeline = [];
                doc.timeline.unshift(timelineEvent);

                // SAVE TO LOCAL STORAGE
                window.documents = docs; // Update memory
                localStorage.setItem('dts_documents', JSON.stringify(docs)); // Update storage

                // Refresh Table & Close
                if(typeof window.renderTable === 'function') window.renderTable();
                
                closeModal();
                alert(`Success! Document transferred to ${newDept}.`);
            }
        });
    }
}