// inventory.js

// Inventory data array (load from localStorage or empty)
let inventory = JSON.parse(localStorage.getItem('fvpsInventory')) || [];

// Modal & form elements
const inventoryModalEl = document.getElementById('inventoryModal');
const inventoryModal = new bootstrap.Modal(inventoryModalEl);
const inventoryForm = document.getElementById('inventoryForm');

// Table body
const inventoryTableBody = document.querySelector('#inventoryTable tbody');

// Filter and search inputs
const filterEquipmentType = document.getElementById('filterEquipmentType');
const searchInventory = document.getElementById('searchInventory');

// Form fields - cache them for easy access
const formFields = {
  equipmentType: document.getElementById('equipmentType'),
  equipment: document.getElementById('equipment'),
  vendor: document.getElementById('vendor'),
  brandModel: document.getElementById('brandModel'),
  profile: document.getElementById('profile'),
  custodian: document.getElementById('custodian'),
  assetNo: document.getElementById('assetNo'),
  serialNumber: document.getElementById('serialNumber'),
  location: document.getElementById('location'),
  startDate: document.getElementById('startDate'),
  endDate: document.getElementById('endDate'),
  hostname: document.getElementById('hostname'),
  ssoePoNumber: document.getElementById('ssoePoNumber'),
  cartNo: document.getElementById('cartNo'),
  sanitiseDate: document.getElementById('sanitiseDate'),
};

// To track if editing, store the index of the item being edited
let editIndex = -1;

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem('fvpsInventory', JSON.stringify(inventory));
}

// Calculate duration in use (years and months) from startDate to endDate or today if endDate empty
function calculateDuration(startDateStr, endDateStr) {
  if (!startDateStr) return '';
  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return ''; // invalid range

  let result = '';
  if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
  if (months > 0) result += `${months} month${months > 1 ? 's' : ''}`;

  return result.trim();
}

// Render the inventory table rows with filtering and searching applied
function renderTable() {
  const filterValue = filterEquipmentType.value.toLowerCase();
  const searchValue = searchInventory.value.toLowerCase();

  inventoryTableBody.innerHTML = '';

  inventory.forEach((item, index) => {
    // Apply EquipmentType filter
    if (filterValue && item.equipmentType.toLowerCase() !== filterValue) return;

    // Apply search filter across multiple columns (simple contains check)
    const searchableFields = [
      item.equipmentType, item.equipment, item.vendor, item.brandModel, item.profile,
      item.custodian, item.assetNo, item.serialNumber, item.location, item.hostname,
      item.ssoePoNumber, item.cartNo
    ].map(f => (f || '').toLowerCase());

    if (searchValue && !searchableFields.some(field => field.includes(searchValue))) return;

    const duration = calculateDuration(item.startDate, item.endDate);

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
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    inventoryTableBody.appendChild(tr);
  });

  // Attach edit/delete listeners after rendering
  document.querySelectorAll('.edit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      openEditModal(idx);
    });
  });

  document.querySelectorAll('.delete-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = Number(btn.dataset.index);
      if (confirm('Are you sure you want to delete this item?')) {
        inventory.splice(idx, 1);
        saveInventory();
        renderTable();
      }
    });
  });
}

// Open modal for editing an existing inventory item
function openEditModal(index) {
  editIndex = index;
  const item = inventory[index];
  for (const key in formFields) {
    if (item[key]) {
      formFields[key].value = item[key];
    } else {
      formFields[key].value = '';
    }
  }

  // Show/hide equipment field based on equipmentType
  if (item.equipmentType === 'SSOE') {
    document.getElementById('equipmentContainer').style.display = 'flex';
    formFields.equipment.setAttribute('required', 'required');
  } else {
    document.getElementById('equipmentContainer').style.display = 'none';
    formFields.equipment.removeAttribute('required');
  }

  inventoryModal.show();
}

// Open modal for adding a new item
function openAddModal() {
  editIndex = -1;
  inventoryForm.reset();
  document.getElementById('equipmentContainer').style.display = 'none';
  formFields.equipment.removeAttribute('required');
  inventoryModal.show();
}

// Handle form submission for add/edit
inventoryForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Basic validation
  if (!formFields.equipmentType.value) {
    alert('EquipmentType is required');
    return;
  }
  if (formFields.equipmentType.value === 'SSOE' && !formFields.equipment.value) {
    alert('Equipment is required when EquipmentType is SSOE');
    return;
  }
  if (!formFields.vendor.value) {
    alert('Vendor is required');
    return;
  }
  if (!formFields.brandModel.value) {
    alert('BrandModel is required');
    return;
  }
  if (!formFields.assetNo.value) {
    alert('AssetNo is required');
    return;
  }

  // Construct new item from form fields
  const newItem = {};
  for (const key in formFields) {
    newItem[key] = formFields[key].value.trim();
  }

  if (editIndex >= 0) {
    // Edit existing
    inventory[editIndex] = newItem;
  } else {
    // Add new
    inventory.push(newItem);
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
});

// Filter & Search event handlers
filterEquipmentType.addEventListener('change', renderTable);
searchInventory.addEventListener('input', renderTable);

// Add Item button click (the modal itself is opened by data-bs-toggle on the button, but we clear form here)
document.getElementById('addItemBtn').addEventListener('click', openAddModal);

// Initial render
renderTable();
