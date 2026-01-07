/* assets/js/document-timeline-modal.js */

document.addEventListener("DOMContentLoaded", () => {
    loadTimelineModal();
});

async function loadTimelineModal() {
    if (document.getElementById('timeline-modal')) return;

    try {
        const response = await fetch('../components/document-timeline-modal.html');
        if (!response.ok) throw new Error("Failed to load timeline modal");
        const html = await response.text();
        document.body.insertAdjacentHTML('beforeend', html);
        
        document.getElementById('close-timeline-btn').addEventListener('click', closeTimeline);

    } catch (error) {
        console.error("Error:", error);
    }
}

// --- GLOBAL FUNCTIONS ---

window.openTimeline = function(docId) {
    // Fallback to globally stored ID if none passed
    const targetId = docId || window.currentDocId; 
    
    // Find document data
    const documents = window.documents || [];
    const doc = documents.find(d => d.id === targetId);

    if (!doc) {
        alert("Document data not found.");
        return;
    }

    // Set Header
    const idLabel = document.getElementById('tl-doc-id');
    if(idLabel) idLabel.innerText = doc.id;
    
    // Render Timeline
    const feed = document.getElementById('timeline-feed-content');
    const history = doc.timeline || [];

    if (history.length === 0) {
        feed.innerHTML = '<div style="padding:40px; text-align:center; color:#94a3b8;">No history available.</div>';
    } else {
        let html = '<div class="timeline-container">';
        
        // Show newest first
        [...history].reverse().forEach((item, index) => {
            const isLatest = index === 0;
            
            // 1. Color Logic
            let dotColor = 'border-gray-300';
            if (isLatest) dotColor = 'border-green-500';
            else if (item.action.includes('Viewed') || item.action.includes('Opened')) dotColor = 'border-blue-500';
            else if (item.action.includes('Rejected')) dotColor = 'border-red-500';

            // 2. Icon Logic
            let iconClass = 'bg-gray-100 text-gray-500';
            if (item.action.includes('Forwarded') || item.action.includes('Approved')) iconClass = 'bg-green-50';
            if (item.action.includes('Viewed') || item.action.includes('Opened')) iconClass = 'bg-blue-50';
            if (item.action.includes('Rejected')) iconClass = 'bg-red-50';
            if (item.action.includes('Signed')) iconClass = 'bg-purple-50';

            // 3. Badge Logic
            let badgeHtml = '';
            if (item.viewTag) {
                badgeHtml = `<span class="badge-view"><i class="ri-eye-line"></i> ${item.viewTag}</span>`;
            }

            html += `
                <div class="timeline-item">
                    <div class="tl-sidebar">
                        <div class="tl-line"></div>
                        <div class="tl-dot ${dotColor}"></div>
                    </div>
                    <div class="tl-body">
                        <div class="tl-header">
                            <div>
                                <span class="tl-user">${item.user}</span>
                                <span class="tl-role">${item.role}</span>
                            </div>
                            <span class="tl-time">${item.time}</span>
                        </div>
                        <div class="tl-action-row">
                            <div class="tl-action-group">
                                <div class="tl-icon ${iconClass}">
                                    <i class="${item.icon}"></i>
                                </div>
                                <span class="tl-action-text">${item.action}</span>
                            </div>
                            ${badgeHtml}
                        </div>
                        <div class="tl-details-box">
                            <strong>Details:</strong><br>
                            ${item.details}
                            ${item.meta ? `<div class="tl-meta">${item.meta}</div>` : ''}
                        </div>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        feed.innerHTML = html;
    }
    
    document.getElementById('timeline-modal').classList.add('active');
};

window.closeTimeline = function() {
    document.getElementById('timeline-modal').classList.remove('active');
};