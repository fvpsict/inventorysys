// Global variables
let inventory = [];
const columns = [
    { id: 'id', label: 'ID', type: 'text', required: true },
    { id: 'category', label: 'Category', type: 'select', required: true, options: [
        'SSOE', 'Projector', 'ProjectorScreen', 'Visualiser', 'AppleTV',
        'SMAX', 'PortableHDD', 'Macbook', 'TV', 'OMR'
    ]},
    { id: 'model', label: 'Model', type: 'text', required: true },
    { id: 'serialNumber', label: 'Serial Number', type: 'text', required: true },
    { id: 'location', label: 'Location', type: 'text', required: true },
    { id: 'status', label: 'Status', type: 'select', required: true, options: [
        'In Use', 'Available', 'Under Repair', 'Disposed'
    ]},
    { id: 'purchaseDate', label: 'Purchase Date', type: 'date', required: true },
    { id: 'warrantyDate', label: 'Warranty Date', type: 'date', required: true },
    { id: 'remarks', label: 'Remarks', type: 'text', required: false }
];

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    setupTable();
    setupEventListeners();
    setupSidebarListeners();
    loadInventory();
});

// Setup the table structure
function setupTable() {
    const thead = document.querySelector('#inventoryTable thead');
    const headerRow = document.createElement('tr');
    
    columns.forEach(column => {
        const th = document.createElement('th');
        th.textContent = column.label;
        headerRow.appendChild(th);
    });
    
    // Add action column header
    const actionTh = document.createElement('th');
    actionTh.textContent = 'Actions';
    headerRow.appendChild(actionTh);
    
    thead.appendChild(headerRow);
}

// Setup event listeners
function setupEventListeners() {
    // Add new item button
    document.getElementById('addNewBtn').addEventListener('click', () => {
        showModal();
    });

    // CSV upload button
    document.getElementById('uploadBtn').addEventListener('click', handleCsvUpload);
    
    // Category filter change
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

// Load inventory from localStorage
function loadInventory() {
    const savedInventory = localStorage.getItem('inventory');
    if (savedInventory) {
        inventory = JSON.parse(savedInventory);
        displayInventory();
    }
}

// Save inventory to localStorage
function saveInventory() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Display inventory items
function displayInventory() {
    const tbody = document.querySelector('#inventoryTable tbody');
    tbody.innerHTML = '';
    
    const filteredInventory = filterInventoryItems();
    
    filteredInventory.forEach(item => {
        const row = document.createElement('tr');
        
        columns.forEach(column => {
            const td = document.createElement('td');
            td.textContent = item[column.id];
            row.appendChild(td);
        });
        
        // Add action buttons
        const actionTd = document.createElement('td');
        actionTd.innerHTML = `
            <button class="btn btn-sm btn-primary edit-btn" data-id="${item.id}">
                <i class="bi bi-pencil"></i> Edit
            </button>
            <button class="btn btn-sm btn-danger delete-btn" data-id="${item.id}">
                <i class="bi bi-trash"></i> Delete
            </button>
        `;
        
        // Add event listeners to buttons
        const editBtn = actionTd.querySelector('.edit-btn');
        const deleteBtn = actionTd.querySelector('.delete-btn');
        
        editBtn.addEventListener('click', () => editItem(item));
        deleteBtn.addEventListener('click', () => deleteItem(item.id));
        
        row.appendChild(actionTd);
        tbody.appendChild(row);
    });
}

// Filter inventory based on selected category
function filterInventory() {
    displayInventory();
}

function filterInventoryItems() {
    const category = document.getElementById('categoryFilter').value;
    if (category === 'all') {
        return inventory;
    }
    return inventory.filter(item => item.category === category);
}

// Show modal for adding/editing items
function showModal(item = null) {
    const modal = document.getElementById('itemModal');
    const form = document.getElementById('itemForm');
    
    // Clear existing form
    form.innerHTML = '';
    
    // Create form fields
    columns.forEach(column => {
        const formGroup = document.createElement('div');
        formGroup.className = 'form-group';
        
        const label = document.createElement('label');
        label.textContent = column.label;
        
        let input;
        
        if (column.type === 'select') {
            input = document.createElement('select');
            input.className = 'form-control';
            
            // Add empty option
            const emptyOption = document.createElement('option');
            emptyOption.value = '';
            emptyOption.textContent = `Select ${column.label}`;
            input.appendChild(emptyOption);
            
            // Add options
            column.options.forEach(option => {
                const optionElement = document.createElement('option');
                optionElement.value = option;
                optionElement.textContent = option;
                input.appendChild(optionElement);
            });
        } else {
            input = document.createElement('input');
            input.type = column.type;
            input.className = 'form-control';
        }
        
        input.id = column.id;
        input.name = column.id;
        input.required = column.required;
        
        // Set value if editing
        if (item) {
            input.value = item[column.id];
        }
        
        formGroup.appendChild(label);
        formGroup.appendChild(input);
        form.appendChild(formGroup);
    });
    
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.type = 'submit';
    submitBtn.className = 'btn btn-primary';
    submitBtn.textContent = item ? 'Update Item' : 'Add Item';
    
    // Add cancel button
    const cancelBtn = document.createElement('button');
    cancelBtn.type = 'button';
    cancelBtn.className = 'btn btn-secondary';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.onclick = () => modal.style.display = 'none';
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'button-group';
    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(submitBtn);
    form.appendChild(buttonGroup);
    
    // Form submit handler
    form.onsubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(form);
        const newItem = Object.fromEntries(formData);
        
        if (item) {
            // Update existing item
            const index = inventory.findIndex(i => i.id === item.id);
            inventory[index] = newItem;
        } else {
            // Add new item
            inventory.push(newItem);
        }
        
        saveInventory();
        displayInventory();
        modal.style.display = 'none';
    };
    
    // Initialize date pickers
    document.querySelectorAll('input[type="date"]').forEach(input => {
        flatpickr(input, {
            dateFormat: "Y-m-d"
        });
    });
    
    modal.style.display = 'block';
}

// Edit item
function editItem(item) {
    showModal(item);
}

// Delete item
function deleteItem(id) {
    if (confirm('Are you sure you want to delete this item?')) {
        inventory = inventory.filter(item => item.id !== id);
        saveInventory();
        displayInventory();
    }
}

// Handle CSV upload
function handleCsvUpload() {
    const file = document.getElementById('csvFile').files[0];
    if (!file) {
        alert('Please select a CSV file first.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        const text
