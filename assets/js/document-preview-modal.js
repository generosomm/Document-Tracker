let viewStartTime = 0;
let isViewing = false;
window.currentUserSignature = null;
let archiveTimerInterval = null;

document.addEventListener("DOMContentLoaded", () => {
    loadPreviewModal();
});

// Path Configuration
function getPaths() {
    const isPages = window.location.pathname.includes('/pages/');
    return {
        html: isPages ? '../components/document-preview-modal.html' : './components/document-preview-modal.html',
        signHtml: isPages ? '../components/sign-document-modal.html' : './components/sign-document-modal.html',
        signJs: isPages ? '../assets/js/sign-modal.js' : './assets/js/sign-modal.js',
        signCss: isPages ? '../assets/css/sign-modal.css' : './assets/css/sign-modal.css',
        transferHtml: isPages ? '../components/transfer-modal.html?v=3' : './components/transfer-modal.html?v=3',
        transferJs: isPages ? '../assets/js/transfer-modal.js' : './assets/js/transfer-modal.js',
        transferCss: isPages ? '../assets/css/transfer-modal.css' : './assets/css/transfer-modal.css',
        timelineJs: isPages ? '../assets/js/document-timeline-modal.js' : './assets/js/document-timeline-modal.js',
        timelineCss: isPages ? '../assets/css/document-timeline-modal.css' : './assets/css/document-timeline-modal.css',
        apiTransfer: isPages ? '../assets/api/transfer_document.php' : './assets/api/transfer_document.php',
        apiServe: isPages ? '../assets/api/serve-file.php' : './assets/api/serve-file.php'
    };
}

// Load HTML Component
async function loadPreviewModal() {
    if (document.getElementById('doc-viewer-modal')) return Promise.resolve();
    try {
        const paths = getPaths();
        const response = await fetch(paths.html);
        if (!response.ok) throw new Error("Failed to load modal HTML");
        const text = await response.text();
        document.body.insertAdjacentHTML('beforeend', text);
        
        // Load timeline JS
        if (!window.openTimeline) {
            await new Promise((resolve, reject) => {
                const script = document.createElement('script');
                script.src = paths.timelineJs;
                script.onload = resolve;
                script.onerror = reject;
                document.body.appendChild(script);
            });
        }
        
        initPreviewLogic();
        return Promise.resolve();
    } catch (e) { 
        console.error("Loader Error:", e); 
        return Promise.reject(e);
    }
}

// Initialize Button Events
function initPreviewLogic() {
    const modal = document.getElementById('doc-viewer-modal');
    const closeBtn = document.getElementById('close-preview-btn');
    if(closeBtn) closeBtn.addEventListener('click', window.closeViewer);

    if (modal) {
        modal.addEventListener("click", (e) => {
            if (e.target.id === "doc-viewer-modal") window.closeViewer();
        });
    }

    const btnTimeline = document.getElementById('btn-view-timeline');
    if (btnTimeline) {
        // Always show for Super Admins, otherwise require permission
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const isSuperAdmin = user && user.role === 'Super Administrator';
            if (isSuperAdmin) {
                btnTimeline.style.display = 'block';
            } else {
                btnTimeline.setAttribute('data-require-feature', 'view_timeline');
            }
        } catch(e) {
            // Fallback to permission system
            btnTimeline.setAttribute('data-require-feature', 'view_timeline');
        }
        btnTimeline.onclick = () => { if(window.openTimeline) window.openTimeline(window.currentDocId); };
    }
    // ...existing code for btnReject and other buttons...

    const btnSign = document.getElementById('btn-sign-doc');
    if(btnSign) {
        btnSign.addEventListener('click', async () => {
            const docId = window.currentDocId;
            if (btnSign.dataset.mode === 'unsign') {
                showConfirm('Remove signature?', async () => {
                    await performUnsign(docId);
                    checkSigningStatus(docId);
                });
                return;
            }
        // ...existing code...
        if (!docId) {
            showToast('No document selected.', 'warning');
            return;
        }

        const paths = getPaths();

        if (!document.getElementById('sign-modal')) {
            const originalText = btnSign.innerHTML;
            btnSign.innerHTML = "<i class='ri-loader-4-line ri-spin'></i> Loading...";
            
            try {
                // Load CSS
                if (!document.querySelector(`link[href*="sign-modal.css"]`)) {
                    const link = document.createElement('link'); 
                    link.rel = 'stylesheet'; link.href = paths.signCss; 
                    document.head.appendChild(link);
                }

                // Load HTML
                const hResp = await fetch(paths.signHtml);
                if (!hResp.ok) throw new Error("HTML not found");
                const html = await hResp.text();
                document.body.insertAdjacentHTML('beforeend', html);

                // Load JS
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = paths.signJs;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });

            } catch(e) {
                console.error(e);
                showToast('Error loading signing interface.', 'error');
                btnSign.innerHTML = originalText;
                return;
            }
            btnSign.innerHTML = originalText;
        }

        document.getElementById('doc-viewer-modal').classList.remove('active');
        
        setTimeout(() => { 
            if(window.openSignModal) {
                window.openSignModal(docId, `${paths.apiServe}?file_id=${docId}`); 
            } else {
                showToast('Error: Signing function not found. Refresh page.', 'error');
            }
        }, 100);
    });
    }

    const btnTransfer = document.getElementById('btn-transfer-doc');
    if(btnTransfer) {
        btnTransfer.addEventListener('click', () => { if(window.openTransferModal) window.openTransferModal(window.currentDocId); });
    }

    const btnNote = document.getElementById('btn-note-doc');
    if(btnNote) {
        btnNote.addEventListener('click', async () => {
            const docId = window.currentDocId;
            if (!docId) {
                showToast('No document selected.', 'warning');
                return;
            }

            const paths = getPaths();
            
            // Force remove old modal to reload with new HTML structure
            const oldModal = document.getElementById('sign-modal');
            if (oldModal) {
                oldModal.remove();
            }
            
            // Load sign modal (it works for both sign and note since it's just placing a stamp)
            const originalText = btnNote.innerHTML;
            btnNote.innerHTML = "<i class='ri-loader-4-line ri-spin'></i> Loading...";
            
            try {
                // Load CSS
                if (!document.querySelector(`link[href*="sign-modal.css"]`)) {
                    const link = document.createElement('link'); 
                    link.rel = 'stylesheet'; link.href = paths.signCss; 
                    document.head.appendChild(link);
                }

                // Load HTML
                const hResp = await fetch(paths.signHtml + '?v=' + new Date().getTime()); // Cache bust
                if (!hResp.ok) throw new Error("HTML not found");
                const html = await hResp.text();
                document.body.insertAdjacentHTML('beforeend', html);

                // Load JS
                await new Promise((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = paths.signJs;
                    script.onload = resolve;
                    script.onerror = reject;
                    document.body.appendChild(script);
                });

            } catch(e) {
                console.error(e);
                showToast('Error loading note interface.', 'error');
                btnNote.innerHTML = originalText;
                return;
            }
            btnNote.innerHTML = originalText;

            document.getElementById('doc-viewer-modal').classList.remove('active');
            
            setTimeout(() => { 
                if(window.openSignModal) {
                    // Pass 'note' as the mode to distinguish from regular signing
                    window.openSignModal(docId, `${paths.apiServe}?file_id=${docId}`, 'note'); 
                } else {
                    showToast('Error: Note function not found. Refresh page.', 'error');
                }
            }, 100);
        });
    }

    const btnArchive = document.getElementById('btn-archive-doc');
    if(btnArchive) {
        btnArchive.addEventListener('click', async () => {
            showConfirm('Finalize and move to Records?', async () => {
                const res = await callApi('archive_document');
                if(res.success) { 
                    showToast(res.message, 'success');
                    window.closeViewer(); 
                    if(window.fetchDocuments) window.fetchDocuments();
                    if(window.loadDashboardData) window.loadDashboardData();
                }
            });
        });
    }

    const btnRelease = document.getElementById('btn-release-doc');
    if(btnRelease) {
        btnRelease.addEventListener('click', async () => {
            showConfirm('Mark this document as RELEASED (Handover to Client)?', async () => {
                const res = await callApi('release_document');
                if(res.success) { 
                    showToast(res.message, 'success');
                    window.closeViewer(); 
                    if(window.fetchDocuments) window.fetchDocuments();
                    if(window.loadDashboardData) window.loadDashboardData();
                }
            });
        });
    }
}

// Check Signing Status
async function checkSigningStatus(docId) {
    const btnSign = document.getElementById('btn-sign-doc');
    const btnNote = document.getElementById('btn-note-doc');
    const btnTransfer = document.getElementById('btn-transfer-doc');
    const btnArchive = document.getElementById('btn-archive-doc');
    const btnReject = document.getElementById('btn-reject-doc'); 
    const btnRelease = document.getElementById('btn-release-doc');
    const btnEditTimeline = document.getElementById('btn-edit-timeline');
    const statusBadge = document.getElementById('view-status');
    const remarkLabel = document.getElementById('view-latest-remark');

    [btnTransfer, btnSign, btnNote, btnArchive, btnReject, btnRelease].forEach(b => { if(b) b.style.display = 'none'; });
    
    // Show Edit Timeline button only for Super Admin
    if (btnEditTimeline) {
        try {
            const user = JSON.parse(localStorage.getItem('currentUser'));
            const isSuperAdmin = user && user.role === 'Super Administrator';
            btnEditTimeline.style.display = isSuperAdmin ? 'flex' : 'none';
            console.log('🔧 Edit Timeline Button - User Role:', user?.role, 'Show:', isSuperAdmin);
        } catch(e) {
            btnEditTimeline.style.display = 'none';
            console.warn('Edit Timeline - Could not determine user role');
        }
    }
    
    if (archiveTimerInterval) clearInterval(archiveTimerInterval);
    const timerContainer = document.getElementById('auto-archive-timer');
    if (timerContainer) timerContainer.style.display = 'none';

    try {
        const formData = new FormData();
        formData.append('doc_id', docId);
        formData.append('action', 'check_status');
        
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if(user) { 
            formData.append('client_user', user.name); 
            formData.append('client_dept', user.dept); 
        }

        const paths = getPaths();
        const res = await fetch(paths.apiTransfer, { method: 'POST', body: formData });
        const data = await res.json();

        if (remarkLabel) {
            remarkLabel.innerHTML = data.latest_remark 
                ? `<strong>${data.latest_user}:</strong> ${data.latest_remark}` 
                : "No activity yet.";
        }
        if(statusBadge) statusBadge.outerHTML = getStatusBadge(data.status);

        const rawStatus = (data.status || '').toLowerCase();
        const isSigned = (rawStatus === 'signed' || data.is_signed === true);
        const isCompleted = (rawStatus === 'completed');
        const isRejected = (rawStatus === 'rejected');
        const isReleased = (rawStatus === 'released');
        const isRevision = (rawStatus === 'revision');

        if (window.location.pathname.includes('records.html')) {
            if ((isCompleted || isRejected) && rawStatus !== 'released') {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                const myName = user ? user.name.trim().toLowerCase() : '';
                const ownerName = data.uploaded_by ? data.uploaded_by.trim().toLowerCase() : '';
                const docDeptEl = document.getElementById('view-dept');
                const docDept = docDeptEl ? docDeptEl.innerText.trim().toLowerCase() : '';
                const myDept = (user ? user.dept : '').trim().toLowerCase();

                const isOwner = (ownerName === myName) || 
                                (docDept.includes(myDept) || myDept.includes(docDept)) ||
                                (user.role === 'Super Administrator');
                
                if (isOwner && btnRelease) {
                    btnRelease.style.display = 'flex';
                    btnRelease.innerHTML = '<i class="ri-hand-coin-line"></i> Release to Client';
                } else if (btnRelease) {
                    btnRelease.style.display = 'none';
                }
            }
            return;
        }

        if (isCompleted) {
            const ownerName = (data.owner || '').trim().toLowerCase();
            const myName = (user ? user.name : '').trim().toLowerCase();
            
            const docDeptEl = document.getElementById('view-dept');
            const docDept = docDeptEl ? docDeptEl.innerText.trim().toLowerCase() : '';
            const myDept = (user ? user.dept : '').trim().toLowerCase();

            const isOwner = (ownerName === myName) || 
                            (docDept.includes(myDept) || myDept.includes(docDept)) ||
                            (user.role === 'Super Administrator');

            if (isOwner) {
                if (btnArchive) btnArchive.style.display = 'flex';
                
                if (btnRelease) {
                    btnRelease.style.display = 'flex';
                    btnRelease.innerHTML = '<i class="ri-hand-coin-line"></i> Release to Client';
                }
            } else {
                if (btnArchive) btnArchive.style.display = 'none';
                if (btnRelease) btnRelease.style.display = 'none';
            }
            
            const completionTimeStr = data.completed_at || new Date().toISOString(); 
            startArchiveTimer(completionTimeStr);
            
            return; 
        }

        if (data.can_sign && !isRejected) {
            
            if (isSigned) {
                if (data.is_last_step) {
                    const ownerName = (data.owner || '').trim().toLowerCase();
                    const myName = (user ? user.name : '').trim().toLowerCase();
                    
                    const docDeptEl = document.getElementById('view-dept');
                    const docDept = docDeptEl ? docDeptEl.innerText.trim().toLowerCase() : '';
                    const myDept = (user ? user.dept : '').trim().toLowerCase();

                    const isOwner = (ownerName === myName) || 
                                    (docDept.includes(myDept) || myDept.includes(docDept)) ||
                                    (user.role === 'Super Administrator');

                    if (isOwner && btnArchive) btnArchive.style.display = 'flex'; 
                } else {
                    if (btnTransfer) btnTransfer.style.display = 'flex';
                }
                
                if (btnSign) {
                    btnSign.style.display = 'flex';
                    btnSign.innerHTML = '<i class="ri-eraser-line"></i> Remove Signature';
                    btnSign.dataset.mode = 'unsign';
                }
            } else {
                if (btnReject) {
                    btnReject.style.display = 'flex';
                    btnReject.innerHTML = isRevision 
                        ? '<i class="ri-close-circle-line"></i> Reject Document' 
                        : '<i class="ri-arrow-go-back-line"></i> Return for Revision';
                    btnReject.dataset.mode = isRevision ? 'reject' : 'revision';
                }

                if (btnSign) {
                    btnSign.style.display = 'flex';
                    btnSign.innerHTML = '<i class="ri-pen-nib-line"></i> Sign Document';
                    btnSign.dataset.mode = 'sign';
                }
            }
        } else if (!isRejected && !isCompleted) {
            // User can't sign, but might be able to NOTE the document
            // Check if user is in the CURRENT routing location AND lacks sign permission
            const isInCurrentLocation = data.is_correct_dept === true;
            const hasSignPermission = data.can_sign === true;
            
            // Show Note button ONLY if:
            // 1. User IS in current routing location
            // 2. User does NOT have sign permission (so can_sign is false)
            // 3. Document is not already signed
            if (isInCurrentLocation && btnNote && !isSigned && !hasSignPermission) {
                btnNote.style.display = 'flex';
                btnNote.innerHTML = '<i class="ri-checkbox-circle-line"></i> Note Document';
            }
        }
    } catch (error) {
        console.error("Error checking status:", error);
    }
}

function startArchiveTimer(completionDateStr) {
    const timerContainer = document.getElementById('auto-archive-timer');
    const timeDisplay = document.getElementById('archive-countdown');
    
    if (!timerContainer || !timeDisplay) return;

    const completedDate = new Date(completionDateStr.replace(/-/g, "/")); 
    
    const DURATION_MS = 24 * 60 * 60 * 1000; 

    const archiveTime = completedDate.getTime() + DURATION_MS;

    timerContainer.style.display = 'block';

    function updateTimer() {
        const now = new Date().getTime();
        const distance = archiveTime - now;

        if (distance < 0) {
            clearInterval(archiveTimerInterval);
            timeDisplay.innerText = "Processing...";
            timerContainer.style.color = "red";
            return;
        }

        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        timeDisplay.innerText = `${hours}h ${minutes}m ${seconds}s`;
    }

    updateTimer(); 
    archiveTimerInterval = setInterval(updateTimer, 1000);
}

async function performUnsign(docId) {
    try {
        const res = await callApi('unsign');
        if (res.success) {
            showToast('Signature removed successfully.', 'success');
            
            const iframe = document.getElementById('pdf-viewer-frame');
            if (iframe) {
                const baseSrc = iframe.src.split('&v=')[0].split('#')[0]; 
                iframe.src = `${baseSrc}&v=${Date.now()}#toolbar=0&navpanes=1&view=FitH`;
            }

            if(window.checkSigningStatus) window.checkSigningStatus(docId);
            if(typeof window.fetchDocuments === 'function') window.fetchDocuments();
            if(window.loadDashboardData) window.loadDashboardData(); 
        } else {
            showToast('Error: ' + res.message, 'error');
        }
    } catch (e) { console.error("Unsign process failed:", e); }
}

// Open Doc Viewer
window.openDocViewer = async function(doc) {
    window.currentDocId = doc.id;
    if (!document.getElementById('doc-viewer-modal')) { try { await loadPreviewModal(); } catch (e) { return; } }
    
    const fields = { 
        'view-doc-title': doc.title, 
        'view-doc-id': doc.id, 
        'view-dept': doc.dept, 
        'view-category': doc.category, 
        'view-date': doc.date,
        'view-description': doc.description
    };
    for (const [id, val] of Object.entries(fields)) {
        const el = document.getElementById(id); 
        if(el) {
            if (id === 'view-description') {
                el.innerText = (val && val.trim() !== "") ? val : "No description provided.";
            } else {
                el.innerText = val || '-';
            }
        }
    }

    const paths = getPaths();
    const iframe = document.getElementById('pdf-viewer-frame');
    const fallback = document.getElementById('pdf-fallback');
    
    const downloadBtn = document.getElementById('btn-download-pdf');
    if(downloadBtn) downloadBtn.style.display = 'none';

    if (doc.id) {
        if(iframe) { 
            iframe.style.display = 'block';
            iframe.src = `${paths.apiServe}?file_id=${doc.id}&t=${Date.now()}#toolbar=0&navpanes=1&view=FitH`; 
        }
        if(fallback) fallback.style.display = 'none';
    } else {
        if(iframe) iframe.style.display = 'none';
        if(fallback) fallback.style.display = 'flex';
    }

    document.getElementById('doc-viewer-modal').classList.add('active');
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const isAssignedToMe = () => {
        if (!user || !doc.assignee) return false;
        const uDept = user.dept.toLowerCase().trim();
        const dAssignee = doc.assignee.toLowerCase().trim();
        return uDept.includes(dAssignee) || dAssignee.includes(uDept);
    };

    if (doc.status && doc.status.toLowerCase() === 'pending' && isAssignedToMe()) {
        try {
            const formData = new FormData();
            formData.append('doc_id', doc.id);
            formData.append('action', 'update_status');
            formData.append('status', 'progress');
            formData.append('remarks', 'Opened and reviewed by Department Head');
            
            if(user) { 
                formData.append('client_user', user.name); 
                formData.append('client_dept', user.dept); 
            }
            
            fetch(paths.apiTransfer, { method: 'POST', body: formData })
                .then(r => r.json())
                .then(data => {
                    if (data.success) {
                        if(window.fetchDocuments) window.fetchDocuments();
                        if(window.loadDashboardData) window.loadDashboardData();
                    }
                });
        } catch(e) { console.warn("Auto-progress failed", e); }
    }

    checkSigningStatus(doc.id);
    renderRouteStepper(doc.id);
    viewStartTime = Date.now();
    isViewing = true;
};

window.closeViewer = function() {
    const modal = document.getElementById('doc-viewer-modal');
    if(modal && modal.classList.contains('active')) {
        modal.classList.remove('active');
        document.getElementById('pdf-viewer-frame').src = ''; 
        const fallback = document.getElementById('pdf-fallback');
        if(fallback) fallback.style.display = 'flex';
        document.getElementById('pdf-viewer-frame').style.display = 'none';

        if(isViewing && window.currentDocId) {
            const endTime = Date.now();
            const durationSec = Math.round((endTime - viewStartTime) / 1000);
            if(durationSec >= 1) logViewSession(window.currentDocId, durationSec);
            isViewing = false;
        }
    }
};

async function logDownload(docId) { callApi('download'); }

async function logViewSession(docId, duration) {
    const formData = new FormData();
    formData.append('doc_id', docId);
    formData.append('action', 'view_log');
    formData.append('duration', duration);
    const paths = getPaths();
    try { await fetch(paths.apiTransfer, { method: 'POST', body: formData }); } catch(e){}
}

async function renderRouteStepper(docId) {
    const container = document.getElementById('view-route-list');
    if(!container) return;
    container.innerHTML = '<div style="color:#94a3b8; font-size:0.8rem; padding:10px;">Loading route...</div>';
    const paths = getPaths();
    const formData = new FormData(); formData.append('doc_id', docId); formData.append('action', 'get_route_info');
    try {
        const res = await fetch(paths.apiTransfer, { method: 'POST', body: formData });
        const data = await res.json();
        if (!data.success || !data.sequence) return container.innerHTML = 'Route info unavailable';
        
        let html = '<div class="route-stepper" style="display:flex; flex-direction:column;">';
        data.sequence.forEach((dept, index) => {
            let status = (index < data.current_step) ? 'completed' : (index === data.current_step ? 'active' : '');
            let icon = (status === 'completed') ? '<i class="ri-check-line"></i>' : (index + 1);
            
            html += `<div class="step-item ${status}" style="display:flex; gap:12px; padding-bottom:16px; align-items:center;">
                        <div class="step-icon">${icon}</div>
                        <span class="step-label">${dept}</span>
                     </div>`;
        });
        container.innerHTML = html + '</div>';
    } catch (e) {}
}

function getStatusBadge(status) {
    const config = {
        released: { icon: 'ri-send-plane-fill', class: 'released' },   
        completed: { icon: 'ri-checkbox-circle-fill', class: 'completed' }, 
        signed: { icon: 'ri-pen-nib-fill', class: 'signed' }, 
        progress: { icon: 'ri-loader-4-line', class: 'progress' },     
        pending: { icon: 'ri-time-line', class: 'pending' },           
        revision: { icon: 'ri-alert-line', class: 'revision' },        
        rejected: { icon: 'ri-close-circle-line', class: 'rejected' }  
    };
    
    const sKey = (status || '').toLowerCase();
    const s = config[sKey] || config.progress;
    
    let label = status ? status.charAt(0).toUpperCase() + status.slice(1) : 'Unknown';
    let customStyle = "";

    if (sKey === 'signed') {
        label = "Signed (Ready)";
        customStyle = "background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe;";
    }

    return `<span class="status-badge ${s.class}" style="${customStyle}">
                <i class="${s.icon}"></i> ${label}
            </span>`;
}

// API Helper
async function callApi(action) {
    try {
        const formData = new FormData();
        formData.append('doc_id', window.currentDocId);
        formData.append('action', action);

        const user = JSON.parse(localStorage.getItem('currentUser'));
        if(user) { 
            formData.append('client_user', user.name); 
            formData.append('client_dept', user.dept); 
        }

        const paths = getPaths();
        const res = await fetch(paths.apiTransfer, { method: 'POST', body: formData });
        return await res.json();
    } catch (e) {
        console.error("API Error:", e);
        return { success: false, message: "Connection Error" };
    }
}