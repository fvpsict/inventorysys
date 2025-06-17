document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchFault = document.getElementById("search-fault");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");

  // Data array to store fault records
  let faultData = [];
  let editIndex = null;

  // Load data from localStorage on page load
  function loadFaultData() {
    const stored = localStorage.getItem("faultData");
    faultData = stored ? JSON.parse(stored) : [];
  }

  // Save data to localStorage
  function saveFaultData() {
    localStorage.setItem("faultData", JSON.stringify(faultData));
  }

  // Render the fault table rows based on filter/search
  function renderTable() {
    const filterVal = filterEquipmentType.value.toLowerCase();
    const searchVal = searchFault.value.toLowerCase();

    faultTableBody.innerHTML = "";

    faultData.forEach((fault, index) => {
      const matchesFilter =
        filterVal === "all" || fault.EquipmentType.toLowerCase() === filterVal;
      const matchesSearch = Object.values(fault).some((val) =>
        val?.toString().toLowerCase().includes(searchVal)
      );

      if (matchesFilter && matchesSearch) {
        const row = document.createElement("tr");

        row.innerHTML = `
          <td>${fault.DateReported}</td>
          <td>${fault.EquipmentType}</td>
          <td>${fault.Equipment || ""}</td>
          <td>${fault.AssetNo || ""}</td>
          <td>${fault.BrandModel || ""}</td>
          <td>${fault.SerialNumber || ""}</td>
          <td>${fault.Location || ""}</td>
          <td>${fault.RoomNumber || ""}</td>
          <td>${fault.FaultDescription}</td>
          <td>
            <select class="form-select form-select-sm status-select" data-index="${index}">
              <option value="Open" ${fault.Status === "Open" ? "selected" : ""}>Open</option>
              <option value="In Progress" ${fault.Status === "In Progress" ? "selected" : ""}>In Progress</option>
              <option value="Pending vendor" ${fault.Status === "Pending vendor" ? "selected" : ""}>Pending vendor</option>
              <option value="Resolved" ${fault.Status === "Resolved" ? "selected" : ""}>Resolved</option>
              <option value="Closed" ${fault.Status === "Closed" ? "selected" : ""}>Closed</option>
            </select>
          </td>
          <td>
            <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
          </td>
        `;

        faultTableBody.appendChild(row);
      }
    });
  }

  // Reset form fields
  function resetForm() {
    faultForm.reset();
    editIndex = null;
  }

  // Fill form with fault data for editing
  function fillForm(fault) {
    faultForm.DateReported.value = fault.DateReported || "";
    faultForm.EquipmentType.value = fault.EquipmentType || "";
    faultForm.Equipment.value = fault.Equipment || "";
    faultForm.AssetNo.value = fault.AssetNo || "";
    faultForm.BrandModel.value = fault.BrandModel || "";
    faultForm.SerialNumber.value = fault.SerialNumber || "";
    faultForm.Location.value = fault.Location || "";
    faultForm.RoomNumber.value = fault.RoomNumber || "";
    faultForm.FaultDescription.value = fault.FaultDescription || "";
    faultForm.Status.value = fault.Status || "Open";
  }

  // Handle form submit (add or update)
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = {
      DateReported: faultForm.DateReported.value,
      EquipmentType: faultForm.EquipmentType.value,
      Equipment: faultForm.Equipment.value || "",
      AssetNo: faultForm.AssetNo.value || "",
      BrandModel: faultForm.BrandModel.value || "",
      SerialNumber: faultForm.SerialNumber.value || "",
      Location: faultForm.Location.value || "",
      RoomNumber: faultForm.RoomNumber.value || "",
      FaultDescription: faultForm.FaultDescription.value,
      Status: faultForm.Status.value,
    };

    if (editIndex !== null) {
      // Update existing record
      faultData[editIndex] = formData;
    } else {
      // Add new record
      faultData.push(formData);
    }

    saveFaultData();
    renderTable();
    faultModal.hide();
    resetForm();
  });

  // Open modal for adding new fault
  addFaultBtn.addEventListener("click", () => {
    resetForm();
    faultModal.show();
  });

  // Delegate edit and delete buttons click in table
  faultTableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      editIndex = parseInt(e.target.dataset.index, 10);
      fillForm(faultData[editIndex]);
      faultModal.show();
    } else if (e.target.classList.contains("delete-btn")) {
      const delIndex = parseInt(e.target.dataset.index, 10);
      if (confirm("Are you sure you want to delete this fault report?")) {
        faultData.splice(delIndex, 1);
        saveFaultData();
        renderTable();
      }
    }
  });

  // Handle inline status change
  faultTableBody.addEventListener("change", (e) => {
    if (e.target.classList.contains("status-select")) {
      const idx = parseInt(e.target.dataset.index, 10);
      faultData[idx].Status = e.target.value;
      saveFaultData();
      renderTable(); // Re-render to update selection
    }
  });

  // Filter equipment type change
  filterEquipmentType.addEventListener("change", renderTable);

  // Search input keyup
  searchFault.addEventListener("input", renderTable);

  // Initial load
  loadFaultData();
  renderTable();
});
