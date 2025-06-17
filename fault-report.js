document.addEventListener("DOMContentLoaded", () => {
  const faultTable = document.querySelector("#fault-table tbody");
  const faultForm = document.getElementById("fault-modal-form");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const equipmentTypeFilter = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  let editingRow = null;

  function createRow(data) {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${data.DateReported}</td>
      <td>${data.EquipmentType}</td>
      <td>${data.Equipment}</td>
      <td>${data.AssetNo}</td>
      <td>${data.BrandModel}</td>
      <td>${data.SerialNumber}</td>
      <td>${data.Location}</td>
      <td>${data.RoomNumber}</td>
      <td>${data.FaultDescription}</td>
      <td>
        <select class="form-select form-select-sm status-dropdown">
          ${["Open", "In Progress", "Pending vendor", "Resolved", "Closed"]
            .map(status => `<option${data.Status === status ? " selected" : ""}>${status}</option>`)
            .join("")}
        </select>
      </td>
      <td>
        <button class="btn btn-sm btn-warning edit-btn">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn">Delete</button>
      </td>
    `;
    faultTable.appendChild(row);
  }

  function updateRow(row, data) {
    const cells = row.children;
    cells[0].textContent = data.DateReported;
    cells[1].textContent = data.EquipmentType;
    cells[2].textContent = data.Equipment;
    cells[3].textContent = data.AssetNo;
    cells[4].textContent = data.BrandModel;
    cells[5].textContent = data.SerialNumber;
    cells[6].textContent = data.Location;
    cells[7].textContent = data.RoomNumber;
    cells[8].textContent = data.FaultDescription;
    cells[9].querySelector("select").value = data.Status;
  }

  addFaultBtn.addEventListener("click", () => {
    faultForm.reset();
    editingRow = null;
    faultModal.show();
  });

  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(faultForm);
    const data = Object.fromEntries(formData.entries());

    if (editingRow) {
      updateRow(editingRow, data);
    } else {
      createRow(data);
    }

    faultModal.hide();
  });

  faultTable.addEventListener("click", (e) => {
    const row = e.target.closest("tr");

    if (e.target.classList.contains("edit-btn")) {
      editingRow = row;
      const cells = row.children;
      faultForm.DateReported.value = cells[0].textContent;
      faultForm.EquipmentType.value = cells[1].textContent;
      faultForm.Equipment.value = cells[2].textContent;
      faultForm.AssetNo.value = cells[3].textContent;
      faultForm.BrandModel.value = cells[4].textContent;
      faultForm.SerialNumber.value = cells[5].textContent;
      faultForm.Location.value = cells[6].textContent;
      faultForm.RoomNumber.value = cells[7].textContent;
      faultForm.FaultDescription.value = cells[8].textContent;
      faultForm.Status.value = cells[9].querySelector("select").value;
      faultModal.show();
    }

    if (e.target.classList.contains("delete-btn")) {
      row.remove();
    }
  });

  // Allow live inline status change
  faultTable.addEventListener("change", (e) => {
    if (e.target.classList.contains("status-dropdown")) {
      // Optionally handle status update (e.g. sync to backend or highlight)
    }
  });

  // Equipment Type Filter
  equipmentTypeFilter.addEventListener("change", () => {
    const filterValue = equipmentTypeFilter.value.toLowerCase();

    Array.from(faultTable.rows).forEach(row => {
      const equipmentType = row.cells[1].textContent.toLowerCase();
      row.style.display =
        filterValue === "all" || equipmentType === filterValue ? "" : "none";
    });
  });

  // Search Filter
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();

    Array.from(faultTable.rows).forEach(row => {
      const rowText = row.textContent.toLowerCase();
      row.style.display = rowText.includes(query) ? "" : "none";
    });
  });
});
