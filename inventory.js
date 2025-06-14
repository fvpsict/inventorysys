document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inventoryForm');
  const tableBody = document.querySelector('#inventoryTable tbody');
  const addInventoryModal = new bootstrap.Modal(document.getElementById('addInventoryModal'));

  // Load inventory from localStorage or empty array
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  // Render inventory table rows
  function renderTable() {
    tableBody.innerHTML = '';
    inventory.forEach((item, index) => {
      const tr = document.createElement('tr');

      // For each property in item, create a cell
      Object.keys(item).forEach((key) => {
        const td = document.createElement('td');
        td.textContent = item[key];
        // Make editable except AssetNo (unique ID)
        td.contentEditable = key !== 'AssetNo';
        td.dataset.field = key;
        td.dataset.index = index;
        tr.appendChild(td);
      });

      // Actions column with Delete button
      const actionTd = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'btn btn-sm btn-danger';
      deleteBtn.onclick = () => {
        if (confirm('Are you sure you want to delete this item?')) {
          inventory.splice(index, 1);
          saveAndRender();
        }
      };
      actionTd.appendChild(deleteBtn);
      tr.appendChild(actionTd);

      tableBody.appendChild(tr);
    });
  }

  // Save to localStorage and re-render table
  function saveAndRender() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderTable();
  }

  // Handle form submit - add new item
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const formData = new FormData(form);
    const newItem = {};
    for (const [key, value] of formData.entries()) {
      newItem[key] = value.trim();
    }

    // Validate unique AssetNo
    if (inventory.find(i => i.AssetNo === newItem.AssetNo)) {
      alert('AssetNo must be unique.');
      return;
    }

    inventory.push(newItem);
    saveAndRender();

    form.reset();
    addInventoryModal.hide();
  });

  // Handle inline table editing
  tableBody.addEventListener('input', (e) => {
    const target = e.target;
    if (target.tagName.toLowerCase() === 'td' && target.dataset.index !== undefined) {
      const index = Number(target.dataset.index);
      const field = target.dataset.field;

      // Update inventory item with new text content
      inventory[index][field] = target.textContent.trim();
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  });

  renderTable();
});
