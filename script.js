// Global variables
let inventory = [];
const columns = [
    'id', 'category', 'brand', 'model', 'serialNumber', 'assetTag', 
    'purchaseDate', 'warrantyDate', 'status', 'location', 'remarks'
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
    columns.forEach(column => {
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
        : inventory.filter(item => item.category === selectedCategory);

    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        
        columns.forEach(column => {
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

// Filter inventory based on category
function filterInventory() {
    updateTableBody();
}

// Show modal for adding/editing items
function showModal(item = null) {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    
    // Create form content
    form.innerHTML = `
        <div class="form-group">
            <label for="category">Category</label>
            <select class="form-control" id="category" required>
                <option value="">Select Category</option>
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
        ${columns.filter(col => !['id', 'category'].includes(col)).map(field => `
            <div class="form-group">
                <label for="${field}">${formatColumnHeader(field)}</label>
                <input type="${field.includes('Date') ? 'date' : 'text'}" 
                       class="form-control" 
                       id="${field}" 
                       ${field === 'serialNumber' || field === 'assetTag' ? 'required' : ''}>
            </div>
        `).join('')}
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
    updateTableBody();
}

// Update existing item
function updateItem(updatedItem) {
    const index = inventory.findIndex(item => item.id === updatedItem.id);
    if (index !== -1) {
        inventory[index] = updatedItem;
        saveInventory();
        updateTableBody();
    }
}

// Delete item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveInventory();
        updateTableBody();
    }
}

// Format column headers
function formatColumnHeader(column) {
    return column
        .replace(/([A-Z])/g, ' $1')
        .replace(/^./, str => str.toUpperCase());
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
            
            if (data.length > 0) {
                data.forEach(item => {
                    item.id = generateId();
                    inventory.push(item);
                });
                
                saveInventory();
                updateTableBody();
                closePreview();
                fileInput.value = '';
            }
        };
        reader.readAsText(file);
    }
}

// Preview CSV content
function previewCsv(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('uploadPreview');
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const text = e.target.result;
            const data = parseCSV(text);
            
            if (data.length > 0) {
                preview.style.display = 'block';
                preview.querySelector('.preview-content').innerHTML = `
                    <p>Found ${data.length} items to import.</p>
                    <p>First row preview:</p>
                    <pre>${JSON.stringify(data[0], null, 2)}</pre>
                `;
            }
        };
        reader.readAsText(file);
    }
}

// Close preview
function closePreview() {
    const preview = document.getElementById('uploadPreview');
    preview.style.display = 'none';
    preview.querySelector('.preview-content').innerHTML = '';
}

// Parse CSV content
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(header => header.trim());
    const results = [];
    
    for (let i = 1; i < lines.length; i++) {
        if (lines[i].trim() === '') continue;
        
        const obj = {};
        const currentLine = lines[i].split(',');
        
        headers.forEach((header, index) => {
            obj[header] = currentLine[index].trim();
        });
        
        results.push(obj);
    }
    
    return results;
}

// Close modal when clicking outside
window.onclick = (event) => {
    const modal = document.getElementById('itemModal');
    if (event.target === modal) {
        closeModal();
    }
};
