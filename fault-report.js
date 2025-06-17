const faultForm = document.getElementById('fault-modal-form');
const faultTableBody = document.querySelector('#fault-table tbody');
let editingRow = null;

// Load from localStorage
let faultData = JSON.parse(localStorage.getItem('faultData') || '[]');
renderFaultTable(faultData);

// Add Fault
document.getElementById('add-fault-btn').addEventListener('click', () => {
  editingRow = null;
  faultForm.reset();
  new bootstrap.Modal(document.getElementById('faultModal')).show();
});

faultForm.addEventListener('submit', function (e) {
  e.preventDefault();
  const data = Object.fromEntries(new FormData(faultForm).entries());

  if (editingRow) {
    faultData[editingRow] = data;
  } else {
    faultData.push(data);
  }

  localStorage.setItem('faultData', JSON.stringify(faultData));
  renderFaultTable(faultData);
  bootstrap.Modal.getInstance(document.getElementById('faultModal')).hide();
});

function renderFaultTable(data) {
  faultTableBody.innerHTML = '';
  data.forEach((item, index) => {
    const row = document.createElement('tr');

    row.innerHTML = `
      <td>${item.DateReported || ''}</td>
      <td>${item.EquipmentType || ''}</td>
      <td>${item.Equipment || ''}</td>
      <td>${item.AssetNo || ''}</td>
      <td>${item.BrandModel || ''}</td>
      <td>${item.SerialNumber || ''}</td>
      <td>${item.Location || ''}</td>
      <td>${item.RoomNumber || ''}</td>
      <td>${item.FaultDescription || ''}</td>
      <td>
        <select class="form-select form-select-sm status-dropdown">
          <option${item.Status === 'Open' ? ' selected' : ''}>Open</option>
          <option${item.Status === 'In Progress' ? ' selected' : ''}>In Progress</option>
          <option${item.Status === 'Pending vendor' ? ' selected' : ''}>Pending vendor</option>
          <option${item.Status === 'Resolved' ? ' selected' : ''}>Resolved</option>
          <option${item.Status === 'Closed' ? ' selected' : ''}>Closed</option>
        </select>
      </td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;

    faultTableBody.appendChild(row);
  });
}

faultTableBody.addEventListener('click', function (e) {
  const index = e.target.dataset.index;

  if (e.target.classList.contains('edit-btn')) {
    const item = faultData[index];
    Object.entries(item).forEach(([key, value]) => {
      if (faultForm.elements[key]) faultForm.elements[key].value = value;
    });
    editingRow = index;
    new bootstrap.Modal(document.getElementById('faultModal')).show();
  }

  if (e.target.classList.contains('delete-btn')) {
    if (confirm('Delete this fault report?')) {
      faultData.splice(index, 1);
      localStorage.setItem('faultData', JSON.stringify(faultData));
      renderFaultTable(faultData);
    }
  }
});

// Handle status change
faultTableBody.addEventListener('change', function (e) {
  if (e.target.classList.contains('status-dropdown')) {
    const rowIndex = [...faultTableBody.children].indexOf(e.target.closest('tr'));
    faultData[rowIndex].Status = e.target.value;
    localStorage.setItem('faultData', JSON.stringify(faultData));
  }
});

// Filter and search
document.getElementById('filter-equipmenttype').addEventListener('change', filterAndSearch);
document.getElementById('search-fault').addEventListener('input', filterAndSearch);

function filterAndSearch() {
  const filter = document.getElementById('filter-equipmenttype').value.toLowerCase();
  const search = document.getElementById('search-fault').value.toLowerCase();

  const filtered = faultData.filter(item => {
    const matchesFilter = filter === 'all' || item.EquipmentType?.toLowerCase() === filter;
    const matchesSearch = Object.values(item).some(value =>
      value?.toLowerCase().includes(search)
    );
    return matchesFilter && matchesSearch;
  });

  renderFaultTable(filtered);
}
