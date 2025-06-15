// inventory.js

const table = document.getElementById('inventoryTable');
const tbody = table.querySelector('tbody');
const form = document.getElementById('inventoryForm');
const modal = new bootstrap.Modal(document.getElementById('inventoryModal'));
const searchInput = document.getElementById('searchInput');

const equipmentTypeColors = {
  "SSOE": "#ffcccc",
  "Projector": "#ccffcc",
  "Projector Screen": "#ccccff",
  "Touch Panel": "#ffffcc",
  "Visualiser": "#ffccff",
  "SMax": "#ccffff",
  "Macbook": "#e6ccff",
  "Portable HDD": "#ffebcc",
  "TV": "#d9ffcc",
  "Monitor": "#cce5ff",
  "OMR": "#ffd9cc"
};

// Fields for default categories
const defaultFormFields = [
  { name: "EquipmentType", label: "Equipment Type", required: true },
  { name: "Vendor", label: "Vendor" },
  { name: "BrandModel", label: "Brand / Model" },
  { name: "Profile", label: "Profile" },
  { name: "Custodian", label: "Custodian" },
  { name: "AssetNo", label: "Asset No", required: true },
  { name: "SerialNumber", label: "Serial Number" },
  { name: "Location", label: "Location" },
  { name: "EndDate", label: "End Date", type: "date" },
  { name: "StartDate", label: "Start Date", type: "date" },
  { name: "Hostname", label: "Hostname" },
  { name: "SSOE_PONumber", label: "SSOE PO Number" },
  { name: "CartNo", label: "Cart No" },
  { name: "SanitiseDate", label: "Sanitise Date", type: "date" },
  { name: "DurationInUse", label: "Duration in use", readonly: true },
  { name: "LampHour", label: "Lamp Hour" },
  { name: "DateUpdated", label: "Date Updated", readonly: true, type: "date" }
];

// Fields for SSOE category (customize if different)
const ssoeFormFields = [
  { name: "EquipmentType", label: "Equipment Type", required: true },
  { name: "Vendor", label: "Vendor" },
  { name: "BrandModel", label: "Brand / Model" },
  { name: "Profile", label: "Profile" },
  { name: "Custodian", label: "Custodian" },
  { name: "AssetNo", label: "Asset No", required: true },
  { name: "SerialNumber", label: "Serial Number" },
  { name: "Location", label: "Location" },
  { name: "EndDate", label: "End Date", type: "date" },
  { name: "StartDate", label: "Start Date", type: "date" },
  { name: "Hostname", label: "Hostname" },
  { name: "SSOE_PONumber", label: "SSOE PO Number" },
  { name: "CartNo", label: "Cart No" },
  { name: "SanitiseDate", label: "Sanitise Date", type: "date" },
  { name: "DurationInUse", label: "Duration in use", readonly: true },
  { name: "LampHour", label: "Lamp Hour" },
  { name: "DateUpdated", label: "Date Updated", readonly: true, type: "date" }
];

// Utility: format date as "DD MMM YYYY"
function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return '';
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

// Calculate duration in use (StartDate to EndDate or today)
function calculateDuration(start, end) {
  if (!start) return '';
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (isNaN(startDate) || isNaN(endDate)) return '';

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years} yr${years !== 1 ? 's' : ''} ${months} mo${months !== 1 ? 's' : ''}`;
}

// Render the inventory table rows from localStorage data
function renderTable() {
  const data = JSON.parse(localStorage.getItem('inventoryData')) || [];
  tbody.innerHTML = '';

  data.forEach(item => {
    const tr = document.createElement('tr');

    // Highlight row based on EquipmentType
    const bgColor = equipmentTypeColors[item.EquipmentType] || '';
    if (bgColor) {
      tr.style.backgroundColor = bgColor;
    }

    // Create cells for each header column
    [
      'EquipmentType', 'Vendor', 'BrandModel', 'Profile', 'Custodian',
      'AssetNo', 'SerialNumber', 'Location', 'EndDate', 'StartDate',
      'Hostname', 'SSOE_PONumber', 'CartNo', 'SanitiseDate',
      'DurationInUse', 'LampHour', 'DateUpdated'
    ].forEach(key => {
      const td = document.createElement('td');
      if (key === 'DurationInUse') {
        td.textContent = calculateDuration(item.StartDate, item.EndDate);
      } else if (['EndDate', 'StartDate', 'SanitiseDate', 'DateUpdated'].includes(key)) {
        td.textContent = formatDate(item[key]);
      } else {
        td.textContent = item[key] || '';
      }
      tr.appendChild(td);
    });

    // Actions cell
    const actionsTd = document.createElement('td');
    actionsTd.innerHTML = `
      <button class="btn btn-sm btn-primary edit-btn">Edit</button>
      <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    `;
    tr.appendChild(actionsTd);

    tbody.appendChild(tr);

    // Attach event listeners for edit and delete buttons
    actionsTd.querySelector('.edit-btn').addEventListener('click', () => openEditForm(item.AssetNo));
    actionsTd.querySelector('.delete-btn').addEventListener('click', () => deleteItem(item.AssetNo));
  });
}

// Open the form modal for adding a new item
function openAddForm() {
  form.dataset.editing = 'false';
  form.dataset.assetno = '';
  buildFormFields('SSOE'); // default equipment type
  form.reset();
  modal.show();
}

// Open the form modal for editing an existing item by AssetNo
function openEditForm(assetNo) {
  const data = JSON.parse(localStorage.getItem('inventoryData')) || [];
  const item = data.find(i => i.AssetNo === assetNo);
  if (!item) return alert('Item not found');

  form.dataset.editing = 'true';
  form.dataset.assetno = assetNo;

  buildFormFields(item.EquipmentType, item);
  modal.show();
}

// Delete an item by AssetNo with confirmation
function deleteItem(assetNo) {
  if (!confirm('Are you sure you want to delete this item?')) return;
  let data = JSON.parse(localStorage.getItem('inventoryData')) || [];
  data = data.filter(i => i.AssetNo !== assetNo);
  localStorage.setItem('inventoryData', JSON.stringify(data));
  renderTable();
}

// Build form fields dynamically depending on EquipmentType
function buildFormFields(equipmentType, values = {}) {
  const container = form.querySelector('.modal-body');
  container.innerHTML = ''; // Clear previous fields

  const fields = equipmentType === "SSOE" ? ssoeFormFields : defaultFormFields;

  fields.forEach(f => {
    const col = document.createElement('div');
    col.className = 'col-md-6 mb-3';

    const label = document.createElement('label');
    label.className = 'form-label';
    label.textContent = f.label;
    label.setAttribute('for', f.name);

    let input;

    if (f.name === "EquipmentType") {
      // Dropdown select for EquipmentType
      input = document.createElement('select');
      input.name = f.name;
      input.className = 'form-select';
      input.required = true;

      const options = [
        "SSOE",
        "Projector",
        "Projector Screen",
        "Touch Panel",
        "Visualiser",
        "SMax",
        "Macbook",
        "Portable HDD",
        "TV",
        "Monitor",
        "OMR"
      ];

      options.forEach(opt => {
        const option = document.createElement('option');
        option.value = opt;
        option.textContent = opt;
        if (values[f.name] === opt) option.selected = true;
        input.appendChild(option);
      });
    } else {
      input = document.createElement('input');
      input.type = f.type || 'text';
      input.className = 'form-control';
      input.name = f.name;
      if (f.readonly) input.readOnly = true;
      if (f.required) input.required = true;
      input.value = values[f.name] || '';
    }

    col.appendChild(label);
    col.appendChild(input);
    container.appendChild(col);
  });
}

// Handle form submission (add or edit)
form.addEventListener('submit', e => {
  e.preventDefault();

  const formData = new FormData(form);
  const newItem = {};

  for (const [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Validate required fields
  if (!newItem.EquipmentType) return alert('Equipment Type is required');
  if (!newItem.AssetNo) return alert('Asset No is required');

  // Set dateUpdated to today in ISO string
  const todayISO = new Date().toISOString().slice(0, 10);
  newItem.DateUpdated = todayISO;

  // Store formatted dates for EndDate, StartDate, SanitiseDate if present
  ['EndDate', 'StartDate', 'SanitiseDate'].forEach(dateField => {
    if (newItem[dateField]) {
      newItem[dateField] = newItem[dateField]; // ISO date string from input type=date
    }
  });

  // Get existing data
  let data = JSON.parse(localStorage.getItem('inventoryData')) || [];

  if (form.dataset.editing === 'true') {
    // Update existing item
    const idx = data.findIndex(i => i.AssetNo === form.dataset.assetno);
    if (idx === -1) return alert('Original item not found');
    data[idx] = { ...data[idx], ...newItem };
  } else {
    // Add new item
    if (data.find(i => i.AssetNo === newItem.AssetNo)) {
      return alert('Asset No must be unique');
    }
    data.push(newItem);
  }

  localStorage.setItem('inventoryData', JSON.stringify(data));
  modal.hide();
  renderTable();
});

// When EquipmentType changes, rebuild form fields (preserve existing values)
form.addEventListener('input', e => {
  if (e.target.name === 'EquipmentType') {
    const currentValues = {};
    new FormData(form).forEach((v, k) => currentValues[k] = v);
    buildFormFields(e.target.value, currentValues);
  }
});

// Search filter functionality
searchInput.addEventListener('input', () => {
  const filter = searchInput.value.toLowerCase();
  [...tbody.rows].forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? '' : 'none';
  });
});

// Initial render
renderTable();
