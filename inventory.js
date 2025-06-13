// inventory.js

let inventory = [];

// On page load: load inventory from localStorage and create table
window.onload = () => {
  loadInventory();
  createTable();

  // Modal form submit handler
  document.getElementById('itemForm').addEventListener('submit', (e) => {
    e.preventDefault();
    saveForm();
  });
};

// Load inventory from localStorage
function loadInventory() {
  const stored = localStorage.getItem('inventoryData');
  inventory = stored ? JSON.parse(stored) : [];
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
}

// Create table headers and rows dynamically
function createTable() {
  const tableHeaders = document.getElementById('tableHeaders');
  const tableBody = document.getElementById('tableBody');

  // Clear existing
  tableHeaders.innerHTML = '';
  tableBody.innerHTML = '';

  if (inventory.length === 0) {
    tableBody.innerHTML = '<tr><td colspan="10" style="text-align:center;">No inventory items found.</td></tr>';
    return;
  }

  // Get all unique keys from inventory to form headers
  const allKeys = new Set();
  inventory.forEach(item => {
    Object.keys(item).forEach(key => {
      if (key !== 'id') allKeys.add(key);
    });
  });

  const keysArray = Array.from(allKeys);

  // Create header row
  keysArray.forEach(key => {
    const th = document.createElement('th');
    th.textContent = formatColumnHeader(key);
    tableHeaders.appendChild(th);
  });

  // Add an extra header for Actions
  const actionTh = document.createElement('th');
  actionTh.textContent = 'Actions';
  tableHeaders.appendChild(actionTh);

  // Create rows
  inventory.forEach(item => {
    const tr = document.createElement('tr');
    keysArray.forEach(key => {
      const td = document.createElement('td');
      td.textContent = item[key] || '';
      tr.appendChild(td);
    });

    // Actions buttons
    const actionTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.className = 'button secondary';
    editBtn.textContent = 'Edit';
    editBtn.onclick = () => openModal(item.id);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'button danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.onclick = () => deleteItem(item.id);

    actionTd.appendChild(editBtn);
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    tableBody.appendChild(tr);
  });
}

// Format header names nicely
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

// Open modal and populate form if editing, else empty form for new item
function openModal(id) {
  const modal = document.getElementById('itemModal');
  modal.style.display = 'block';

  const form = document.getElementById('itemForm');
  form.dataset.editId = id || '';

  if (id) {
    // Editing existing item
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    // Fill inputs
    for (const [key, value] of Object.entries(item)) {
      const input = form.elements[key];
      if (input) input.value = value;
    }
  } else {
    // New item: clear inputs
    form.reset();
  }
}

// Close modal
function closeModal() {
  const modal = document.getElementById('itemModal');
  modal.style.display = 'none';
}

// Save form data (add or update item)
function saveForm() {
  const form = document.getElementById('itemForm');
  const id = form.dataset.editId;

  // Build item object from form inputs
  const newItem = {};
  for (let element of form.elements) {
    if (element.name) {
      newItem[element.name] = element.value.trim();
    }
  }

  if (!newItem.equipmentType) {
    alert('Equipment Type is required.');
    return;
  }

  if (id) {
    // Update existing item
    newItem.id = id;
    updateItem(newItem);
  } else {
    // Add new item
    newItem.id = generateId();
    addItem(newItem);
  }

  closeModal();
  createTable();
}

// Generate unique ID
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Add new item
function addItem(item) {
  inventory.push(item);
  saveInventory();
}

// Update existing item
function updateItem(updatedItem) {
  const idx = inventory.findIndex(i => i.id === updatedItem.id);
  if (idx > -1) {
    inventory[idx] = updatedItem;
    saveInventory();
  }
}

// Delete item by id
function deleteItem(id) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory = inventory.filter(i => i.id !== id);
    saveInventory();
    createTable();
  }
}

// Export inventory to CSV (simple)
function exportToCsv() {
  if (inventory.length === 0) {
    alert('No inventory data to export.');
    return;
  }

  const keys = Object.keys(inventory[0]).filter(k => k !== 'id');
  const csvRows = [];

  // Header row
  csvRows.push(keys.map(k => `"${formatColumnHeader(k)}"`).join(','));

  // Data rows
  inventory.forEach(item => {
    const row = keys.map(k => `"${(item[k] || '').replace(/"/g, '""')}"`);
    csvRows.push(row.join(','));
  });

  const csvString = csvRows.join('\n');
  const blob = new Blob([csvString], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = 'inventory_export.csv';
  a.click();

  URL.revokeObjectURL(url);
}
