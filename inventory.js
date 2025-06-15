// inventory.js

const equipmentTypes = [
  'SSOE', 'Projector', 'Projector Screen', 'Touch Panel', 'Visualiser', 'SMax',
  'Macbook', 'Portable HDD', 'TV', 'Monitor', 'OMR'
];

const headers = [
  'EquipmentType', 'Vendor', 'BrandModel', 'Profile', 'Custodian', 'AssetNo',
  'SerialNumber', 'Location', 'EndDate', 'StartDate', 'Hostname',
  'SSOE PO Number', 'Cart No', 'SanitiseDate', 'Duration in use',
  'Lamp Hour', 'DateUpdated', 'Actions'
];

let inventory = JSON.parse(localStorage.getItem('inventoryData') || '[]');

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
};

const calculateDuration = (startDate) => {
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
};

function saveData() {
  localStorage.setItem('inventoryData', JSON.stringify(inventory));
}

function renderTable() {
  const tbody = document.querySelector('#inventory-table tbody');
  tbody.innerHTML = '';
  inventory.forEach((item, index) => {
    const row = document.createElement('tr');
    row.classList.add('category-' + item.EquipmentType.replace(/\s+/g, '-').toLowerCase());

    headers.forEach(header => {
      const td = document.createElement('td');
      if (header === 'Duration in use') {
        td.textContent = calculateDuration(item['StartDate']);
      } else if (['EndDate', 'StartDate', 'DateUpdated'].includes(header)) {
        td.textContent = formatDate(item[header]);
      } else if (header === 'Actions') {
        td.innerHTML = `
          <button class="btn btn-sm btn-primary" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
        `;
      } else {
        td.textContent = item[header] || '';
      }
      row.appendChild(td);
    });
    tbody.appendChild(row);
  });
}

function openForm(item = {}, index = null) {
  const form = document.getElementById('inventory-form');
  form.innerHTML = '';

  headers.forEach(header => {
    if (header === 'Actions' || header === 'Duration in use') return;
    const div = document.createElement('div');
    div.className = 'mb-3';
    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = header;
    const input = document.createElement(
      header === 'EquipmentType' ? 'select' : 'input'
    );
    input.name = header;
    input.className = 'form-control';
    input.value = item[header] || '';
    if (header === 'EquipmentType') {
      equipmentTypes.forEach(type => {
        const opt = document.createElement('option');
        opt.value = type;
        opt.textContent = type;
        if (opt.value === item[header]) opt.selected = true;
        input.appendChild(opt);
      });
    } else if (header.toLowerCase().includes('date')) {
      input.type = 'date';
      if (item[header]) input.value = new Date(item[header]).toISOString().split('T')[0];
    } else {
      input.type = 'text';
    }
    div.appendChild(label);
    div.appendChild(input);
    form.appendChild(div);
  });

  const saveBtn = document.createElement('button');
  saveBtn.className = 'btn btn-success';
  saveBtn.textContent = 'Save';
  saveBtn.onclick = (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newItem = {};
    headers.forEach(h => {
      if (h !== 'Actions' && h !== 'Duration in use') {
        newItem[h] = formData.get(h);
      }
    });
    newItem['DateUpdated'] = new Date().toISOString();
    if (index !== null) inventory[index] = newItem;
    else inventory.push(newItem);
    saveData();
    renderTable();
    bootstrap.Modal.getInstance(document.getElementById('inventoryModal')).hide();
  };

  form.appendChild(saveBtn);
  new bootstrap.Modal(document.getElementById('inventoryModal')).show();
}

function editItem(index) {
  openForm(inventory[index], index);
}

function deleteItem(index) {
  if (confirm('Are you sure you want to delete this item?')) {
    inventory.splice(index, 1);
    saveData();
    renderTable();
  }
}

document.getElementById('add-item-btn').addEventListener('click', () => openForm());
document.addEventListener('DOMContentLoaded', renderTable);
