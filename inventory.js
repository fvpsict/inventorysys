const inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');
const tableBody = document.querySelector('#inventory-table tbody');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-inventory');
const form = document.getElementById('inventory-modal-form');
const modalElement = document.getElementById('inventoryModal');
const modal = new bootstrap.Modal(modalElement);
let editingIndex = null;

function renderTable() {
  tableBody.innerHTML = '';
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory
    .filter(item => {
      const matchFilter = filter === 'all' || item.equipmentType?.toLowerCase() === filter;
      const matchSearch = Object.values(item).some(val => (val || '').toLowerCase().includes(search));
      return matchFilter && matchSearch;
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

function resetForm() {
  form.reset();
  editingIndex = null;
  form.classList.remove('was-validated');
  document.getElementById('dateUpdated').value = new Date().toLocaleDateString();
}

function editItem(index) {
  editingIndex = index;
  const item = inventory[index];
  Object.keys(item).forEach(key => {
    const input = form.elements.namedItem(key);
    if (input) input.value = item[key];
  });
  modal.show();
}

function deleteItem(index) {
  if (confirm('Delete this item?')) {
    inventory.splice(index, 1);
    saveAndRender();
  }
}

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
    inventory.push(item);
  }

  saveAndRender();
  modal.hide();
});

function saveAndRender() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
  renderTable();
}

filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);
document.getElementById('add-item-btn').addEventListener('click', resetForm);

renderTable();
