document.addEventListener("DOMContentLoaded", () => {
    loadSubmitModal();
});

let dynamicRoutes = {};
let availableDepts = [];

function updateFileDisplay(file) {
    const listContainer = document.getElementById('fileList');
    const fileNameLabel = document.getElementById("file-name");
    
    if (!listContainer) return;

    if (!file) {
        listContainer.innerHTML = '';
        if (fileNameLabel) fileNameLabel.innerText = "Choose PDF File";
        return;
    }

    listContainer.innerHTML = `
        <div class="selected-file-item" style="display:flex; align-items:center; gap:10px; padding:8px; background:#f1f5f9; border-radius:6px; margin-top:10px; font-size:0.85rem;">
            <i class="ri-file-pdf-fill" style="color:#ef4444; font-size:1.2rem;"></i>
            <span style="flex:1; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${file.name}</span>
            <span style="color:#94a3b8;">(${(file.size / 1024 / 1024).toFixed(2)} MB)</span>
            <i class="ri-close-circle-line" onclick="clearSelectedFile()" style="cursor:pointer; color:#64748b;"></i>
        </div>
    `;

    if (fileNameLabel) {
        fileNameLabel.innerText = file.name;
        fileNameLabel.style.color = "#1e293b";
    }
}

window.clearSelectedFile = function() {
    const fileInput = document.getElementById("file-upload");
    if (fileInput) fileInput.value = '';
    updateFileDisplay(null);
};

function initGlobalDragAndDrop() {
    const body = document.body;

    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        body.addEventListener(eventName, e => {
            e.preventDefault();
            e.stopPropagation();
        }, false);
    });

    body.addEventListener('dragover', () => {
        body.style.border = "4px dashed #2563EB";
        body.style.backgroundColor = "rgba(37, 99, 235, 0.05)";
    });

    ['dragleave', 'drop'].forEach(eventName => {
        body.addEventListener(eventName, (e) => {
            if (eventName === 'drop' || e.relatedTarget === null) {
                body.style.border = "none";
                body.style.backgroundColor = "transparent";
            }
        });
    });

    body.addEventListener('drop', (e) => {
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            
            if (file.type === 'application/pdf') {
                window.openSubmitModalWithFile(file);
            } else {
                showToast("Only PDF files are allowed", "error");
            }
        }
    });
}

async function loadSubmitModal() {
    if (document.getElementById("submit-modal")) return;

    try {
        const isPages = window.location.pathname.includes("/pages/");
        const componentPath = isPages
            ? "../components/submit-document-modal.html"
            : "./components/submit-document-modal.html";

        const response = await fetch(componentPath);
        if (!response.ok) throw new Error("Failed to load modal component");

        const html = await response.text();
        document.body.insertAdjacentHTML("beforeend", html);

        initModalLogic();
        fetchRouteConfig();
        fetchDepartmentsForModal();
        
        initGlobalDragAndDrop();
    } catch (error) {
        console.error("Error loading modal:", error);
    }
}

window.openSubmitModalWithFile = function (file) {
    const modal = document.getElementById("submit-modal");
    if (!modal) return;

    modal.classList.add("active");

    const fileInput = document.getElementById("file-upload");
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    fileInput.files = dataTransfer.files;

    updateFileDisplay(file);

    setTimeout(() => {
        const titleInput = document.getElementById("doc-title-input");
        if (titleInput) titleInput.focus();
    }, 300);
};

async function fetchRouteConfig() {
    try {
        const isPages = window.location.pathname.includes("/pages/");
        const apiPath = isPages
            ? "../assets/api/get_routes.php"
            : "./assets/api/get_routes.php";

        const res = await fetch(apiPath);
        const data = await res.json();

        dynamicRoutes = {};
        data.forEach(item => {
            dynamicRoutes[item.category] = item.sequence;
        });

        const select = document.getElementById("category-select");
        select.innerHTML =
            '<option value="" disabled selected>Select category</option>';

        Object.keys(dynamicRoutes).forEach(cat => {
            const opt = document.createElement("option");
            opt.value = cat;
            opt.innerText = cat;
            select.appendChild(opt);
        });
    } catch (err) {
        console.error("Route Error:", err);
    }
}

async function fetchDepartmentsForModal() {
    try {
        const isPages = window.location.pathname.includes("/pages/");
        const apiPath = isPages
            ? "../assets/api/get_departments.php"
            : "./assets/api/get_departments.php";

        const res = await fetch(apiPath);
        availableDepts = await res.json();
    } catch (err) {
        console.error("Dept Error:", err);
    }
}

function initModalLogic() {
    const modal = document.getElementById("submit-modal");
    if (!modal) return;

    let currentRoute = [];

    const listEl = document.getElementById("routing-list");
    const pathContainer = document.getElementById("path-container");
    const pathText = document.getElementById("path-text");
    const deptPopup = document.getElementById("dept-selector-popup");
    const deptListContainer = document.getElementById("dept-list-options");
    const addDeptBtn = document.getElementById("add-dept-btn");
    const fileInput = document.getElementById("file-upload");
    const fileNameLabel = document.getElementById("file-name");
    const form = document.getElementById("document-form");

    const closeModal = (e) => {
        if (e) e.preventDefault();
        modal.classList.remove("active");
        if (deptPopup) deptPopup.classList.remove("active");
        form.reset();
        updateFileDisplay(null);
        currentRoute = [];
        renderRoutes();
    };

    document.getElementById("close-submit-modal").onclick = closeModal;
    document.getElementById("cancel-submit-btn").onclick = closeModal;

    modal.addEventListener("click", (e) => {
        if (e.target.id === "submit-modal") {
            closeModal();
        }
    });

    function renderRoutes() {
        listEl.innerHTML = "";

        if (currentRoute.length === 0) {
            listEl.innerHTML =
                '<div class="empty-state">Select a category or add a department</div>';
            pathContainer.style.display = "none";
            return;
        }

        pathContainer.style.display = "block";
        pathText.innerHTML = currentRoute
            .map((dept, i) => `<span style="font-weight:600;">${dept}</span>`)
            .join(' <i class="ri-arrow-right-s-line" style="vertical-align:middle; color:#94a3b8;"></i> ');

        currentRoute.forEach((dept, index) => {
            const item = document.createElement("div");
            item.className = "route-item";
            item.draggable = true; // Enable dragging
            item.dataset.index = index; // Store index for reordering

            item.innerHTML = `
                <div class="route-info">
                    <span class="step-number">${index + 1}</span>
                    <span class="dept-name">${dept}</span>
                </div>
                <i class="ri-close-line remove-dept"></i>
            `;
            
            item.querySelector(".remove-dept").onclick = () => {
                currentRoute.splice(index, 1);
                renderRoutes();
            };

            item.addEventListener('dragstart', (e) => {
                e.dataTransfer.setData('text/plain', index);
                item.classList.add('dragging');
            });

            item.addEventListener('dragend', () => {
                item.classList.remove('dragging');
            });

            item.addEventListener('dragover', (e) => {
                e.preventDefault();
                item.classList.add('drag-over');
            });

            item.addEventListener('dragleave', () => {
                item.classList.remove('drag-over');
            });

            item.addEventListener('drop', (e) => {
                e.preventDefault();
                item.classList.remove('drag-over');
                const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
                const toIndex = index;

                if (fromIndex !== toIndex) {
                    const [movedItem] = currentRoute.splice(fromIndex, 1);
                    currentRoute.splice(toIndex, 0, movedItem);
                    renderRoutes();
                }
            });

            listEl.appendChild(item);
        });
    }

    document
        .getElementById("category-select")
        .addEventListener("change", (e) => {
            const selected = e.target.value;
            if (dynamicRoutes[selected]) {
                currentRoute = [...dynamicRoutes[selected]];
                renderRoutes();
            }
        });

    document.getElementById("clear-route-btn").onclick = () => {
        currentRoute = [];
        renderRoutes();
    };

    function renderDepartmentList(filterText = "") {
        const container = document.getElementById("dept-list-options");
        if (!container) return;
        
        container.innerHTML = "";

        const searchTerm = filterText.toLowerCase();
        const filteredDepts = availableDepts.filter(dept => 
            dept.toLowerCase().includes(searchTerm)
        );

        if (filteredDepts.length === 0) {
            container.innerHTML = '<div style="padding:10px; color:#94a3b8; text-align:center; font-size:0.85rem;">No departments found</div>';
        } else {
            filteredDepts.forEach(dept => {
                const div = document.createElement("div");
                div.className = "dept-option";
                div.innerText = dept;
                
                div.onclick = () => {
                    currentRoute.push(dept);
                    renderRoutes();
                    const popup = document.getElementById("dept-selector-popup");
                    if(popup) popup.classList.remove("active");
                    
                    const searchInput = document.getElementById('dept-search-input');
                    if(searchInput) searchInput.value = ""; 
                };
                container.appendChild(div);
            });
        }
    }

    const btnAddDept = document.getElementById("add-dept-btn");
    const closeDeptPopupBtn = document.getElementById("close-dept-popup");

    if (btnAddDept && deptPopup) {
        btnAddDept.onclick = (e) => {
            e.stopPropagation();
            
            // Reset search
            const searchInput = document.getElementById('dept-search-input');
            if(searchInput) {
                searchInput.value = "";
                setTimeout(() => searchInput.focus(), 50);
            }

            renderDepartmentList("");

            deptPopup.classList.toggle("active");
        };
    }

    if (closeDeptPopupBtn && deptPopup) {
        closeDeptPopupBtn.onclick = (e) => {
            e.stopPropagation();
            deptPopup.classList.remove("active");
        }
    }

    document.addEventListener("click", (e) => {
        if (deptPopup && deptPopup.classList.contains("active")) {
            if (!deptPopup.contains(e.target) && e.target !== btnAddDept) {
                deptPopup.classList.remove("active");
            }
        }
    });

    const deptSearchInput = document.getElementById('dept-search-input');
    if (deptSearchInput) {
        deptSearchInput.addEventListener('input', (e) => {
            renderDepartmentList(e.target.value);
        });
        deptSearchInput.addEventListener('click', (e) => e.stopPropagation());
    }

    if (fileInput) {
        fileInput.addEventListener("change", function () {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                const maxSize = 25 * 1024 * 1024;

                if (file.type !== "application/pdf") {
                    showToast("System exclusively accepts PDF files.", "error");
                    this.value = "";
                    updateFileDisplay(null);
                    return;
                }

                if (file.size > maxSize) {
                    const errorMsg = `File exceeds 25 MB limit. <a href="https://www.ilovepdf.com/compress_pdf" target="_blank">Compress it here</a> then try again.`;
                    
                    showToast(errorMsg, "error");
                    
                    this.value = "";
                    updateFileDisplay(null);
                    return;
                }

                updateFileDisplay(file);
            }
        });
    }

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const submitBtn = document.getElementById("final-submit-btn");
        const originalText = submitBtn.innerText;
        submitBtn.disabled = true;
        submitBtn.innerText = "Saving...";

        if (!fileInput.files[0]) {
            showToast("Please select a PDF file", "error");
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
            return;
        }

        const title = document.getElementById("doc-title-input").value;
        const category = document.getElementById("category-select").value;
        const description = document.getElementById("doc-desc-input").value;
        const currentUser =
            JSON.parse(localStorage.getItem("currentUser")) || {
                name: "Unknown",
                role: "Guest",
                dept: "Unknown",
            };

        const docId =
            "DOC-" + (Math.floor(Math.random() * 90000) + 10000);

        const formData = new FormData();
        formData.append("id", docId);
        formData.append("title", title);
        formData.append("description", description);
        formData.append("dept", currentUser.dept || "OCM");
        formData.append("category", category);
        formData.append("route_sequence", JSON.stringify(currentRoute));
        formData.append("assignee", currentRoute[0] || "Unassigned");
        formData.append("pdf_file", fileInput.files[0]);
        formData.append(
            "timeline_data",
            JSON.stringify({
                user: currentUser.name,
                role: currentUser.role,
                action: "Document Created",
                details: "Uploaded via Drag & Drop or File Picker",
            })
        );

        try {
            const isPages = window.location.pathname.includes("/pages/");
            const apiPath = isPages
                ? "../assets/api/save_document.php"
                : "./assets/api/save_document.php";

            const response = await fetch(apiPath, {
                method: "POST",
                body: formData,
            });
            const result = await response.json();

            if (result.success) {
                showToast(`Document submitted successfully • ${docId}`, "success");

                // Close the modal
                const modal = document.getElementById("submit-modal");
                if (modal) modal.classList.remove("active");

                // Reset the form
                form.reset();
                
                // Clear file display
                updateFileDisplay(null);
                
                // Reset route display
                currentRoute = [];
                const routeList = document.getElementById("routing-list");
                if (routeList) routeList.innerHTML = '';

                if (typeof window.loadDashboardData === "function") window.loadDashboardData();
                if (typeof window.fetchDocuments === "function") window.fetchDocuments();
            } else {
                showToast(result.message || "Submission failed", "error");
            }
        } catch (error) {
            console.error("Submit Error:", error);
            showToast("Connection error. Please try again.", "error");
        } finally {
            submitBtn.disabled = false;
            submitBtn.innerText = originalText;
        }
    });
}