let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

function renderTable() {
  const tableBody = document.getElementById('tableBody');
  tableBody.innerHTML = '';
  inventory.forEach((item, index) => {
    tableBody.innerHTML += `
      <tr>
        <td>${item.name}</td>
        <td>${item.category}</td>
        <td>${item.quantity}</td>
        <td>
          <button class="btn btn-sm btn-warning" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
        </td>
      </tr>
    `;
  });
  localStorage.setItem('inventory', JSON.stringify(inventory));
}

function showAddModal() {
  document.getElementById('itemForm').reset();
  document.getElementById('editIndex').value = '';
  new bootstrap.Modal(document.getElementById('itemModal')).show();
}

function closeModal() {
  bootstrap.Modal.getInstance(document.getElementById('itemModal')).hide();
}

function saveItem(event) {
  event.preventDefault();
  const name = document.getElementById('itemName').value;
  const category = document.getElementById('itemCategory').value;
  const quantity = document.getElementById('itemQuantity').value;
  const editIndex = document.getElementById('editIndex').value;

  const newItem = { name, category, quantity };

  if (editIndex) {
    inventory[editIndex] = newItem;
  } else {
    inventory.push(newItem);
  }

  renderTable();
  closeModal();
}

function editItem(index) {
  const item = inventory[index];
  document.getElementById('itemName').value = item.name;
  document.getElementById('itemCategory').value = item.category;
  document.getElementById('itemQuantity').value = item.quantity;
  document.getElementById('editIndex').value = index;
  showAddModal();
}

function deleteItem(index) {
  if (confirm('Delete this item?')) {
    inventory.splice(index, 1);
    renderTable();
  }
}

renderTable();
