const STORAGE_KEY = 'inventoryData';

function getInventory() {
  const data = localStorage.getItem(STORAGE_KEY);
  return data ? JSON.parse(data) : [];
}

function saveInventory(items) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

function renderInventoryTable() {
  const items = getInventory();
  const tbody = document.getElementById('inventoryTbody');
  tbody.innerHTML = '';

  items.forEach((item, idx) => {
    const tr = document.createElement('tr');

    // Create editable cells for each property
    Object.keys(item).forEach(key => {
      const td = document.createElement('td');
      td.contentEditable = true;
      td.textContent = item[key];
      td.addEventListener('input', () => {
        item[key] = td.textContent.trim();
        saveInventory(items);
      });
      tr.appendChild(td);
    });

    // Delete button cell
    const delTd = document.createElement('td');
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.className = 'btn btn-danger btn-sm';
    delBtn.onclick = () => {
      if (confirm('Delete this item?')) {
        items.splice(idx, 1);
        saveInventory(items);
        renderInventoryTable();
      }
    };
    delTd.appendChild(delBtn);
    tr.appendChild(delTd);

    tbody.appendChild(tr);
  });
}

function addInventoryItem(event) {
  event.preventDefault();

  const form = event.target;
  const newItem = {};
  [...form.elements].forEach(el => {
    if (el.tagName === 'INPUT' || el.tagName === 'SELECT' || el.tagName === 'TEXTAREA') {
      newItem[el.name] = el.value.trim();
    }
  });

  const items = getInventory();
  items.push(newItem);
  saveInventory(items);
  renderInventoryTable();
  form.reset();
}

window.onload = () => {
  renderInventoryTable();
  const form = document.getElementById('inventoryForm');
  if (form) form.addEventListener('submit', addInventoryItem);

  // Highlight active menu item
  document.querySelectorAll('.menu-list li a').forEach(link => {
    if (link.href === window.location.href) {
      link.parentElement.classList.add('active');
    }
  });
};
