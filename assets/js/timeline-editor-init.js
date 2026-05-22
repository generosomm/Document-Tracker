// Quick Integration - Add this to your admin.js or admin page

// Load Timeline Editor Modal
function initTimelineEditor() {
    // Check if user is Super Admin
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if (user && user.role === 'Super Administrator') {
            // Load the modal HTML
            fetch('./components/edit-timeline-modal.html?v=' + Date.now())
                .then(r => r.text())
                .then(html => {
                    document.body.insertAdjacentHTML('beforeend', html);
                    console.log('✅ Timeline Editor loaded');
                })
                .catch(e => console.warn('Timeline Editor not available'));
        }
    } catch(e) {
        console.warn('Could not initialize Timeline Editor');
    }
}

// Call this on page load
document.addEventListener('DOMContentLoaded', () => {
    initTimelineEditor();
});

// To use: Add this button in your document actions
/*
<button onclick="openEditTimelineModal(window.currentDocId)" 
    style="background:#f59e0b; color:white; padding:10px 20px; border:none; border-radius:6px; cursor:pointer; font-weight:600;">
    <i class="ri-edit-line"></i> Edit Timeline (Admin)
</button>
*/
