/* assets/js/modal.js */

document.addEventListener("DOMContentLoaded", () => {
    loadSubmitModal();
});

async function loadSubmitModal() {
    // Avoid duplicate injection
    if (document.getElementById('submit-modal')) return;

    try {
        // 1. Fetch Modal HTML
        const response = await fetch('../components/submit-document-modal.html');
        if (!response.ok) throw new Error("Failed to load modal component");

        const html = await response.text();
        
        // 2. Inject into Body
        document.body.insertAdjacentHTML('beforeend', html);

        // 3. Initialize Logic (Now that HTML exists)
        initModalLogic();

    } catch (error) {
        console.error("Error loading modal:", error);
    }
}

function initModalLogic() {
    const modal = document.getElementById('submit-modal');
    if (!modal) return;

    // --- Modal Close Logic ---
    const closeModal = (e) => { 
        if (e) e.preventDefault(); 
        modal.classList.remove('active'); 
    };
    
    document.getElementById('close-submit-modal').onclick = closeModal;
    document.getElementById('cancel-submit-btn').onclick = closeModal;

    // --- Routing Configuration ---
    const defaultRoutes = {
        "Contracts": ["City Legal Office", "City Budget Office", "City Accountant", "Mayor's Office"],
        "Invoices": ["Budget Office", "Accountant's Office", "Treasurer's Office", "Mayor's Office"],
        "Reports": ["Department Head", "Records Section", "City Administrator"],
        "Memos": ["HRMO", "City Administrator", "Mayor's Office"],
        "Legal": ["Legal Office", "City Administrator", "Mayor's Office"]
    };

    let currentRoute = [];
    const listEl = document.getElementById('routing-list');
    const pathContainer = document.getElementById('path-container');
    const pathText = document.getElementById('path-text');

    // --- Helper: Render the visual route list ---
    function renderRoutes() {
        listEl.innerHTML = '';
        
        if (currentRoute.length === 0) {
            listEl.innerHTML = '<div class="empty-state">Select a category or add a department</div>';
            pathContainer.style.display = 'none';
            return;
        }

        pathContainer.style.display = 'block';
        pathText.innerText = currentRoute.map((dept, i) => `${i+1}. ${dept}`).join(' → ');

        currentRoute.forEach((dept, index) => {
            const item = document.createElement('div');
            item.className = 'route-item';
            item.draggable = true;
            item.innerHTML = `
                <div class="route-info">
                    <span class="step-number">${index + 1}</span>
                    <span class="dept-name">${dept}</span>
                </div>
                <i class="ri-close-line remove-dept"></i>
            `;
            
            // Remove Button
            item.querySelector('.remove-dept').onclick = () => { 
                currentRoute.splice(index, 1); 
                renderRoutes(); 
            };
            
            // Drag Events
            item.addEventListener('dragstart', () => item.classList.add('dragging'));
            item.addEventListener('dragend', () => item.classList.remove('dragging'));
            
            listEl.appendChild(item);
        });
    }

    // --- Drag & Drop Logic ---
    listEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        const draggingItem = document.querySelector('.dragging');
        const siblings = [...listEl.querySelectorAll('.route-item:not(.dragging)')];
        const nextSibling = siblings.find(sibling => e.clientY <= sibling.getBoundingClientRect().top + sibling.getBoundingClientRect().height / 2);
        listEl.insertBefore(draggingItem, nextSibling);
    });

    listEl.addEventListener('drop', () => {
        const newOrder = [];
        listEl.querySelectorAll('.route-item').forEach(item => {
            newOrder.push(item.querySelector('.dept-name').innerText);
        });
        currentRoute = newOrder;
        renderRoutes();
    });

    // --- Form Interaction ---
    document.getElementById('category-select').addEventListener('change', (e) => {
        const selected = e.target.value;
        if (defaultRoutes[selected]) { 
            currentRoute = [...defaultRoutes[selected]]; 
            renderRoutes(); 
        }
    });

    document.getElementById('add-dept-btn').onclick = () => {
        const dept = prompt("Enter Department Name:");
        if (dept) { 
            currentRoute.push(dept); 
            renderRoutes(); 
        }
    };

    document.getElementById('clear-route-btn').onclick = () => { 
        currentRoute = []; 
        renderRoutes(); 
    };

    // --- File Upload Handling ---
    document.getElementById('file-upload').addEventListener('change', function() {
        const fileName = document.getElementById('file-name');
        if (this.files && this.files[0]) {
            if (this.files[0].type !== 'application/pdf') { 
                alert('Only PDF files are allowed!'); 
                this.value = ''; 
                fileName.innerText = 'Choose PDF File'; 
            } else { 
                fileName.innerText = this.files[0].name; 
                fileName.style.color = '#1e293b'; 
            }
        }
    });

    // --- Submit Logic ---
    const form = document.getElementById('document-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const title = document.getElementById('doc-title-input').value;
        const category = document.getElementById('category-select').value;
        const currentUser = JSON.parse(localStorage.getItem('currentUser')) || { name: 'Unknown', role: 'Guest', dept: 'Unknown' };
        
        const now = new Date();
        const dateStr = now.toISOString().split('T')[0];
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        const newDoc = {
            id: 'DOC-' + (Math.floor(Math.random() * 90000) + 10000),
            title: title,
            dept: currentUser.dept || 'OCM',
            status: 'pending',
            category: category,
            date: dateStr,
            progress: 0,
            assignee: currentRoute[0] || 'Unassigned',
            finalizedBy: '-',
            timeline: [
                {
                    user: currentUser.name,
                    role: currentUser.role,
                    action: 'Document Created',
                    time: `${dateStr} ${timeStr}`,
                    icon: 'ri-upload-cloud-line',
                    ctx: 'ctx-sys',
                    details: `Uploaded by ${currentUser.name} (${currentUser.dept}). File size: 2.4 MB (Simulated).`
                }
            ]
        };

        if (window.documents) {
            window.documents.unshift(newDoc);
            localStorage.setItem('dts_documents', JSON.stringify(window.documents));
        }

        alert('Document Submitted Successfully!\nTracking ID: ' + newDoc.id);
        window.location.href = 'tracking.html';
    });
}