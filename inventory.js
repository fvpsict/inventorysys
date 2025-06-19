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

// Render table
function renderTable() {
  tbody.innerHTML = '';

  const filterVal = filterSelect.value.toLowerCase();
  const searchTerm = searchInput.value.trim().toLowerCase();

  const filtered = inventory.filter(item => {
    const matchesFilter =
      filterVal === 'all' || filterVal === '' || (item.equipmentType || '').toLowerCase() === filterVal;

    if (!matchesFilter) return false;

    const fields = [
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

    return fields.some(f => f && f.toLowerCase().includes(searchTerm));
  });

  filtered.forEach((item, index) => {
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
        <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachRowListeners();
}

function attachRowListeners() {
  document.querySelectorAll('.btn-edit').forEach(btn => {
    btn.removeEventListener('click', handleEdit);
    btn.addEventListener('click', handleEdit);
  });

  document.querySelectorAll('.btn-delete').forEach(btn => {
    btn.removeEventListener('click', handleDelete);
    btn.addEventListener('click', handleDelete);
  });
}

function handleEdit(e) {
  const index = +e.target.dataset.index;
  openEditModal(index);
}

function handleDelete(e) {
  const index = +e.target.dataset.index;
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    saveAndRender();
  }
}

function openEditModal(index = null) {
  editingIndex = index;
  inventoryForm.classList.remove('was-validated');

  if (index !== null) {
    const item = inventory[index];
    fillForm(item);
    inventoryModalElement.querySelector('.modal-title').textContent = 'Edit Inventory Item';
  } else {
    inventoryForm.reset();
    document.getElementById('dateUpdated').value = '';
    inventoryModalElement.querySelector('.modal-title').textContent = 'Add Inventory Item';
  }

  inventoryModal.show();
}

function fillForm(item) {
  Object.entries(item).forEach(([key, value]) => {
    const input = inventoryForm.elements.namedItem(key);
    if (input) {
      input.value = value;
    }
  });
}

function saveItem(e) {
  e.preventDefault();

  if (!inventoryForm.checkValidity()) {
    inventoryForm.classList.add('was-validated');
    return;
  }

  const formData = new FormData(inventoryForm);
  const item = {};

  for (const [key, value] of formData.entries()) {
    item[key] = value.trim();
  }

  item.dateUpdated = new Date().toLocaleDateString();

  if (editingIndex === null) {
    const exists = inventory.some(i => i.assetNo === item.assetNo);
    if (exists) {
      alert('Asset No must be unique.');
      return;
    }
    inventory.push(item);
  } else {
    inventory[editingIndex] = item;
  }

  saveAndRender();
  inventoryModal.hide();
  editingIndex = null;
  inventoryForm.classList.remove('was-validated');
}

function saveAndRender() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
  renderTable();
}

// Event Listeners
addItemBtn.addEventListener('click', () => openEditModal(null));
inventoryForm.addEventListener('submit', saveItem);
filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);

// Initial
renderTable();
