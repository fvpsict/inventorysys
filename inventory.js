// Elements
const inventoryTableBody = document.querySelector('#inventoryTable tbody');
const addItemBtn = document.getElementById('addItemBtn');
const inventoryModal = new bootstrap.Modal(document.getElementById('inventoryModal'));
const inventoryForm = document.getElementById('inventoryForm');
const filterEquipmentType = document.getElementById('filterEquipmentType');
const searchInventory = document.getElementById('searchInventory');

const fields = [
  "equipmentType","equipment","vendor","brandModel","profile","custodian","assetNo","serialNumber",
  "location","startDate","endDate","hostname","ssoePoNumber","cartNo","sanitiseDate","lampHour","dateUpdated"
];

// Load inventory data from localStorage or empty array
let inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');
let editingIndex = null;

// Utility: format date yyyy-mm-dd to readable
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString();
}

// Calculate duration in use (years, months) based on StartDate to today or EndDate
function calculateDuration(startDateStr, endDateStr) {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  if (isNaN(start)) return "";
  const end = endDateStr && new Date(endDateStr) || new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "";

  let result = "";
  if (years > 0) result += years + " yr" + (years > 1 ? "s" : "");
  if (months > 0) result += (result ? " " : "") + months + " mo" + (months > 1 ? "s" : "");
  return result || "<1 mo";
}

// Render the inventory table rows with filter and search applied
function renderTable() {
  const filterVal = filterEquipmentType.value.toLowerCase();
  const searchVal = searchInventory.value.toLowerCase();

  inventoryTableBody.innerHTML = '';

  inventory.forEach((item, index) => {
    // Filter by EquipmentType if not "all"
    if (filterVal !== 'all' && item.equipmentType.toLowerCase() !== filterVal) return;

    // Search in all string fields
    const searchableString = fields.map(f => (item[f] || "").toString().toLowerCase()).join(' ');
    if (!searchableString.includes(searchVal)) return;

    const tr = document.createElement('tr');

    // Add table cells
    tr.innerHTML = `
      <td>${item.equipmentType || ""}</td>
      <td>${item.equipment || ""}</td>
      <td>${item.vendor || ""}</td>
      <td>${item.brandModel || ""}</td>
      <td>${item.profile || ""}</td>
      <td>${item.custodian || ""}</td>
      <td>${item.assetNo || ""}</td>
      <td>${item.serialNumber || ""}</td>
      <td>${item.location || ""}</td>
      <td>${formatDate(item.startDate)}</td>
      <td>${formatDate(item.endDate)}</td>
      <td>${calculateDuration(item.startDate, item.endDate)}</td>
      <td>${item.hostname || ""}</td>
      <td>${item.ssoePoNumber || ""}</td>
      <td>${item.cartNo || ""}</td>
      <td>${formatDate(item.sanitiseDate)}</td>
      <td>${item.lampHour || ""}</td>
      <td>${item.dateUpdated || ""}</td>
      <td>
        <button class="btn-edit btn btn-sm btn-primary" data-index="${index}">Edit</button>
        <button class="btn-delete btn btn-sm btn-danger" data-index="${index}">Delete</button>
      </td>
    `;

    inventoryTableBody.appendChild(tr);
  });
}

// Reset form inputs
function resetForm() {
  inventoryForm.reset();
  editingIndex = null;
  document.getElementById('dateUpdated').value = "";
  inventoryForm.classList.remove('was-validated');
  document.getElementById('equipmentType').focus();
}

// Populate form fields for editing
function populateForm(index) {
  const item = inventory[index];
  if (!item) return;

  editingIndex = index;
  document.getElementById('equipmentType').value = item.equipmentType || "";
  document.getElementById('equipment').value = item.equipment || "";
  document.getElementById('vendor').value = item.vendor || "";
  document.getElementById('brandModel').value = item.brandModel || "";
  document.getElementById('profile').value = item.profile || "";
  document.getElementById('custodian').value = item.custodian || "";
  document.getElementById('assetNo').value = item.assetNo || "";
  document.getElementById('serialNumber').value = item.serialNumber || "";
  document.getElementById('location').value = item.location || "";
  document.getElementById('startDate').value = item.startDate || "";
  document.getElementById('endDate').value = item.endDate || "";
  document.getElementById('hostname').value = item.hostname || "";
  document.getElementById('ssoePoNumber').value = item.ssoePoNumber || "";
  document.getElementById('cartNo').value = item.cartNo || "";
  document.getElementById('sanitiseDate').value = item.sanitiseDate || "";
  document.getElementById('lampHour').value = item.lampHour || "";
  document.getElementById('dateUpdated').value = item.dateUpdated || "";
}

// Save or update inventory item from form data
function saveItem(event) {
  event.preventDefault();
  event.stopPropagation();

  if (!inventoryForm.checkValidity()) {
    inventoryForm.classList.add('was-validated');
    return;
  }

  const now = new Date();
  const dateUpdatedStr = now.toLocaleDateString();

  const newItem = {
    equipmentType: document.getElementById('equipmentType').value.trim(),
    equipment: document.getElementById('equipment').value.trim(),
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
    sanitiseDate: document.getElementById('sanitiseDate').value,
    lampHour: document.getElementById('lampHour').value.trim(),
    dateUpdated: dateUpdatedStr
  };

  if (editingIndex !== null) {
    // Update existing item
    inventory[editingIndex] = newItem;
  } else {
    // Prevent duplicate AssetNo
    if (inventory.some(item => item.assetNo.toLowerCase() === newItem.assetNo.toLowerCase())) {
      alert('AssetNo must be unique. This AssetNo already exists.');
      return;
    }
    inventory.push(newItem);
  }

  localStorage.setItem('inventoryData', JSON.stringify(inventory));
  renderTable();
  inventoryModal.hide();
  resetForm();
}

// Delete item from inventory
function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    localStorage.setItem('inventoryData', JSON.stringify(inventory));
    renderTable();
  }
}

// Event listeners

// Add Item button resets form and opens modal
addItemBtn.addEventListener('click', () => {
  resetForm();
  inventoryModal.show();
});

// Edit button clicks
inventoryTableBody.addEventListener('click', e => {
  if (e.target.classList.contains('btn-edit')) {
    const idx = parseInt(e.target.getAttribute('data-index'), 10);
    populateForm(idx);
    inventoryModal.show();
  }
  if (e.target.classList.contains('btn-delete')) {
    const idx = parseInt(e.target.getAttribute('data-index'), 10);
    deleteItem(idx);
  }
});

// Save form submission
inventoryForm.addEventListener('submit', saveItem);

// Filter and Search
filterEquipmentType.addEventListener('change', renderTable);
searchInventory.addEventListener('input', renderTable);

// Initial render
renderTable();
