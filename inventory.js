// inventory.js

// Bootstrap modal instance
const inventoryModalElement = document.getElementById('inventoryModal');
const inventoryModal = new bootstrap.Modal(inventoryModalElement);
const inventoryForm = document.getElementById('inventory-modal-form');

let inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');
let editingIndex = null;

// Cached DOM elements
const tbody = document.querySelector('#inventory-table tbody');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-inventory');

// Utility to calculate duration in use (years and months)
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

// Render the inventory table based on filters and search
function renderTable() {
  tbody.innerHTML = '';

  const filterValue = filterSelect.value.toLowerCase();
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = inventory.filter(item => {
    const matchesFilter = filterValue === 'all' || filterValue === '' || (item.equipmentType || '').toLowerCase() === filterValue;
    if (!matchesFilter) return false;

    // Search matches in multiple fields
    const searchableFields = [
      item.equipmentType, item.equipment, item.vendor, item.brandModel, item.profile,
      item.custodian, item.assetNo, item.serialNumber, item.location,
      item.hostname, item.ssoePoNumber, item.cartNo
    ];

    return searchableFields.some(field => field && field.toLowerCase().includes(searchTerm));
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
      <td>${item.hostname || ''}</td>
      <td>${item.ssoePoNumber || ''}</td>
      <td>${item.cartNo || ''}</td>
      <td>${item.sanitiseDate || ''}</td>
      <td>${calculateDuration(item.startDate, item.endDate)}</td>
      <td>${item.lampHour || ''}</td>
      <td>${item.dateUpdated || ''}</td>
      <td>
        <button class="btn-edit btn btn-sm btn-primary me-1" data-index="${idx}">Edit</button>
        <button class="btn-delete btn btn-sm btn-danger" data-index="${idx}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  attachRowEventListeners();
}

// Attach click listeners for edit and delete buttons
function attachRowEventListeners() {
  document.querySelectorAll('.btn-edit').forEach(button => {
    button.addEventListener('click', e => {
      const index = parseInt(e.target.dataset.index);
      openEditModal(index);
    });
  });

  document.querySelectorAll('.btn-delete').forEach(button => {
    button.addEventListener('click', e => {
      const index = parseInt(e.target.dataset.index);
      if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(index, 1);
        saveAndRender();
      }
    });
  });
}

// Open modal for adding new item or editing existing
function openEditModal(index = null) {
  editingIndex = index;

  if (index !== null) {
    // Edit existing
    const item = inventory[index];
    fillForm(item);
    inventoryModalElement.querySelector('.modal-title').textContent = 'Edit Inventory Item';
  } else {
    // Add new
    inventoryForm.reset();
    inventoryModalElement.querySelector('.modal-title').textContent = 'Add Inventory Item';
  }

  inventoryModal.show();
  updateEquipmentVisibility();
}

// Fill form fields with an item data
function fillForm(item) {
  // Map item fields to form fields by name
  Object.entries(item).forEach(([key, value]) => {
    const field = inventoryForm.elements.namedItem(key);
    if (field) {
      field.value = value;
    }
  });
}

// Save the form data (add new or update existing)
function saveItem(event) {
  event.preventDefault();

  // Optional: Form validation
  if (!inventoryForm.checkValidity()) {
    inventoryForm.classList.add('was-validated');
    return;
  }

  // Gather all form fields into an object
  const formData = new FormData(inventoryForm);
  const newItem = {};

  for (const [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Add dateUpdated as today
  newItem.dateUpdated = new Date().toLocaleDateString();

  if (editingIndex !== null) {
    inventory[editingIndex] = newItem;
  } else {
    // Prevent duplicate AssetNo (optional)
    const duplicate = inventory.find(i => i.assetNo === newItem.assetNo);
    if (duplicate) {
      alert('Asset No must be unique.');
      return;
    }
    inventory.push(newItem);
  }

  saveAndRender();
  inventoryModal.hide();
  inventoryForm.classList.remove('was-validated');
  editingIndex = null;
}

// Save inventory array to localStorage and re-render table
function saveAndRender() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
  renderTable();
}

// Show/hide Equipment field if EquipmentType is SSOE
function updateEquipmentVisibility() {
  const equipmentContainer = document.getElementById('equipmentContainer');
  const equipmentField = inventoryForm.elements.namedItem('equipment');

  if (!equipmentContainer || !equipmentField) return;

  if (inventoryForm.elements['EquipmentType'].value === 'SSOE') {
    equipmentContainer.style.display = 'flex';
    equipmentField.required = false; // as per your request, not required
  } else {
    equipmentContainer.style.display = 'none';
    equipmentField.value = '';
    equipmentField.required = false;
  }
}

// Event listeners

// Show modal to add new item
document.getElementById('add-item-btn').addEventListener('click', () => {
  openEditModal(null);
});

// Filter and search listeners
filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);

// Update Equipment visibility on form EquipmentType change
inventoryForm.elements['EquipmentType'].addEventListener('change', updateEquipmentVisibility);

// Form submission
inventoryForm.addEventListener('submit', saveItem);

// Initial render
renderTable();
