/* assets/js/document-preview-modal.js */

document.addEventListener("DOMContentLoaded", () => {
    loadPreviewModal();
});

async function loadPreviewModal() {
    if (document.getElementById('doc-viewer-modal')) return;

    try {
        const response = await fetch('../components/document-preview-modal.html');
        if (!response.ok) throw new Error("Failed to load preview modal");
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        
        // Initialize Close Logic
        document.getElementById('close-preview-btn').addEventListener('click', closeViewer);
        
        // Initialize Action Buttons
        document.getElementById('btn-view-timeline').addEventListener('click', () => {
            if(window.openTimeline) window.openTimeline(window.currentDocId);
        });
        
        document.getElementById('btn-transfer-doc').addEventListener('click', () => {
            if(window.openTransfer) window.openTransfer(window.currentDocId, window.currentDocTitle);
        });

    } catch (error) {
        console.error("Error:", error);
    }
}

// --- GLOBAL FUNCTIONS (Called by Tracking Table) ---

window.openDocViewer = function(doc) {
    // Store current doc details globally for other modals to access
    window.currentDocId = doc.id;
    window.currentDocTitle = doc.title;

    // Helper to set text content
    const setVal = (id, val) => { 
        const el = document.getElementById(id); 
        if(el) el.innerText = val; 
    };

    setVal('view-doc-title', doc.title);
    setVal('view-doc-id', doc.id);
    setVal('view-dept', doc.dept);
    setVal('view-assignee', doc.assignee);
    setVal('view-category', doc.category);
    setVal('view-date', doc.date);

    // Set Status Badge
    const elStatus = document.getElementById('view-status');
    if(elStatus) {
        // Reset classes
        elStatus.className = `status-badge ${doc.status.toLowerCase()}`;
        elStatus.innerText = doc.status.charAt(0).toUpperCase() + doc.status.slice(1);
        
        // Manual color mapping fallback (optional if CSS handles class names correctly)
        const colors = {
            released: 'released', completed: 'completed',
            progress: 'progress', pending: 'pending',
            revision: 'revision', rejected: 'rejected'
        };
        if(colors[doc.status]) elStatus.classList.add(colors[doc.status]);
    }

    document.getElementById('doc-viewer-modal').classList.add('active');
};

window.closeViewer = function() {
    document.getElementById('doc-viewer-modal').classList.remove('active');
};