(() => {
  // Elements
  const inventoryTableBody = document.querySelector('#inventoryTable tbody');
  const filterSelect = document.getElementById('filterEquipmentType');
  const searchInput = document.getElementById('searchInventory');
  const inventoryForm = document.getElementById('inventoryForm');
  const modalTitle = document.getElementById('inventoryModalLabel');
  const inventoryModalEl = document.getElementById('inventoryModal');
  const bsModal = new bootstrap.Modal(inventoryModalEl);

  // Form inputs
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
  const hostnameInput = document.getElementById('hostname');
  const ssoePoNumberInput = document.getElementById('ssoePoNumber');
  const cartNoInput = document.getElementById('cartNo');
  const sanitiseDateInput = document.getElementById('sanitiseDate');

  // State
  let inventoryData = [];
  let editIndex = null; // null means adding new

  // Load inventory from localStorage
  function loadInventory() {
    const raw = localStorage.getItem('fvpsInventory');
    if (raw) {
      try {
        inventoryData = JSON.parse(raw);
      } catch {
        inventoryData = [];
      }
    } else {
      inventoryData = [];
    }
  }

  // Save inventory to localStorage
  function saveInventory() {
    localStorage.setItem('fvpsInventory', JSON.stringify(inventoryData));
  }

  // Calculate duration in use (years, months)
  function calculateDuration(start, end) {
    if (!start) return '';
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    if (isNaN(startDate)) return '';
    if (isNaN(endDate)) return '';
    if (endDate < startDate) return '';

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    let result = '';
    if (years > 0) result += `${years} year${years > 1 ? 's' : ''}`;
    if (months > 0) {
      if (result) result += ' ';
      result += `${months} month${months > 1 ? 's' : ''}`;
    }
    return result || '<1 month';
  }

  // Create a table row
  function createRow(item, index) {
    const tr = document.createElement('tr');

    function createCell(text) {
      const td = document.createElement('td');
      td.textContent = text ?? '';
      return td;
    }

    tr.appendChild(createCell(item.equipmentType));
    tr.appendChild(createCell(item.equipmentType === 'SSOE' ? (item.equipment || '') : ''));
    tr.appendChild(createCell(item.vendor));
    tr.appendChild(createCell(item.brandModel));
    tr.appendChild(createCell(item.profile));
    tr.appendChild(createCell(item.custodian));
    tr.appendChild(createCell(item.assetNo));
    tr.appendChild(createCell(item.serialNumber));
    tr.appendChild(createCell(item.location));
    tr.appendChild(createCell(item.startDate));
    tr.appendChild(createCell(item.endDate));
    tr.appendChild(createCell(calculateDuration(item.startDate, item.endDate)));
    tr.appendChild(createCell(item.hostname));
    tr.appendChild(createCell(item.ssoePoNumber));
    tr.appendChild(createCell(item.cartNo));
    tr.appendChild(createCell(item.sanitiseDate));

    // Actions cell with Edit and Delete buttons
    const actionsTd = document.createElement('td');

    const editBtn = document.createElement('button');
    editBtn.className = 'btn btn-sm btn-primary me-1';
    editBtn.textContent = 'Edit';
    editBtn.type = 'button';
    editBtn.addEventListener('click', () => openEditModal(index));

    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'btn btn-sm btn-danger';
    deleteBtn.textContent = 'Delete';
    deleteBtn.type = 'button';
    deleteBtn.addEventListener('click', () => deleteItem(index));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    return tr;
  }

  // Render table with current filter & search
  function renderTable() {
    const filter = filterSelect.value.toLowerCase();
    const search = searchInput.value.trim().toLowerCase();

    inventoryTableBody.innerHTML = '';

    inventoryData.forEach((item, index) => {
      // Filter by equipmentType
      if (filter && item.equipmentType.toLowerCase() !== filter) return;

      // Search all visible fields for the search term
      const combined = [
        item.equipmentType,
        item.equipmentType === 'SSOE' ? item.equipment : '',
        item.vendor,
        item.brandModel,
        item.profile,
        item.custodian,
        item.assetNo,
        item.serialNumber,
        item.location,
        item.startDate,
        item.endDate,
        item.hostname,
        item.ssoePoNumber,
        item.cartNo,
        item.sanitiseDate,
      ]
        .join(' ')
        .toLowerCase();

      if (search && !combined.includes(search)) return;

      const row = createRow(item, index);
      inventoryTableBody.appendChild(row);
    });
  }

  // Reset form fields
  function resetForm() {
    inventoryForm.reset();
    // Hide Equipment dropdown by default
    document.getElementById('equipmentContainer').style.display = 'none';
    equipmentInput.required = false;
    editIndex = null;
    modalTitle.textContent = 'Add Inventory Item';
  }

  // Open modal to add new item
  function openAddModal() {
    resetForm();
    bsModal.show();
  }

  // Open modal to edit existing item
  function openEditModal(index) {
    const item = inventoryData[index];
    if (!item) return;

    editIndex = index;
    modalTitle.textContent = 'Edit Inventory Item';

    equipmentTypeInput.value = item.equipmentType || '';
    if (item.equipmentType === 'SSOE') {
      document.getElementById('equipmentContainer').style.display = 'flex';
      equipmentInput.required = true;
      equipmentInput.value = item.equipment || '';
    } else {
      document.getElementById('equipmentContainer').style.display = 'none';
      equipmentInput.required = false;
      equipmentInput.value = '';
    }

    vendorInput.value = item.vendor || '';
    brandModelInput.value = item.brandModel || '';
    profileInput.value = item.profile || '';
    custodianInput.value = item.custodian || '';
    assetNoInput.value = item.assetNo || '';
    serialNumberInput.value = item.serialNumber || '';
    locationInput.value = item.location || '';
    startDateInput.value = item.startDate || '';
    endDateInput.value = item.endDate || '';
    hostnameInput.value = item.hostname || '';
    ssoePoNumberInput.value = item.ssoePoNumber || '';
    cartNoInput.value = item.cartNo || '';
    sanitiseDateInput.value = item.sanitiseDate || '';

    bsModal.show();
  }

  // Delete item with confirmation
  function deleteItem(index) {
    if (confirm('Are you sure you want to delete this inventory item?')) {
      inventoryData.splice(index, 1);
      saveInventory();
      renderTable();
    }
  }

  // Validate AssetNo uniqueness
  function isAssetNoUnique(assetNo, skipIndex = null) {
    return !inventoryData.some((item, idx) => item.assetNo === assetNo && idx !== skipIndex);
  }

  // Form submit handler
  inventoryForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate required fields
    if (!equipmentTypeInput.value) {
      alert('Please select EquipmentType.');
      equipmentTypeInput.focus();
      return;
    }
    if (equipmentTypeInput.value === 'SSOE' && !equipmentInput.value) {
      alert('Please select Equipment for SSOE.');
      equipmentInput.focus();
      return;
    }
    if (!vendorInput.value.trim()) {
      alert('Please enter Vendor.');
      vendorInput.focus();
      return;
    }
    if (!brandModelInput.value.trim()) {
      alert('Please enter BrandModel.');
      brandModelInput.focus();
      return;
    }
    if (!assetNoInput.value.trim()) {
      alert('Please enter AssetNo.');
      assetNoInput.focus();
      return;
    }
    // Check uniqueness of AssetNo
    if (!isAssetNoUnique(assetNoInput.value.trim(), editIndex)) {
      alert('AssetNo must be unique.');
      assetNoInput.focus();
      return;
    }

    // Prepare data object
    const item = {
      equipmentType: equipmentTypeInput.value,
      equipment: equipmentTypeInput.value === 'SSOE' ? equipmentInput.value : '',
      vendor: vendorInput.value.trim(),
      brandModel: brandModelInput.value.trim(),
      profile: profileInput.value.trim(),
      custodian: custodianInput.value.trim(),
      assetNo: assetNoInput.value.trim(),
      serialNumber: serialNumberInput.value.trim(),
      location: locationInput.value.trim(),
      startDate: startDateInput.value,
      endDate: endDateInput.value,
      hostname: hostnameInput.value.trim(),
      ssoePoNumber: ssoePoNumberInput.value.trim(),
      cartNo: cartNoInput.value.trim(),
      sanitiseDate: sanitiseDateInput.value,
    };

    if (editIndex === null) {
      // Add new
      inventoryData.push(item);
    } else {
      // Update existing
      inventoryData[editIndex] = item;
    }

    saveInventory();
    renderTable();
    bsModal.hide();
  });

  // Filter and Search handlers
  filterSelect.addEventListener('change', renderTable);
  searchInput.addEventListener('input', renderTable);

  // Add Item button
  document.getElementById('addItemBtn').addEventListener('click', openAddModal);

  // Initial load
  loadInventory();
  renderTable();
})();
