// inventory.js

// Global array to store inventory items
let inventory = [];

// Cached DOM elements
const tableBody = document.querySelector('#inventory-table tbody');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-inventory');
const addItemBtn = document.getElementById('add-item-btn');
const modalElement = document.getElementById('inventoryModal');
const modalForm = document.getElementById('inventory-modal-form');

const bsModal = new bootstrap.Modal(modalElement);

// Format date as "DD Month YYYY" e.g. "25 June 2025"
function formatDate(date) {
  if (!(date instanceof Date)) return '';
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

// Calculate duration in use (years and months) between two dates (startDate, endDate)
function calculateDuration(startDateStr, endDateStr) {
  if (!startDateStr) return '';
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();
  if (start > end) return '';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let result = '';
  if (years > 0) result += years + (years === 1 ? ' year ' : ' years ');
  if (months > 0) result += months + (months === 1 ? ' month' : ' months');
  return result.trim();
}

// Render the inventory table rows based on current inventory, filter and search
function renderTable() {
  const filterValue = filterSelect.value.toLowerCase();
  const searchValue = searchInput.value.toLowerCase();

  tableBody.innerHTML = '';

  inventory.forEach(item => {
    // Filter by EquipmentType if not 'all'
    if (filterValue !== 'all' && item.EquipmentType.toLowerCase() !== filterValue) return;

    // Search in multiple fields
    const searchableText = [
      item.EquipmentType,
      item.Vendor,
      item.Equipment || '',
      item.BrandModel,
      item.Profile,
      item.Custodian,
      item.AssetNo,
      item.SerialNumber,
      item.Location,
      item.Hostname,
      item['SSOE PO Number'] || '',
      item['Cart No'] || '',
    ].join(' ').toLowerCase();

    if (!searchableText.includes(searchValue)) return;

    const tr = document.createElement('tr');

    // Create cells in correct order:
    const cells = [
      item.EquipmentType,
      item.Vendor,
      item.Equipment || '',
      item.BrandModel,
      item.Profile,
      item.Custodian,
      item.AssetNo,
      item.SerialNumber,
      item.Location,
      item.EndDate || '',
      item.StartDate || '',
      item.Hostname,
      item['SSOE PO Number'] || '',
      item['Cart No'] || '',
      item.SanitiseDate || '',
      calculateDuration(item.StartDate, item.EndDate),
      item['Lamp Hour'] || '',
      item.DateUpdated || '',
    ];

    cells.forEach(text => {
      const td = document.createElement('td');
      td.textContent = text;
      tr.appendChild(td);
    });

    // Actions cell with Edit and Delete buttons
    const actionTd = document.createElement('td');

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-primary me-2';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openEditModal(item.AssetNo));

    // Delete button
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-sm btn-danger';
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteItem(item.AssetNo));

    actionTd.appendChild(editBtn);
    actionTd.appendChild(delBtn);

    tr.appendChild(actionTd);

    tableBody.appendChild(tr);
  });
}

// Find item by AssetNo
function findItemByAssetNo(assetNo) {
  return inventory.find(item => item.AssetNo === assetNo);
}

// Open modal for adding new item or editing existing one
function openEditModal(assetNo = null) {
  if (assetNo) {
    // Edit existing
    const item = findItemByAssetNo(assetNo);
    if (!item) return;

    // Fill form with item data
    modalForm.elements['EquipmentType'].value = item.EquipmentType || '';
    modalForm.elements['Equipment'].value = item.Equipment || '';
    modalForm.elements['Vendor'].value = item.Vendor || '';
    modalForm.elements['BrandModel'].value = item.BrandModel || '';
    modalForm.elements['Profile'].value = item.Profile || '';
    modalForm.elements['Custodian'].value = item.Custodian || '';
    modalForm.elements['AssetNo'].value = item.AssetNo || '';
    modalForm.elements['SerialNumber'].value = item.SerialNumber || '';
    modalForm.elements['Location'].value = item.Location || '';
    modalForm.elements['EndDate'].value = item.EndDate || '';
    modalForm.elements['StartDate'].value = item.StartDate || '';
    modalForm.elements['Hostname'].value = item.Hostname || '';
    modalForm.elements['SSOE PO Number'].value = item['SSOE PO Number'] || '';
    modalForm.elements['Cart No'].value = item['Cart No'] || '';
    modalForm.elements['SanitiseDate'].value = item.SanitiseDate || '';
    modalForm.elements['Lamp Hour'].value = item['Lamp Hour'] || '';

    // DateUpdated auto-set to current date (updated now)
    modalForm.elements['DateUpdated'].value = formatDate(new Date());
  } else {
    // Add new - reset form and set DateUpdated to today
    modalForm.reset();
    modalForm.elements['DateUpdated'].value = formatDate(new Date());
  }

  bsModal.show();
}

// Delete item by AssetNo
function deleteItem(assetNo) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  inventory = inventory.filter(item => item.AssetNo !== assetNo);
  saveInventory();
  renderTable();
}

// Save inventory data to localStorage
function saveInventory() {
  localStorage.setItem('fvps_inventory', JSON.stringify(inventory));
}

// Load inventory data from localStorage
function loadInventory() {
  const data = localStorage.getItem('fvps_inventory');
  inventory = data ? JSON.parse(data) : [];
}

// Handle modal form submit (Add/Edit)
modalForm.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(modalForm);

  // Construct item object from form
  const newItem = {};
  for (const [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Validate required fields
  if (!newItem.EquipmentType) {
    alert('Equipment Type is required.');
    return;
  }
  if (!newItem.AssetNo) {
    alert('Asset No is required.');
    return;
  }

  // Update DateUpdated automatically (overwrite if any)
  newItem.DateUpdated = formatDate(new Date());

  // Check if item with AssetNo exists to update or add
  const existingIndex = inventory.findIndex(item => item.AssetNo === newItem.AssetNo);
  if (existingIndex !== -1) {
    // Update existing
    inventory[existingIndex] = newItem;
  } else {
    // Add new
    inventory.push(newItem);
  }

  saveInventory();
  renderTable();
  bsModal.hide();
});

// Filter and search event listeners
filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);

// Add new item button
addItemBtn.addEventListener('click', () => openEditModal(null));

// Initial load
loadInventory();
renderTable();
