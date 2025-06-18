// inventory.js

// Elements
const tableBody = document.querySelector('#inventory-table tbody');
const addItemBtn = document.getElementById('add-item-btn');
const itemModalEl = document.getElementById('itemModal');
const itemModal = new bootstrap.Modal(itemModalEl);
const itemForm = document.getElementById('itemForm');
const modalTitle = document.getElementById('itemModalLabel');
const editIndexInput = document.getElementById('editIndex');

// Storage Key
const STORAGE_KEY = 'fvpsInventory';

// Load saved data or empty array
let inventory = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

// Utility: Calculate Duration In Use (years + months)
function calculateDuration(startDateStr, endDateStr) {
  if (!startDateStr) return '';
  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();
  if (endDate < startDate) return 'Invalid dates';

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let durationStr = '';
  if (years > 0) durationStr += years + (years === 1 ? ' yr ' : ' yrs ');
  if (months > 0) durationStr += months + (months === 1 ? ' mo' : ' mos');
  if (durationStr === '') durationStr = 'Less than 1 month';

  return durationStr.trim();
}

// Render inventory table
function renderTable() {
  tableBody.innerHTML = '';
  if (inventory.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="12" class="text-center">No inventory items found.</td></tr>`;
    return;
  }
  inventory.forEach((item, idx) => {
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${item.equipmentType || ''}</td>
      <td>${item.vendor || ''}</td>
      <td>${item.brandModel || ''}</td>
      <td>${item.profile || ''}</td>
      <td>${item.custodian || ''}</td>
      <td>${item.assetNo || ''}</td>
      <td>${item.serialNumber || ''}</td>
      <td>${item.location || ''}</td>
      <td>${item.startDate || ''}</td>
      <td>${item.endDate || ''}</td>
      <td class="duration">${calculateDuration(item.startDate, item.endDate)}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-edit" data-index="${idx}">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${idx}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  // Attach event listeners for edit/delete buttons
  document.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', e => openEditModal(e.target.dataset.index))
  );
  document.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', e => deleteItem(e.target.dataset.index))
  );
}

// Open modal for editing an item
function openEditModal(index) {
  const item = inventory[index];
  if (!item) return;

  modalTitle.textContent = 'Edit Inventory Item';
  editIndexInput.value = index;

  itemForm.equipmentType.value = item.equipmentType || '';
  itemForm.vendor.value = item.vendor || '';
  itemForm.brandModel.value = item.brandModel || '';
  itemForm.profile.value = item.profile || '';
  itemForm.custodian.value = item.custodian || '';
  itemForm.assetNo.value = item.assetNo || '';
  itemForm.serialNumber.value = item.serialNumber || '';
  itemForm.location.value = item.location || '';
  itemForm.startDate.value = item.startDate || '';
  itemForm.endDate.value = item.endDate || '';

  itemModal.show();
}

// Delete item
function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    saveAndRender();
  }
}

// Save and render data
function saveAndRender() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  renderTable();
}

// Reset and open modal for new item
addItemBtn.addEventListener('click', () => {
  modalTitle.textContent = 'Add Inventory Item';
  editIndexInput.value = '';
  itemForm.reset();
});

// Handle form submit
itemForm.addEventListener('submit', e => {
  e.preventDefault();

  // Validate required fields (HTML5 validation)
  if (!itemForm.checkValidity()) {
    itemForm.reportValidity();
    return;
  }

  const newItem = {
    equipmentType: itemForm.equipmentType.value.trim(),
    vendor: itemForm.vendor.value.trim(),
    brandModel: itemForm.brandModel.value.trim(),
    profile: itemForm.profile.value.trim(),
    custodian: itemForm.custodian.value.trim(),
    assetNo: itemForm.assetNo.value.trim(),
    serialNumber: itemForm.serialNumber.value.trim(),
    location: itemForm.location.value.trim(),
    startDate: itemForm.startDate.value,
    endDate: itemForm.endDate.value || ''
  };

  const editIndex = editIndexInput.value;

  if (editIndex === '') {
    // Add new
    inventory.push(newItem);
  } else {
    // Update existing
    inventory[editIndex] = newItem;
  }

  saveAndRender();
  itemModal.hide();
});

// Initial render
renderTable();
