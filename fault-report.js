// fault-report.js

const faultTableBody = document.querySelector('#fault-table tbody');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-fault');
const addFaultBtn = document.getElementById('add-fault-btn');
const faultModalElement = document.getElementById('faultModal');
const faultModal = new bootstrap.Modal(faultModalElement);
const faultForm = document.getElementById('fault-modal-form');

let faultData = JSON.parse(localStorage.getItem('faultData')) || [];
let editingIndex = null;

// --- Date formatting helpers ---

// Format date string "yyyy-mm-dd" to "DD Month YYYY"
function formatDateDisplay(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr; // fallback if invalid date
  const options = { day: '2-digit', month: 'long', year: 'numeric' };
  return date.toLocaleDateString('en-GB', options);
}

// Format "DD Month YYYY" or other string back to "yyyy-mm-dd" for input[type=date]
function formatDateInput(dateStr) {
  if (!dateStr) return '';
  // If already ISO yyyy-mm-dd, return as is
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try to parse date string with Date object
  const date = new Date(dateStr);
  if (!isNaN(date)) {
    return date.toISOString().split('T')[0];
  }

  // Try parsing "DD Month YYYY"
  const parts = dateStr.split(' ');
  if (parts.length === 3) {
    const day = parts[0].padStart(2, '0');
    const monthName = parts[1];
    const year = parts[2];
    const monthIndex = new Date(`${monthName} 1, 2000`).getMonth();
    if (monthIndex >= 0) {
      const monthPadded = (monthIndex + 1).toString().padStart(2, '0');
      return `${year}-${monthPadded}-${day}`;
    }
  }
  return '';
}

// --- Utility to create a table cell ---
function createCell(text) {
  const td = document.createElement('td');
  td.textContent = text ?? '';
  return td;
}

// --- Render the fault table ---
function renderFaultTable() {
  faultTableBody.innerHTML = '';

  const filterValue = filterSelect.value.toLowerCase();
  const searchTerm = searchInput.value.toLowerCase();

  faultData.forEach((fault, index) => {
    if (filterValue !== 'all' && fault.EquipmentType.toLowerCase() !== filterValue) return;

    const searchableStr = Object.values(fault).join(' ').toLowerCase();
    if (!searchableStr.includes(searchTerm)) return;

    const tr = document.createElement('tr');

    // Format dates for display
    tr.appendChild(createCell(formatDateDisplay(fault.DateReported)));
    tr.appendChild(createCell(fault.EquipmentType));
    tr.appendChild(createCell(fault.Equipment));
    tr.appendChild(createCell(fault.AssetNo));
    tr.appendChild(createCell(fault.BrandModel));
    tr.appendChild(createCell(fault.SerialNumber));
    tr.appendChild(createCell(fault.Location));
    tr.appendChild(createCell(fault.RoomNumber));
    tr.appendChild(createCell(fault.FaultDescription));
    tr.appendChild(createCell(fault.Status));
    tr.appendChild(createCell(formatDateDisplay(fault.DateUpdated)));

    // Actions (Edit/Delete)
    const actionsTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-primary btn-sm me-2';
    editBtn.textContent = 'Edit';
    editBtn.addEventListener('click', () => openEditModal(index));
    actionsTd.appendChild(editBtn);

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-danger btn-sm delete-btn';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to delete this fault report?')) deleteFault(index);
    });
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);
    faultTableBody.appendChild(tr);
  });
}

// --- Open modal for adding a new fault ---
function openAddModal() {
  editingIndex = null;
  faultForm.reset();

  // Set DateReported to today by default
  const todayStr = new Date().toISOString().split('T')[0];
  faultForm.elements['DateReported'].value = todayStr;
  faultForm.elements['DateUpdated'].value = todayStr;

  faultModal.show();
}

// --- Open modal for editing an existing fault ---
function openEditModal(index) {
  editingIndex = index;
  const fault = faultData[index];

  for (const key in fault) {
    if (faultForm.elements.namedItem(key)) {
      if (key === 'DateReported' || key === 'DateUpdated') {
        faultForm.elements.namedItem(key).value = formatDateInput(fault[key]);
      } else {
        faultForm.elements.namedItem(key).value = fault[key];
      }
    }
  }

  faultModal.show();
}

// --- Save the fault from modal form ---
function saveFault(event) {
  event.preventDefault();

  const formData = new FormData(faultForm);
  const newFault = {};

  for (const [key, value] of formData.entries()) {
    newFault[key] = value.trim();
  }

  // Set DateUpdated to today on save
  newFault.DateUpdated = new Date().toISOString().split('T')[0];

  if (editingIndex !== null) {
    faultData[editingIndex] = newFault;
  } else {
    faultData.push(newFault);
  }

  localStorage.setItem('faultData', JSON.stringify(faultData));
  renderFaultTable();
  faultModal.hide();
}

// --- Delete fault at index ---
function deleteFault(index) {
  faultData.splice(index, 1);
  localStorage.setItem('faultData', JSON.stringify(faultData));
  renderFaultTable();
}

// --- Event Listeners ---
addFaultBtn.addEventListener('click', openAddModal);
faultForm.addEventListener('submit', saveFault);
filterSelect.addEventListener('change', renderFaultTable);
searchInput.addEventListener('input', renderFaultTable);

// Initial render
renderFaultTable();
