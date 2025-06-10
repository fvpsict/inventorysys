// Global variables
let inventory = [];
const columns = [
    'id', 'equipmentType', 'vendor', 'brandModel', 'assetNo', 
    'serialNo', 'startDate', 'endDate', 'room', 'roomNo', 'lampHour'
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
    
    // Create form content
    form.innerHTML = `
        <div class="form-group">
            <label for="equipmentType">Equipment Type</label>
            <select class="form-control" id="equipmentType" required>
                <option value="">Select Equipment Type</option>
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

// Format column headers
function formatColumnHeader(column) {
    const headerMap = {
        'equipmentType': 'Equipment Type',
        'vendor': 'Vendor',
        'brandModel': 'Brand & Model',
        'assetNo': 'Asset No',
        'serialNo': 'Serial No',
        'startDate': 'Start Date',
        'endDate': 'End Date',
        'room': 'Room',
        'roomNo': 'Room No',
        'lampHour': 'Lamp Hour'
    };
    
    return headerMap[column] || column.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
}

// The rest of the JavaScript functions (closeModal, generateId, addItem, updateItem, deleteItem, 
// handleCsvUpload, previewCsv, closePreview, parseCSV, etc.) remain the same as in the previous message.
