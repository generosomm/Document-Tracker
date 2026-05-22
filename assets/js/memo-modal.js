/* assets/js/memo-modal.js */

var memoStart = 0, activeId = null;

// --- 1. ROBUST LOADER ---
document.addEventListener('DOMContentLoaded', async () => {
    if (document.getElementById('memo-modal')) return;
    try {
        let res = await fetch('../components/memo-modal.html');
        if (!res.ok) res = await fetch('assets/components/memo-modal.html');
        if (res.ok) {
            document.body.insertAdjacentHTML('beforeend', await res.text());
            document.getElementById('memo-modal').addEventListener('click', e => { 
                if(e.target.id === 'memo-modal') window.closeMemoModal(); 
            });
        }
    } catch(e) { console.error(e); }
});

// --- 2. HELPERS ---
window.timeAgo = (d) => {
    const s = Math.floor((new Date() - new Date(d))/1000);
    return s<60?"Just now": s<3600?`${Math.floor(s/60)}m ago`: s<86400?`${Math.floor(s/3600)}h ago`: `${Math.floor(s/86400)}d ago`;
};

window.getExpiry = (d, days) => {
    if(!days || days==0) return "Indefinite";
    const diff = Math.ceil((new Date(new Date(d).getTime()+(days*864e5)) - new Date())/864e5);
    return diff < 0 ? "Expired" : (diff === 0 ? "Expires Today" : `Expires in ${diff} days`);
};

window.updateChipText = (sel) => {
    const chip = sel.closest('.chip');
    const span = chip.querySelector('span') || chip.querySelector('.label');
    if(span) span.innerText = sel.options[sel.selectedIndex].text;
    if(sel.id === 'm_dur') {
        const inp = document.getElementById('m_dur_c');
        if(sel.value === 'custom') {
            inp.style.display = 'block'; inp.focus();
        } else {
            inp.style.display = 'none'; inp.value = '';
        }
    }
};

window.toggleAll = (el) => {
    const checkboxes = document.querySelectorAll('input[name="td"]');
    checkboxes.forEach(c => { c.checked = false; c.disabled = el.checked; });
};

// --- 3. ACTIONS ---
window.closeMemoModal = () => {
    const m = document.getElementById('memo-modal');
    if(m?.classList.contains('active')) {
        m.classList.remove('active'); 
        setTimeout(() => m.style.display = 'none', 300);
        if(memoStart && activeId) {
            const d = Math.round((Date.now()-memoStart)/1000);
            if(d>1) sendTracking(activeId, d, 0);
        }
        memoStart=0; activeId=null;
    }
};

// FIX: sendTracking now calls the refreshStatsTable function correctly
window.sendTracking = (id, dur, dl) => {
    const u = JSON.parse(localStorage.getItem('currentUser'));
    if(!u) return;
    const fd = new FormData();
    fd.append('action','track_view'); 
    fd.append('memo_id',id);
    fd.append('user_name',u.name); 
    fd.append('user_role',u.role);
    fd.append('duration',dur); 
    fd.append('downloaded',dl?1:0);
    
    fetch('../assets/api/memo_api.php', { method:'POST', body:fd, keepalive: true })
    .then(() => {
        // Only try to refresh if the stats box is actually visible
        const statsBox = document.getElementById(`stats-${id}`);
        if(statsBox && statsBox.style.display === 'block') {
            // THIS FUNCTION WAS MISSING IN YOUR PREVIOUS CODE
            window.refreshStatsTable(id); 
        }
    }).catch(()=>{});
};

// --- 4. VIEW MEMO ---
window.viewMemo = async (id, fromHistory = false) => {
    const m = document.getElementById('memo-modal'), b = document.getElementById('memo-modal-body');
    if(!m) { showToast("System loading...", "info"); return; } 
    
    const u = JSON.parse(localStorage.getItem('currentUser'));
    document.querySelector('.modal-container.memo-style').style.maxWidth = "750px";
    
    activeId = id; memoStart = Date.now(); window.sendTracking(id,0,0);
    
    const titleEl = document.getElementById('memo-modal-title');
    if(fromHistory) {
        titleEl.innerHTML = `<span onclick="openMemoHistory()" style="cursor:pointer; display:flex; align-items:center; gap:5px; color:#2563EB;"><i class="ri-arrow-left-line"></i> Back to Archive</span>`;
    } else {
        titleEl.innerText = "View Post";
    }

    b.innerHTML = '<div style="padding:40px; text-align:center;"><i class="ri-loader-4-line ri-spin" style="font-size:2rem;"></i></div>';
    m.style.display = 'flex'; setTimeout(() => m.classList.add('active'), 10);

    const fd = new FormData(); fd.append('action','get_memo_details'); fd.append('id',id);
    try {
        const res = await fetch('../assets/api/memo_api.php', {method:'POST', body:fd});
        const json = await res.json();
        if(json.success) {
            const d = json.data, isAuth = (u.name === d.created_by || u.role.includes('Admin'));
            const isArchived = (d.archive_status||'').toLowerCase() === 'deleted' || (d.archive_status||'').toLowerCase() === 'expired';
            
            const badge = d.type==='Urgent'?'badge-urgent':(d.type==='Holiday'?'badge-holiday':'badge-announcement');
            
            // FIX: Explicitly passing '1' to sendTracking for downloads
            const pdf = d.attachment ? `<div class="pdf-wrap"><div class="pdf-head"><i class="ri-file-pdf-2-fill text-red"></i> <span>Attachment</span> <a href="${d.attachment}" download onclick="window.sendTracking(${id},0,1)" class="btn-dl">Download</a></div><iframe src="${d.attachment}" class="pdf-frame"></iframe></div>` : '';
            
            const safeObj = encodeURIComponent(JSON.stringify(d));
            let tools = '';
            
            if (isAuth && !isArchived) {
                tools = `
                <div class="admin-tools">
                    <button onclick="toggleStats(${id})" class="btn-tool"><i class="ri-bar-chart-box-line"></i> Stats</button>
                    <button onclick="openMemoForm(JSON.parse(decodeURIComponent('${safeObj}')))" class="btn-tool text-blue"><i class="ri-edit-line"></i> Edit</button>
                    <button onclick="archiveMemo(${id})" class="btn-tool text-red"><i class="ri-delete-bin-line"></i> Move to Trash</button>
                </div><div id="stats-${id}" class="stats-box" style="display:none;"></div>`;
            } else if (isAuth && isArchived) {
                tools = `
                <div class="admin-tools">
                    <span style="margin-right:auto; font-size:0.8rem; color:#ef4444; font-weight:600; display:flex; align-items:center; gap:5px;">
                        <i class="ri-archive-line"></i> Status: ${(d.archive_status||'Archived').toUpperCase()}
                    </span>
                    <button onclick="toggleStats(${id})" class="btn-tool"><i class="ri-bar-chart-box-line"></i> Stats</button>
                </div><div id="stats-${id}" class="stats-box" style="display:none;"></div>`;
            }

            b.innerHTML = `
                <div class="memo-head"><div><span class="memo-view-ref ${badge}">${d.type}</span> <span class="ref">${d.ref_no}</span></div><div class="meta-right"><span title="${d.created_at}">${window.timeAgo(d.created_at)}</span><span class="pill">${window.getExpiry(d.created_at, d.duration_days)}</span></div></div>
                <h2 class="title">${d.title}</h2><div class="msg">${d.message}</div>${pdf}
                <div class="footer"><span><i class="ri-user-line"></i> ${d.created_by}</span><span class="${d.target_audience==='All'?'text-green':'text-orange'}"><i class="ri-group-line"></i> ${d.target_audience}</span></div>${tools}`;
        }
    } catch(e) { b.innerHTML = '<p class="err">Failed.</p>'; }
};

// --- 5. FORM ---
window.openMemoForm = (ed=null) => {
    const m = document.getElementById('memo-modal'), b = document.getElementById('memo-modal-body');
    if(!m) return;
    document.querySelector('.modal-container.memo-style').style.maxWidth = "520px";
    document.getElementById('memo-modal-title').innerText = ed ? "Edit Post" : "Create Post";
    
    const isCust = ed && ![1,3,7,30,0].includes(parseInt(ed.duration_days));
    const durVal = isCust ? 'custom' : (ed ? ed.duration_days : 7);
    const custDays = isCust ? ed.duration_days : '';
    const typeLabel = ed ? ed.type : 'Announcement';
    const durLabel = isCust ? 'Custom' : (durVal==7?'1 Week':(durVal==1?'24 Hours':(durVal==30?'1 Month':'Indefinite')));
    
    b.innerHTML = `
        <form id="memo-form" class="composer">
            <input type="hidden" id="e_id" value="${ed?ed.id:''}">
            <input type="text" id="m_title" class="inp-title" placeholder="Title" required value="${ed?ed.title:''}">
            <div class="tools">
                <div class="chip"><i class="ri-price-tag-3-line"></i><span class="label">${typeLabel}</span><select id="m_type" onchange="updateChipText(this)"><option value="Announcement">Announcement</option><option value="Urgent">Urgent</option><option value="Holiday">Holiday</option></select></div>
                <div class="chip"><i class="ri-timer-line"></i><span class="label">${durLabel}</span><select id="m_dur" onchange="updateChipText(this)"><option value="7">1 Week</option><option value="1">24 Hours</option><option value="3">3 Days</option><option value="30">1 Month</option><option value="0">Indefinite</option><option value="custom">Custom...</option></select><input type="number" id="m_dur_c" placeholder="Days" min="1" class="tool-input" style="display:${isCust?'block':'none'};" value="${custDays}"></div>
                <div class="chip" id="btn-tgt" onclick="toggleTgt()"><i class="ri-group-line"></i> <span id="lbl-tgt">All</span></div>
            </div>
            <div id="tgt-box" class="tgt-box">
                <label style="grid-column:span 2; border-bottom:1px solid #eee;"><input type="checkbox" id="chk-all" checked onchange="toggleAll(this)"> <strong>All Depts</strong></label>
                ${["Accounting","CBO","CIO","CMIS","OCM","HR","Engineering"].map(d=>`<label class="dept-check"><input type="checkbox" name="td" value="${d}"> ${d}</label>`).join('')}
            </div>
            <textarea id="m_msg" class="inp-msg" placeholder="Content..." required>${ed?ed.message:''}</textarea>
            <div id="att-prev" class="att-prev"><i class="ri-file-pdf-fill text-red"></i><span id="f_name"></span><i class="ri-close-line pointer" onclick="clrFile()"></i></div>
            <div class="foot">
                <div class="acts"><button type="button" onclick="document.getElementById('m_file').click()"><i class="ri-attachment-line"></i></button><input type="file" id="m_file" accept=".pdf" hidden onchange="showFile(this)"></div>
                <button type="submit" id="btn-sub" class="btn-post">${ed?'Save':'Post'}</button>
            </div>
        </form>`;
    
    m.style.display = 'flex'; setTimeout(()=>m.classList.add('active'),10);

    window.toggleTgt = () => { const b=document.getElementById('tgt-box'); b.style.display=(b.style.display==='grid'?'none':'grid'); document.getElementById('btn-tgt').classList.toggle('active'); };
    window.showFile = (i) => { if(i.files[0]){document.getElementById('att-prev').style.display='flex';document.getElementById('f_name').innerText=i.files[0].name;} };
    window.clrFile = () => { document.getElementById('m_file').value=''; document.getElementById('att-prev').style.display='none'; };

    if(ed && ed.target_audience !== 'All') { window.toggleTgt(); document.getElementById('chk-all').click(); ed.target_audience.split(',').forEach(t=> {const c=document.querySelector(`input[value="${t.trim()}"]`); if(c) c.checked=true;}); }

    document.getElementById('memo-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const u = JSON.parse(localStorage.getItem('currentUser')), btn = document.getElementById('btn-sub');
        btn.disabled = true; btn.innerText = '...';
        
        const durSelect = document.getElementById('m_dur').value;
        const customDurInput = document.getElementById('m_dur_c').value;
        const finalDur = (durSelect === 'custom') ? customDurInput : durSelect;

        let tgts = 'All';
        if(!document.getElementById('chk-all').checked) {
            tgts = Array.from(document.querySelectorAll('input[name="td"]:checked')).map(c=>c.value).join(',');
            if(!tgts) { showToast('Please select at least one department', 'warning'); btn.disabled=false; return; }
        }

        const fd = new FormData();
        fd.append('action', ed?'update_memo':'add_memo');
        if(ed) fd.append('id', document.getElementById('e_id').value);
        fd.append('author',u.name); fd.append('title',document.getElementById('m_title').value);
        fd.append('type',document.getElementById('m_type').options[document.getElementById('m_type').selectedIndex].value); 
        fd.append('duration_days', finalDur);
        fd.append('target_audience', tgts); fd.append('message', document.getElementById('m_msg').value);
        if(document.getElementById('m_file').files[0]) fd.append('attachment', document.getElementById('m_file').files[0]);

        try {
            const res = await fetch('../assets/api/memo_api.php', {method:'POST', body:fd});
            const j = await res.json();
            
            if(j.success) { 
                // Email notification logic disabled per LGU request
                /* Note: If your memo_api.php automatically sends emails on 'add_memo', 
                   you must also comment out the mailer call in that PHP file. 
                */
                window.closeMemoModal(); 
                if(window.loadDashboardData) window.loadDashboardData(); 
                else location.reload(); 
            } else {
                showToast(j.message, j.success ? 'success' : 'error');
            }
        } catch(e) { showToast('Upload failed', 'error'); }
        btn.disabled = false; btn.innerText = ed?'Save':'Post';
    });
};

// --- 6. HISTORY ---
window.openMemoHistory = async () => {
    const m = document.getElementById('memo-modal'), b = document.getElementById('memo-modal-body');
    if(!m) return;
    document.querySelector('.modal-container.memo-style').style.maxWidth = "600px";
    document.getElementById('memo-modal-title').innerText = "Archive / Trash";
    b.innerHTML = '<div style="text-align:center; padding:30px;"><i class="ri-loader-4-line ri-spin"></i></div>';
    m.style.display = 'flex'; setTimeout(()=>m.classList.add('active'),10);

    const fd = new FormData(); fd.append('action','get_archived_memos');
    try {
        const res = await fetch('../assets/api/memo_api.php', {method:'POST', body:fd});
        const j = await res.json();
        const rows = j.data?.length ? j.data.map(d => `
            <div class="hist-item" onclick="viewMemo(${d.id}, true)" style="cursor:pointer;">
                <div class="h-info"><h4>${d.title}</h4><small>${d.type} • ${new Date(d.created_at).toLocaleDateString()}</small></div>
                <span class="badge-${(d.status||'').toLowerCase()==='deleted'?'del':'exp'}">${d.status||'Expired'}</span>
            </div>`).join('') : '<p class="empty">No history found.</p>';
        b.innerHTML = `<div class="hist-list">${rows}</div>`;
    } catch(e) { b.innerHTML = '<p class="err">Failed.</p>'; }
};

window.archiveMemo = async (id) => {
    showConfirm("Move to Trash?", async () => {
        const fd = new FormData(); 
        fd.append('action', 'delete_memo'); 
        fd.append('id', id);
        try {
            const res = await fetch('../assets/api/memo_api.php', {method:'POST', body:fd});
            const j = await res.json();
            if(j.success) {
                showToast('Memo moved to trash', 'success');
                window.closeMemoModal(); 
                if(typeof window.loadDashboardData === "function") window.loadDashboardData(); 
                else window.location.reload();
            } else {
                showToast('Error: ' + j.message, 'error');
            }
        } catch(e) { 
            showToast('Server Error.', 'error');
        }
    });
};

// --- ADDED THIS MISSING FUNCTION ---
window.refreshStatsTable = async (id) => {
    const b = document.getElementById(`stats-${id}`);
    if (!b || b.style.display === 'none') return;
    
    const fd = new FormData(); 
    fd.append('action', 'get_memo_viewers'); 
    fd.append('memo_id', id);
    
    try {
        const res = await fetch('../assets/api/memo_api.php', {method: 'POST', body: fd});
        const j = await res.json();
        
        const rows = j.data?.map(v => `
            <tr>
                <td style="text-align: left;">
                    <div style="font-weight:600; color:#334155;">${v.viewer_name}</div>
                    <div style="font-size:0.7rem; color:#94a3b8;">${v.viewer_role}</div>
                </td>
                <td style="text-align: left;">${v.first_viewed_formatted}</td>
                <td style="text-align: center;">${v.duration_formatted}</td>
                <td style="text-align: center;">
                    ${v.has_downloaded == 1 
                        ? '<i class="ri-checkbox-circle-fill" style="color:#10b981; font-size:1.2rem;"></i>' 
                        : '<span style="color:#cbd5e1; font-size:1.2rem;">&minus;</span>'}
                </td>
            </tr>`).join('') || '<tr><td colspan="4" style="text-align:center; padding:15px; color:#94a3b8;">No views yet</td></tr>';
        
        b.innerHTML = `<table class="stats-tbl"><thead><tr><th style="width:40%">User</th><th style="width:25%">Seen</th><th style="width:20%; text-align:center;">Time</th><th style="width:15%; text-align:center;">DL</th></tr></thead><tbody>${rows}</tbody></table>`;
    } catch(e) { console.error(e); }
};

window.toggleStats = async (id) => {
    const b = document.getElementById(`stats-${id}`);
    if (b.style.display !== 'none') { b.style.display = 'none'; return; }
    b.style.display='block'; b.innerHTML = 'Loading...';
    // Reuse the helper
    window.refreshStatsTable(id);
};