// inventory.js

document.addEventListener('DOMContentLoaded', () => {
  const inventoryTableBody = document.querySelector('#inventory-table tbody');
  const addItemBtn = document.getElementById('add-item-btn');
  const filterCategory = document.getElementById('filter-category');
  const searchInput = document.getElementById('search-inventory');

  const modal = new bootstrap.Modal(document.getElementById('itemModal'));
  const itemForm = document.getElementById('itemForm');
  const itemModalLabel = document.getElementById('itemModalLabel');

  // Form fields
  const equipmentTypeInput = document.getElementById('equipmentType');
  const equipmentInput = document.getElementById('equipment');
  const vendorInput = document.getElementById('vendor');
  const brandModelInput = document.getElementById('brandModel');
  const profileInput = document.getElementById('profile');
  const custodianInput = document.getElementById('custodian');
  const assetNoInput = document.getElementById('assetNo');
  const serialNumberInput = document.getElementById('serialNumber');
  const locationInput = document.getElementById('location');
  const startDateInput = document.getElementById('startDate');
  const endDateInput = document.getElementById('endDate');

  let inventoryData = [];
  let editIndex = -1; // -1 means adding new

  // Load data from localStorage
  function loadData() {
    const saved = localStorage.getItem('inventoryData');
    if (saved) {
      try {
        inventoryData = JSON.parse(saved);
      } catch {
        inventoryData = [];
      }
    }
  }

  // Save data to localStorage
  function saveData() {
    localStorage.setItem('inventoryData', JSON.stringify(inventoryData));
  }

  // Calculate Duration in Use (years and months) from startDate and endDate
  function calculateDuration(startDateStr, endDateStr) {
    if (!startDateStr) return '';
    const startDate = new Date(startDateStr);
    let endDate = endDateStr ? new Date(endDateStr) : new Date();
    if (endDate < startDate) return '';

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let durationStr = '';
    if (years > 0) durationStr += years + (years === 1 ? ' yr ' : ' yrs ');
    if (months > 0) durationStr += months + (months === 1 ? ' mo' : ' mos');
    return durationStr.trim() || '0 mo';
  }

  // Render the inventory table rows based on current data and filters/search
  function renderTable() {
    const filterVal = filterCategory.value.trim().toLowerCase();
    const searchVal = searchInput.value.trim().toLowerCase();

    inventoryTableBody.innerHTML = '';

    inventoryData.forEach((item, index) => {
      // Filter by EquipmentType if set
      if (filterVal && item.equipmentType.toLowerCase() !== filterVal) return;

      // Search in all fields (except duration & actions)
      const searchableFields = [
        item.equipmentType,
        item.equipment || '',
        item.vendor,
        item.brandModel,
        item.profile,
        item.custodian,
        item.assetNo,
        item.serialNumber,
        item.location,
        item.startDate,
        item.endDate
      ];

      const matchesSearch = searchableFields.some(field =>
        field && field.toLowerCase().includes(searchVal)
      );
      if (!matchesSearch) return;

      const tr = document.createElement('tr');

      // Calculate duration in use for this row
      const duration = calculateDuration(item.startDate, item.endDate);

      tr.innerHTML = `
        <td>${item.equipmentType}</td>
        <td>${item.equipment || ''}</td>
        <td>${item.vendor || ''}</td>
        <td>${item.brandModel || ''}</td>
        <td>${item.profile || ''}</td>
        <td>${item.custodian || ''}</td>
        <td>${item.assetNo || ''}</td>
        <td>${item.serialNumber || ''}</td>
        <td>${item.location || ''}</td>
        <td>${item.startDate || ''}</td>
        <td>${item.endDate || ''}</td>
        <td>${duration}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger btn-delete ms-1" data-index="${index}">Delete</button>
        </td>
      `;

      inventoryTableBody.appendChild(tr);
    });

    // Attach event listeners to Edit and Delete buttons after render
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        openEditModal(idx);
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        const idx = parseInt(e.target.getAttribute('data-index'));
        if (confirm('Are you sure you want to delete this item?')) {
          inventoryData.splice(idx, 1);
          saveData();
          renderTable();
        }
      });
    });
  }

  // Reset modal form fields
  function resetForm() {
    itemForm.reset();
    equipmentInput.disabled = true;
    equipmentInput.value = '';
    // Reset validation states
    itemForm.classList.remove('was-validated');
  }

  // Open modal for adding new item
  function openAddModal() {
    editIndex = -1;
    resetForm();
    itemModalLabel.textContent = 'Add Inventory Item';
    modal.show();
  }

  // Open modal for editing existing item
  function openEditModal(idx) {
    editIndex = idx;
    resetForm();
    itemModalLabel.textContent = 'Edit Inventory Item';

    const item = inventoryData[idx];
    equipmentTypeInput.value = item.equipmentType;
    equipmentInput.value = item.equipment || '';
    equipmentInput.disabled = (item.equipmentType !== 'SSOE');
    vendorInput.value = item.vendor || '';
    brandModelInput.value = item.brandModel || '';
    profileInput.value = item.profile || '';
    custodianInput.value = item.custodian || '';
    assetNoInput.value = item.assetNo || '';
    serialNumberInput.value = item.serialNumber || '';
    locationInput.value = item.location || '';
    startDateInput.value = item.startDate || '';
    endDateInput.value = item.endDate || '';

    modal.show();
  }

  // When EquipmentType changes, toggle Equipment dropdown enabled/disabled
  equipmentTypeInput.addEventListener('change', () => {
    if (equipmentTypeInput.value === 'SSOE') {
      equipmentInput.disabled = false;
      equipmentInput.required = true;
    } else {
      equipmentInput.disabled = true;
      equipmentInput.value = '';
      equipmentInput.required = false;
    }
  });

  // Form submit: add new or update existing item
  itemForm.addEventListener('submit', e => {
    e.preventDefault();
    e.stopPropagation();

    // Validate form
    if (!itemForm.checkValidity()) {
      itemForm.classList.add('was-validated');
      return;
    }

    const newItem = {
      equipmentType: equipmentTypeInput.value.trim(),
      equipment: equipmentTypeInput.value === 'SSOE' ? equipmentInput.value.trim() : '',
      vendor: vendorInput.value.trim(),
      brandModel: brandModelInput.value.trim(),
      profile: profileInput.value.trim(),
      custodian: custodianInput.value.trim(),
      assetNo: assetNoInput.value.trim(),
      serialNumber: serialNumberInput.value.trim(),
      location: locationInput.value.trim(),
      startDate: startDateInput.value,
      endDate: endDateInput.value
    };

    if (editIndex === -1) {
      // Add new
      inventoryData.push(newItem);
    } else {
      // Update existing
      inventoryData[editIndex] = newItem;
    }

    saveData();
    renderTable();
    modal.hide();
  });

  // Filter and Search event handlers
  filterCategory.addEventListener('change', renderTable);
  searchInput.addEventListener('input', renderTable);

  addItemBtn.addEventListener('click', openAddModal);

  // Initialize
  loadData();
  renderTable();
});
