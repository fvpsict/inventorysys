// inventory.js

(() => {
  const STORAGE_KEY = 'fvpsInventoryData';

  // DOM elements
  const inventoryTableBody = document.querySelector('#inventory-table tbody');
  const filterEquipmentType = document.getElementById('filterEquipmentType');
  const searchInput = document.getElementById('searchInventory');

  // Modal and form elements
  const itemModalEl = document.getElementById('itemModal');
  const itemModal = new bootstrap.Modal(itemModalEl);
  const itemForm = document.getElementById('itemForm');
  const modalTitle = document.getElementById('itemModalLabel');

  const equipmentTypeSelect = document.getElementById('equipmentType');
  const equipmentSelect = document.getElementById('equipment');

  const editIndexInput = document.getElementById('editIndex');

  // Other form fields
  const fields = {
    vendor: document.getElementById('vendor'),
    brandModel: document.getElementById('brandModel'),
    profile: document.getElementById('profile'),
    custodian: document.getElementById('custodian'),
    assetNo: document.getElementById('assetNo'),
    serialNumber: document.getElementById('serialNumber'),
    location: document.getElementById('location'),
    startDate: document.getElementById('startDate'),
    endDate: document.getElementById('endDate'),
  };

  let inventoryData = [];

  // Utility: Calculate duration in years and months between two dates
  function calculateDuration(start, end) {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    if (endDate < startDate) return '';

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''} `;
    if (months > 0) result += `${months} month${months > 1 ? 's' : ''}`;
    return result.trim() || '0 months';
  }

  // Load inventory from localStorage
  function loadInventory() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        inventoryData = JSON.parse(stored);
      } catch {
        inventoryData = [];
      }
    } else {
      inventoryData = [];
    }
  }

  // Save inventory to localStorage
  function saveInventory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryData));
  }

  // Clear table body
  function clearTable() {
    inventoryTableBody.innerHTML = '';
  }

  // Render the inventory table applying current filter and search
  function renderTable() {
    clearTable();

    const filterVal = filterEquipmentType.value;
    const searchVal = searchInput.value.toLowerCase();

    // Filter and search
    const filteredData = inventoryData.filter(item => {
      if (filterVal !== 'All' && item.equipmentType !== filterVal) return false;

      // Search across multiple fields
      const searchFields = [
        item.equipmentType,
        item.equipment || '',
        item.vendor,
        item.brandModel,
        item.profile,
        item.custodian,
        item.assetNo,
        item.serialNumber,
        item.location
      ];
      return searchFields.some(f => f.toLowerCase().includes(searchVal));
    });

    if (filteredData.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 13;
      td.className = 'text-center fst-italic';
      td.textContent = 'No inventory items found.';
      tr.appendChild(td);
      inventoryTableBody.appendChild(tr);
      return;
    }

    filteredData.forEach((item, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${item.equipmentType}</td>
        <td>${item.equipment || ''}</td>
        <td>${item.vendor}</td>
        <td>${item.brandModel}</td>
        <td>${item.profile}</td>
        <td>${item.custodian}</td>
        <td>${item.assetNo}</td>
        <td>${item.serialNumber}</td>
        <td>${item.location}</td>
        <td>${item.startDate || ''}</td>
        <td>${item.endDate || ''}</td>
        <td class="duration">${calculateDuration(item.startDate, item.endDate)}</td>
        <td>
          <button class="btn btn-sm btn-primary me-1 edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      inventoryTableBody.appendChild(tr);
    });
  }

  // Show or hide Equipment select depending on EquipmentType
  function toggleEquipmentDropdown() {
    if (equipmentTypeSelect.value === 'SSOE') {
      equipmentSelect.parentElement.style.display = 'block';
      equipmentSelect.setAttribute('required', 'required');
    } else {
      equipmentSelect.parentElement.style.display = 'none';
      equipmentSelect.removeAttribute('required');
      equipmentSelect.value = '';
    }
  }

  // Reset and open modal for add or edit
  function openModal(editIndex = null) {
    itemForm.reset();
    editIndexInput.value = '';

    toggleEquipmentDropdown();

    if (editIndex !== null) {
      modalTitle.textContent = 'Edit Inventory Item';
      const item = inventoryData[editIndex];

      equipmentTypeSelect.value = item.equipmentType || '';
      equipmentSelect.value = item.equipment || '';
      fields.vendor.value = item.vendor || '';
      fields.brandModel.value = item.brandModel || '';
      fields.profile.value = item.profile || '';
      fields.custodian.value = item.custodian || '';
      fields.assetNo.value = item.assetNo || '';
      fields.serialNumber.value = item.serialNumber || '';
      fields.location.value = item.location || '';
      fields.startDate.value = item.startDate || '';
      fields.endDate.value = item.endDate || '';

      editIndexInput.value = editIndex;

      toggleEquipmentDropdown();
    } else {
      modalTitle.textContent = 'Add Inventory Item';
    }

    itemModal.show();
  }

  // Validate form (bootstrap custom validation)
  function validateForm() {
    // Use built-in checkValidity
    if (!itemForm.checkValidity()) {
      itemForm.classList.add('was-validated');
      return false;
    }
    return true;
  }

  // Handle form submit
  function handleFormSubmit(event) {
    event.preventDefault();
    if (!validateForm()) return;

    const newItem = {
      equipmentType: equipmentTypeSelect.value,
      equipment: equipmentSelect.value,
      vendor: fields.vendor.value.trim(),
      brandModel: fields.brandModel.value.trim(),
      profile: fields.profile.value.trim(),
      custodian: fields.custodian.value.trim(),
      assetNo: fields.assetNo.value.trim(),
      serialNumber: fields.serialNumber.value.trim(),
      location: fields.location.value.trim(),
      startDate: fields.startDate.value,
      endDate: fields.endDate.value,
    };

    const editIndex = editIndexInput.value;

    if (editIndex) {
      inventoryData[editIndex] = newItem;
    } else {
      inventoryData.push(newItem);
    }

    saveInventory();
    renderTable();
    itemModal.hide();
  }

  // Handle click on edit or delete buttons in table
  function handleTableClick(e) {
    if (e.target.classList.contains('edit-btn')) {
      const index = e.target.dataset.index;
      openModal(parseInt(index, 10));
    } else if (e.target.classList.contains('delete-btn')) {
      const index = e.target.dataset.index;
      if (confirm('Are you sure you want to delete this item?')) {
        inventoryData.splice(index, 1);
        saveInventory();
        renderTable();
      }
    }
  }

  // Initialization
  function init() {
    loadInventory();
    renderTable();

    // Event listeners
    filterEquipmentType.addEventListener('change', renderTable);
    searchInput.addEventListener('input', renderTable);

    equipmentTypeSelect.addEventListener('change', toggleEquipmentDropdown);

    document.getElementById('add-item-btn').addEventListener('click', () => openModal());

    inventoryTableBody.addEventListener('click', handleTableClick);

    itemForm.addEventListener('submit', handleFormSubmit);

    // Remove validation class on modal hide
    itemModalEl.addEventListener('hidden.bs.modal', () => {
      itemForm.classList.remove('was-validated');
    });
  }

  // Run init on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
