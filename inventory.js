const inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');
const tableBody = document.querySelector('#inventory-table tbody');
const form = document.getElementById('inventory-modal-form');
const modalElement = document.getElementById('inventoryModal');
const modal = new bootstrap.Modal(modalElement);
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-inventory');

let editingIndex = null;

// Render inventory table
function renderTable() {
  tableBody.innerHTML = '';
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory
    .filter(item => {
      const matchesFilter = filter === 'all' || item.equipmentType?.toLowerCase() === filter;
      const matchesSearch = Object.values(item).some(val => (val || '').toLowerCase().includes(search));
      return matchesFilter && matchesSearch;
    })
    .forEach((item, index) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td>${item.equipmentType || ''}</td>
        <td>${item.equipment || ''}</td>
        <td>${item.assetNo || ''}</td>
        <td>${item.serialNumber || ''}</td>
        <td>${item.dateUpdated || ''}</td>
        <td>
          <button class="btn btn-sm btn-primary" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
        </td>`;
      tableBody.appendChild(row);
    });
}

// Reset form before adding
function resetForm() {
  form.reset();
  editingIndex = null;
  form.classList.remove('was-validated');
  document.getElementById('dateUpdated').value = new Date().toLocaleDateString();
}

// Edit item
window.editItem = function(index) {
  editingIndex = index;
  const item = inventory[index];
  for (const key in item) {
    const input = form.elements.namedItem(key);
    if (input) input.value = item[key];
  }
  modal.show();
}

// Delete item
window.deleteItem = function(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    saveAndRender();
  }
}

// Save or update item
form.addEventListener('submit', e => {
  e.preventDefault();
  if (!form.checkValidity()) {
    form.classList.add('was-validated');
    return;
  }

  const formData = new FormData(form);
  const item = Object.fromEntries(formData.entries());
  item.dateUpdated = new Date().toLocaleDateString();

  if (editingIndex !== null) {
    inventory[editingIndex] = item;
  } else {
    // Prevent duplicate Asset No
    if (inventory.some(i => i.assetNo === item.assetNo)) {
      alert('Asset No must be unique.');
      return;
    }
    inventory.push(item);
  }

  saveAndRender();
  modal.hide();
  form.reset();
});

// Save to localStorage and render
function saveAndRender() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
  renderTable();
}

// Event bindings
document.getElementById('add-item-btn').addEventListener('click', resetForm);
filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);

// Initial render
renderTable();
