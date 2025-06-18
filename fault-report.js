// fault-report.js

document.addEventListener('DOMContentLoaded', () => {
  const faultTableBody = document.querySelector('#faultTable tbody');
  const faultForm = document.getElementById('faultForm');
  const faultModal = new bootstrap.Modal(document.getElementById('faultModal'));
  const modalTitle = document.getElementById('faultModalLabel');

  let faults = JSON.parse(localStorage.getItem('faults')) || [];
  let editingIndex = null;

  function formatDate(dateStr) {
    if (!dateStr) return '';
    const d = new Date(dateStr);
    const options = { day: '2-digit', month: 'long', year: 'numeric' };
    return d.toLocaleDateString(undefined, options);
  }

  // Render the table rows from faults array
  function renderTable() {
    faultTableBody.innerHTML = '';

    faults.forEach((fault, index) => {
      const tr = document.createElement('tr');

      tr.innerHTML = `
        <td>${fault.equipment}</td>
        <td>${fault.equipmentType}</td>
        <td>${fault.assetNo || ''}</td>
        <td>${fault.description}</td>
        <td>${fault.status}</td>
        <td>${formatDate(fault.dateReported)}</td>
        <td>
          <button class="btn btn-sm btn-primary me-2 edit-btn">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn">Delete</button>
        </td>
      `;

      // Edit button handler
      tr.querySelector('.edit-btn').addEventListener('click', () => {
        editingIndex = index;
        modalTitle.textContent = 'Edit Fault';
        fillForm(fault);
        faultModal.show();
      });

      // Delete button handler
      tr.querySelector('.delete-btn').addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this fault report?')) {
          faults.splice(index, 1);
          saveFaults();
          renderTable();
        }
      });

      faultTableBody.appendChild(tr);
    });
  }

  // Fill form inputs with fault data for editing
  function fillForm(fault) {
    faultForm.faultEquipment.value = fault.equipment;
    faultForm.faultEquipmentType.value = fault.equipmentType;
    faultForm.faultAssetNo.value = fault.assetNo || '';
    faultForm.faultDescription.value = fault.description;
    faultForm.faultStatus.value = fault.status;
    faultForm.faultDateReported.value = fault.dateReported;
  }

  // Clear form inputs for adding new fault
  function clearForm() {
    faultForm.reset();
    editingIndex = null;
    modalTitle.textContent = 'Add Fault';
  }

  // Save faults array to localStorage
  function saveFaults() {
    localStorage.setItem('faults', JSON.stringify(faults));
  }

  // Handle form submit
  faultForm.addEventListener('submit', (e) => {
    e.preventDefault();

    // Validate required fields
    const equipment = faultForm.faultEquipment.value.trim();
    const equipmentType = faultForm.faultEquipmentType.value.trim();
    const description = faultForm.faultDescription.value.trim();
    const status = faultForm.faultStatus.value;
    const dateReported = faultForm.faultDateReported.value;

    if (!equipment || !equipmentType || !description || !status || !dateReported) {
      alert('Please fill in all required fields.');
      return;
    }

    const assetNo = faultForm.faultAssetNo.value.trim();

    const faultData = {
      equipment,
      equipmentType,
      assetNo,
      description,
      status,
      dateReported,
    };

    if (editingIndex !== null) {
      // Update existing
      faults[editingIndex] = faultData;
    } else {
      // Add new
      faults.push(faultData);
    }

    saveFaults();
    renderTable();
    faultModal.hide();
    clearForm();
  });

  // Clear form on modal hidden (optional)
  document.getElementById('faultModal').addEventListener('hidden.bs.modal', () => {
    clearForm();
  });

  // Initial render
  renderTable();
});
