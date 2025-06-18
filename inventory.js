// Initialize table from localStorage on load
document.addEventListener('DOMContentLoaded', () => {
  loadInventory();
  document.getElementById('inventory-form').addEventListener('submit', saveItem);
  document.getElementById('add-item-btn').addEventListener('click', () => openModal());
  document.getElementById('search-inventory').addEventListener('input', filterTable);
  document.getElementById('filter-equipmenttype').addEventListener('change', filterTable);
});

let editIndex = null;

// Load inventory from localStorage
function loadInventory() {
  const data = JSON.parse(localStorage.getItem('inventoryData')) || [];
  const tbody = document.querySelector('#inventory-table tbody');
  tbody.innerHTML = '';
  data.forEach((item, index) => {
    const row = tbody.insertRow();
    row.innerHTML = `
      <td>${item.EquipmentType}</td>
      <td>${item.Equipment || ''}</td>
      <td>${item.Vendor}</td>
      <td>${item.BrandModel}</td>
      <td>${item.Profile}</td>
      <td>${item.Custodian}</td>
      <td>${item.AssetNo}</td>
      <td>${item.SerialNumber}</td>
      <td>${item.Location}</td>
      <td>${item.StartDate}</td>
      <td>${calculateDuration(item.StartDate)}</td>
      <td>${item.DateUpdated}</td>
      <td>
        <button class="btn btn-sm btn-primary me-1" onclick="editItem(${index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
      </td>
    `;
  });
}

// Save or update inventory item
function saveItem(event) {
  event.preventDefault();
  const form = event.target;
  const newItem = {
    EquipmentType: form.EquipmentType.value,
    Equipment: form.Equipment.value || '',
    Vendor: form.Vendor.value,
    BrandModel: form.BrandModel.value,
    Profile: form.Profile.value,
    Custodian: form.Custodian.value,
    AssetNo: form.AssetNo.value,
    SerialNumber: form.SerialNumber.value,
    Location: form.Location.value,
    StartDate: form.StartDate.value,
    DateUpdated: new Date().toISOString().split('T')[0]
  };

  const data = JSON.parse(localStorage.getItem('inventoryData')) || [];

  if (editIndex !== null) {
    data[editIndex] = newItem;
    editIndex = null;
  } else {
    data.push(newItem);
  }

  localStorage.setItem('inventoryData', JSON.stringify(data));
  form.reset();
  bootstrap.Modal.getInstance(document.getElementById('inventoryModal')).hide();
  loadInventory();
}

// Open modal to add new item
function openModal() {
  editIndex = null;
  document.getElementById('inventory-form').reset();
  document.getElementById('inventoryModalLabel').innerText = 'Add Inventory Item';
  document.getElementById('equipment-wrapper').style.display = 'none';
  document.getElementById('Equipment').removeAttribute('required');
  document.getElementById('DateUpdated').value = new Date().toISOString().split('T')[0];
  new bootstrap.Modal(document.getElementById('inventoryModal')).show();
}

// Edit an existing item
function editItem(index) {
  const data = JSON.parse(localStorage.getItem('inventoryData')) || [];
  const item = data[index];
  editIndex = index;

  document.getElementById('EquipmentType').value = item.EquipmentType;
  document.getElementById('Vendor').value = item.Vendor;
  document.getElementById('BrandModel').value = item.BrandModel;
  document.getElementById('Profile').value = item.Profile;
  document.getElementById('Custodian').value = item.Custodian;
  document.getElementById('AssetNo').value = item.AssetNo;
  document.getElementById('SerialNumber').value = item.SerialNumber;
  document.getElementById('Location').value = item.Location;
  document.getElementById('StartDate').value = item.StartDate;
  document.getElementById('DateUpdated').value = new Date().toISOString().split('T')[0];

  // Show equipment if SSOE
  if (item.EquipmentType === 'SSOE') {
    document.getElementById('equipment-wrapper').style.display = 'block';
    document.getElementById('Equipment').setAttribute('required', 'required');
    document.getElementById('Equipment').value = item.Equipment || '';
  } else {
    document.getElementById('equipment-wrapper').style.display = 'none';
    document.getElementById('Equipment').removeAttribute('required');
    document.getElementById('Equipment').value = '';
  }

  document.getElementById('inventoryModalLabel').innerText = 'Edit Inventory Item';
  new bootstrap.Modal(document.getElementById('inventoryModal')).show();
}

// Delete an item
function deleteItem(index) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  const data = JSON.parse(localStorage.getItem('inventoryData')) || [];
  data.splice(index, 1);
  localStorage.setItem('inventoryData', JSON.stringify(data));
  loadInventory();
}

// Calculate duration in years and months
function calculateDuration(startDate) {
  if (!startDate) return '';
  const start = new Date(startDate);
  const now = new Date();
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years}y ${months}m`;
}

// Filter table
function filterTable() {
  const search = document.getElementById('search-inventory').value.toLowerCase();
  const filter = document.getElementById('filter-equipmenttype').value;
  const rows = document.querySelectorAll('#inventory-table tbody tr');

  rows.forEach(row => {
    const text = row.innerText.toLowerCase();
    const equipment = row.cells[1].innerText;
    const matchesSearch = text.includes(search);
    const matchesFilter = filter === 'all' || equipment === filter;
    row.style.display = matchesSearch && matchesFilter ? '' : 'none';
  });
}
