// inventory.js

const inventoryModalElement = document.getElementById('inventoryModal');
const inventoryModal = new bootstrap.Modal(inventoryModalElement);
const inventoryForm = document.getElementById('inventory-modal-form');
const tbody = document.querySelector('#inventory-table tbody');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-inventory');
const addItemBtn = document.getElementById('add-item-btn');

let inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');
let editingIndex = null;

// Calculate duration in use (years and months)
function calculateDuration(startDateStr, endDateStr) {
  if (!startDateStr) return '';
  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  if (startDate > endDate) return '';

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let result = '';
  if (years > 0) result += `${years} yr${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} mo${months > 1 ? 's' : ''}`;
  return result.trim() || '<1 mo';
}

// Render table rows based on inventory, filter, and search
function renderTable() {
  tbody.innerHTML = '';

  const filterVal = filterSelect.value.toLowerCase();
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = inventory.filter(item => {
    const matchFilter =
      filterVal === 'all' || filterVal === '' || (item.equipmentType || '').toLowerCase() === filterVal;

    if (!matchFilter) return false;

    // Search all text fields for match
    const fieldsToSearch = [
      item.equipmentType,
      item.equipment,
      item.vendor,
      item.brandModel,
      item.profile,
      item.custodian,
      item.assetNo,
      item.serialNumber,
      item.location,
      item.hostname,
      item.ssoePoNumber,
      item.cartNo,
    ];

    return fieldsToSearch.some(f => f && f.toLowerCase().includes(searchTerm));
  });

  filtered.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.equipmentType || ''}</td>
      <td>${item.equipment || ''}</td>
      <td>${item.vendor || ''}</td>
      <td>${item.brandModel || ''}</td>
      <td>${item.profile || ''}</td>
      <td>${item.custodian || ''}</td>
      <td>${item.assetNo || ''}</td>
      <td>${item.serialNumber || ''}</td>
      <td>${item.location || ''}</td>
      <td>${item.endDate || ''}</td>
      <td>${item.startDate || ''}</td>
      <td>${calculateDuration(item.startDate, item.endDate)}</td>
      <td>${item.hostname || ''}</td>
      <td>${item.ssoePoNumber || ''}</td>
      <td>${item.cartNo || ''}</td>
      <td>${item.sanitiseDate || ''}</td>
      <td>${item.lampHour || ''}</td>
      <td>${item.dateUpdated || ''}</td>
      <td>
        <button class="btn btn-primary btn-sm btn-edit me-1" data-index="${idx}">Edit</button>
        <button class="btn btn-danger btn-sm btn-delete" data-index="${idx}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachRowListeners();
}

// Attach edit and delete button listeners
function attachRowListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.target.dataset.index);
      openEditModal(idx);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', e => {
      const idx = Number(e.target.dataset.index);
      if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(idx, 1);
        saveAndRender();
      }
    });
  });
}

// Open modal for add or edit
function openEditModal(index = null) {
  editingIndex = index;
  inventoryForm.classList.remove('was-validated');

  if (index !== null) {
    // Editing existing
    const item = inventory[index];
    fillForm(item);
    inventoryModalElement.querySelector('.modal-title').textContent = 'Edit Inventory Item';
  } else {
    // Adding new
    inventoryForm.reset();
    inventoryModalElement.querySelector('.modal-title').textContent = 'Add Inventory Item';
    // Reset Date Updated
    document.getElementById('dateUpdated').value = '';
  }
  inventoryModal.show();
}

// Fill modal form fields from item data
function fillForm(item) {
  Object.entries(item).forEach(([key, val]) => {
    const field = inventoryForm.elements.namedItem(key);
    if (field) {
      field.value = val;
    }
  });
}

// Save form data (add or update)
function saveItem(e) {
  e.preventDefault();

  if (!inventoryForm.checkValidity()) {
    inventoryForm.classList.add('was-validated');
    return;
  }

  const formData = new FormData(inventoryForm);
  const newItem = {};

  for (const [key, val] of formData.entries()) {
    newItem[key] = val.trim();
  }

  // Auto-update dateUpdated to today's date
  newItem.dateUpdated = new Date().toLocaleDateString();

  // Prevent duplicate AssetNo if adding new
  if (editingIndex === null) {
    if (inventory.find(i => i.assetNo === newItem.assetNo)) {
      alert('Asset No must be unique.');
      return;
    }
    inventory.push(newItem);
  } else {
    // Editing existing
    inventory[editingIndex] = newItem;
  }

  saveAndRender();
  inventoryModal.hide();
  editingIndex = null;
  inventoryForm.classList.remove('was-validated');
}

// Save to localStorage and render table
function saveAndRender() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
  renderTable();
}

// Event listeners
addItemBtn.addEventListener('click', () => openEditModal(null));
filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);
inventoryForm.addEventListener('submit', saveItem);

// Initial render
renderTable();
