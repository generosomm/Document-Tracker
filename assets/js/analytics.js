document.addEventListener('DOMContentLoaded', () => {

    // --- MOCK DATA SOURCE (Easy to replace with API) ---
    const chartData = {
        status: [30, 20, 15, 10, 25], // Completed, In Progress, Pending, Revision, Released
        workload: [7, 8, 8, 9, 15, 8, 17, 7, 9], // Data for each department
        trends: [22, 18, 20, 15, 19, 28, 14] // Hours per day (Mon-Sun)
    };

    // --- 1. PIE CHART: Document Status ---
    const ctxStatus = document.getElementById('statusChart').getContext('2d');
    new Chart(ctxStatus, {
        type: 'doughnut',
        data: {
            labels: ['Completed', 'In Progress', 'Pending', 'Revision', 'Released'],
            datasets: [{
                data: chartData.status,
                backgroundColor: ['#22c55e', '#3b82f6', '#eab308', '#f97316', '#a855f7'],
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
            cutout: '65%' // Makes the donut thinner
        }
    });

    // --- 2. BAR CHART: Workload ---
    const ctxWorkload = document.getElementById('workloadChart').getContext('2d');
    new Chart(ctxWorkload, {
        type: 'bar',
        data: {
            labels: ['Admin', 'Finance', 'HR', 'Legal', 'Planning', 'Licensing', 'Info', 'IT', 'Health'],
            datasets: [{
                label: 'Active Docs',
                data: chartData.workload,
                backgroundColor: '#10b981',
                borderRadius: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                y: { beginAtZero: true, grid: { display: true, drawBorder: false } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- 3. LINE CHART: Trends ---
    const ctxTrend = document.getElementById('trendChart').getContext('2d');
    new Chart(ctxTrend, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [{
                label: 'Avg Processing Time (Hours)',
                data: chartData.trends,
                borderColor: '#8b5cf6',
                backgroundColor: 'rgba(139, 92, 246, 0.1)',
                tension: 0.4, // Smooth curves
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
                y: { beginAtZero: true, grid: { color: '#f1f5f9' } },
                x: { grid: { display: false } }
            },
            plugins: { legend: { display: false } }
        }
    });

    // --- 4. POPULATE TABLE DYNAMICALLY ---
    const tableData = [
        { dept: 'Office of Mayor', title: 'Admin Order No. 2024-001', status: 'released', time: '10 days', perf: 'delayed', msg: 'Expedite approval process' },
        { dept: 'City Budget', title: 'Budget Plan Q1', status: 'process', time: '3 days', perf: 'good', msg: 'Maintain current speed' },
        { dept: 'HRMO', title: 'Employee Training Memo', status: 'completed', time: '1 day', perf: 'good', msg: 'Excellent turnaround' },
        { dept: 'Planning', title: 'City Dev Plan 2024', status: 'process', time: '8 days', perf: 'warn', msg: 'Review routing delays' },
        { dept: 'Legal Office', title: 'Contract Agreement', status: 'delayed', time: '12 days', perf: 'bad', msg: 'Bottleneck detected in signing' },
    ];

    const tableBody = document.getElementById('insights-table-body');
    
    // Helper to get Badge HTML
    const getStatusBadge = (s) => {
        const map = { released: 'process', process: 'process', completed: 'completed', delayed: 'delayed' };
        return `<span class="status-badge ${map[s] || 'process'}">${s.toUpperCase()}</span>`;
    };
    
    const getPerfBadge = (p) => {
        const map = { delayed: 'bad', bad: 'bad', good: 'good', warn: 'warn' };
        const icon = p === 'good' ? 'ri-check-line' : (p === 'warn' ? 'ri-alert-line' : 'ri-time-line');
        return `<span class="perf-badge ${map[p]}"><i class="${icon}"></i> ${p.toUpperCase()}</span>`;
    };

    // Render Rows
    tableData.forEach(row => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td><strong>${row.dept}</strong><br><span style="font-size:0.7em;color:#94a3b8">DOC-${Math.floor(Math.random()*1000)}</span></td>
            <td>${row.title}</td>
            <td>${getStatusBadge(row.status)}</td>
            <td>${row.time}</td>
            <td>${getPerfBadge(row.perf)}</td>
            <td style="color:#64748b; font-size: 0.8em;">${row.msg}</td>
        `;
        tableBody.appendChild(tr);
    });

});