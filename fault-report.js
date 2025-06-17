// fault-report.js

const faultTableBody = document.querySelector('#fault-table tbody');
const addFaultBtn = document.getElementById('add-fault-btn');
const faultModal = new bootstrap.Modal(document.getElementById('faultModal'));
const faultForm = document.getElementById('fault-modal-form');
const filterSelect = document.getElementById('filter-equipmenttype');
const searchInput = document.getElementById('search-fault');

let faultData = JSON.parse(localStorage.getItem('faultData')) || [];
let editIndex = null;

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d)) return '';
  const day = d.getDate();
  const month = MONTH_NAMES[d.getMonth()];
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Converts a formatted date "dd MMMM yyyy" back to yyyy-mm-dd for inputs
function parseFormattedDate(formatted) {
  if (!formatted) return '';
  const parts = formatted.split(' ');
  if (parts.length !== 3) return '';
  const day = parts[0];
  const month = MONTH_NAMES.indexOf(parts[1]);
  const year = parts[2];
  if (month === -1) return '';
  // Format as yyyy-mm-dd for input value
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

function saveData() {
  localStorage.setItem('faultData', JSON.stringify(faultData));
}

function renderTable() {
  faultTableBody.innerHTML = '';

  // Apply filters and search
  const filter = filterSelect.value.toLowerCase();
  const searchTerm = searchInput.value.toLowerCase();

  faultData.forEach((fault, index) => {
    if (filter !== 'all' && fault.EquipmentType.toLowerCase() !== filter) return;
    const combinedText = Object.values(fault).join(' ').toLowerCase();
    if (!combinedText.includes(searchTerm)) return;

    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>${formatDate(fault.DateReported)}</td>
      <td>${fault.EquipmentType}</td>
      <td>${fault.Equipment || ''}</td>
      <td>${fault.AssetNo || ''}</td>
      <td>${fault.BrandModel || ''}</td>
      <td>${fault.SerialNumber || ''}</td>
      <td>${fault.Location || ''}</td>
      <td>${fault.RoomNumber || ''}</td>
      <td>${fault.FaultDescription}</td>
      <td>${fault.Status}</td>
      <td>${formatDate(fault.DateUpdated)}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
      </td>
    `;

    faultTableBody.appendChild(tr);
  });

  // Add event listeners for edit and delete buttons
  document.querySelectorAll('.btn-edit').forEach(btn =>
    btn.addEventListener('click', e => {
      editIndex = Number(e.target.dataset.index);
      openEditModal(editIndex);
    })
  );

  document.querySelectorAll('.btn-delete').forEach(btn =>
    btn.addEventListener('click', e => {
      const index = Number(e.target.dataset.index);
      if (confirm('Are you sure you want to delete this fault report?')) {
        faultData.splice(index, 1);
        saveData();
        renderTable();
      }
    })
  );
}

function openEditModal(index) {
  const fault = faultData[index];
  if (!fault) return;

  // Fill form with existing data, convert formatted dates back to yyyy-mm-dd for input fields
  faultForm.DateReported.value = parseFormattedDate(formatDate(fault.DateReported));
  faultForm.EquipmentType.value = fault.EquipmentType;
  faultForm.Equipment.value = fault.Equipment || '';
  faultForm.AssetNo.value = fault.AssetNo || '';
  faultForm.BrandModel.value = fault.BrandModel || '';
  faultForm.SerialNumber.value = fault.SerialNumber || '';
  faultForm.Location.value = fault.Location || '';
  faultForm.RoomNumber.value = fault.RoomNumber || '';
  faultForm.FaultDescription.value = fault.FaultDescription;
  faultForm.Status.value = fault.Status;
  faultForm.DateUpdated.value = formatDate(fault.DateUpdated);

  faultModal.show();
}

function resetForm() {
  faultForm.reset();
  faultForm.DateUpdated.value = '';
  editIndex = null;
}

addFaultBtn.addEventListener('click', () => {
  resetForm();
  // Set DateReported default to today in yyyy-mm-dd for input
  const today = new Date();
  faultForm.DateReported.value = today.toISOString().slice(0, 10);
  faultForm.Status.value = 'Open';
  faultForm.DateUpdated.value = '';
  editIndex = null;
  faultModal.show();
});

faultForm.addEventListener('submit', (e) => {
  e.preventDefault();

  // Read values from form
  const formData = {
    DateReported: faultForm.DateReported.value,
    EquipmentType: faultForm.EquipmentType.value,
    Equipment: faultForm.Equipment.value,
    AssetNo: faultForm.AssetNo.value.trim(),
    BrandModel: faultForm.BrandModel.value.trim(),
    SerialNumber: faultForm.SerialNumber.value.trim(),
    Location: faultForm.Location.value.trim(),
    RoomNumber: faultForm.RoomNumber.value.trim(),
    FaultDescription: faultForm.FaultDescription.value.trim(),
    Status: faultForm.Status.value,
    DateUpdated: new Date().toISOString().slice(0, 10) // always update DateUpdated to today
  };

  // Validate required
  if (!formData.DateReported || !formData.EquipmentType || !formData.FaultDescription || !formData.Status) {
    alert('Please fill in all required fields.');
    return;
  }

  if (editIndex !== null) {
    // Update existing fault
    faultData[editIndex] = formData;
  } else {
    // Add new fault
    faultData.push(formData);
  }

  saveData();
  renderTable();
  faultModal.hide();
  resetForm();
});

filterSelect.addEventListener('change', renderTable);
searchInput.addEventListener('input', renderTable);

// Initial render on page load
renderTable();
