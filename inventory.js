// inventory.js

// Inventory array
let inventory = [];

// Form and UI elements
const form = document.getElementById('inventory-inline-form');
const tbody = document.querySelector('#inventory-table tbody');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-inventory');

let editingAssetNo = null; // track editing item by AssetNo

// Load inventory from localStorage
function loadInventory() {
  const stored = localStorage.getItem('inventory');
  inventory = stored ? JSON.parse(stored) : [];
  renderTable();
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

// Clear form fields
function clearForm() {
  form.reset();
  editingAssetNo = null;
  form.querySelector('[name="DateUpdated"]').value = '';
}

// Calculate duration between two dates in years and months
function calculateDuration(start, end) {
  if (!start) return '';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (startDate > endDate) return '';

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years}y ${months}m`;
}

// Render inventory table filtered and searched
function renderTable() {
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  tbody.innerHTML = '';

  // Filter and search
  let filtered = inventory.filter(item => {
    const matchesCategory = (filter === 'all' || filter === '') || (item.EquipmentType && item.EquipmentType.toLowerCase() === filter);
    const matchesSearch = Object.values(item).some(val =>
      val && val.toString().toLowerCase().includes(search)
    );
    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="18" class="text-center">No items found.</td></tr>`;
    return;
  }

  filtered.forEach(item => {
    const duration = calculateDuration(item.StartDate, item.EndDate);
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td>${item.EquipmentType || ''}</td>
        <td>${item.Vendor || ''}</td>
        <td>${item.BrandModel || ''}</td>
        <td>${item.Profile || ''}</td>
        <td>${item.Custodian || ''}</td>
        <td>${item.AssetNo || ''}</td>
        <td>${item.SerialNumber || ''}</td>
        <td>${item.Location || ''}</td>
        <td>${item.EndDate || ''}</td>
        <td>${item.StartDate || ''}</td>
        <td>${item.Hostname || ''}</td>
        <td>${item['SSOE PO Number'] || ''}</td>
        <td>${item['Cart No'] || ''}</td>
        <td>${item.SanitiseDate || ''}</td>
        <td>${duration}</td>
        <td>${item['Lamp Hour'] || ''}</td>
        <td>${item.DateUpdated || ''}</td>
        <td>
          <button class="btn btn-sm btn-warning me-1" onclick="editItem('${item.AssetNo}')">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem('${item.AssetNo}')">Delete</button>
        </td>
      </tr>
    `);
  });
}

// On form submit (add or update)
form.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(form);
  let newItem = {};
  for (let [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Validate required fields
  if (!newItem.EquipmentType) {
    alert('Please select Equipment Type.');
    return;
  }
  if (!newItem.AssetNo) {
    alert('Asset No is required.');
    return;
  }

  // Check unique AssetNo
  if (editingAssetNo) {
    if (editingAssetNo !== newItem.AssetNo && inventory.some(i => i.AssetNo === newItem.AssetNo)) {
      alert('Asset No must be unique.');
      return;
    }
  } else {
    if (inventory.some(i => i.AssetNo === newItem.AssetNo)) {
      alert('Asset No must be unique.');
      return;
    }
  }

  // Set DateUpdated to today yyyy-mm-dd
  newItem.DateUpdated = new Date().toISOString().slice(0, 10);

  if (editingAssetNo) {
    // Update existing item
    const index = inventory.findIndex(i => i.AssetNo === editingAssetNo);
    if (index !== -1) {
      inventory[index] = newItem;
    }
  } else {
    // Add new item
    inventory.push(newItem);
  }

  saveInventory();
  renderTable();
  clearForm();
  alert('Item saved.');
});

// Edit an item by AssetNo
window.editItem = function(assetNo) {
  const item = inventory.find(i => i.AssetNo === assetNo);
  if (!item) return alert('Item not found.');

  editingAssetNo = assetNo;

  // Populate form fields
  for (let [key, value] of Object.entries(item)) {
    const field = form.elements[key];
    if (field) {
      field.value = value;
    }
  }
};

// Delete item by AssetNo
window.deleteItem = function(assetNo) {
  if (!confirm('Are you sure you want to delete this item?')) return;

  inventory = inventory.filter(i => i.AssetNo !== assetNo);
  saveInventory();
  renderTable();
  if (editingAssetNo === assetNo) {
    clearForm();
  }
};

// Filter change
filterSelect.addEventListener('change', renderTable);

// Search input
searchInput.addEventListener('input', renderTable);

// Initial load
loadInventory();
