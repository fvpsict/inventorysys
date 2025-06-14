document.addEventListener('DOMContentLoaded', () => {
  const faultTableBody = document.querySelector('#faultTable tbody');
  const faultForm = document.getElementById('faultForm');
  const addFaultModal = new bootstrap.Modal(document.getElementById('addFaultModal'));

  let faults = JSON.parse(localStorage.getItem('faults')) || [];

  function renderFaults() {
    faultTableBody.innerHTML = '';
    faults.forEach((fault, idx) => {
      const tr = document.createElement('tr');

      // EquipmentType
      const tdType = document.createElement('td');
      tdType.textContent = fault.EquipmentType || '';
      tr.appendChild(tdType);

      // Status with inline dropdown
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
      deleteBtn.className = 'btn btn-sm btn-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.addEventListener('click', () => {
        if (confirm('Delete this fault report?')) {
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

  faultForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(faultForm);
    const newFault = {};
    for (const [key, value] of formData.entries()) {
      newFault[key] = value.trim();
    }
    faults.push(newFault);
    localStorage.setItem('faults', JSON.stringify(faults));
    renderFaults();
    faultForm.reset();
    addFaultModal.hide();
  });

  renderFaults();
});
