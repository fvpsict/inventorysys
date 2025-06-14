document.addEventListener('DOMContentLoaded', () => {
  const faultTableBody = document.querySelector('#faultTable tbody');
  const faultForm = document.getElementById('faultForm');
  const addFaultModalEl = document.getElementById('addFaultModal');
  const addFaultModal = new bootstrap.Modal(addFaultModalEl);

  // Load faults or initialize empty
  let faults = JSON.parse(localStorage.getItem('faults')) || [];

  // Render fault rows
  function renderFaults() {
    faultTableBody.innerHTML = '';

    faults.forEach((fault, idx) => {
      const tr = document.createElement('tr');

      // EquipmentType
      const tdType = document.createElement('td');
      tdType.textContent = fault.EquipmentType || '';
      tr.appendChild(tdType);

      // Status - inline editable dropdown
      const tdStatus = document.createElement('td');
      const statusSelect = document.createElement('select');
      ['Open', 'In Progress', 'Resolved', 'Closed'].forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.textContent = status;
        if (fault.Status === status) option.selected = true;
        statusSelect.appendChild(option);
      });
      statusSelect.className = 'form-select form-select-sm';
      statusSelect.addEventListener('change', () => {
        faults[idx].Status = statusSelect.value;
        localStorage.setItem('faults', JSON.stringify(faults));
      });
      tdStatus.appendChild(statusSelect);
      tr.appendChild(tdStatus);

      // Fault Description
      const tdFault = document.createElement('td');
      tdFault.textContent = fault.Fault || '';
      tr.appendChild(tdFault);

      // Actions: Delete button
      const tdActions = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.textContent = 'Delete';
      deleteBtn.className = 'btn btn-sm btn-danger delete-btn';
      deleteBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to delete this fault?')) {
          faults.splice(idx, 1);
          localStorage.setItem('faults', JSON.stringify(faults));
          renderFaults();
        }
      });
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdActions);

      faultTableBody.appendChild(tr);
    });
  }

  // Initial render
  renderFaults();

  // Add fault form submit
  faultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(faultForm);
    const newFault = {
      EquipmentType: formData.get('EquipmentType'),
      Status: formData.get('Status'),
      Fault: formData.get('Fault'),
    };
    faults.push(newFault);
    localStorage.setItem('faults', JSON.stringify(faults));
    renderFaults();
    faultForm.reset();
    addFaultModal.hide();
  });
});
