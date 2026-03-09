// Equipment Inventory Manager with Advanced Features
class InventoryManager {
    constructor() {
        this.inventory = [];
        this.currentStep = 1;
        this.totalSteps = 4;
        this.editingIndex = null;
        this.filteredData = [];
        this.customColumns = [];
        this.cameraStream = null;
        this.currentListName = '';
        this.savedLists = {};
        
        this.defaultColumns = [
            'serialNumber', 'equipment', 'location', 'swl', 'yom', 'condition',
            'useHours', 'lastService', 'thisService', 'time', 'pass', 'strapKitDue', 'notes'
        ];
        
        this.columnLabels = {
            serialNumber: 'Serial Number',
            equipment: 'Equipment',
            location: 'Location',
            swl: 'S.W.L',
            yom: 'Y.O.M',
            condition: 'Condition',
            useHours: 'Use (Hours)',
            lastService: 'Last Service',
            thisService: 'This Service',
            time: 'Time',
            pass: 'Pass',
            strapKitDue: 'Strap Kit Due',
            notes: 'Notes'
        };
        
        this.init();
        this.loadAllLists();
    }

    init() {
        console.log('Initializing InventoryManager...');
        
        // Landing page buttons - with extra protection
        const createBtn = document.getElementById('createNewBtn');
        const viewBtn = document.getElementById('viewExistingBtn');
        const importBtn = document.getElementById('importDataBtn');
        
        if (createBtn) {
            console.log('Create button found');
            createBtn.addEventListener('click', (e) => {
                console.log('Create clicked');
                e.stopPropagation();
                this.createNewList();
            });
        }
        
        if (viewBtn) {
            console.log('View button found');
            viewBtn.addEventListener('click', (e) => {
                console.log('View clicked');
                e.stopPropagation();
                this.viewExisting();
            });
        }
        
        if (importBtn) {
            console.log('Import button found');
            importBtn.addEventListener('click', (e) => {
                console.log('Import clicked');
                e.stopPropagation();
                document.getElementById('landingImportFile').click();
            });
        }
        
        // Landing page imports
        const landingImportFile = document.getElementById('landingImportFile');
        if (landingImportFile) {
            landingImportFile.addEventListener('change', (e) => {
                console.log('File selected');
                this.importFile(e);
                this.showMainApp();
            });
        }

        // Return home button
        const returnHomeBtn = document.getElementById('returnHomeBtn');
        if (returnHomeBtn) {
            returnHomeBtn.addEventListener('click', () => this.returnToHome());
        }

        // Photo buttons
        const openCameraBtn = document.getElementById('openCameraBtn');
        const uploadPhotoBtn = document.getElementById('uploadPhotoBtn');
        const photoUpload = document.getElementById('photoUpload');
        
        if (openCameraBtn) {
            openCameraBtn.addEventListener('click', () => this.openCamera());
        }
        if (uploadPhotoBtn) {
            uploadPhotoBtn.addEventListener('click', () => {
                document.getElementById('photoUpload').click();
            });
        }
        if (photoUpload) {
            photoUpload.addEventListener('change', (e) => this.uploadPhoto(e));
        }

        // Camera modal buttons
        const closeCameraBtn = document.getElementById('closeCameraBtn');
        const capturePhotoBtn = document.getElementById('capturePhotoBtn');
        const cancelCameraBtn = document.getElementById('cancelCameraBtn');
        
        if (closeCameraBtn) closeCameraBtn.addEventListener('click', () => this.closeCamera());
        if (capturePhotoBtn) capturePhotoBtn.addEventListener('click', () => this.capturePhoto());
        if (cancelCameraBtn) cancelCameraBtn.addEventListener('click', () => this.closeCamera());

        // Column management buttons
        const addColumnBtn = document.getElementById('addColumnBtn');
        const backToListBtn = document.getElementById('backToListBtn');
        
        if (addColumnBtn) addColumnBtn.addEventListener('click', () => this.addCustomColumn());
        if (backToListBtn) backToListBtn.addEventListener('click', () => this.switchView('list'));

        // Back to landing from saved lists
        const backToLandingBtn = document.getElementById('backToLandingBtn');
        if (backToLandingBtn) {
            backToLandingBtn.addEventListener('click', () => this.showLandingCards());
        }

        // Navigation
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchView(btn.dataset.view));
        });

        // List View Controls
        document.getElementById('searchBtn').addEventListener('click', () => this.search());
        document.getElementById('clearSearch').addEventListener('click', () => this.clearSearch());
        document.getElementById('searchInput').addEventListener('keyup', (e) => {
            if (e.key === 'Enter') this.search();
        });

        // Import/Export
        document.getElementById('importBtn').addEventListener('click', () => {
            document.getElementById('importFile').click();
        });
        document.getElementById('importFile').addEventListener('change', (e) => this.importFile(e));
        document.getElementById('exportCSV').addEventListener('click', () => this.exportCSV());
        document.getElementById('exportExcel').addEventListener('click', () => this.exportExcel());

        // Form Navigation
        document.getElementById('nextBtn').addEventListener('click', () => this.nextStep());
        document.getElementById('prevBtn').addEventListener('click', () => this.prevStep());
        document.getElementById('submitBtn').addEventListener('click', (e) => {
            e.preventDefault();
            this.saveItem();
        });
        document.getElementById('cancelBtn').addEventListener('click', () => {
            this.switchView('list');
            this.resetForm();
        });

        // Pivot Table
        document.getElementById('refreshPivot').addEventListener('click', () => this.generatePivotTable());
        document.getElementById('exportPivotCSV').addEventListener('click', () => this.exportPivotCSV());
        document.getElementById('pivotGroupBy').addEventListener('change', () => this.generatePivotTable());

        // Location Title
        document.getElementById('locationTitle').addEventListener('change', () => this.saveToStorage());
        
        console.log('Initialization complete');
    }

    // Landing Page Functions
    createNewList() {
        console.log('createNewList called');
        
        // Prompt for new list name
        const newListName = prompt('Enter a name for your new list:', 'New List ' + new Date().toLocaleDateString());
        
        if (!newListName) {
            return; // User cancelled
        }
        
        // Check if list already exists
        if (this.savedLists[newListName]) {
            if (!confirm(`A list named "${newListName}" already exists. Open it instead?`)) {
                return;
            }
            this.loadList(newListName);
            return;
        }
        
        // Create new empty list
        this.currentListName = newListName;
        this.inventory = [];
        this.customColumns = [];
        document.getElementById('locationTitle').value = newListName;
        
        // Save the new empty list
        this.saveToStorage();
        this.showMainApp();
    }

    viewExisting() {
        console.log('viewExisting called');
        this.loadAllLists();
        
        if (Object.keys(this.savedLists).length === 0) {
            alert('No saved lists found. Please create a new list or import data.');
            return;
        }
        
        // Show saved lists
        this.showSavedLists();
    }

    showSavedLists() {
        const container = document.getElementById('savedListsContainer');
        const lists = Object.keys(this.savedLists);
        
        container.innerHTML = lists.map(listName => {
            const list = this.savedLists[listName];
            return `
                <div class="saved-list-card" data-list-name="${listName}" style="cursor: pointer; padding: 20px; margin: 10px 0; background: var(--bg-color); border-radius: 10px; border: 2px solid var(--border-color); transition: all 0.2s;">
                    <h3 style="margin: 0 0 10px 0; color: var(--primary-color);">${listName}</h3>
                    <p style="margin: 0; color: var(--text-secondary); font-size: 14px;">
                        ${list.inventory.length} items • Last updated: ${new Date(list.lastModified).toLocaleDateString()}
                    </p>
                    <div style="margin-top: 15px; display: flex; gap: 10px;">
                        <button class="btn btn-primary btn-sm open-list-btn" data-list-name="${listName}">Open</button>
                        <button class="btn btn-danger btn-sm delete-list-btn" data-list-name="${listName}">Delete</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Show saved lists section
        document.querySelector('.landing-cards').style.display = 'none';
        document.querySelector('.landing-footer').style.display = 'none';
        document.getElementById('savedListsSection').style.display = 'block';
        
        // Add event listeners
        container.querySelectorAll('.open-list-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const listName = btn.getAttribute('data-list-name');
                this.loadList(listName);
            });
        });
        
        container.querySelectorAll('.delete-list-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const listName = btn.getAttribute('data-list-name');
                this.deleteList(listName);
            });
        });
    }

    showLandingCards() {
        document.querySelector('.landing-cards').style.display = 'grid';
        document.querySelector('.landing-footer').style.display = 'block';
        document.getElementById('savedListsSection').style.display = 'none';
    }

    loadList(listName) {
        console.log('Loading list:', listName);
        
        // Reload all lists first to get latest data
        this.loadAllLists();
        
        const list = this.savedLists[listName];
        if (list) {
            this.currentListName = listName;
            this.inventory = JSON.parse(JSON.stringify(list.inventory || [])); // Deep copy
            this.customColumns = JSON.parse(JSON.stringify(list.customColumns || [])); // Deep copy
            document.getElementById('locationTitle').value = listName;
            console.log('Loaded inventory:', this.inventory.length, 'items');
            this.showMainApp();
        } else {
            alert('List not found!');
            console.error('List not found:', listName, 'Available lists:', Object.keys(this.savedLists));
        }
    }

    deleteList(listName) {
        if (confirm(`Delete list "${listName}"? This cannot be undone.`)) {
            delete this.savedLists[listName];
            localStorage.setItem('inventoryLists', JSON.stringify(this.savedLists));
            this.showSavedLists();
        }
    }

    showMainApp() {
        console.log('showMainApp called');
        document.getElementById('landingPage').classList.remove('active');
        document.getElementById('mainApp').style.display = 'block';
        
        // If no list name set, prompt for one
        if (!this.currentListName) {
            const listName = document.getElementById('locationTitle').value || 'New List';
            this.currentListName = listName;
        }
        
        this.renderTable();
        this.updateStats();
    }

    returnToHome() {
        // Save current list before leaving
        if (this.inventory.length > 0 || this.currentListName) {
            console.log('Saving current list before returning home:', this.currentListName);
            this.saveToStorage();
        }
        
        if (confirm('Return to home page? Your data is saved.')) {
            document.getElementById('mainApp').style.display = 'none';
            document.getElementById('landingPage').classList.add('active');
            this.showLandingCards();
        }
    }

    // Custom Columns Management
    addCustomColumn() {
        const columnName = document.getElementById('newColumnName').value.trim();
        if (!columnName) {
            alert('Please enter a column name');
            return;
        }

        const columnKey = columnName.toLowerCase().replace(/\s+/g, '_');
        
        if (this.customColumns.some(col => col.key === columnKey)) {
            alert('This column already exists');
            return;
        }

        this.customColumns.push({
            key: columnKey,
            label: columnName
        });

        document.getElementById('newColumnName').value = '';
        this.renderCustomColumnsList();
        this.renderCustomFieldsInForm();
        this.saveToStorage();
        this.renderTable();
        
        alert(`Column "${columnName}" added successfully!`);
    }

    removeCustomColumn(columnKey) {
        if (confirm('Remove this column? Data in this column will be deleted.')) {
            this.customColumns = this.customColumns.filter(col => col.key !== columnKey);
            
            // Remove data from inventory
            this.inventory.forEach(item => {
                delete item[columnKey];
            });
            
            this.renderCustomColumnsList();
            this.renderCustomFieldsInForm();
            this.saveToStorage();
            this.renderTable();
        }
    }

    renderCustomColumnsList() {
        const container = document.getElementById('customColumnsList');
        if (this.customColumns.length === 0) {
            container.innerHTML = '<p style="color: var(--text-secondary); font-style: italic;">No custom columns yet</p>';
            return;
        }

        container.innerHTML = this.customColumns.map(col => `
            <span class="custom-column-tag">
                ${col.label}
                <span class="remove-column" data-column-key="${col.key}">✕</span>
            </span>
        `).join('');
        
        // Add event listeners for remove buttons
        container.querySelectorAll('.remove-column').forEach(btn => {
            btn.addEventListener('click', () => {
                const columnKey = btn.getAttribute('data-column-key');
                this.removeCustomColumn(columnKey);
            });
        });
    }

    renderCustomFieldsInForm() {
        const container = document.getElementById('customFieldsContainer');
        if (this.customColumns.length === 0) {
            container.innerHTML = '';
            return;
        }

        container.innerHTML = '<hr style="margin: 20px 0; border: 1px solid var(--border-color);">' +
            this.customColumns.map(col => `
            <div class="form-group">
                <label for="custom_${col.key}">${col.label}</label>
                <input type="text" id="custom_${col.key}" placeholder="Enter ${col.label.toLowerCase()}">
            </div>
        `).join('');
    }

    // Photo Capture & OCR
    openCamera() {
        const modal = document.getElementById('cameraModal');
        const video = document.getElementById('cameraVideo');

        navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } 
        })
        .then(stream => {
            this.cameraStream = stream;
            video.srcObject = stream;
            modal.classList.add('active');
        })
        .catch(err => {
            alert('Camera access denied or not available: ' + err.message);
            console.error('Camera error:', err);
        });
    }

    closeCamera() {
        if (this.cameraStream) {
            this.cameraStream.getTracks().forEach(track => track.stop());
            this.cameraStream = null;
        }
        document.getElementById('cameraModal').classList.remove('active');
    }

    capturePhoto() {
        const video = document.getElementById('cameraVideo');
        const canvas = document.getElementById('cameraCanvas');
        const context = canvas.getContext('2d');

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        context.drawImage(video, 0, 0);

        canvas.toBlob(blob => {
            this.processPhoto(blob);
            this.closeCamera();
        }, 'image/jpeg', 0.8);
    }

    uploadPhoto(event) {
        const file = event.target.files[0];
        if (!file) return;
        this.processPhoto(file);
    }

    async processPhoto(imageBlob) {
        const previewDiv = document.getElementById('photoPreview');
        
        // Show preview
        const img = document.createElement('img');
        img.src = URL.createObjectURL(imageBlob);
        previewDiv.innerHTML = '';
        previewDiv.appendChild(img);

        // Show processing message
        const processingDiv = document.createElement('div');
        processingDiv.className = 'ocr-result';
        processingDiv.innerHTML = '<h4>🔍 Processing image...</h4><p>Extracting text from photo...</p>';
        previewDiv.appendChild(processingDiv);

        try {
            // Use Tesseract.js for OCR
            const result = await Tesseract.recognize(
                imageBlob,
                'eng',
                {
                    logger: m => {
                        if (m.status === 'recognizing text') {
                            processingDiv.innerHTML = `<h4>🔍 Processing image...</h4><p>Progress: ${Math.round(m.progress * 100)}%</p>`;
                        }
                    }
                }
            );

            const text = result.data.text;
            
            // Try to extract useful information
            const extractedData = this.extractDataFromText(text);
            
            // Display results
            const dataJson = JSON.stringify(extractedData);
            processingDiv.innerHTML = `
                <h4>✅ Text Extracted Successfully!</h4>
                <p><strong>Detected:</strong></p>
                <pre>${text.substring(0, 500)}${text.length > 500 ? '...' : ''}</pre>
                <button class="btn btn-success" id="applyExtractedBtn">
                    ✓ Apply Detected Information
                </button>
            `;
            
            // Add event listener for apply button
            document.getElementById('applyExtractedBtn').addEventListener('click', () => {
                this.applyExtractedData(extractedData);
            });

        } catch (error) {
            processingDiv.innerHTML = `
                <h4>⚠️ Error Processing Image</h4>
                <p>Could not extract text: ${error.message}</p>
                <p><small>Try taking a clearer photo with better lighting</small></p>
            `;
            console.error('OCR error:', error);
        }
    }

    extractDataFromText(text) {
        const data = {};
        
        // Extract serial number patterns (various formats)
        const serialPatterns = [
            /serial\s*(?:number|no|#)?[\s:]*(\w+\d+)/i,
            /s\/n[\s:]*(\w+\d+)/i,
            /\b(\d{6,12})\b/  // 6-12 digit numbers
        ];
        
        for (const pattern of serialPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.serialNumber = match[1];
                break;
            }
        }

        // Extract model/equipment type
        const modelPatterns = [
            /model[\s:]*([A-Z0-9\s-]+)/i,
            /(MAXIMOVE|SARA\s*STEDY|HOIST)/i
        ];
        
        for (const pattern of modelPatterns) {
            const match = text.match(pattern);
            if (match) {
                data.equipment = match[1].trim();
                break;
            }
        }

        // Extract weight/SWL
        const weightMatch = text.match(/(\d+)\s*kg/i);
        if (weightMatch) {
            data.swl = weightMatch[1] + ' KG';
        }

        // Extract year
        const yearMatch = text.match(/\b(20\d{2})\b/);
        if (yearMatch) {
            data.yom = yearMatch[1];
        }

        return data;
    }

    applyExtractedData(data) {
        if (data.serialNumber) document.getElementById('serialNumber').value = data.serialNumber;
        if (data.equipment) document.getElementById('equipment').value = data.equipment;
        if (data.swl) document.getElementById('swl').value = data.swl;
        if (data.yom) document.getElementById('yom').value = data.yom;
        
        alert('Information applied! Please verify and complete remaining fields.');
    }

    // Form Step Navigation
    nextStep() {
        const currentStepElement = document.querySelector(`.form-step[data-step="${this.currentStep}"]`);
        const requiredInputs = currentStepElement.querySelectorAll('[required]');
        let isValid = true;

        // Only validate required fields on step 1 if creating new item
        // When editing, allow skipping through steps even with empty required fields
        if (this.currentStep === 1 || this.editingIndex === null) {
            requiredInputs.forEach(input => {
                if (!input.value.trim()) {
                    input.style.borderColor = 'var(--danger-color)';
                    isValid = false;
                } else {
                    input.style.borderColor = 'var(--border-color)';
                }
            });

            if (!isValid && this.editingIndex === null) {
                alert('Please fill in all required fields marked with *');
                return;
            }
        }

        if (this.currentStep < this.totalSteps) {
            this.currentStep++;
            this.updateFormSteps();
        }
    }

    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateFormSteps();
        }
    }

    updateFormSteps() {
        document.querySelectorAll('.form-step').forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
        });

        document.getElementById('prevBtn').style.display = this.currentStep === 1 ? 'none' : 'block';
        document.getElementById('nextBtn').style.display = this.currentStep === this.totalSteps ? 'none' : 'block';
        document.getElementById('submitBtn').style.display = this.currentStep === this.totalSteps ? 'block' : 'none';
    }

    resetForm() {
        document.getElementById('itemForm').reset();
        document.getElementById('editIndex').value = '';
        document.getElementById('formTitle').textContent = 'Add New Item';
        document.getElementById('photoPreview').innerHTML = '';
        this.currentStep = 1;
        this.editingIndex = null;
        this.updateFormSteps();
    }

    // CRUD Operations
    saveItem() {
        const item = {
            serialNumber: document.getElementById('serialNumber').value,
            equipment: document.getElementById('equipment').value,
            location: document.getElementById('location').value,
            swl: document.getElementById('swl').value,
            yom: document.getElementById('yom').value,
            condition: document.getElementById('condition').value,
            useHours: document.getElementById('useHours').value,
            lastService: document.getElementById('lastService').value,
            thisService: document.getElementById('thisService').value,
            time: document.getElementById('time').value,
            pass: document.getElementById('pass').value,
            strapKitDue: document.getElementById('strapKitDue').value,
            notes: document.getElementById('notes').value
        };

        // Add custom columns
        this.customColumns.forEach(col => {
            const input = document.getElementById('custom_' + col.key);
            if (input) {
                item[col.key] = input.value;
            }
        });

        if (this.editingIndex !== null) {
            this.inventory[this.editingIndex] = item;
            this.editingIndex = null;
        } else {
            this.inventory.push(item);
        }

        this.saveToStorage();
        this.renderTable();
        this.updateStats();
        this.switchView('list');
        this.resetForm();
    }

    editItem(index) {
        const item = this.inventory[index];
        this.editingIndex = index;

        console.log('Editing item:', item);

        // Switch to add view first
        this.switchView('add');
        
        // Reset to first step
        this.currentStep = 1;
        this.updateFormSteps();
        
        // Render custom fields BEFORE filling values
        this.renderCustomFieldsInForm();
        
        // Use setTimeout to ensure DOM is updated
        setTimeout(() => {
            // Fill default fields
            document.getElementById('serialNumber').value = item.serialNumber || '';
            document.getElementById('equipment').value = item.equipment || '';
            document.getElementById('location').value = item.location || '';
            document.getElementById('swl').value = item.swl || '';
            document.getElementById('yom').value = item.yom || '';
            document.getElementById('condition').value = item.condition || '';
            document.getElementById('useHours').value = item.useHours || '';
            document.getElementById('lastService').value = item.lastService || '';
            document.getElementById('thisService').value = item.thisService || '';
            document.getElementById('time').value = item.time || '';
            document.getElementById('pass').value = item.pass || '';
            document.getElementById('strapKitDue').value = item.strapKitDue || '';
            document.getElementById('notes').value = item.notes || '';

            // Fill custom fields
            this.customColumns.forEach(col => {
                const input = document.getElementById('custom_' + col.key);
                if (input) {
                    input.value = item[col.key] || '';
                    console.log('Filled custom field:', col.key, '=', item[col.key]);
                } else {
                    console.warn('Custom field not found:', 'custom_' + col.key);
                }
            });

            document.getElementById('formTitle').textContent = 'Edit Item';
            console.log('Edit form filled successfully');
        }, 50);
    }

    deleteItem(index) {
        if (confirm('Are you sure you want to delete this item?')) {
            this.inventory.splice(index, 1);
            this.saveToStorage();
            this.renderTable();
            this.updateStats();
        }
    }

    switchView(view) {
        document.querySelectorAll('.nav-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === view);
        });

        document.querySelectorAll('.view').forEach(v => {
            v.classList.remove('active');
        });
        document.getElementById(view + 'View').classList.add('active');

        if (view === 'add') {
            // Don't reset form if we're editing
            if (this.editingIndex === null) {
                this.resetForm();
            }
            this.renderCustomFieldsInForm();
        } else if (view === 'pivot') {
            this.generatePivotTable();
        } else if (view === 'columns') {
            this.renderCustomColumnsList();
        }
    }

    // Search Functionality
    search() {
        const query = document.getElementById('searchInput').value.toLowerCase();
        if (!query) {
            this.clearSearch();
            return;
        }

        this.filteredData = this.inventory.filter(item => {
            return Object.values(item).some(value => 
                value && value.toString().toLowerCase().includes(query)
            );
        });

        this.renderTable(this.filteredData);
        document.getElementById('clearSearch').style.display = 'block';
    }

    clearSearch() {
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearch').style.display = 'none';
        this.filteredData = [];
        this.renderTable();
    }

    // Render Table
    renderTable(data = null) {
        const wrapper = document.getElementById('tableWrapper');
        const dataToRender = data || this.inventory;

        const allColumns = [...this.defaultColumns, ...this.customColumns.map(col => col.key)];

        if (dataToRender.length === 0) {
            wrapper.innerHTML = `
                <table id="inventoryTable">
                    <tbody>
                        <tr class="empty-state">
                            <td colspan="20">
                                <div class="empty-message">
                                    <p>📦 ${data ? 'No items match your search' : 'No items yet'}</p>
                                    <p>${data ? 'Try a different search term' : 'Add your first item or import existing data'}</p>
                                </div>
                            </td>
                        </tr>
                    </tbody>
                </table>
            `;
            return;
        }

        const headers = allColumns.map(key => {
            const customCol = this.customColumns.find(col => col.key === key);
            return customCol ? customCol.label : this.columnLabels[key];
        });

        const tableHTML = `
            <table id="inventoryTable">
                <thead>
                    <tr>
                        ${headers.map(h => `<th>${h}</th>`).join('')}
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${dataToRender.map((item, index) => {
                        const originalIndex = data ? this.inventory.indexOf(item) : index;
                        return `
                            <tr data-index="${originalIndex}" class="table-row-clickable" style="cursor: pointer;">
                                ${allColumns.map(key => {
                                    let value = item[key] || '';
                                    if (key === 'lastService' || key === 'thisService') {
                                        value = this.formatDate(value);
                                    } else if (key === 'yom' && value) {
                                        // Display just the year from the date
                                        const match = value.match(/^(\d{4})/);
                                        if (match) {
                                            value = match[1];
                                        }
                                    }
                                    return `<td>${this.escapeHtml(value)}</td>`;
                                }).join('')}
                                <td>
                                    <button class="btn btn-edit" data-action="edit" data-index="${originalIndex}">✏️ Edit</button>
                                    <button class="btn btn-danger" data-action="delete" data-index="${originalIndex}">🗑️</button>
                                </td>
                            </tr>
                        `;
                    }).join('')}
                </tbody>
            </table>
        `;

        wrapper.innerHTML = tableHTML;
        this.updateLocationList();
        
        // Add event listeners for row clicks (excluding action buttons)
        wrapper.querySelectorAll('.table-row-clickable').forEach(row => {
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on buttons
                if (!e.target.closest('button')) {
                    const index = parseInt(row.getAttribute('data-index'));
                    this.editItem(index);
                }
            });
        });
        
        // Add event listeners for dynamically created buttons
        wrapper.querySelectorAll('[data-action="edit"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                this.editItem(index);
            });
        });
        
        wrapper.querySelectorAll('[data-action="delete"]').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const index = parseInt(btn.getAttribute('data-index'));
                this.deleteItem(index);
            });
        });
    }

    formatDate(dateStr) {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        if (isNaN(date.getTime())) return dateStr;
        return date.toLocaleDateString('en-GB');
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    updateLocationList() {
        const locations = [...new Set(this.inventory.map(item => item.location).filter(Boolean))];
        const datalist = document.getElementById('locationList');
        datalist.innerHTML = locations.map(loc => `<option value="${loc}">`).join('');
    }

    // Statistics
    updateStats() {
        const totalItems = this.inventory.length;
        const locations = new Set(this.inventory.map(item => item.location).filter(Boolean));
        const equipment = new Set(this.inventory.map(item => item.equipment).filter(Boolean));

        document.getElementById('totalItems').textContent = totalItems;
        document.getElementById('totalLocations').textContent = locations.size;
        document.getElementById('totalEquipment').textContent = equipment.size;
    }

    // Pivot Table
    generatePivotTable() {
        const groupBy = document.getElementById('pivotGroupBy').value;
        const container = document.getElementById('pivotTableContainer');

        const groups = {};
        this.inventory.forEach(item => {
            const key = item[groupBy] || 'Unspecified';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        let html = '';
        Object.keys(groups).sort().forEach(key => {
            html += `
                <div class="pivot-group">
                    <div class="pivot-header">
                        <span>${key}</span>
                        <span class="pivot-count">${groups[key].length} items</span>
                    </div>
                    <div class="pivot-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Serial Number</th>
                                    <th>Equipment</th>
                                    <th>Location</th>
                                    <th>Condition</th>
                                    <th>Last Service</th>
                                    <th>Pass</th>
                                </tr>
                            </thead>
                            <tbody>
                                ${groups[key].map(item => `
                                    <tr>
                                        <td>${this.escapeHtml(item.serialNumber || '')}</td>
                                        <td>${this.escapeHtml(item.equipment || '')}</td>
                                        <td>${this.escapeHtml(item.location || '')}</td>
                                        <td>${this.escapeHtml(item.condition || '')}</td>
                                        <td>${this.formatDate(item.lastService)}</td>
                                        <td>${item.pass || ''}</td>
                                    </tr>
                                `).join('')}
                            </tbody>
                        </table>
                    </div>
                </div>
            `;
        });

        container.innerHTML = html || '<p style="text-align:center; padding:40px; color:var(--text-secondary);">No data to display</p>';
    }

    // Import/Export
    importFile(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        
        if (file.name.endsWith('.csv')) {
            reader.onload = (e) => this.parseCSV(e.target.result);
            reader.readAsText(file);
        } else if (file.name.endsWith('.numbers')) {
            // .numbers files are zip archives
            reader.onload = (e) => this.parseNumbers(e.target.result, file.name);
            reader.readAsArrayBuffer(file);
        } else {
            // Excel files (.xlsx, .xls)
            reader.onload = (e) => this.parseExcel(e.target.result);
            reader.readAsArrayBuffer(file);
        }
    }

    parseNumbers(data, filename) {
        try {
            // Try to parse as Excel first (SheetJS can sometimes handle .numbers)
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length < 2) {
                alert('Numbers file appears empty or could not be read. Try exporting it as Excel (.xlsx) or CSV first.');
                return;
            }

            this.processImportedData(jsonData);
        } catch (error) {
            console.error('Numbers import error:', error);
            alert('Could not import .numbers file directly. Please export it as Excel (.xlsx) or CSV and try again.');
        }
    }

    processImportedData(jsonData) {
        if (jsonData.length < 2) {
            alert('File appears empty. Please check the file and try again.');
            return;
        }

        console.log('Import data preview:', jsonData.slice(0, 3));

        // Find the header row by looking for column-like data
        let headerRowIndex = -1;
        const commonHeaders = ['serial', 'equipment', 'location', 'number', 'swl', 'condition', 'pass'];
        
        for (let i = 0; i < Math.min(10, jsonData.length); i++) {
            const row = jsonData[i];
            if (row && row.length > 2) {
                const rowText = row.join(' ').toLowerCase();
                const matchCount = commonHeaders.filter(h => rowText.includes(h)).length;
                if (matchCount >= 2) {
                    headerRowIndex = i;
                    console.log('Found header row at index:', i, '- Row:', row);
                    break;
                }
            }
        }

        if (headerRowIndex === -1) {
            console.log('No clear header found, using first non-empty row');
            // Find first non-empty row
            for (let i = 0; i < Math.min(5, jsonData.length); i++) {
                if (jsonData[i] && jsonData[i].some(cell => cell && String(cell).trim())) {
                    headerRowIndex = i;
                    break;
                }
            }
        }

        const headers = jsonData[headerRowIndex];
        console.log('Using headers:', headers);
        
        // Create smart column mapping
        const columnMapping = this.createSmartColumnMapping(headers);
        console.log('Column mapping:', columnMapping);
        
        const newItems = [];

        // Process data rows
        for (let i = headerRowIndex + 1; i < jsonData.length; i++) {
            const row = jsonData[i];
            
            // Skip completely empty rows
            if (!row || row.every(cell => !cell || String(cell).trim() === '')) {
                continue;
            }
            
            const item = {};
            let hasValidData = false;

            // Map each column to the correct field
            Object.keys(columnMapping).forEach(field => {
                const columnIndex = columnMapping[field];
                if (columnIndex !== -1 && row[columnIndex] !== undefined && row[columnIndex] !== null) {
                    let value = String(row[columnIndex]).trim();
                    
                    // Convert date fields to YYYY-MM-DD format
                    if ((field === 'lastService' || field === 'thisService') && value) {
                        value = this.convertToDateFormat(value);
                        console.log('Converted date:', row[columnIndex], '→', value);
                    }
                    
                    // Convert Y.O.M - if it's just a year (e.g., "2020"), convert to Jan 1st of that year
                    if (field === 'yom' && value) {
                        if (/^\d{4}$/.test(value)) {
                            // Just a year like "2020"
                            value = `${value}-01-01`;
                            console.log('Converted YOM year to date:', row[columnIndex], '→', value);
                        } else {
                            // Try to parse as date
                            value = this.convertToDateFormat(value);
                        }
                    }
                    
                    // Convert pass/fail symbols
                    if (field === 'pass' && value) {
                        if (value.includes('✓') || value.includes('✔') || value.toLowerCase() === 'pass') {
                            value = '✔️';
                        } else if (value.includes('✗') || value.includes('❌') || value.toLowerCase() === 'fail') {
                            value = '❌';
                        }
                    }
                    
                    if (value) {
                        item[field] = value;
                        hasValidData = true;
                    }
                }
            });

            // Only add items that have at least one key field
            if (hasValidData && (item.serialNumber || item.equipment || item.location)) {
                newItems.push(item);
                console.log('Added item:', item);
            }
        }

        if (newItems.length > 0) {
            console.log('Found items:', newItems);
            if (confirm(`Found ${newItems.length} items to import.\n\nPreview:\n${this.getImportPreview(newItems)}\n\nAdd to current list?`)) {
                // Add items to current inventory
                this.inventory.push(...newItems);
                
                // Save immediately
                this.saveToStorage();
                
                // Re-render table
                this.renderTable();
                this.updateStats();
                
                console.log('After import - inventory has', this.inventory.length, 'items');
                alert(`✅ Successfully imported ${newItems.length} items!`);
            }
        } else {
            alert('❌ No valid items found in file.\n\nTips:\n• Make sure there\'s a row with column names like "Serial Number", "Equipment", "Location"\n• Data should be in rows below the column names\n• At least one of: Serial Number, Equipment, or Location should have data');
        }
    }

    createSmartColumnMapping(headers) {
        // Map detected columns to our fields
        const mapping = {
            serialNumber: -1,
            equipment: -1,
            location: -1,
            swl: -1,
            yom: -1,
            condition: -1,
            useHours: -1,
            lastService: -1,
            thisService: -1,
            time: -1,
            pass: -1,
            strapKitDue: -1,
            notes: -1
        };

        headers.forEach((header, index) => {
            if (!header) return;
            const headerLower = String(header).toLowerCase().trim();
            
            // Serial Number variations
            if (headerLower.includes('serial') || headerLower.includes('s/n') || headerLower.includes('number') && !headerLower.includes('equipment')) {
                mapping.serialNumber = index;
            }
            // Equipment variations
            else if (headerLower.includes('equipment') || headerLower.includes('type') || headerLower.includes('model')) {
                mapping.equipment = index;
            }
            // Location variations
            else if (headerLower.includes('location') || headerLower.includes('ward') || headerLower.includes('area') || headerLower.includes('floor')) {
                mapping.location = index;
            }
            // S.W.L variations
            else if (headerLower.includes('swl') || headerLower.includes('s.w.l') || headerLower.includes('safe working load') || headerLower.includes('weight')) {
                mapping.swl = index;
            }
            // Y.O.M variations - can be year or date
            else if (headerLower.includes('yom') || headerLower.includes('y.o.m') || headerLower.includes('year') || headerLower.includes('manufacture')) {
                mapping.yom = index;
            }
            // Condition
            else if (headerLower.includes('condition') || headerLower.includes('cond') || headerLower.includes('state')) {
                mapping.condition = index;
            }
            // Use Hours
            else if (headerLower.includes('use') || headerLower.includes('hour') || headerLower.includes('usage')) {
                mapping.useHours = index;
            }
            // Last Service
            else if (headerLower.includes('last') && (headerLower.includes('service') || headerLower.includes('date'))) {
                mapping.lastService = index;
            }
            // This Service
            else if (headerLower.includes('this') && (headerLower.includes('service') || headerLower.includes('date'))) {
                mapping.thisService = index;
            }
            // Time
            else if (headerLower === 'time' || headerLower.includes('duration')) {
                mapping.time = index;
            }
            // Pass/Fail
            else if (headerLower.includes('pass') || headerLower.includes('test') || headerLower.includes('result')) {
                mapping.pass = index;
            }
            // Strap Kit Due
            else if (headerLower.includes('strap') || headerLower.includes('kit') || headerLower.includes('due')) {
                mapping.strapKitDue = index;
            }
            // Notes
            else if (headerLower.includes('note') || headerLower.includes('comment') || headerLower.includes('remark')) {
                mapping.notes = index;
            }
        });

        return mapping;
    }

    convertToDateFormat(dateStr) {
        if (!dateStr || dateStr.toString().trim() === '') return '';
        
        const str = dateStr.toString().trim();
        
        // Already in YYYY-MM-DD format
        if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
            return str;
        }
        
        // Handle M/D/YY or MM/DD/YY format (e.g., "5/11/25" or "11/25/2025")
        const match = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{2,4})$/);
        if (match) {
            let [, month, day, year] = match;
            
            // Convert 2-digit year to 4-digit
            if (year.length === 2) {
                const num = parseInt(year);
                // Assume 00-50 is 2000s, 51-99 is 1900s
                year = num <= 50 ? '20' + year : '19' + year;
            }
            
            // Pad month and day with zeros
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');
            
            return `${year}-${month}-${day}`;
        }
        
        // Handle DD/MM/YYYY format
        const match2 = str.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
        if (match2) {
            let [, day, month, year] = match2;
            month = month.padStart(2, '0');
            day = day.padStart(2, '0');
            return `${year}-${month}-${day}`;
        }
        
        // Try to parse as date object
        try {
            const date = new Date(str);
            if (!isNaN(date.getTime())) {
                const year = date.getFullYear();
                const month = String(date.getMonth() + 1).padStart(2, '0');
                const day = String(date.getDate()).padStart(2, '0');
                return `${year}-${month}-${day}`;
            }
        } catch (e) {
            console.warn('Could not parse date:', str);
        }
        
        // Return original if can't parse
        return str;
    }

    getImportPreview(items) {
        const preview = items.slice(0, 3).map(item => {
            const parts = [];
            if (item.serialNumber) parts.push(`Serial: ${item.serialNumber}`);
            if (item.equipment) parts.push(`Equipment: ${item.equipment}`);
            if (item.location) parts.push(`Location: ${item.location}`);
            return parts.join(', ');
        }).join('\n');
        
        return preview + (items.length > 3 ? `\n... and ${items.length - 3} more` : '');
    }

    parseCSV(text) {
        const lines = text.split('\n').filter(line => line.trim());
        if (lines.length < 2) {
            alert('CSV file is empty or invalid');
            return;
        }

        const headers = lines[0].split(',').map(h => h.trim());
        const newItems = [];

        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const item = {};
            
            headers.forEach((header, index) => {
                const key = this.mapHeaderToKey(header);
                item[key] = values[index] || '';
            });

            if (item.serialNumber) {
                newItems.push(item);
            }
        }

        if (confirm(`Import ${newItems.length} items? This will add to existing data.`)) {
            this.inventory.push(...newItems);
            this.saveToStorage();
            this.renderTable();
            this.updateStats();
            alert(`Successfully imported ${newItems.length} items!`);
        }
    }

    parseCSVLine(line) {
        const values = [];
        let current = '';
        let inQuotes = false;

        for (let i = 0; i < line.length; i++) {
            const char = line[i];
            if (char === '"') {
                inQuotes = !inQuotes;
            } else if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
            } else {
                current += char;
            }
        }
        values.push(current.trim());
        return values;
    }

    parseExcel(data) {
        try {
            const workbook = XLSX.read(data, { type: 'array' });
            const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
            const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

            if (jsonData.length < 2) {
                alert('Excel file is empty or invalid');
                return;
            }

            this.processImportedData(jsonData);
        } catch (error) {
            alert('Error parsing Excel file: ' + error.message);
        }
    }

    mapHeaderToKey(header) {
        const headerStr = String(header).toLowerCase().trim();
        
        // Check custom columns first
        const customCol = this.customColumns.find(col => 
            col.label.toLowerCase() === headerStr
        );
        if (customCol) return customCol.key;
        
        // Map default columns
        const mapping = {
            'serial': 'serialNumber',
            'serial number': 'serialNumber',
            'equipment': 'equipment',
            'location': 'location',
            's.w.l': 'swl',
            'swl': 'swl',
            'y.o.m': 'yom',
            'yom': 'yom',
            'condition': 'condition',
            'cond': 'condition',
            'use': 'useHours',
            'use (hours)': 'useHours',
            'last': 'lastService',
            'last service': 'lastService',
            'this': 'thisService',
            'this service': 'thisService',
            'time': 'time',
            'pass': 'pass',
            'strap kit due': 'strapKitDue',
            'notes': 'notes'
        };

        for (const [key, value] of Object.entries(mapping)) {
            if (headerStr.includes(key)) {
                return value;
            }
        }

        return 'notes';
    }

    exportCSV() {
        if (this.inventory.length === 0) {
            alert('No data to export');
            return;
        }

        const locationTitle = document.getElementById('locationTitle').value;
        const allColumns = [...this.defaultColumns, ...this.customColumns.map(col => col.key)];
        const headers = allColumns.map(key => {
            const customCol = this.customColumns.find(col => col.key === key);
            return customCol ? customCol.label : this.columnLabels[key];
        });

        let csv = locationTitle + '\n';
        csv += headers.join(',') + '\n';

        this.inventory.forEach(item => {
            const row = allColumns.map(key => {
                let value = item[key] || '';
                
                // Convert emoji symbols to text for better compatibility
                if (key === 'pass') {
                    if (value.includes('✔') || value.includes('✓')) {
                        value = 'PASS';
                    } else if (value.includes('❌') || value.includes('✗')) {
                        value = 'FAIL';
                    } else if (value.includes('⚠')) {
                        value = 'WARNING';
                    }
                }
                
                const str = String(value);
                return str.includes(',') ? `"${str}"` : str;
            });
            csv += row.join(',') + '\n';
        });

        // Create filename from list name (sanitize for file system)
        const safeFileName = (locationTitle || 'inventory').replace(/[^a-z0-9]/gi, '_').toLowerCase();
        this.downloadFile(csv, `${safeFileName}.csv`, 'text/csv;charset=utf-8;');
    }

    exportExcel() {
        if (this.inventory.length === 0) {
            alert('No data to export');
            return;
        }

        const locationTitle = document.getElementById('locationTitle').value || this.currentListName || 'Inventory';
        const allColumns = [...this.defaultColumns, ...this.customColumns.map(col => col.key)];
        const headers = allColumns.map(key => {
            const customCol = this.customColumns.find(col => col.key === key);
            return customCol ? customCol.label : this.columnLabels[key];
        });

        // Convert data and replace emojis with text
        const data = this.inventory.map(item => 
            allColumns.map(key => {
                let value = item[key] || '';
                
                // Convert emoji symbols to text for Excel compatibility
                if (key === 'pass') {
                    if (value.includes('✔') || value.includes('✓')) {
                        return 'PASS';
                    } else if (value.includes('❌') || value.includes('✗')) {
                        return 'FAIL';
                    } else if (value.includes('⚠')) {
                        return 'WARNING';
                    }
                }
                
                // Display YOM as just year in exports
                if (key === 'yom' && value) {
                    const match = value.match(/^(\d{4})/);
                    if (match) {
                        return match[1];
                    }
                }
                
                return value;
            })
        );

        // Create workbook with formatting
        const ws = XLSX.utils.aoa_to_sheet([[locationTitle], headers, ...data]);
        
        // Set column widths
        const colWidths = headers.map(h => ({ wch: Math.max(h.length + 2, 12) }));
        ws['!cols'] = colWidths;
        
        // Set row heights
        ws['!rows'] = [];
        ws['!rows'][0] = { hpt: 24 }; // Title row height
        ws['!rows'][1] = { hpt: 20 }; // Header row height
        
        // Style the title row (Row 1) - BOLD and BLUE
        const titleCell = 'A1';
        if (!ws[titleCell].s) ws[titleCell].s = {};
        ws[titleCell].s = {
            font: { 
                bold: true, 
                sz: 16,
                color: { rgb: "1F4E78" } // Dark blue color
            },
            alignment: { 
                horizontal: 'left',
                vertical: 'center'
            }
        };
        
        // Style the header row (Row 2) - BOLD and DARK GREY background
        const range = XLSX.utils.decode_range(ws['!ref']);
        for (let C = range.s.c; C <= range.e.c; ++C) {
            const cellAddress = XLSX.utils.encode_cell({ r: 1, c: C });
            if (!ws[cellAddress]) continue;
            if (!ws[cellAddress].s) ws[cellAddress].s = {};
            ws[cellAddress].s = {
                font: { 
                    bold: true,
                    color: { rgb: "FFFFFF" } // White text
                },
                fill: { 
                    fgColor: { rgb: "4472C4" } // Blue background
                },
                alignment: { 
                    horizontal: 'center',
                    vertical: 'center'
                }
            };
        }

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventory');

        // Create filename from list name (sanitize for file system)
        const safeFileName = locationTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase();
        
        // Write file with proper options for special characters
        XLSX.writeFile(wb, `${safeFileName}.xlsx`, { 
            bookType: 'xlsx',
            type: 'binary',
            cellStyles: true
        });
    }

    exportPivotCSV() {
        const groupBy = document.getElementById('pivotGroupBy').value;
        const groups = {};

        this.inventory.forEach(item => {
            const key = item[groupBy] || 'Unspecified';
            if (!groups[key]) {
                groups[key] = [];
            }
            groups[key].push(item);
        });

        let csv = 'Group,Count,Serial Numbers\n';
        Object.keys(groups).sort().forEach(key => {
            const serials = groups[key].map(item => item.serialNumber).join('; ');
            csv += `"${key}",${groups[key].length},"${serials}"\n`;
        });

        this.downloadFile(csv, 'pivot-table.csv', 'text/csv');
    }

    downloadFile(content, filename, type) {
        const blob = new Blob([content], { type: type });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Storage
    saveToStorage() {
        const listName = document.getElementById('locationTitle').value || this.currentListName || 'Unnamed List';
        this.currentListName = listName;
        
        // Reload existing lists first to avoid overwriting
        this.loadAllLists();
        
        const listData = {
            inventory: JSON.parse(JSON.stringify(this.inventory)), // Deep copy to prevent reference issues
            customColumns: JSON.parse(JSON.stringify(this.customColumns)),
            lastModified: new Date().toISOString()
        };
        
        this.savedLists[listName] = listData;
        localStorage.setItem('inventoryLists', JSON.stringify(this.savedLists));
        console.log('Saved list:', listName, 'with', this.inventory.length, 'items');
        console.log('Total saved lists:', Object.keys(this.savedLists).length);
    }

    loadAllLists() {
        const stored = localStorage.getItem('inventoryLists');
        if (stored) {
            try {
                this.savedLists = JSON.parse(stored);
                console.log('Loaded', Object.keys(this.savedLists).length, 'lists:', Object.keys(this.savedLists));
            } catch (e) {
                console.error('Error loading lists:', e);
                this.savedLists = {};
            }
        } else {
            console.log('No saved lists found in storage');
        }
    }
}

// Initialize the app
let manager;
document.addEventListener('DOMContentLoaded', () => {
    manager = new InventoryManager();
});
