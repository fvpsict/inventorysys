// inventory.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('inventoryForm');
  const tableBody = document.querySelector('#inventoryTable tbody');
  let inventory = JSON.parse(localStorage.getItem('inventory')) || [];

  function renderTable() {
    tableBody.innerHTML = '';
    inventory.forEach((item, index) => {
      const tr = document.createElement('tr');
      Object.keys(item).forEach((key) => {
        const td = document.createElement('td');
        td.textContent = item[key];
        td.contentEditable = key !== 'AssetNo'; // AssetNo not editable
        td.dataset.field = key;
        td.dataset.index = index;
        tr.appendChild(td);
      });
      // Actions column
      const actionTd = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'btn btn-sm btn-danger';
      deleteBtn.onclick = () => {
        inventory.splice(index, 1);
        saveAndRender();
      };
      actionTd.appendChild(deleteBtn);
      tr.appendChild(actionTd);

      tableBody.appendChild(tr);
    });
  }

  function saveAndRender() {
    localStorage.setItem('inventory', JSON.stringify(inventory));
    renderTable();
  }

  // Add new item
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newItem = {};
    for (const [key, value] of formData.entries()) {
      newItem[key] = value.trim();
    }
    // Prevent duplicates by AssetNo
    if (inventory.find(i => i.AssetNo === newItem.AssetNo)) {
      alert('AssetNo must be unique.');
      return;
    }
    inventory.push(newItem);
    saveAndRender();
    form.reset();
  });

  // Inline editing
  tableBody.addEventListener('input', (e) => {
    const target = e.target;
    if (target.tagName.toLowerCase() === 'td' && target.dataset.index !== undefined) {
      const index = Number(target.dataset.index);
      const field = target.dataset.field;
      inventory[index][field] = target.textContent.trim();
      localStorage.setItem('inventory', JSON.stringify(inventory));
    }
  });

  renderTable();
});
