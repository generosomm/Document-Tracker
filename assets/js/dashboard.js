/* * dashboard.js
 * Logic specifically for the Dashboard page
 * (Submit Modal, Routing Sequence, Drag & Drop)
 */

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. MODAL LOGIC ---
    const modal = document.getElementById('submit-modal');
    // Note: The open button is in the header, but we handle it here 
    // because the Modal HTML is only on this page.
    const openBtn = document.getElementById('open-modal');
    const closeBtn = document.getElementById('close-modal');
    const cancelBtn = document.getElementById('cancel-btn');

    // Safety Check: Only run if the modal actually exists on this page
    if (!modal) return; 

    function openModal() {
        modal.classList.add('active');
    }

    function closeModal() {
        modal.classList.remove('active');
    }

    if(openBtn) openBtn.addEventListener('click', openModal);
    if(closeBtn) closeBtn.addEventListener('click', closeModal);
    if(cancelBtn) cancelBtn.addEventListener('click', closeModal);

    // Close on outside click
    modal.addEventListener('click', (e) => {
        if (e.target === modal) closeModal();
    });


    // --- 2. ROUTING LOGIC (The smart part) ---
    
    // Default Routes Database (Simulation)
    const defaultRoutes = {
        "Contracts": ["Office of the City Administrator", "City Legal Office", "City Accountant's Office", "Office of the City Mayor"],
        "Invoices": ["City Budget Office", "City Accountant's Office", "City Treasurer's Office", "Office of the City Mayor"],
        "Reports": ["Department Head", "Records Section", "Office of the City Administrator"],
        "Memos": ["HRMO", "Office of the City Administrator"],
        "Legal": ["City Legal Office", "Office of the City Mayor"]
    };

    const categorySelect = document.getElementById('category-select');
    const routingList = document.getElementById('routing-list');
    const pathDisplay = document.getElementById('path-display');
    const clearBtn = document.getElementById('clear-btn');
    const addDeptBtn = document.getElementById('add-dept-btn');

    // Current list state
    let currentRoute = [];

    // Helper: Render the list based on 'currentRoute' array
    function renderRoutes() {
        routingList.innerHTML = ''; // Clear current list

        if (currentRoute.length === 0) {
            routingList.innerHTML = '<div class="empty-state">Select a category to view routing</div>';
            pathDisplay.textContent = 'Path: None';
            return;
        }

        currentRoute.forEach((dept, index) => {
            const item = document.createElement('div');
            item.classList.add('route-item');
            item.setAttribute('draggable', 'true'); // Enable native dragging
            item.dataset.index = index;

            item.innerHTML = `
                <div class="route-info">
                    <span class="step-number">${index + 1}</span>
                    <span class="dept-name">${dept}</span>
                </div>
                <i class="ri-close-line remove-dept" onclick="removeDept(${index})"></i>
            `;
            
            // Add Drag Events
            addDragEvents(item);
            
            routingList.appendChild(item);
        });

        updatePathString();
    }

    // Helper: Update the blue text string at bottom
    function updatePathString() {
        const pathString = currentRoute.map((dept, i) => `${i+1}. ${dept}`).join(' → ');
        pathDisplay.textContent = `Path: ${pathString}`;
    }

    // Event: Category Change
    if(categorySelect) {
        categorySelect.addEventListener('change', (e) => {
            const category = e.target.value;
            if (defaultRoutes[category]) {
                currentRoute = [...defaultRoutes[category]]; // Copy array
                renderRoutes();
            }
        });
    }

    // Event: Clear List
    if(clearBtn) {
        clearBtn.addEventListener('click', () => {
            currentRoute = [];
            renderRoutes();
        });
    }

    // Event: Add Department (Simulation)
    if(addDeptBtn) {
        addDeptBtn.addEventListener('click', () => {
            const newDept = prompt("Enter Department Name:");
            if (newDept) {
                currentRoute.push(newDept);
                renderRoutes();
            }
        });
    }

    // Global Function for Inline OnClick (needed because of innerHTML injection)
    window.removeDept = function(index) {
        currentRoute.splice(index, 1);
        renderRoutes();
    };


    // --- 3. DRAG AND DROP LOGIC ---
    
    let dragStartIndex;

    function addDragEvents(item) {
        item.addEventListener('dragstart', () => {
            dragStartIndex = +item.getAttribute('data-index');
            item.classList.add('dragging');
        });

        item.addEventListener('dragover', (e) => {
            e.preventDefault(); // Necessary to allow dropping
        });

        item.addEventListener('drop', () => {
            const dragEndIndex = +item.getAttribute('data-index');
            swapItems(dragStartIndex, dragEndIndex);
            item.classList.remove('dragging');
        });

        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
        });
    }

    function swapItems(fromIndex, toIndex) {
        const itemOne = currentRoute[fromIndex];
        currentRoute.splice(fromIndex, 1);
        currentRoute.splice(toIndex, 0, itemOne);
        renderRoutes();
    }
    
    // --- 4. FILE UPLOAD UI ---
    const fileInput = document.getElementById('file-upload');
    const fileNameDisplay = document.getElementById('file-name');
    
    if(fileInput) {
        fileInput.addEventListener('change', function() {
            if(this.files && this.files.length > 0){
                fileNameDisplay.textContent = this.files[0].name;
                fileNameDisplay.style.color = '#1e293b';
            } else {
                fileNameDisplay.textContent = "Choose File";
                fileNameDisplay.style.color = '#64748b';
            }
        });
    }
});