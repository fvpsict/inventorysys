document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");
  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  // Store faults data in-memory (replace with your own data source or localStorage)
  let faults = [];

  // Track currently editing fault index; -1 = adding new
  let editingIndex = -1;

  // Render fault table rows filtered and searched
  function renderTable() {
    const filterValue = filterEquipmentType.value.toLowerCase();
    const searchValue = searchInput.value.trim().toLowerCase();

    faultTableBody.innerHTML = "";

    const filteredFaults = faults.filter(fault => {
      const matchesFilter =
        filterValue === "all" || fault.EquipmentType.toLowerCase() === filterValue;
      const matchesSearch = Object.values(fault).some(value =>
        String(value).toLowerCase().includes(searchValue)
      );
      return matchesFilter && matchesSearch;
    });

    filteredFaults.forEach((fault, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${fault.DateReported}</td>
        <td>${fault.EquipmentType}</td>
        <td>${fault.Equipment}</td>
        <td>${fault.BrandModel || ""}</td>
        <td>${fault.SerialNumber || ""}</td>
        <td>${fault.Location || ""}</td>
        <td>${fault.RoomNumber || ""}</td>
        <td>${fault.FaultDescription}</td>
        <td>
          <select class="form-select form-select-sm status-select" data-index="${index}">
            <option value="Open" ${fault.Status === "Open" ? "selected" : ""}>Open</option>
            <option value="In Progress" ${fault.Status === "In Progress" ? "selected" : ""}>In Progress</option>
            <option value="Resolved" ${fault.Status === "Resolved" ? "selected" : ""}>Resolved</option>
            <option value="Closed" ${fault.Status === "Closed" ? "selected" : ""}>Closed</option>
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;

      faultTableBody.appendChild(tr);
    });

    // Attach event listeners to status dropdowns, edit, and delete buttons
    document.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const i = e.target.dataset.index;
        faults[i].Status = e.target.value;
        // Optionally save data here
      });
    });

    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        editingIndex = e.target.dataset.index;
        populateForm(faults[editingIndex]);
        faultModal.show();
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        if (confirm("Are you sure you want to delete this fault report?")) {
          faults.splice(i, 1);
          renderTable();
          // Optionally save data here
        }
      });
    });
  }

  // Populate modal form with fault data
  function populateForm(fault) {
    const formElements = faultForm.elements;
    formElements["DateReported"].value = fault.DateReported;
    formElements["EquipmentType"].value = fault.EquipmentType;
    formElements["Equipment"].value = fault.Equipment;
    formElements["BrandModel"].value = fault.BrandModel || "";
    formElements["SerialNumber"].value = fault.SerialNumber || "";
    formElements["Location"].value = fault.Location || "";
    formElements["RoomNumber"].value = fault.RoomNumber || "";
    formElements["FaultDescription"].value = fault.FaultDescription;
    formElements["Status"].value = fault.Status;
  }

  // Clear modal form
  function clearForm() {
    faultForm.reset();
  }

  // Handle form submit to add or update fault
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(faultForm);
    const faultData = Object.fromEntries(formData.entries());

    if (editingIndex === -1) {
      // Add new
      faults.push(faultData);
    } else {
      // Update existing
      faults[editingIndex] = faultData;
    }

    faultModal.hide();
    clearForm();
    editingIndex = -1;
    renderTable();
  });

  // Add fault button opens modal for new fault
  addFaultBtn.addEventListener("click", () => {
    editingIndex = -1;
    clearForm();
    faultModal.show();
  });

  // Filter and search triggers
  filterEquipmentType.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
});
