document.addEventListener('DOMContentLoaded', () => {
  const inventoryTableBody = document.querySelector('#inventoryTable tbody');
  const inventoryForm = document.getElementById('inventoryForm');
  const addInventoryModal = new bootstrap.Modal(document.getElementById('addInventoryModal'));

  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  function renderInventory() {
    inventoryTableBody.innerHTML = '';
    inventory.forEach((item, idx) => {
      const tr = document.createElement('tr');

      ['AssetNo', 'EquipmentType', 'Vendor', 'BrandModel', 'SerialNumber', 'Location', 'StartDate', 'EndDate'].forEach((key) => {
        const td = document.createElement('td');
        td.textContent = item[key] || '';
        tr.appendChild(td);
      });

      const actionTd = document.createElement('td');
      // Delete button
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'btn btn-sm btn-danger me-2';
      deleteBtn.addEventListener('click', () => {
        if (confirm('Delete this inventory item?')) {
          inventory.splice(idx, 1);
          localStorage.setItem('inventory', JSON.stringify(inventory));
          renderInventory();
        }
      });
      actionTd.appendChild(deleteBtn);

      // Edit button (optional - can add editing)
      // ...

      tr.appendChild(actionTd);

      inventoryTableBody.appendChild(tr);
    });
  }

  inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(inventoryForm);
    const newItem = {};
    for (const [key, value] of formData.entries()) {
      newItem[key] = value.trim();
    }
    // Check unique AssetNo
    if (inventory.some(item => item.AssetNo === newItem.AssetNo)) {
      alert('AssetNo must be unique!');
      return;
    }
    inventory.push(newItem);
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderInventory();
    inventoryForm.reset();
    addInventoryModal.hide();
  });

  renderInventory();
});
