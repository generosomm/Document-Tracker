const TIMELINE_HTML = `
<div class="modal-overlay" id="timeline-modal" style="z-index: 2147483647;">
    <div class="modal-container timeline-style">
        <div class="modal-header">
            <div class="header-left">
                <div class="icon-circle orange"><i class="ri-history-line"></i></div>
                <div><h3>Document Timeline</h3><p class="sub-header">Audit Trail for <span id="tl-doc-id">...</span></p></div>
            </div>
            <button class="close-btn" id="close-timeline-btn" style="cursor:pointer;"><i class="ri-close-line"></i></button>
        </div>
        <div class="modal-body">
            <div class="timeline-container" id="timeline-list">
                <div style="padding:20px; text-align:center;"><i class="ri-loader-4-line ri-spin"></i> Loading...</div>
            </div>
        </div>
    </div>
</div>`;

window.openTimeline = function(docId) {
    if (!document.getElementById('timeline-modal')) {
        document.body.insertAdjacentHTML('beforeend', TIMELINE_HTML);
        
        const isPages = window.location.pathname.includes('/pages/');
        const cssPath = isPages ? '../assets/css/document-timeline-modal.css?v=99' : './assets/css/document-timeline-modal.css?v=99';
        
        if (!document.querySelector(`link[href*="document-timeline-modal.css"]`)) {
            const link = document.createElement('link');
            link.rel = 'stylesheet'; link.href = cssPath;
            document.head.appendChild(link);
        }

        const modalOverlay = document.getElementById('timeline-modal');
        modalOverlay.addEventListener("click", (e) => {
            if (e.target.id === "timeline-modal") {
                modalOverlay.classList.remove('active');
            }
        });
    }
    
    const modal = document.getElementById('timeline-modal');
    modal.classList.add('active');

    const closeBtn = document.getElementById('close-timeline-btn');
    closeBtn.onclick = () => { modal.classList.remove('active'); };

    document.getElementById('tl-doc-id').innerText = docId;
    fetchTimelineData(docId);
};

async function fetchTimelineData(docId) {
    const list = document.getElementById('timeline-list');
    const isPages = window.location.pathname.includes('/pages/');
    const api = isPages ? '../assets/api/get_timeline.php' : './assets/api/get_timeline.php';

    try {
        const res = await fetch(`${api}?doc_id=${docId}`);
        const data = await res.json();
        
        if(!Array.isArray(data) || data.length === 0) {
            list.innerHTML = '<p style="text-align:center; padding:20px; color:#64748b;">No history found.</p>';
            return;
        }

        // Sort by timestamp (oldest to newest)
        const sortedData = [...data].sort((a, b) => {
            return new Date(a.timestamp) - new Date(b.timestamp);
        });

        let html = '<div class="timeline-wrapper" style="border-left:2px solid #e2e8f0; margin-left:10px; padding-left:20px;">';
        
        sortedData.forEach(item => {
            const actionType = item.action ? item.action.toLowerCase() : 'viewed';
            
            let actionDisplay = item.action;
            let badgeHtml = '';

            if (item.action === 'Viewed' && item.view_number) {
                const count = item.view_number;
                const ordinal = getOrdinal(count);
                actionDisplay = "Viewed Document";
                badgeHtml += `<span style="background:#eff6ff; color:#2563EB; font-size:0.7rem; padding:1px 5px; border-radius:4px; border:1px solid #bfdbfe; margin-left:6px; font-weight:600;">${ordinal} Time</span>`;
            }

            const deptHtml = item.role ? `<span class="dept-badge" style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-size:0.75rem; color:#475569; margin-left:6px; font-weight:normal;">${item.role}</span>` : '';

            let detailsText = item.details || '';
            detailsText = detailsText.replace(/(Viewed for|Duration:)(.*?)(s|m|h)/gi, '<strong>$1$2$3</strong>');

            html += `
                <div class="timeline-item ${actionType}" style="position:relative; margin-bottom:20px;">
                    <div class="timeline-dot" style="position:absolute; left:-27px; top:4px; width:12px; height:12px; background:white; border:2px solid #cbd5e1; border-radius:50%;"></div>
                    
                    <div class="timeline-content" style="background:white; padding:12px; border:1px solid #e2e8f0; border-radius:8px; box-shadow: 0 1px 2px rgba(0,0,0,0.05);">
                        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:4px;">
                            <h4 style="margin:0; font-size:0.9rem; color:#1e293b; font-weight:600;">
                                ${item.user || 'Unknown'} ${deptHtml}
                            </h4>
                            <span style="font-size:0.7rem; color:#94a3b8;">${formatDateTime(item.timestamp)}</span>
                        </div>

                        <div style="margin:2px 0 6px; font-size:0.85rem; color:#334155; font-weight:600;">
                            ${actionDisplay} ${badgeHtml}
                        </div>

                        <div style="font-size:0.8rem; color:#64748b; line-height:1.4;">
                            ${detailsText}
                        </div>
                    </div>
                </div>`;
        });
        
        html += '</div>';
        list.innerHTML = html;

    } catch (e) {
        console.error("Timeline Load Error:", e);
        list.innerHTML = '<p style="text-align:center; color:#ef4444; padding:20px;">Failed to load data.</p>';
    }
}

function getOrdinal(n) {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

function formatDateTime(sqlDate) {
    const d = new Date(sqlDate);
    return d.toLocaleString('en-US', { 
        month: 'short', day: 'numeric', year: 'numeric',
        hour: 'numeric', minute: '2-digit', hour12: true 
    });
}