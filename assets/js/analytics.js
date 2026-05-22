// Global State
const charts = { status: null, workload: null, trend: null };
let isDashboardInit = false, sentimentClassifier = null, globalScope = 'mine';

// AI Engine
const AI_ENGINE = {
    analyzeContext: (text) => {
        const t = (text || '').toLowerCase();
        const keywords = [
            { word: 'emergency', score: 5, reason: 'Emergency', action: 'Immediate Action Required', level: 'critical' },
            { word: 'urgent', score: 4, reason: 'Urgent', action: 'Expedite Processing', level: 'critical' },
            { word: 'asap', score: 4, reason: 'ASAP Request', action: 'Prioritize', level: 'critical' },
            { word: 'immediate', score: 4, reason: 'Immediate', action: 'Fast-track', level: 'critical' },
            { word: 'deadline', score: 3, reason: 'Has Deadline', action: 'Monitor Timeline', level: 'high' },
            { word: 'mayor', score: 3, reason: 'Executive Request', action: 'High Priority', level: 'high' },
            { word: 'councilor', score: 3, reason: 'Legislative', action: 'Priority Review', level: 'high' },
            { word: 'special order', score: 3, reason: 'Special Order', action: 'Priority', level: 'high' },
            { word: 'budget', score: 2, reason: 'Budget-Related', action: 'Financial Review', level: 'medium' },
            { word: 'fund', score: 2, reason: 'Funding Request', action: 'Check Allocation', level: 'medium' },
            { word: 'payment', score: 2, reason: 'Payment', action: 'Process Payment', level: 'medium' },
            { word: 'procurement', score: 2, reason: 'Procurement', action: 'Verify Specs', level: 'medium' },
            { word: 'proposal', score: 2, reason: 'Proposal Review', action: 'Evaluate', level: 'medium' },
            { word: 'request', score: 1, reason: 'Request', action: 'Review', level: 'normal' },
            { word: 'report', score: 1, reason: 'Report', action: 'Acknowledge', level: 'normal' }
        ];
        return keywords.find(k => t.includes(k.word)) || null;
    },
    
    predictDelay: (docAge, status) => {
        const s = (status || '').toLowerCase();
        if (docAge > 14) return { risk: true, level: 'critical', reason: 'Severely Delayed (14+ days)', action: 'Escalate to Management' };
        if (docAge > 7) return { risk: true, level: 'high', reason: 'Delay Risk (7+ days)', action: 'Follow Up Required' };
        if (docAge > 4 && s === 'pending') return { risk: true, level: 'medium', reason: 'Pending Too Long', action: 'Request Update' };
        return { risk: false };
    },
    
    suggestAction: (doc, age, score) => {
        const status = (doc.status || '').toLowerCase();
        if (status === 'revision' && age > 2) return 'Contact originator for corrections';
        if (status === 'pending' && age > 5) return 'Assign to department handler';
        if (status === 'progress' && age > 7) return 'Request status update from handler';
        if (score > 7) return 'Flag for priority review';
        return 'Monitor progress';
    },
    
    getPriorityLevel: (score) => {
        if (score >= 8) return { label: 'CRITICAL', color: '#dc2626', icon: 'ri-error-warning-fill' };
        if (score >= 5) return { label: 'HIGH', color: '#ea580c', icon: 'ri-alert-fill' };
        if (score >= 3) return { label: 'MEDIUM', color: '#f59e0b', icon: 'ri-information-fill' };
        return { label: 'NORMAL', color: '#10b981', icon: 'ri-checkbox-circle-fill' };
    },
    
    detectComplaint: (text) => {
        const t = (text || '').toLowerCase();
        const complaintKeywords = [
            'complaint', 'complain', 'grievance', 'grievances',
            'dissatisfied', 'unsatisfied', 'protest', 'objection',
            'dispute', 'appeal', 'violation', 'concern'
        ];
        return complaintKeywords.some(word => t.includes(word));
    }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    try { 
        if (!localStorage.getItem('currentUser')) return; 
    } catch (e) { return; }

    populateDeptOptions();

    let attempts = 0;
    const check = setInterval(() => {
        attempts++;
        if (attempts > 20) { clearInterval(check); }

        if (window.documents && Array.isArray(window.documents)) {
            clearInterval(check);
            if (!isDashboardInit) initDashboard();
        }
    }, 500);
});

// Populate Department Options
async function populateDeptOptions() {
    const select = document.getElementById('globalScope');
    if (!select) return;

    try {
        const res = await fetch('../assets/api/get_departments.php');
        const depts = await res.json();
        
        const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
        const userDept = user.dept || '';
        const isSuperAdmin = user.role === 'Super Administrator';

        select.innerHTML = '';

        const allOpt = document.createElement('option');
        allOpt.value = 'all';
        allOpt.textContent = 'All Departments';
        allOpt.selected = true;
        select.appendChild(allOpt);

        if (userDept) {
            const myDeptOpt = document.createElement('option');
            myDeptOpt.value = 'mine';
            myDeptOpt.textContent = `My Department (${userDept})`;
            select.appendChild(myDeptOpt);
        }

        const sep = document.createElement('option');
        sep.disabled = true;
        sep.textContent = '──────────';
        select.appendChild(sep);

        depts.forEach(d => {
            const opt = document.createElement('option');
            opt.value = d.dept_name;
            opt.textContent = d.dept_name;
            select.appendChild(opt);
        });

        if (!isSuperAdmin) {
            select.value = 'mine';
            select.disabled = true;
            Array.from(select.options).forEach(opt => {
                if (opt.value !== 'mine') opt.style.display = 'none';
            });
            globalScope = 'mine';
        }

    } catch (err) {
        console.error('Failed to load departments:', err);
        select.innerHTML = '<option value="all">All Departments</option>';
    }
}

// Initialize Dashboard
function initDashboard() {
    isDashboardInit = true;
    
    const loader = document.getElementById('initial-loader');
    if (loader) loader.style.display = 'none';
    
    const container = document.querySelector('.analytics-container');
    if (container) container.classList.add('loaded');
    
    const dateFilter = document.getElementById('globalDateFilter');
    if(dateFilter) dateFilter.value = 'thisYear';

    try {
        const userStr = localStorage.getItem('currentUser');
        if (!userStr) return;
        
        const user = JSON.parse(userStr);
        const scopeSelect = document.getElementById('globalScope');

        if (user && user.role !== 'Super Administrator') {
            updateDashboardScope('mine');
        } else {
            updateDashboardScope('all');
        }
    } catch (e) {
        console.warn("Scope initialization warning:", e);
    }
}

// Dashboard Scope
window.updateDashboardScope = function(scopeVal) {
    globalScope = scopeVal;
    const globalDate = document.getElementById('globalDateFilter')?.value || 'thisYear';
    refreshDashboard(globalDate);
};

window.applyGlobalDateFilter = function(dateRange) {
    refreshDashboard(dateRange);
    
    ['status', 'workload', 'trend'].forEach(type => {
        const individualSelect = document.querySelector(`.card-header select[onchange*="'${type}'"]`);
        if(individualSelect) individualSelect.value = dateRange;
        const customDiv = document.getElementById(`custom-${type}`);
        if(customDiv) customDiv.classList.remove('active');
    });
};

window.applyStatusFilter = function(statusVal) {
    const globalDate = document.getElementById('globalDateFilter')?.value || 'thisYear';
    refreshDashboard(globalDate);
};

window.applyDocTypeFilter = function(docType) {
    updateTabsForDocType(docType);
    const globalDate = document.getElementById('globalDateFilter')?.value || 'thisYear';
    refreshDashboard(globalDate);
};

window.activeAnalyticsTab = 'all';

// Update Tabs for Document Type
function updateTabsForDocType(docType) {
    const tabsContainer = document.getElementById('analytics-tabs-container');
    if (!tabsContainer) return;

    if (docType === 'all') {
        tabsContainer.style.display = 'none';
        tabsContainer.innerHTML = '';
        window.activeAnalyticsTab = 'all';
    } else if (docType === 'active') {
        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = `
            <button class="analytics-tab-btn active" onclick="window.switchAnalyticsTab('alltracking')">All Tracking</button>
            <button class="analytics-tab-btn" onclick="window.switchAnalyticsTab('submitted')">Submitted</button>
            <button class="analytics-tab-btn" onclick="window.switchAnalyticsTab('approval')">Approval (For Sign)</button>
        `;
        window.activeAnalyticsTab = 'alltracking';
    } else if (docType === 'archived') {
        tabsContainer.style.display = 'flex';
        tabsContainer.innerHTML = `
            <button class="analytics-tab-btn active" onclick="window.switchAnalyticsTab('allrecords')">All Records</button>
            <button class="analytics-tab-btn" onclick="window.switchAnalyticsTab('myuploads')">My Uploads</button>
            <button class="analytics-tab-btn" onclick="window.switchAnalyticsTab('routedtome')">Routed to Me</button>
        `;
        window.activeAnalyticsTab = 'allrecords';
    }
}

window.switchAnalyticsTab = function(tab) {
    window.activeAnalyticsTab = tab;
    
    document.querySelectorAll('.analytics-tab-btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    const globalDate = document.getElementById('globalDateFilter')?.value || 'thisYear';
    refreshDashboard(globalDate);
};

// Refresh Dashboard
function refreshDashboard(dateRange) {
    const allDocs = window.documents || [];
    let scopedDocs = getScopedDocs(allDocs); 
    const user = JSON.parse(localStorage.getItem('currentUser') || '{}');
    const myDept = user.dept || '';
    const myName = user.name || '';

    const docTypeFilter = document.getElementById('globalDocTypeFilter')?.value || 'all';
    if (docTypeFilter === 'active') {
        scopedDocs = scopedDocs.filter(d => {
            const status = (d.status || '').toLowerCase();
            return ['pending', 'progress', 'revision'].includes(status);
        });
        
        if (window.activeAnalyticsTab === 'alltracking') {
        } else if (window.activeAnalyticsTab === 'submitted') {
            scopedDocs = scopedDocs.filter(d => d.dept === myDept);
        } else if (window.activeAnalyticsTab === 'approval') {
            scopedDocs = scopedDocs.filter(d => d.assignee === myDept);
        }
    } else if (docTypeFilter === 'archived') {
        scopedDocs = scopedDocs.filter(d => {
            const status = (d.status || '').toLowerCase();
            return ['completed', 'released', 'rejected'].includes(status);
        });
        
        if (window.activeAnalyticsTab === 'allrecords') {
        } else if (window.activeAnalyticsTab === 'myuploads') {
            scopedDocs = scopedDocs.filter(d => d.dept === myDept);
        } else if (window.activeAnalyticsTab === 'routedtome') {
            scopedDocs = scopedDocs.filter(d => checkIfProcessedByMe(d, myDept, myName));
        }
    }

    const currentDocs = filterByDate(scopedDocs, dateRange); 
    
    const prevRangeObj = getPreviousRange(dateRange);
    const prevDocs = filterByDate(scopedDocs, prevRangeObj);

    updateChart('status', currentDocs);   
    updateChart('workload', currentDocs, dateRange);
    updateChart('trend', currentDocs);
    
    renderInsights(currentDocs, prevDocs); 
    renderTable(currentDocs);    
}

// Check If Processed By Me
function checkIfProcessedByMe(doc, myDept, myName) {
    if (doc.timeline && Array.isArray(doc.timeline)) {
        return doc.timeline.some(t => 
            t.dept === myDept || t.handler === myName
        );
    }
    return doc.assignee === myDept;
}

// Get Scoped Documents
function getScopedDocs(docs) {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!docs) return [];
    if (globalScope === 'mine') return docs.filter(d => d.dept === user.dept || d.assignee === user.dept);
    if (globalScope === 'all') return docs;
    return docs.filter(d => d.dept === globalScope || d.assignee === globalScope);
}

// Render Insights
function renderInsights(currDocs, prevDocs) {
    if (!Array.isArray(currDocs)) return;

    const calc = (data) => {
        const total = data.length;
        if(total === 0) return { rate: 0, issues: 0, avgAge: 0 };
        
        const comp = data.filter(d => ['COMPLETED','RELEASED'].includes((d.status||'').toUpperCase())).length;
        const issues = data.filter(d => ['REJECTED','REVISION'].includes((d.status||'').toUpperCase())).length;
        
        let totalAge = 0;
        data.forEach(d => {
            if(d.date) {
                const docDate = new Date(d.date.replace(/-/g, "/"));
                if(!isNaN(docDate)) {
                    totalAge += Math.ceil(Math.abs(new Date() - docDate) / 8.64e7);
                }
            }
        });
        
        return {
            rate: Math.round((comp/total)*100),
            issues: issues,
            avgAge: Math.round(totalAge / total)
        };
    };

    const curr = calc(currDocs);
    const prev = calc(prevDocs);

    updateKpi('insight-rate', 'trend-rate', curr.rate + '%', curr.rate, prev.rate, '%', false);

    updateKpi('insight-issues', 'trend-issues', curr.issues, curr.issues, prev.issues, '', true);

    updateKpi('insight-speed', 'trend-speed', curr.avgAge + 'd', curr.avgAge, prev.avgAge, 'd', true);

    const stages = currDocs
        .filter(d => !['COMPLETED', 'RELEASED', 'REJECTED'].includes((d.status||'').toUpperCase()))
        .map(d => d.status); // Keep generic status if that's all we have

    if(stages.length) {
        let mode = stages.sort((a,b) => stages.filter(v => v===a).length - stages.filter(v => v===b).length).pop();
        
        if(mode.toUpperCase() === 'PROGRESS') mode = 'In Progress';
        
        document.getElementById('insight-bottle').innerText = mode;
    } else {
        document.getElementById('insight-bottle').innerText = "None";
    }
}

// Update KPI
function updateKpi(valId, trendId, displayVal, currVal, prevVal, suffix, lowerIsBetter) {
    const valEl = document.getElementById(valId);
    const trendEl = document.getElementById(trendId);
    
    if(valEl) valEl.innerText = displayVal;
    
    if(trendEl) {
        const diff = currVal - prevVal;
        if(isNaN(diff) || (prevVal === 0 && currVal === 0)) {
            trendEl.innerHTML = `<span style="color:#94a3b8">-</span>`;
            trendEl.className = 'trend-badge neutral';
            return;
        }

        let icon = diff > 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line';
        if (diff === 0) icon = 'ri-subtract-line';

        let isGood = false;
        if (lowerIsBetter) isGood = diff <= 0;
        else isGood = diff >= 0;

        trendEl.className = `trend-badge ${isGood ? 'positive' : 'negative'}`;
        trendEl.innerHTML = `<i class="${icon}"></i> ${Math.abs(diff)}${suffix}`;
    }
}

// Get Previous Range
function getPreviousRange(range) {
    const now = new Date();
    const y = now.getFullYear();
    const m = now.getMonth();
    let start, end;

    if (range === 'thisYear') {
        start = new Date(y - 1, 0, 1); end = new Date(y - 1, 11, 31);
    } else if (range === 'thisMonth') {
        start = new Date(y, m - 1, 1); end = new Date(y, m, 0);
    } else if (range === 'today') {
        start = new Date(); start.setDate(now.getDate() - 1); start.setHours(0,0,0,0);
        end = new Date(); end.setDate(now.getDate() - 1); end.setHours(23,59,59,999);
    } else if (range === 'thisWeek') {
        start = new Date(); start.setDate(now.getDate() - 14); 
        end = new Date(); end.setDate(now.getDate() - 7);
    } else {
        return null;
    }
    return { start, end };
}

// Filter By Date
function filterByDate(docs, range) {
    if (!Array.isArray(docs) || !range || range === 'all') return docs || [];
    let start, end, now = new Date(), y = now.getFullYear();

    if (typeof range === 'object' && range.start) {
        start = new Date(range.start); start.setHours(0,0,0,0);
        end = new Date(range.end); end.setHours(23,59,59,999);
    } else {
        switch(range) {
            case 'thisYear': start = new Date(y, 0, 1); end = new Date(y, 11, 31, 23, 59, 59); break;
            case 'thisMonth': start = new Date(y, now.getMonth(), 1); end = new Date(y, now.getMonth() + 1, 0, 23, 59, 59); break;
            case 'today': start = new Date(); start.setHours(0,0,0,0); end = new Date(); end.setHours(23,59,59,999); break;
            case 'thisWeek': 
                start = new Date(now); start.setHours(0,0,0,0); start.setDate(now.getDate() - (now.getDay()||7) + 1); 
                end = new Date(start); end.setDate(start.getDate() + 6); end.setHours(23,59,59,999); break;
            case 'q1': start = new Date(y, 0, 1); end = new Date(y, 2, 31, 23, 59, 59); break;
            case 'q2': start = new Date(y, 3, 1); end = new Date(y, 5, 30, 23, 59, 59); break;
            case 'q3': start = new Date(y, 6, 1); end = new Date(y, 8, 30, 23, 59, 59); break;
            case 'q4': start = new Date(y, 9, 1); end = new Date(y, 11, 31, 23, 59, 59); break;
            default: return docs;
        }
    }
    return docs.filter(d => { if(!d.date) return false; const dt = new Date(d.date.replace(/-/g, "/")); return dt >= start && dt <= end; });
}

// Update Chart
window.updateChart = function(type, docs, range) {
    if (typeof docs === 'string') {
        range = docs;
        docs = filterByDate(getScopedDocs(window.documents || []), range);
    }
    
    if (!Array.isArray(docs)) docs = [];
    
    const canvas = document.getElementById(type + 'Chart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (charts[type]) charts[type].destroy();

    if (!docs.length) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    if (type === 'status') {
        const counts = {}; docs.forEach(d => counts[d.category || 'Other'] = (counts[d.category || 'Other'] || 0) + 1);
        charts[type] = new Chart(ctx, {
            type: 'doughnut',
            data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'], borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: false, cutout: '75%', plugins: { legend: { position: 'right', labels: { boxWidth: 10 } } } }
        });
    } else if (type === 'workload') {
        const counts = {}; 
        const globalDate = document.getElementById('globalDateFilter')?.value || 'thisYear';
        let isDay = ['today', 'thisWeek'].includes(globalDate);
        if (isDay) ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].forEach(d => counts[d] = 0);
        else for(let w=1; w<=5; w++) counts[`W${w}`] = 0;
        
        docs.forEach(d => { if(d.date) {
            const dt = new Date(d.date.replace(/-/g, "/"));
            let k = isDay ? dt.toLocaleDateString('en-US', { weekday: 'short' }) : `W${Math.ceil(dt.getDate()/7)}`;
            if (counts[k] !== undefined) counts[k]++;
        }});
        
        const grad = ctx.createLinearGradient(0,0,0,300); grad.addColorStop(0,'#6366f1'); grad.addColorStop(1,'#a5b4fc');
        charts[type] = new Chart(ctx, { type: 'bar', data: { labels: Object.keys(counts), datasets: [{ data: Object.values(counts), backgroundColor: grad, borderRadius: 6 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } } } } });
    } else if (type === 'trend') {
        const raw = {}; docs.forEach(d => { if(d.date) { const k = d.date.split(' ')[0]; raw[k] = (raw[k] || 0) + 1; }});
        const sorted = Object.keys(raw).sort();
        const grad = ctx.createLinearGradient(0,0,0,300); grad.addColorStop(0,'rgba(99,102,241,0.4)'); grad.addColorStop(1,'rgba(99,102,241,0)');
        charts[type] = new Chart(ctx, { type: 'line', data: { labels: sorted.map(k => new Date(k).toLocaleDateString('en-US', { month:'short', day:'numeric' })), datasets: [{ data: sorted.map(k => raw[k]), borderColor: '#6366f1', borderWidth: 2, backgroundColor: grad, fill: true, tension: 0.4 }] }, options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { display: false } }, y: { beginAtZero: true } } } });
    }
};

// Reload Table
window.reloadTable = function() { 
    const globalDate = document.getElementById('globalDateFilter')?.value || 'thisYear';
    refreshDashboard(globalDate); 
};

// Render Table
window.renderTable = function(docs) {
    if (!Array.isArray(docs)) docs = [];
    const tbody = document.getElementById('insights-table-body'), sortFilter = document.getElementById('aiSortFilter');
    const aiSection = document.querySelector('.card:has(#insights-table-body)');
    if (!tbody) return; 
    
    const user = JSON.parse(localStorage.getItem('currentUser')) || { role: 'Guest', dept: 'None' };
    const selSort = sortFilter ? sortFilter.value : 'urgent';
    const docTypeFilter = document.getElementById('globalDocTypeFilter')?.value || 'all';

    if (docTypeFilter === 'archived') {
        if (aiSection) aiSection.style.display = 'none';
        return;
    } else {
        if (aiSection) aiSection.style.display = 'flex';
    }

    tbody.innerHTML = '';

    let processed = docs.filter(d => {
        const status = (d.status || '').toLowerCase();
        if (!['pending', 'progress', 'revision'].includes(status)) return false;
        
        if (globalScope === 'all') return true;
        const target = (globalScope === 'mine') ? user.dept : globalScope;
        return d.dept === target || d.assignee === target;
    }).map(d => {
        const age = d.date ? Math.ceil(Math.abs(new Date() - new Date(d.date.replace(/-/g, "/"))) / 8.64e7) : 0;
        let score = age * 0.7;
        if (d.status?.toLowerCase() === 'revision') score += 3;
        if (age > 7) score += 2;
        if (age > 14) score += 3;
        
        const ctx = AI_ENGINE.analyzeContext(d.title);
        const risk = AI_ENGINE.predictDelay(age, d.status);
        
        if (ctx) score += ctx.score;
        if (risk.risk) score += (risk.level === 'critical' ? 3 : 2);
        
        const suggestedAction = AI_ENGINE.suggestAction(d, age, score);
        const priorityLevel = AI_ENGINE.getPriorityLevel(score);
        
        return { 
            ...d, 
            score: Math.min(10, score), 
            tag: ctx ? ctx.reason : (risk.risk ? risk.reason : ""), 
            aiAction: ctx?.action || risk?.action || suggestedAction,
            priorityLevel: priorityLevel,
            age 
        };
    });

    processed = processed.filter(d => d.score >= 2.5);

    processed.sort((a,b) => selSort === 'urgent' ? b.score - a.score : (selSort === 'oldest' ? b.age - a.age : new Date(b.date) - new Date(a.date)));

    processed = processed.slice(0, 15);

    processed.forEach(d => {
        let color = d.score > 7 ? "#ef4444" : d.score > 4 ? "#f59e0b" : "#10b981";
        
        let badges = '';
        
        if (d.priorityLevel) {
            badges += `<span class="ai-badge priority" style="background:${d.priorityLevel.color}22; color:${d.priorityLevel.color}; border:1px solid ${d.priorityLevel.color}44;">
                <i class="${d.priorityLevel.icon}"></i> ${d.priorityLevel.label}
            </span>`;
        }
        
        if (d.tag) {
            badges += `<span class="ai-badge keyword"><i class="ri-sparkling-fill"></i> ${d.tag}</span>`;
        }
        
        if(AI_ENGINE.detectComplaint(d.title)) {
            badges += `<span class="ai-badge negative"><i class="ri-alarm-warning-fill"></i> Complaint</span>`;
        }
        
        const aiActionHint = d.aiAction ? `<div style="font-size:0.65rem; color:#6366f1; margin-top:4px;"><i class="ri-lightbulb-line"></i> ${d.aiAction}</div>` : '';
        
        const isAssignedToMe = d.assignee === user.dept;
        const isAdmin = user.role === 'Super Administrator';
        
        let actionBtn = '';
        
        if (isAssignedToMe || isAdmin) {
            actionBtn = `<a href="tracking.html?search=${d.id}" class="action-link-btn btn-actionable">Track <i class="ri-arrow-right-line"></i></a>`;
        } else {
            const safeDoc = JSON.stringify(d).replace(/"/g, '&quot;');
            actionBtn = `<button onclick="window.viewHistoryOnly(${safeDoc})" class="action-link-btn btn-readonly">History <i class="ri-time-line"></i></button>`;
        }

        const statusClass = (d.status || '').toLowerCase();

        tbody.innerHTML += `<tr>
            <td><div class="dept-avatar-wrapper"><div class="dept-avatar" style="background:#f1f5f9; color:#64748b;">${(d.dept||'UK').substring(0,2).toUpperCase()}</div><div><div style="font-weight:700; font-size:0.75rem; color:#64748b;">${d.dept}</div><div style="font-size:0.6rem; color:#94a3b8;">Created</div></div></div></td>
            <td><div class="dept-avatar-wrapper"><div class="dept-avatar" style="background:#eff6ff; color:#3b82f6;">${(d.assignee||'UK').substring(0,2).toUpperCase()}</div><div><div style="font-weight:700; font-size:0.75rem; color:#3b82f6;">${d.assignee}</div><div style="font-size:0.6rem; color:#94a3b8;">Assigned</div></div></div></td>
            <td><div style="font-weight:700; font-size:0.85rem; color:#334155;">${d.title}</div>${badges}${aiActionHint}<div style="font-size:0.65rem; color:#64748b; margin-top:2px;">ID: ${d.id}</div></td>
            <td><span class="status-badge ${statusClass}">${d.status}</span></td>
            <td style="font-weight:600; color:#64748b; font-size:0.8rem;">${d.age}d</td>
            <td><div class="heatmap-container"><div class="heatmap-fill" style="width:${d.score*10}%; background:linear-gradient(90deg, ${color}, ${color}88);"></div></div><div style="text-align:right; font-size:0.65rem; font-weight:700; color:${color}; margin-top:2px;">${d.score.toFixed(1)}</div></td>
            <td style="text-align:right;">${actionBtn}</td>
        </tr>`;
    });

    if(!processed.length) tbody.innerHTML = `<tr><td colspan="7" style="text-align:center; padding:3rem; color:#94a3b8; font-size:0.85rem;">No actionable recommendations found.</td></tr>`;
};

// View History Only
window.viewHistoryOnly = function(doc) {
    if(window.openDocViewer) {
        window.openDocViewer(doc);
    } else {
        showToast("Document Viewer not loaded.", "error");
        return;
    }

    setTimeout(() => {
        const modal = document.getElementById('doc-viewer-modal');
        if(modal) {
            modal.classList.add('restricted-mode');
            
            const closeBtn = document.getElementById('close-preview-btn');
            if(closeBtn) {
                closeBtn.addEventListener('click', () => {
                    modal.classList.remove('restricted-mode');
                }, { once: true });
            }
        }
    }, 50);
};

// Handle Filter Change
window.handleFilterChange = (t, v) => {
    const container = document.getElementById(`custom-${t}`);
    if (!container) return;
    if (v === 'custom') {
        container.classList.add('active');
        const closeHandler = (e) => {
            if (!container.contains(e.target) && e.target.tagName !== 'SELECT') {
                container.classList.remove('active');
                document.removeEventListener('click', closeHandler);
            }
        };
        setTimeout(() => document.addEventListener('click', closeHandler), 10);
    } else {
        container.classList.remove('active');
        updateChart(t, v);
    }
};

// Apply Custom Filter
window.applyCustomFilter = (t) => {
    const start = document.getElementById(`start-${t}`).value;
    const end = document.getElementById(`end-${t}`).value;
    if (start && end) {
        updateChart(t, { start, end });
        document.getElementById(`custom-${t}`).classList.remove('active');
    }
};

// Open Report Modal
window.openReportModal = () => {
    const scopeSel = document.getElementById('globalDateFilter');
    const scopeText = scopeSel.options[scopeSel.selectedIndex].text;
    document.getElementById('rpt-scope-display').innerText = scopeText;
    
    document.getElementById('export-progress-container').style.display = 'none';
    document.getElementById('btn-download-report').disabled = false;
    document.getElementById('btn-download-report').innerHTML = '<i class="ri-download-cloud-2-line"></i> Generate PDF';
    
    document.getElementById('report-modal').classList.add('active');
};

window.closeReportModal = () => document.getElementById('report-modal').classList.remove('active');

// Generate PDF
window.generatePDF = async function() {
    const btn = document.getElementById('btn-download-report');
    const progressContainer = document.getElementById('export-progress-container');
    const progressBar = document.getElementById('progress-bar');
    const progressText = document.getElementById('progress-percent');
    
    btn.disabled = true;
    btn.innerHTML = `<i class="ri-loader-4-line ri-spin"></i> Processing...`;
    if(progressContainer) progressContainer.style.display = 'block';
    
    const pdf = new window.jspdf.jsPDF('p', 'mm', 'a4');
    const pageWidth = 210;
    const pageHeight = 297;
    const margin = 10; 
    const contentWidth = pageWidth - (margin * 2);
    let y = margin;
    
    const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
    const scopeElement = document.getElementById('globalDateFilter');
    const scope = scopeElement ? scopeElement.options[scopeElement.selectedIndex].text : 'Custom Range';

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(18);
    pdf.setTextColor(30, 41, 59);
    pdf.text("Analytics Report", margin, y + 6);
    
    pdf.setFont("helvetica", "normal");
    pdf.setFontSize(10);
    pdf.setTextColor(100);
    pdf.text(`Generated: ${today}  |  Period: ${scope}`, margin, y + 12);
    
    pdf.setDrawColor(226, 232, 240);
    pdf.setLineWidth(0.5);
    pdf.line(margin, y + 16, pageWidth - margin, y + 16);
    y += 25;

    const sections = [];
    if(document.getElementById('chk-overview').checked) sections.push({ selector: '.insights-grid', title: 'Executive Overview' });
    if(document.getElementById('chk-trends').checked) sections.push({ selector: '#report-section-charts', title: 'Performance Trends' });
    if(document.getElementById('chk-table').checked) sections.push({ selector: '#report-section-table', title: 'AI Recommendations' });

    const totalSteps = sections.length;

    try {
        for(let i = 0; i < totalSteps; i++) {
            const pct = Math.round(((i) / totalSteps) * 100);
            if(progressBar) progressBar.style.width = `${pct}%`;
            if(progressText) progressText.innerText = `${pct}%`;

            const section = sections[i];
            const el = document.querySelector(section.selector);

            if(el) {
                if (y > pageHeight - 40) { pdf.addPage(); y = margin; }
                
                pdf.setFont("helvetica", "bold");
                pdf.setFontSize(12);
                pdf.setTextColor(30, 41, 59);
                pdf.text(section.title, margin, y);
                y += 6;

                const canvas = await html2canvas(el, { 
                    scale: 2, 
                    useCORS: true,
                    backgroundColor: '#ffffff',
                    logging: false
                });
                
                const imgData = canvas.toDataURL('image/jpeg', 0.75);
                
                const imgProps = pdf.getImageProperties(imgData);
                const pdfImgHeight = (imgProps.height * contentWidth) / imgProps.width;

                if (y + pdfImgHeight > pageHeight - margin) {
                    pdf.addPage();
                    y = margin;
                }

                pdf.addImage(imgData, 'JPEG', margin, y, contentWidth, pdfImgHeight);
                y += pdfImgHeight + 10;
            }
            
            await new Promise(r => setTimeout(r, 50));
        }

        if(progressBar) progressBar.style.width = `100%`;
        if(progressText) progressText.innerText = `100%`;
        btn.innerHTML = "Saving...";
        
        pdf.save('Analytics_Report.pdf'); 
        
        setTimeout(() => {
            closeReportModal();
        }, 500);

    } catch(e) {
        console.error(e);
        showToast("Error generating PDF: " + e.message, "error");
        btn.disabled = false;
        btn.innerHTML = "Try Again";
    }
};