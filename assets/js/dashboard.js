/* assets/js/dashboard.js */

document.addEventListener('DOMContentLoaded', () => {

    // 1. USE SHARED DATA (Populated by data.js)
    const docs = window.documents || []; 

    // 2. HELPER: DATES
    function getRelativeDate(daysAgo) {
        const d = new Date(); d.setDate(d.getDate() - daysAgo);
        return d.toISOString().split('T')[0];
    }

    // 3. UPDATE STATS CARDS
    function updateDashboardStats() {
        const pending = docs.filter(d => d.status === 'pending').length;
        const progress = docs.filter(d => d.status === 'progress').length;
        const completed = docs.filter(d => d.status === 'completed' || d.status === 'released').length;
        const attention = docs.filter(d => d.status === 'revision' || d.status === 'rejected').length;

        // Safely update elements
        const setVal = (id, val) => { 
            const el = document.getElementById(id); 
            if(el) el.innerText = val; 
        };
        setVal('stat-pending', pending);
        setVal('stat-progress', progress);
        setVal('stat-completed', completed);
        setVal('stat-attention', attention);
    }

    // 4. RENDER "NEW DOCUMENTS" LIST (Limit 5)
    function renderNewDocuments() {
        const listContainer = document.getElementById('new-docs-list');
        const badge = document.getElementById('new-docs-badge');
        
        const newDocs = docs.filter(d => d.status === 'pending');
        
        if(badge) badge.innerText = `${newDocs.length} Pending`;
        
        if(listContainer) {
            listContainer.innerHTML = '';
            
            newDocs.slice(0, 5).forEach(doc => {
                const item = document.createElement('div');
                item.className = 'list-item';
                
                // CLICK EVENT: Calls global function from document-preview-modal.js
                item.onclick = () => {
                    if (window.openDocViewer) {
                        window.openDocViewer(doc);
                    } else {
                        console.error("Preview Modal Script not loaded!");
                    }
                };

                item.innerHTML = `
                    <div class="icon-box blue"><i class="ri-file-text-line"></i></div>
                    <div class="item-content">
                        <div class="item-head">
                            <h4 class="item-title">${doc.title}</h4>
                            <span class="item-ref">${doc.id}</span>
                        </div>
                        <span class="item-meta">
                            <i class="ri-time-line"></i> ${doc.date}
                        </span>
                    </div>
                `;
                listContainer.appendChild(item);
            });
        }
    }

    // --- INIT ---
    updateDashboardStats();
    renderNewDocuments();
});