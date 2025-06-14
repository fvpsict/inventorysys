// fault-report.js

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('faultForm');
  const tableBody = document.querySelector('#faultTable tbody');
  let faults = JSON.parse(localStorage.getItem('faults')) || [];

  function renderTable() {
    tableBody.innerHTML = '';
    faults.forEach((fault, index) => {
      const tr = document.createElement('tr');

      // Equipment Type
      const tdEquip = document.createElement('td');
      tdEquip.textContent = fault.EquipmentType;
      tr.appendChild(tdEquip);

      // Fault Description
      const tdFault = document.createElement('td');
      tdFault.textContent = fault.Fault;
      tr.appendChild(tdFault);

      // Status (editable select)
      const tdStatus = document.createElement('td');
      const select = document.createElement('select');
      ['Open', 'In Progress', 'Resolved', 'Closed'].forEach((status) => {
        const option = document.createElement('option');
        option.value = status;
        option.text = status;
        if (fault.Status === status) option.selected = true;
        select.appendChild(option);
      });
      select.addEventListener('change', () => {
        faults[index].Status = select.value;
        localStorage.setItem('faults', JSON.stringify(faults));
      });
      tdStatus.appendChild(select);
      tr.appendChild(tdStatus);

      // Actions
      const tdActions = document.createElement('td');
      const deleteBtn = document.createElement('button');
      deleteBtn.className = 'btn btn-sm btn-danger';
      deleteBtn.textContent = 'Delete';
      deleteBtn.onclick = () => {
        faults.splice(index, 1);
        saveAndRender();
      };
      tdActions.appendChild(deleteBtn);
      tr.appendChild(tdActions);

      tableBody.appendChild(tr);
    });
  }

  function saveAndRender() {
    localStorage.setItem('faults', JSON.stringify(faults));
    renderTable();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newFault =
