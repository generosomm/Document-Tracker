(function loadPdfJs() {
    if (window.pdfjsLib) return;
    const script = document.createElement('script');
    script.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
    script.onload = () => {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    };
    document.head.appendChild(script);
})();

window.openSignModal = async function(docId, pdfUrl, mode = 'sign') {
    const modal = document.getElementById('sign-modal');
    const iframe = document.getElementById('sign-pdf-frame');
    
    // Store the mode globally for use in submission
    window.currentSignMode = mode;
    
    if(iframe) iframe.style.display = 'none';

    // Update modal title based on mode
    const modalTitle = modal.querySelector('.modal-header h3');
    if (modalTitle) {
        modalTitle.textContent = mode === 'note' ? 'Add Note to Document' : 'Digital Signature';
    }

    // Show/hide mode buttons based on mode
    const modeNote = document.getElementById('mode-note');
    const modeSimple = document.getElementById('mode-simple');
    const modePnpki = document.getElementById('mode-pnpki');
    
    if (mode === 'note') {
        if (modeNote) modeNote.style.display = 'inline-flex';
        if (modeSimple) modeSimple.style.display = 'none';
        if (modePnpki) modePnpki.style.display = 'none';
    } else {
        if (modeNote) modeNote.style.display = 'none';
        if (modeSimple) modeSimple.style.display = 'inline-flex';
        if (modePnpki) modePnpki.style.display = 'inline-flex';
    }

    if (modal) {
        modal.onclick = (e) => {
            if (e.target.id === "sign-modal") {
                modal.classList.remove('active');
            }
        };
    }

    if (!document.getElementById('autofill-trap')) {
        const trap = document.createElement('div');
        trap.id = 'autofill-trap';
        trap.style.position = 'absolute';
        trap.style.top = '-9999px';
        trap.style.left = '-9999px';
        trap.innerHTML = `<form><input type="text" name="fake_user"><input type="password" name="fake_pass"></form>`;
        document.body.prepend(trap);
    }
    
    document.querySelectorAll('input[type="text"]').forEach(el => {
        if(el.name.includes('search') || el.placeholder.includes('Search')) {
            el.setAttribute('autocomplete', 'off');
            el.setAttribute('readonly', true);
            el.onfocus = function(){ this.removeAttribute('readonly'); };
        }
    });

    let container = document.getElementById('pdf-render-container');
    const wrapper = document.querySelector('.sign-canvas-area');
    
    let userName = "USER NAME";
    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        if(user && user.name) userName = user.name.toUpperCase();
    } catch(e) {}
    const todayDate = new Date().toISOString().split('T')[0];

    if (wrapper) {
        wrapper.innerHTML = ''; 
        wrapper.style.height = 'auto';       
        wrapper.style.maxHeight = '70vh';    
        wrapper.style.overflowY = 'auto';    
        wrapper.style.overflowX = 'hidden';
        wrapper.style.backgroundColor = '#525659';
        wrapper.style.display = 'block';
        wrapper.style.position = 'relative';

        container = document.createElement('div');
        container.id = 'pdf-render-container';
        container.style.position = 'relative';
        container.style.margin = '0 auto'; 
        container.style.padding = '0';
        
        const canvas = document.createElement('canvas');
        canvas.id = 'the-canvas';
        canvas.style.display = 'block';
        
        const overlay = document.createElement('div');
        overlay.id = 'signature-overlay';
        overlay.style.position = 'absolute';
        overlay.style.top = '0';
        overlay.style.left = '0';
        overlay.style.width = '100%';
        overlay.style.height = '100%'; 
        overlay.style.zIndex = '10';
        overlay.style.margin = '0';
        overlay.style.padding = '0';

        const sigDrag = document.createElement('div');
        sigDrag.id = 'draggable-sig';
        sigDrag.className = 'drag-element';
        sigDrag.style.display = 'none';
        sigDrag.style.position = 'absolute';
        sigDrag.style.border = '2px dashed #2563eb';
        sigDrag.style.backgroundColor = 'rgba(37, 99, 235, 0.1)';
        sigDrag.style.cursor = 'grab';
        sigDrag.innerHTML = `
            <img src="" style="width:100%; height:100%; pointer-events: none; display:block;">
            <div class="sig-remove-btn" onclick="this.parentElement.style.display='none'" 
                 style="position:absolute; top:-12px; right:-12px; background:#ff4444; color:white; 
                 border-radius:50%; width:24px; height:24px; cursor:pointer; text-align:center; 
                 line-height:22px; font-weight:bold;">&times;</div>
        `;
        
        const handle = document.createElement('div');
        handle.className = 'resize-handle';
        Object.assign(handle.style, {
            width: '14px', height: '14px', backgroundColor: '#2563eb',
            position: 'absolute', right: '-7px', bottom: '-7px',
            cursor: 'se-resize', borderRadius: '50%', border: '2px solid white', zIndex: '20'
        });
        sigDrag.appendChild(handle);

        const pnpkiDrag = document.createElement('div');
        pnpkiDrag.id = 'draggable-pnpki';
        pnpkiDrag.className = 'drag-element';
        pnpkiDrag.style.display = 'none';
        pnpkiDrag.style.position = 'absolute';
        pnpkiDrag.style.width = '200px';
        pnpkiDrag.style.height = '60px';
        pnpkiDrag.style.border = '2px solid #10b981';
        pnpkiDrag.style.backgroundColor = 'white'; 
        pnpkiDrag.style.cursor = 'grab';
        pnpkiDrag.style.borderRadius = '4px';
        pnpkiDrag.style.boxShadow = '0 4px 6px rgba(0,0,0,0.2)';
        
        pnpkiDrag.innerHTML = `
            <div style="display:flex; height:100%; align-items:center; padding:5px; pointer-events:none;">
                <div style="width:50px; height:50px; background:#f3f4f6; display:flex; align-items:center; justify-content:center; margin-right:10px;">
                    <i class="ri-qr-code-line" style="font-size:32px; color:#333;"></i>
                </div>
                <div style="font-family: Arial, sans-serif; font-size:10px; line-height:1.2; color:#333;">
                    <strong style="color:#000;">Digitally Signed by:</strong><br>
                    <span style="font-size:11px; font-weight:bold; text-transform:uppercase;">${userName}</span><br>
                    <span style="color:#666;">Date: ${todayDate}</span><br>
                    <span style="color:#10b981; font-weight:bold;">Verified by PNPKI</span>
                </div>
            </div>
            <div class="sig-remove-btn" onclick="this.parentElement.style.display='none'" 
                 style="position:absolute; top:-10px; right:-10px; background:#ff4444; color:white; 
                 border-radius:50%; width:20px; height:20px; cursor:pointer; text-align:center; 
                 line-height:18px; font-weight:bold;">&times;</div>
        `;

        const noteTextDrag = document.createElement('div');
        noteTextDrag.id = 'draggable-note-text';
        noteTextDrag.className = 'drag-element';
        noteTextDrag.style.display = 'none';
        noteTextDrag.style.position = 'absolute';
        noteTextDrag.style.minWidth = '200px';
        noteTextDrag.style.maxWidth = '500px';
        noteTextDrag.style.background = 'white';
        noteTextDrag.style.border = '2px solid #3b82f6';
        noteTextDrag.style.padding = '10px 15px';
        noteTextDrag.style.borderRadius = '6px';
        noteTextDrag.style.cursor = 'grab';
        noteTextDrag.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
        
        noteTextDrag.innerHTML = `
            <div style="font-family:Arial, sans-serif; font-size:14px; color:#1e293b; font-weight:500; word-wrap:break-word; pointer-events:none;" id="note-text-content">
                Sample Note Text
            </div>
            <div class="sig-remove-btn" onclick="this.parentElement.style.display='none'" 
                 style="position:absolute; top:-10px; right:-10px; background:#ff4444; color:white; 
                 border-radius:50%; width:20px; height:20px; cursor:pointer; text-align:center; 
                 line-height:18px; font-weight:bold;">&times;</div>
        `;

        overlay.appendChild(sigDrag);
        overlay.appendChild(pnpkiDrag);
        overlay.appendChild(noteTextDrag);
        container.appendChild(overlay); 
        wrapper.appendChild(container);
        
        setupDrag(sigDrag, overlay);
        setupResize(sigDrag, handle);
        setupDrag(pnpkiDrag, overlay);
        setupDrag(noteTextDrag, overlay);
    }

    if (!pdfUrl || pdfUrl.includes('.html') || pdfUrl.endsWith('/')) {
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/serve-file.php' : './assets/api/serve-file.php';
        pdfUrl = `${apiPath}?file_id=${docId}`;
    }

    try {
        let attempts = 0;
        while(!window.pdfjsLib && attempts < 20) { await new Promise(r => setTimeout(r, 100)); attempts++; }
        if(!window.pdfjsLib) throw new Error("PDF.js failed to load.");

        const loadingTask = window.pdfjsLib.getDocument(pdfUrl);
        const pdf = await loadingTask.promise;
        const cont = document.getElementById('pdf-render-container');
        const overlay = document.getElementById('signature-overlay');
        const wrapWidth = wrapper.clientWidth - 30;

        let totalHeight = 0;
        let maxWidth = 0;

        for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const viewportRaw = page.getViewport({scale: 1});
            const scale = wrapWidth / viewportRaw.width;
            const viewport = page.getViewport({scale: scale});

            const canvas = document.createElement('canvas');
            canvas.className = 'pdf-page-canvas';
            canvas.width = viewport.width;
            canvas.height = viewport.height;
            canvas.style.display = 'block';
            canvas.style.marginBottom = '10px'; 
            canvas.dataset.pageNumber = pageNum; 
            
            cont.insertBefore(canvas, overlay);

            await page.render({canvasContext: canvas.getContext('2d'), viewport: viewport}).promise;

            totalHeight += viewport.height + 10;
            if(viewport.width > maxWidth) maxWidth = viewport.width;
        }

        totalHeight -= 10; 
        cont.style.width = `${maxWidth}px`;
        cont.style.height = `${totalHeight}px`;
        overlay.style.width = `${maxWidth}px`;
        overlay.style.height = `${totalHeight}px`;

    } catch (e) { console.error("PDF Render Error", e); }

    try {
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const isPages = window.location.pathname.includes('/pages/');
        const apiPath = isPages ? '../assets/api/transfer_document.php' : './assets/api/transfer_document.php';
        
        const formData = new FormData();
        formData.append('action', 'check_status');
        formData.append('doc_id', docId);
        if (user) { formData.append('client_user', user.name); formData.append('client_dept', user.dept); }

        const res = await fetch(apiPath, { method: 'POST', body: formData });
        const data = await res.json();

        if (data.saved_signature) {
            window.currentUserSignature = data.saved_signature;
        }
    } catch (e) {}

    if (window.currentUserSignature) {
        const timestamp = new Date().getTime();
        const freshSrc = window.currentUserSignature + '?v=' + timestamp;
        const imgPreview = document.getElementById('sig-image-preview');
        if (imgPreview) { imgPreview.src = freshSrc; imgPreview.style.display = 'block'; }
        
        const dragImg = document.querySelector('#draggable-sig img');
        if (dragImg) { 
            dragImg.src = freshSrc; 
            dragImg.style.objectFit = 'fill'; 
        }
    }

    if (modal) {
        modal.classList.add('active');
        modal.dataset.docId = docId;
        initSignEvents(modal);
        // Switch to appropriate mode based on function parameter
        if (mode === 'note') {
            switchMode('note');
        } else {
            switchMode('simple');
        }
    }
};

function switchMode(mode) {
    const btnSimple = document.getElementById('mode-simple');
    const btnPnpki = document.getElementById('mode-pnpki');
    const btnNote = document.getElementById('mode-note');
    const toolsSimple = document.getElementById('tools-simple');
    const toolsPnpki = document.getElementById('tools-pnpki');
    const toolsNote = document.getElementById('tools-note');
    const confirmBtn = document.getElementById('btn-save-signature');
    
    const simpleDrag = document.getElementById('draggable-sig');
    const pnpkiDrag = document.getElementById('draggable-pnpki');
    const noteDrag = document.getElementById('draggable-note-text');

    // Reset all buttons
    [btnSimple, btnPnpki, btnNote].forEach(b => {
        if(b) b.classList.remove('active');
    });

    // Reset all tools - explicitly set display to none
    if(toolsSimple) toolsSimple.style.display = 'none';
    if(toolsPnpki) toolsPnpki.style.display = 'none';
    if(toolsNote) toolsNote.style.display = 'none';

    // Reset all draggables
    [simpleDrag, pnpkiDrag, noteDrag].forEach(d => {
        if(d) d.style.display = 'none';
    });

    if (mode === 'simple') {
        if(btnSimple) btnSimple.classList.add('active');
        if(toolsSimple) toolsSimple.style.display = 'flex';
        if(confirmBtn) confirmBtn.innerHTML = 'Confirm & Sign <i class="ri-check-line"></i>';
    } else if (mode === 'pnpki') {
        if(btnPnpki) btnPnpki.classList.add('active');
        if(toolsPnpki) toolsPnpki.style.display = 'flex';
        if(confirmBtn) confirmBtn.innerHTML = 'Confirm & Sign <i class="ri-check-line"></i>';
    } else if (mode === 'note') {
        if(btnNote) btnNote.classList.add('active');
        if(toolsNote) {
            toolsNote.style.display = 'flex';
            console.log('Note tools should now be visible');
        }
        if(confirmBtn) confirmBtn.innerHTML = 'Confirm & Add Note <i class="ri-check-line"></i>';
    }
}

function initSignEvents(modal) {
    if (modal.getAttribute('data-init') === 'true') return; 

    const closeBtn = document.getElementById('close-sign-btn');
    const confirmBtn = document.getElementById('btn-save-signature');
    const btnUpload = document.getElementById('btn-upload-trigger');
    const inpUpload = document.getElementById('inp-sig-upload');
    const btnUseSaved = document.getElementById('tool-add-sig');
    
    const btnModeSimple = document.getElementById('mode-simple');
    const btnModePnpki = document.getElementById('mode-pnpki');
    const btnModeNote = document.getElementById('mode-note');
    const btnLoadCert = document.getElementById('btn-pnpki-login'); 
    const btnVerifyCert = document.getElementById('btn-pnpki-verify');
    const btnAddNoteText = document.getElementById('btn-add-note-text');
    const noteTextInput = document.getElementById('note-text-input');
    
    let pnpkiFile = document.getElementById('pnpki-file-input');
    if (!pnpkiFile) {
        pnpkiFile = document.createElement('input');
        pnpkiFile.type = 'file';
        pnpkiFile.id = 'pnpki-file-input';
        pnpkiFile.accept = '.p12,.pfx';
        pnpkiFile.style.display = 'none';
        document.body.appendChild(pnpkiFile);
    }

    if(btnModeSimple) btnModeSimple.onclick = () => switchMode('simple');
    if(btnModePnpki) btnModePnpki.onclick = () => switchMode('pnpki');
    if(btnModeNote) btnModeNote.onclick = () => switchMode('note');
    if (closeBtn) closeBtn.onclick = () => modal.classList.remove('active');

    const centerElement = (el) => {
        const overlay = document.getElementById('signature-overlay');
        const wrapper = document.querySelector('.sign-canvas-area');
        if (el && overlay && wrapper) {
            el.style.display = 'flex';
            el.style.zIndex = '100';
            const scrollTop = wrapper.scrollTop;
            const visibleH = wrapper.clientHeight;
            el.style.top = (scrollTop + (visibleH / 2) - 40) + 'px'; 
            el.style.left = (overlay.clientWidth / 2 - 100) + 'px';
        }
    };

    if (btnLoadCert) {
        btnLoadCert.onclick = (e) => {
            e.preventDefault();
            const popup = document.getElementById('pnpki-auth-popup');
            if (popup) popup.style.display = 'flex';
        };
    }

    if (btnVerifyCert) {
        btnVerifyCert.onclick = (e) => {
            e.preventDefault();
            const fileInput = document.getElementById('pnpki-file');
            const passInput = document.getElementById('pnpki-password');
            const popup = document.getElementById('pnpki-auth-popup');

            if (!fileInput.files.length) {
                showToast('Please select a .p12 file.', 'warning');
                return;
            }
            if (!passInput.value) {
                showToast('Please enter your password.', 'warning');
                return;
            }

            popup.style.display = 'none';
            passInput.value = '';
            
            const pnpkiDrag = document.getElementById('draggable-pnpki');
            centerElement(pnpkiDrag);
        };
    }

    if (btnUpload && inpUpload) {
        btnUpload.onclick = () => inpUpload.click();
        inpUpload.onchange = async () => {
            const file = inpUpload.files[0];
            if (!file) return;
            const originalText = btnUpload.innerHTML;
            btnUpload.innerHTML = '...';
            const formData = new FormData();
            formData.append('signature', file);
            formData.append('action', 'upload_signature'); 
            formData.append('doc_id', modal.dataset.docId);

            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if (user) { formData.append('client_user', user.name); formData.append('client_dept', user.dept); }
                const isPages = window.location.pathname.includes('/pages/');
                const apiPath = isPages ? '../assets/api/transfer_document.php' : './assets/api/transfer_document.php';
                const res = await fetch(apiPath, { method: 'POST', body: formData });
                const data = await res.json();

                if (data.success) {
                    if(data.new_sig_path) window.currentUserSignature = data.new_sig_path;
                    const freshSrc = window.currentUserSignature + '?v=' + new Date().getTime();
                    const imgPreview = document.getElementById('sig-image-preview');
                    if(imgPreview) { imgPreview.src = freshSrc; imgPreview.style.display = 'block'; }
                    const dragImg = document.querySelector('#draggable-sig img');
                    if (dragImg) dragImg.src = freshSrc;
                    
                    const sigEl = document.getElementById('draggable-sig');
                    centerElement(sigEl);
                    showToast('Signature Uploaded.', 'success');
                } else { 
                    showToast('Upload Failed', 'error');
                }
            } catch (e) { console.error(e); } 
            finally { btnUpload.innerHTML = originalText; inpUpload.value = ''; }
        };
    }

    if (btnUseSaved) {
        btnUseSaved.onclick = () => {
            if (!window.currentUserSignature) {
                showToast('Upload a signature first.', 'warning');
                return;
            }
            let cleanSrc = window.currentUserSignature.split('?')[0];
            const freshSrc = cleanSrc + '?v=' + new Date().getTime();
            const dragImg = document.querySelector('#draggable-sig img');
            if (dragImg) dragImg.src = freshSrc;
            
            const sigEl = document.getElementById('draggable-sig');
            centerElement(sigEl);
        };
    }

    if (btnAddNoteText && noteTextInput) {
        btnAddNoteText.onclick = () => {
            // Show the popup
            const popup = document.getElementById('note-text-popup');
            if (popup) {
                popup.style.display = 'flex';
                noteTextInput.value = ''; // Clear previous text
                noteTextInput.focus();
            }
        };
    }

    // Handle the "Add to Document" button in the popup
    const btnConfirmNoteText = document.getElementById('btn-confirm-note-text');
    if (btnConfirmNoteText) {
        btnConfirmNoteText.onclick = () => {
            const noteTextInput = document.getElementById('note-text-input');
            const text = noteTextInput ? noteTextInput.value.trim() : '';
            
            if (!text) {
                showToast('Please enter note text first.', 'warning');
                return;
            }
            
            // Get user info for preview
            let userName = "USER NAME";
            try {
                const user = JSON.parse(localStorage.getItem('currentUser'));
                if(user && user.name) userName = user.name.toUpperCase();
            } catch(e) {}
            
            const currentDate = new Date().toISOString().slice(0, 16).replace('T', ' ');
            
            const noteEl = document.getElementById('draggable-note-text');
            const noteContent = document.getElementById('note-text-content');
            
            // Create preview with black text on transparent background
            if (noteContent) {
                noteContent.innerHTML = `
                    <div style="font-family:Arial, sans-serif; font-size:14px; color:#000; font-weight:500; padding-bottom:6px; border-bottom:1px solid #666; margin-bottom:6px;">
                        ${text.replace(/\n/g, '<br>')}
                    </div>
                    <div style="font-size:10px; color:#333;">
                        <div style="font-weight:600; margin-bottom:2px;">As Noted By: ${userName}</div>
                        <div>Date: ${currentDate}</div>
                    </div>
                `;
            }
            
            // Update note element styling - transparent background
            if (noteEl) {
                noteEl.style.background = 'rgba(255, 255, 255, 0.9)';
                noteEl.style.border = '1px dashed #666';
                
                const textLength = text.length;
                if (textLength < 30) {
                    noteEl.style.minWidth = '200px';
                } else if (textLength < 80) {
                    noteEl.style.minWidth = '300px';
                } else {
                    noteEl.style.minWidth = '400px';
                }
                noteEl.style.minHeight = '80px';
            }
            
            centerElement(noteEl);
            
            // Close the popup
            const popup = document.getElementById('note-text-popup');
            if (popup) popup.style.display = 'none';
        };
    }

    if (confirmBtn) {
        confirmBtn.onclick = async () => {
            const sigEl = document.getElementById('draggable-sig');
            const pnpkiEl = document.getElementById('draggable-pnpki');
            const noteEl = document.getElementById('draggable-note-text');
            
            let activeEl = null;
            let sigType = 'visual';

            if (sigEl && sigEl.style.display !== 'none') {
                activeEl = sigEl;
                sigType = 'visual';
            } else if (pnpkiEl && pnpkiEl.style.display !== 'none') {
                activeEl = pnpkiEl;
                sigType = 'pnpki';
            } else if (noteEl && noteEl.style.display !== 'none') {
                activeEl = noteEl;
                sigType = 'note';
            }

            if (!activeEl) {
                showToast(window.currentSignMode === 'note' ? 'Please add a note first.' : 'Place signature or badge first.', 'warning');
                return;
            }
            
            const rect = activeEl.getBoundingClientRect();
            const overlay = document.getElementById('signature-overlay');
            const contRect = overlay.getBoundingClientRect();
            
            const canvases = document.querySelectorAll('.pdf-page-canvas');
            let targetPage = 1;
            let pageHeight = 0;
            let pageWidth = 0;
            let relativeTop = 0;

            const absTop = rect.top - contRect.top; 

            for(let cvs of canvases) {
                if(absTop >= cvs.offsetTop && absTop < (cvs.offsetTop + cvs.height)) {
                    targetPage = parseInt(cvs.dataset.pageNumber);
                    pageHeight = cvs.height;
                    pageWidth = cvs.width;
                    relativeTop = absTop - cvs.offsetTop;
                    break;
                }
            }

            const relativeLeft = rect.left - contRect.left;
            const xPos = relativeLeft / pageWidth;
            const yPos = relativeTop / pageHeight;
            const widthPct = rect.width / pageWidth;
            const heightPct = rect.height / pageHeight;

            const docId = modal.dataset.docId;
            const originalText = confirmBtn.innerText;
            const actionMode = window.currentSignMode || 'sign';
            confirmBtn.innerText = actionMode === 'note' ? "Noting..." : "Signing...";
            confirmBtn.disabled = true;

            try {
                const formData = new FormData();
                formData.append('doc_id', docId);
                formData.append('action', actionMode); // 'sign' or 'note'
                formData.append('sig_type', sigType);
                formData.append('x_pos', xPos);
                formData.append('y_pos', yPos);
                formData.append('width_pct', widthPct);
                formData.append('height_pct', heightPct);
                formData.append('page_num', targetPage);

                // If note mode, get the actual note text (only the user's text, not the footer)
                if (actionMode === 'note' && noteEl) {
                    const noteContent = document.getElementById('note-text-content');
                    if (noteContent) {
                        // Get only the first child div which contains the user's actual note text
                        const userTextDiv = noteContent.querySelector('div:first-child');
                        const noteText = userTextDiv ? userTextDiv.textContent.trim() : noteContent.textContent.trim();
                        formData.append('note_text', noteText);
                    }
                }

                const user = JSON.parse(localStorage.getItem('currentUser'));
                if(user) { formData.append('client_user', user.name); formData.append('client_dept', user.dept); }

                const isPages = window.location.pathname.includes('/pages/');
                const apiPath = isPages ? '../assets/api/transfer_document.php' : './assets/api/transfer_document.php';
                
                const res = await fetch(apiPath, { method: 'POST', body: formData });
                const result = await res.json();

                if (result.success) {
                    const isNoteMode = (actionMode === 'note');
                    
                    const successOverlay = document.getElementById('sign-success-overlay');
                    
                    if(successOverlay) {
                        successOverlay.style.display = 'flex';
                        
                        const continueBtn = document.getElementById('btn-success-close');
                        const newBtn = continueBtn.cloneNode(true);
                        continueBtn.parentNode.replaceChild(newBtn, continueBtn);
                        
                        newBtn.onclick = () => {
                            successOverlay.style.display = 'none';
                            modal.classList.remove('active');
                            
                            // Show success toast here instead
                            showToast(isNoteMode ? 'Note added successfully!' : 'Signed successfully!', 'success');
                            
                            if (typeof window.fetchDocuments === 'function') window.fetchDocuments();

                            if (window.openTransferModal) {
                                setTimeout(() => {
                                    window.openTransferModal(docId);
                                }, 300);
                            } else {
                                setTimeout(() => {
                                    if(window.openDocViewer) window.openDocViewer({ id: docId });
                                }, 300);
                            }
                        };
                    } else {
                        showToast('Signed Successfully!', 'success');
                        modal.classList.remove('active');
                        if (typeof window.fetchDocuments === 'function') window.fetchDocuments();
                        if (window.openTransferModal) setTimeout(() => window.openTransferModal(docId), 300);
                    }
                } else { 
                    showToast('Error: ' + result.message, 'error');
                }
            } catch (e) { 
                showToast('Connection Error', 'error');
                console.error(e);
            } 
            finally { 
                confirmBtn.innerText = originalText; 
                confirmBtn.disabled = false; 
            }
        };
    }
    modal.setAttribute('data-init', 'true');
}

function setupDrag(element, container) {
    let isDragging = false;
    let startX, startY, initialLeft, initialTop;

    element.addEventListener('mousedown', (e) => {
        if (e.target.className.includes('resize') || e.target.className.includes('remove')) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        initialLeft = element.offsetLeft;
        initialTop = element.offsetTop;
        element.style.cursor = 'grabbing';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        e.preventDefault();
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        
        let newLeft = initialLeft + dx;
        let newTop = initialTop + dy;

        const maxW = container.clientWidth - element.offsetWidth;
        const maxH = container.clientHeight - element.offsetHeight;
        
        if(newLeft < 0) newLeft = 0;
        if(newTop < 0) newTop = 0;
        if(newLeft > maxW) newLeft = maxW;
        if(newTop > maxH) newTop = maxH;

        element.style.left = newLeft + 'px';
        element.style.top = newTop + 'px';
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            element.style.cursor = 'grab';
        }
    });
}

function setupResize(element, handle) {
    let isResizing = false;
    let startX, startY, startW, startH;

    handle.addEventListener('mousedown', (e) => {
        e.stopPropagation();
        isResizing = true;
        startX = e.clientX;
        startY = e.clientY;
        startW = element.offsetWidth;
        startH = element.offsetHeight;
    });

    window.addEventListener('mousemove', (e) => {
        if (!isResizing) return;
        e.preventDefault();
        const width = startW + (e.clientX - startX);
        const height = startH + (e.clientY - startY);
        if (width > 30) element.style.width = width + 'px';
        if (height > 20) element.style.height = height + 'px';
    });

    window.addEventListener('mouseup', () => isResizing = false);
}