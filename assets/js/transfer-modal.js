window.openTransferModal = function(docId) {
    const existingModal = document.getElementById('transfer-modal');
    
    if (!existingModal) {
        loadTransferModalHtml(docId);
        return;
    }

    const modal = existingModal;
    const remarksInput = document.getElementById('transfer-remarks');
    
    if(remarksInput) remarksInput.value = ''; 
    
    modal.classList.add('active');
    modal.dataset.docId = docId;

    fetchRouteInfo(docId);

    initTransferEvents(modal);
};

async function fetchRouteInfo(docId) {
    const elCurrent = document.getElementById('route-current');
    const elNext = document.getElementById('route-next');
    const btnConfirm = document.getElementById('confirm-transfer-btn');
    const warningBox = document.getElementById('transfer-warning');

    if(elCurrent) elCurrent.innerText = "Checking...";
    if(elNext) {
        elNext.innerText = "Calculating...";
        elNext.style.color = '#2563EB'; 
    }
    if(btnConfirm) btnConfirm.disabled = true;
    if(warningBox) warningBox.style.display = 'none'; 

    try {
        let user = null;
        try { user = JSON.parse(localStorage.getItem('currentUser')); } catch(e){}

        const formData = new FormData();
        formData.append('doc_id', docId);
        formData.append('action', 'preview_route');
        
        if(user) {
            formData.append('client_user', user.name);
            formData.append('client_dept', user.dept);
        }

        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/transfer_document.php' : './assets/api/transfer_document.php';

        const res = await fetch(apiPath, { method: 'POST', body: formData, credentials: 'include' });
        const data = await res.json();

        if (data.success) {
            if(elCurrent) elCurrent.innerText = data.current || 'Unknown';
            
            if (!data.has_signed) {
                if(elNext) elNext.innerText = "Pending Signature";
                if(warningBox) warningBox.style.display = 'flex'; 
                if(btnConfirm) btnConfirm.disabled = true; 
            } else {
                if(elNext) elNext.innerText = data.next || 'End of Route';
                if(btnConfirm) btnConfirm.disabled = false;
            }

        } else {
            if(elNext) {
                elNext.innerText = "Error: " + (data.message || "Unknown");
                elNext.style.color = '#ef4444';
            }
        }
    } catch (e) {
        console.error("Route Fetch Error:", e);
        if(elNext) {
            elNext.innerText = "Connection Failed";
            elNext.style.color = '#ef4444';
        }
    }
}

async function loadTransferModalHtml(docId) {
    try {
        const isPages = window.location.pathname.includes('/pages/');
        const path = isPages ? '../components/transfer-modal.html?v=' + Date.now() : './components/transfer-modal.html?v=' + Date.now();
        
        const res = await fetch(path);
        if(!res.ok) throw new Error("Transfer modal HTML not found");
        const html = await res.text();
        
        document.body.insertAdjacentHTML('beforeend', html);
        setTimeout(() => window.openTransferModal(docId), 50);
        
    } catch (e) {
        console.error(e);
        if (window.showToast) window.showToast("Error loading interface", 'error');
    }
}

function initTransferEvents(modal) {
    if (modal.getAttribute('data-init') === 'true') return;

    const closeBtn = document.getElementById('close-transfer-btn');
    const cancelBtn = document.getElementById('cancel-transfer-btn');
    const confirmBtn = document.getElementById('confirm-transfer-btn');

    const closeModal = () => modal.classList.remove('active');

    if(closeBtn) closeBtn.onclick = closeModal;
    if(cancelBtn) cancelBtn.onclick = closeModal;

    if(confirmBtn) {
        confirmBtn.onclick = async () => {
            const docId = modal.dataset.docId;
            const remarks = document.getElementById('transfer-remarks').value;
            const originalText = confirmBtn.innerHTML;
            
            confirmBtn.innerHTML = "<i class='ri-loader-4-line ri-spin'></i> Processing...";
            confirmBtn.disabled = true;

            try {
                let user = null;
                try { user = JSON.parse(localStorage.getItem('currentUser')); } catch(e){}

                const formData = new FormData();
                formData.append('doc_id', docId);
                formData.append('action', 'transfer');
                formData.append('remarks', remarks);
                
                if(user) {
                    formData.append('client_user', user.name);
                    formData.append('client_dept', user.dept);
                }

                const isPages = window.location.pathname.includes('/pages/');
                const apiPath = isPages ? '../assets/api/transfer_document.php' : './assets/api/transfer_document.php';
                const emailPath = isPages ? '../assets/api/trigger_notification.php' : './assets/api/trigger_notification.php';

                const res = await fetch(apiPath, { method: 'POST', body: formData, credentials: 'include' });
                const result = await res.json();

                if(result.success) {
                    closeModal();
                    if(window.closeViewer) window.closeViewer();
                    
                    if(window.showToast) {
                        window.showToast(result.message, 'success');
                    } else {
                        alert(result.message);
                    }
                    
                    if(typeof window.fetchDocuments === 'function') {
                        window.fetchDocuments();
                    } else {
                        setTimeout(() => window.location.reload(), 1500);
                    }

                } else {
                    if(window.showToast) window.showToast("Transfer Failed: " + result.message, 'error');
                    else alert(result.message);
                }
            } catch (e) {
                console.error(e);
                if(window.showToast) window.showToast("Connection Error during transfer.", 'error');
            } finally {
                confirmBtn.innerHTML = originalText;
                confirmBtn.disabled = false;
            }
        };
    }

    modal.setAttribute('data-init', 'true');
}