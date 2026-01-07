document.addEventListener('DOMContentLoaded', () => {

    // --- 1. GET SHARED DATA ---
    // Pull from data.js
    const docs = window.documents || [];

    // --- 2. DATA PROCESSING FUNCTIONS ---

    // A. Calculate Status Counts
    const getStatusCounts = () => {
        // Initialize counters
        const counts = { completed: 0, progress: 0, pending: 0, revision: 0, released: 0, rejected: 0 };
        
        docs.forEach(d => {
            // Normalize status to lowercase just in case
            const s = d.status.toLowerCase();
            if (counts.hasOwnProperty(s)) {
                counts[s]++;
            }
        });

        // Return array matching Chart labels order
        // Order: [Completed, In Progress, Pending, Revision, Released, Rejected]
        return [counts.completed, counts.progress, counts.pending, counts.revision, counts.released, counts.rejected];
    };

    // B. Calculate Workload (Docs per Department)
    const getWorkloadData = () => {
        const deptCounts = {};
        
        docs.forEach(d => {
            const dept = d.dept || 'Unassigned';
            deptCounts[dept] = (deptCounts[dept] || 0) + 1;
        });

        return {
            labels: Object.keys(deptCounts),
            data: Object.values(deptCounts)
        };
    };

    // C. Calculate Trends (Docs per Date)
    const getTrendData = () => {
        const dateCounts = {};
        // Initialize last 7 days with 0
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            dateCounts[dateStr] = 0;
        }

        // Count actual docs
        docs.forEach(d => {
            if (dateCounts.hasOwnProperty(d.date)) {
                dateCounts[d.date]++;
            }
        });

        return {
            labels: Object.keys(dateCounts).map(date => {
                const d = new Date(date);
                return `${d.getMonth()+1}/${d.getDate()}`; // Format MM/DD
            }),
            data: Object.values(dateCounts)
        };
    };

    // --- 3. RENDER CHARTS ---

    // PIE CHART: Status
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending', 'Revision', 'Released', 'Rejected'],
            datasets: [{
                data: getStatusCounts(),
                backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7', '#ef4444'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'right', labels: { usePointStyle: true, boxWidth: 8 } }
            },
            cutout: '65%'
        }
    });

    // BAR CHART: Workload (By Department)
    const workloadData = getWorkloadData();
    const ctxWorkload = document.getElementById('workloadChart').getContext('2d');
    new Chart(ctxWorkload, {
        type: 'bar',
        data: {
            labels: workloadData.labels,
            datasets: [{
                label: 'Active Docs',
                data: workloadData.data,
                backgroundColor: '#10b981',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: true, drawBorder: false }, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // LINE CHART: Trends (Activity over time)
    const trendData = getTrendData();
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: trendData.labels,
            datasets: [{
                label: 'Documents Processed',
                data: trendData.data,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#fff',
                pointBorderColor: '#8b5cf6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { color: '#f1f5f9' }, ticks: { stepSize: 1 } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- 4. POPULATE INSIGHTS TABLE ---
    const tableBody = document.getElementById('insights-table-body');
    tableBody.innerHTML = ''; // Clear mock data

    // Helper: Logic to determine "Performance" based on status
    const evaluatePerformance = (doc) => {
        if (['completed', 'released'].includes(doc.status)) return { badge: 'good', label: 'Good', msg: 'On track' };
        if (['rejected', 'revision'].includes(doc.status)) return { badge: 'bad', label: 'Attention', msg: 'Delayed / Issues' };
        return { badge: 'warn', label: 'Processing', msg: 'Ongoing review' };
    };

    // Helper: HTML for badges
    const getPerfBadge = (p) => {
        const map = { bad: 'ri-alert-line', good: 'ri-check-line', warn: 'ri-time-line' };
        return `<span class="perf-badge ${p.badge}"><i class="${map[p.badge]}"></i> ${p.label}</span>`;
    };

    const getStatusBadge = (s) => {
        // Simple mapping for table colors
        let color = 'process';
        if(s === 'completed' || s === 'released') color = 'completed';
        if(s === 'rejected' || s === 'revision') color = 'delayed';
        return `<span class="status-badge ${color}">${s.toUpperCase()}</span>`;
    };

    // Render Rows (Take first 8 for display)
    docs.slice(0, 8).forEach(doc => {
        const perf = evaluatePerformance(doc);
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td><strong>${doc.dept}</strong><br><span style="font-size:0.7em;color:#94a3b8">${doc.id}</span></td>
            <td>${doc.title}</td>
            <td>${getStatusBadge(doc.status)}</td>
            <td>${doc.date}</td>
            <td>${getPerfBadge(perf)}</td>
            <td style="color:#64748b; font-size: 0.8em;">${perf.msg}</td>
        `;
        tableBody.appendChild(tr);
    });

});