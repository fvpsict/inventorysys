// fault-report.js

// Initialize data array
let faultData = JSON.parse(localStorage.getItem('faultData')) || [];
let editingIndex = null;

const faultTableBody = document.querySelector('#fault-table tbody');
const addFaultBtn = document.getElementById('add-fault-btn');
const faultModal = new bootstrap.Modal(document.getElementById('faultModal'));
const faultForm = document.getElementById('fault-modal-form');

const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-fault');

// Render the fault table rows
function renderFaultTable() {
  faultTableBody.innerHTML = '';

  // Apply filter and search
  const filterValue = filterSelect.value.toLowerCase();
  const searchTerm = searchInput.value.toLowerCase();

  faultData.forEach((fault, index) => {
    // Filter by EquipmentType
    if (filterValue !== 'all' && fault.EquipmentType.toLowerCase() !== filterValue) return;

    // Search in multiple fields
    const searchableStr = Object.values(fault).join(' ').toLowerCase();
    if (!searchableStr.includes(searchTerm)) return;

    // Create table row
    const tr = document.createElement('tr');

    // Date Reported
    tr.appendChild(createCell(fault.DateReported));
    tr.appendChild(createCell(fault.EquipmentType));
    tr.appendChild(createCell(fault.Equipment));
    tr.appendChild(createCell(fault.AssetNo));
    tr.appendChild(createCell(fault.BrandModel));
    tr.appendChild(createCell(fault.SerialNumber));
    tr.appendChild(createCell(fault.Location));
    tr.appendChild(createCell(fault.RoomNumber));
    tr.appendChild(createCell(fault.FaultDescription));
    tr.appendChild(createCell(fault.Status));
    tr.appendChild(createCell(fault.DateUpdated));

    // Actions cell with Edit and Delete buttons
    const actionsTd = document.createElement('td');

    // Edit button
    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-primary btn-sm me-2';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => {
      openEditModal(index);
    });
    actionsTd.appendChild(editBtn);

    // Delete button
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this fault report?')) {
        deleteFault(index);
      }
    });
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);

    faultTableBody.appendChild(tr);
  });
}

function createCell(text) {
  const td = document.createElement('td');
  td.textContent = text || '';
  return td;
}

// Open modal for adding new fault
addFaultBtn.addEventListener('click', () => {
  editingIndex = null;
  faultForm.reset();
  faultForm.DateUpdated.value = '';
  faultModal.show();
});

// Open modal for editing fault
function openEditModal(index) {
  editingIndex = index;
  const fault = faultData[index];
  for (const key in fault) {
    if (faultForm.elements.namedItem(key)) {
      faultForm.elements.namedItem(key).value = fault[key];
    }
  }
  faultModal.show();
}

// Save fault (add or update)
faultForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Gather form data
  const formData = {};
  for (const element of faultForm.elements) {
    if (element.name) {
      formData[element.name] = element.value;
    }
  }

  // Set DateUpdated to today’s date
  const todayStr = new Date().toISOString().split('T')[0];
  formData.DateUpdated = todayStr;

  if (editingIndex !== null) {
    faultData[editingIndex] = formData;
  } else {
    faultData.push(formData);
  }

  saveFaultData();
  faultModal.hide();
  renderFaultTable();
});

// Delete fault by index
function deleteFault(index) {
  faultData.splice(index, 1);
  saveFaultData();
  renderFaultTable();
}

// Save data to localStorage
function saveFaultData() {
  localStorage.setItem('faultData', JSON.stringify(faultData));
}

// Filter and search events
filterSelect.addEventListener('change', renderFaultTable);
searchInput.addEventListener('input', renderFaultTable);

// Initial render
renderFaultTable();
