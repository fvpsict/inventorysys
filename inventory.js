// inventory.js

// Inventory array in memory
let inventory = [];

// Elements
const tableBody = document.querySelector('#inventoryTable tbody');
const form = document.getElementById('inventoryForm');
const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
const modalTitle = document.getElementById('inventoryModalLabel');

const filterEquipmentType = document.getElementById('filterEquipmentType');
const searchInput = document.getElementById('searchInventory');

const equipmentTypeSelect = document.getElementById('equipmentType');
const equipmentSelect = document.getElementById('equipment');
const equipmentContainer = document.getElementById('equipmentContainer');

let editIndex = -1; // tracks index of editing item (-1 = add new)

// Utility: Format duration in use from start and end dates
function getDurationInUse(startDateStr, endDateStr) {
  if (!startDateStr) return '';
  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return '';

  let duration = '';
  if (years > 0) duration += `${years} yr${years > 1 ? 's' : ''} `;
  if (months > 0) duration += `${months} mo${months > 1 ? 's' : ''}`;
  return duration.trim();
}

// Load inventory from localStorage
function loadInventory() {
  const data = localStorage.getItem('fvpsInventory');
  if (data) {
    try {
      inventory = JSON.parse(data);
    } catch {
      inventory = [];
    }
  }
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem('fvpsInventory', JSON.stringify(inventory));
}

// Render the inventory table rows based on current inventory and filters
function renderTable() {
  const filterType = filterEquipmentType.value.trim().toLowerCase();
  const searchTerm = searchInput.value.trim().toLowerCase();

  tableBody.innerHTML = '';

  inventory.forEach((item, idx) => {
    // Filter by EquipmentType
    if (filterType && item.equipmentType.toLowerCase() !== filterType) return;

    // Search filter - check if any text field contains searchTerm
    const searchableFields = [
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
      item.cartNo
    ];
    if (
      searchTerm &&
      !searchableFields.some((f) => f && f.toLowerCase().includes(searchTerm))
    ) {
      return;
    }

    // Calculate duration in use
    const duration = getDurationInUse(item.startDate, item.endDate);

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
      <td>${item.startDate || ''}</td>
      <td>${item.endDate || ''}</td>
      <td>${duration}</td>
      <td>${item.hostname || ''}</td>
      <td>${item.ssoePoNumber || ''}</td>
      <td>${item.cartNo || ''}</td>
      <td>${item.sanitiseDate || ''}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${idx}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${idx}">Delete</button>
      </td>
    `;
    tableBody.appendChild(tr);
  });

  attachTableButtonsListeners();
}

// Attach listeners to Edit and Delete buttons after rendering table
function attachTableButtonsListeners() {
  const editButtons = document.querySelectorAll('.edit-btn');
  editButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      openEditModal(idx);
    })
  );

  const deleteButtons = document.querySelectorAll('.delete-btn');
  deleteButtons.forEach((btn) =>
    btn.addEventListener('click', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(idx, 1);
        saveInventory();
        renderTable();
      }
    })
  );
}

// Open modal for adding new item
function openAddModal() {
  editIndex = -1;
  modalTitle.textContent = 'Add Inventory Item';
  form.reset();
  equipmentContainer.style.display = 'none';
  equipmentSelect.required = false;
  modal.show();
}

// Open modal for editing existing item
function openEditModal(index) {
  editIndex = index;
  const item = inventory[index];
  modalTitle.textContent = 'Edit Inventory Item';

  // Populate form fields
  equipmentTypeSelect.value = item.equipmentType || '';
  if (item.equipmentType === 'SSOE') {
    equipmentContainer.style.display = 'flex';
    equipmentSelect.required = true;
  } else {
    equipmentContainer.style.display = 'none';
    equipmentSelect.required = false;
  }
  equipmentSelect.value = item.equipment || '';

  document.getElementById('vendor').value = item.vendor || '';
  document.getElementById('brandModel').value = item.brandModel || '';
  document.getElementById('profile').value = item.profile || '';
  document.getElementById('custodian').value = item.custodian || '';
  document.getElementById('assetNo').value = item.assetNo || '';
  document.getElementById('serialNumber').value = item.serialNumber || '';
  document.getElementById('location').value = item.location || '';
  document.getElementById('startDate').value = item.startDate || '';
  document.getElementById('endDate').value = item.endDate || '';
  document.getElementById('hostname').value = item.hostname || '';
  document.getElementById('ssoePoNumber').value = item.ssoePoNumber || '';
  document.getElementById('cartNo').value = item.cartNo || '';
  document.getElementById('sanitiseDate').value = item.sanitiseDate || '';

  modal.show();
}

// Save form data on submit (add or edit)
form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Basic validation - AssetNo and EquipmentType required
  if (!equipmentTypeSelect.value) {
    alert('Please select EquipmentType.');
    return;
  }
  if (equipmentTypeSelect.value === 'SSOE' && !equipmentSelect.value) {
    alert('Please select Equipment for SSOE.');
    return;
  }
  if (!document.getElementById('assetNo').value.trim()) {
    alert('AssetNo is required.');
    return;
  }

  const itemData = {
    equipmentType: equipmentTypeSelect.value,
    equipment: equipmentSelect.value || '',
    vendor: document.getElementById('vendor').value.trim(),
    brandModel: document.getElementById('brandModel').value.trim(),
    profile: document.getElementById('profile').value.trim(),
    custodian: document.getElementById('custodian').value.trim(),
    assetNo: document.getElementById('assetNo').value.trim(),
    serialNumber: document.getElementById('serialNumber').value.trim(),
    location: document.getElementById('location').value.trim(),
    startDate: document.getElementById('startDate').value,
    endDate: document.getElementById('endDate').value,
    hostname: document.getElementById('hostname').value.trim(),
    ssoePoNumber: document.getElementById('ssoePoNumber').value.trim(),
    cartNo: document.getElementById('cartNo').value.trim(),
    sanitiseDate: document.getElementById('sanitiseDate').value
  };

  if (editIndex >= 0) {
    // Update existing item
    inventory[editIndex] = itemData;
  } else {
    // Add new item
    inventory.push(itemData);
  }

  saveInventory();
  renderTable();
  modal.hide();
  form.reset();
});

// EquipmentType change handler to show/hide Equipment dropdown
equipmentTypeSelect.addEventListener('change', () => {
  if (equipmentTypeSelect.value === 'SSOE') {
    equipmentContainer.style.display = 'flex';
    equipmentSelect.required = true;
  } else {
    equipmentContainer.style.display = 'none';
    equipmentSelect.required = false;
    equipmentSelect.value = '';
  }
});

// Filter and Search event listeners
filterEquipmentType.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);

// Initial load
loadInventory();
renderTable();

// Add button event to open modal for new item
document.getElementById('addItemBtn').addEventListener('click', openAddModal);
