// Global variables
let inventory = [];
const ssoeColumns = [
    'id', 'equipmentType', 'vendor', 'brandModel', 'profile', 'custodian', 
    'assetNo', 'serialNo', 'location', 'endDate', 'startDate', 'hostname', 
    'ssoePONumber', 'cartNo', 'fault'
];

const standardColumns = [
    'id', 'equipmentType', 'vendor', 'brandModel', 'assetNo', 'serialNo', 
    'endDate', 'startDate', 'room', 'roomNo', 'lampHour', 'durationInUse'
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    loadInventory();
    setupEventListeners();
    setupSidebarListeners();
    createTable();
});

// Load inventory from localStorage
function loadInventory() {
    const savedInventory = localStorage.getItem('inventory');
    inventory = savedInventory ? JSON.parse(savedInventory) : [];
}

// Save inventory to localStorage
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Setup event listeners
function setupEventListeners() {
    document.getElementById('addNewBtn').addEventListener('click', () => showModal());
    document.getElementById('uploadBtn').addEventListener('click', handleCsvUpload);
    document.getElementById('csvFile').addEventListener('change', previewCsv);
    document.getElementById('categoryFilter').addEventListener('change', filterInventory);
}

// Setup sidebar menu listeners
function setupSidebarListeners() {
    document.querySelectorAll('.menu-list a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.closest('a').dataset.category;
            
            // Update active state
            document.querySelectorAll('.menu-list li').forEach(li => li.classList.remove('active'));
            e.target.closest('li').classList.add('active');
            
            // Update category filter and display
            document.getElementById('categoryFilter').value = category;
            filterInventory();
        });
    });
}

// Create and populate table
function createTable() {
    const table = document.getElementById('inventoryTable');
    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    
    // Get selected category
    const selectedCategory = document.getElementById('categoryFilter').value;
    const columns = selectedCategory === 'SSOE' ? ssoeColumns : standardColumns;
    
    // Create header row
    const headerRow = document.createElement('tr');
    columns.filter(col => col !== 'id').forEach(column => {
        const th = document.createElement('th');
        th.textContent = formatColumnHeader(column);
        headerRow.appendChild(th);
    });
    headerRow.appendChild(document.createElement('th')); // Actions column
    thead.innerHTML = '';
    thead.appendChild(headerRow);
    
    // Populate table body
    updateTableBody();
}

// Update table body with filtered inventory
function updateTableBody() {
    const tbody = document.getElementById('inventoryTable').querySelector('tbody');
    const selectedCategory = document.getElementById('categoryFilter').value;
    
    tbody.innerHTML = '';
    
    const filteredInventory = selectedCategory === 'all' 
        ? inventory 
        : inventory.filter(item => item.equipmentType === selectedCategory);

    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        const columns = item.equipmentType === 'SSOE' ? ssoeColumns : standardColumns;
        
        columns.filter(col => col !== 'id').forEach(column => {
            const td = document.createElement('td');
            td.textContent = item[column] || '';
            row.appendChild(td);
        });
        
        // Add action buttons
        const actionsTd = document.createElement('td');
        actionsTd.innerHTML = `
            <button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}">
                <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">
                <i class="bi bi-trash"></i>
            </button>
        `;
        row.appendChild(actionsTd);
        
        // Add event listeners to buttons
        const editBtn = actionsTd.querySelector('.edit-btn');
        const deleteBtn = actionsTd.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => showModal(item));
        deleteBtn.addEventListener('click', () => deleteItem(item.id));
        
        tbody.appendChild(row);
    });
}

// Show modal for adding/editing items
function showModal(item = null) {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    
    // Determine which type of form to show
    const isSSOE = item ? item.equipmentType === 'SSOE' : false;
    const columns = isSSOE ? ssoeColumns : standardColumns;
    
    // Create form content
    form.innerHTML = `
        <div class="form-group">
            <label for="equipmentType">Equipment Type</label>
            <select class="form-control" id="equipmentType" required onchange="handleEquipmentTypeChange(this.value)">
                <option value="">Select Equipment Type</option>
                <option value="SSOE">SSOE</option>
                <option value="Projector">Projector</option>
                <option value="ProjectorScreen">Projector Screen</option>
                <option value="Visualiser">Visualiser</option>
                <option value="AppleTV">Apple TV</option>
                <option value="SMAX">SMAX</option>
                <option value="PortableHDD">Portable HDD</option>
                <option value="Macbook">Macbook</option>
                <option value="TV">TV</option>
                <option value="OMR">OMR</option>
            </select>
        </div>
        ${generateFormFields(isSSOE)}
        <div class="button-group">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
        </div>
    `;
    
    // Initialize date pickers
    document.querySelectorAll('input[type="date"]').forEach(input => {
        flatpickr(input, {
            dateFormat: "Y-m-d"
        });
    });
    
    // Populate form if editing
    if (item) {
        columns.forEach(field => {
            const input = document.getElementById(field);
            if (input) input.value = item[field] || '';
        });
    }
    
    // Form submit handler
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = {};
        const equipmentType = document.getElementById('equipmentType').value;
        const columns = equipmentType === 'SSOE' ? ssoeColumns : standardColumns;
        
        columns.forEach(field => {
            const input = document.getElementById(field);
            if (input) formData[field] = input.value;
        });
        
        if (item) {
            formData.id = item.id;
            updateItem(formData);
        } else {
            formData.id = generateId();
            addItem(formData);
        }
        
        closeModal();
    };
    
    modal.style.display = 'block';
}

// Generate form fields based on equipment type
function generateFormFields(isSSOE) {
    if (isSSOE) {
        return `
            <div class="form-group">
                <label for="vendor">Vendor</label>
                <input type="text" class="form-control" id="vendor" required>
            </div>
            <div class="form-group">
                <label for="brandModel">Brand & Model</label>
                <input type="text" class="form-control" id="brandModel" required>
            </div>
            <div class="form-group">
                <label for="profile">Profile</label>
                <input type="text" class="form-control" id="profile" required>
            </div>
            <div class="form-group">
                <label for="custodian">Custodian</label>
                <input type="text" class="form-control" id="custodian" required>
            </div>
            <div class="form-group">
                <label for="assetNo">Asset No</label>
                <input type="text" class="form-control" id="assetNo" required>
            </div>
            <div class="form-group">
                <label for="serialNo">Serial No</label>
                <input type="text" class="form-control" id="serialNo" required>
            </div>
            <div class="form-group">
                <label for="location">Location</label>
                <input type="text" class="form-control" id="location" required>
            </div>
            <div class="form-group">
                <label for="startDate">Start Date</label>
                <input type="date" class="form-control" id="startDate" required>
            </div>
            <div class="form-group">
                <label for="endDate">End Date</label>
                <input type="date" class="form-control" id="endDate" required>
            </div>
            <div class="form-group">
                <label for="hostname">Hostname</label>
                <input type="text" class="form-control" id="hostname" required>
            </div>
            <div class="form-group">
                <label for="ssoePONumber">SSOE PO Number</label>
                <input type="text" class="form-control" id="ssoePONumber" required>
            </div>
            <div class="form-group">
                <label for="cartNo">Cart No</label>
                <input type="text" class="form-control" id="cartNo" required>
            </div>
            <div class="form-group">
                <label for="fault">Fault</label>
                <input type="text" class="form-control" id="fault">
            </div>
        `;
    } else {
        return `
            <div class="form-group">
                <label for="vendor">Vendor</label>
                <input type="text" class="form-control" id="vendor" required>
            </div>
            <div class="form-group">
                <label for="brandModel">Brand & Model</label>
                <input type="text" class="form-control" id="brandModel" required>
            </div>
            <div class="form-group">
                <label for="assetNo">Asset No</label>
                <input type="text" class="form-control" id="assetNo" required>
            </div>
            <div class="form-group">
                <label for="serialNo">Serial No</label>
                <input type="text" class="form-control" id="serialNo" required>
            </div>
            <div class="form-group">
                <label for="startDate">Start Date</label>
                <input type="date" class="form-control" id="startDate" required>
            </div>
            <div class="form-group">
                <label for="endDate">End Date</label>
                <input type="date" class="form-control" id="endDate" required>
            </div>
            <div class="form-group">
                <label for="room">Room</label>
                <input type="text" class="form-control" id="room" required>
            </div>
            <div class="form-group">
                <label for="roomNo">Room No</label>
                <input type="text" class="form-control" id="roomNo" required>
            </div>
            <div class="form-group">
                <label for="lampHour">Lamp Hour</label>
                <input type="number" class="form-control" id="lampHour">
            </div>
            <div class="form-group">
                <label for="durationInUse">Duration in Use</label>
                <input type="text" class="form-control" id="durationInUse">
            </div>
        `;
    }
}

// Handle equipment type change
function handleEquipmentTypeChange(value) {
    const form = document.getElementById('itemForm');
    const currentFields = form.innerHTML;
    const newFields = generateFormFields(value === 'SSOE');
    
    // Replace all fields after the equipment type selector
    const equipmentTypeField = currentFields.split('</select>')[0] + '</select>';
    form.innerHTML = equipmentTypeField + newFields + `
        <div class="button-group">
            <button type="button" class="btn btn-secondary" onclick="closeModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Save</button>
        </div>
    `;
    
    // Reinitialize date pickers
    document.querySelectorAll('input[type="date"]').forEach(input => {
        flatpickr(input, {
            dateFormat: "Y-m-d"
        });
    });
}

// Close modal
function closeModal() {
    document.getElementById('itemModal').style.display = 'none';
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add new item
function addItem(item) {
    inventory.push(item);
    saveInventory();
    createTable();
}

// Update existing item
function updateItem(updatedItem) {
    const index = inventory.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        inventory[index] = updatedItem;
        saveInventory();
        createTable();
    }
}

// Delete item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveInventory();
        createTable();
    }
}

// Format column headers
function formatColumnHeader(column) {
    const headerMap = {
        'equipmentType': 'Equipment Type',
        'vendor': 'Vendor',
        'brandModel': 'Brand & Model',
        'profile': 'Profile',
        'custodian': 'Custodian',
        'assetNo': 'Asset No',
        'serialNo': 'Serial No',
        'location': 'Location',
        'startDate': 'Start Date',
        'endDate': 'End Date',
        'hostname': 'Hostname',
        'ssoePONumber': 'SSOE PO Number',
        'cartNo': 'Cart No',
        'fault': 'Fault',
        'room': 'Room',
        'roomNo': 'Room No',
        'lampHour': 'Lamp Hour',
        'durationInUse': 'Duration in Use'
    };
    
    return headerMap[column] || column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// Filter inventory based on selected category
function filterInventory() {
    createTable();
}

// Handle CSV upload
function handleCsvUpload() {
    const fileInput = document.getElementById('csvFile');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text);
            
            // Add each item to inventory
            data.forEach(item => {
                item.id = generateId();
                inventory.push(item);
            });
            
            saveInventory();
            createTable();
            closePreview();
        };
        reader.readAsText(file);
    }
}

// Preview CSV content
function previewCsv() {
    const fileInput = document.getElementById('csvFile');
    const previewDiv = document.getElementById('uploadPreview');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text);
            
            // Display preview
            previewDiv.style.display = 'block';
            previewDiv.querySelector('.preview-content').innerHTML = `
                <p>Found ${data.length} items to import</p>
                <p>First item preview:</p>
                <pre>${JSON.stringify(data[0], null, 2)}</pre>
            `;
        };
        reader.readAsText(file);
    }
}

// Close preview
function closePreview() {
    const previewDiv = document.getElementById('uploadPreview');
    previewDiv.style.display = 'none';
    document.getElementById('csvFile').value = '';
}

// Parse CSV content
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const items = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const values = lines[i].split(',').map(v => v.trim());
        const item = {};
        
        headers.forEach((header, index) => {
            item[header] = values[index] || '';
        });
        
        items.push(item);
    }
    
    return items;
}
