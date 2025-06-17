document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModalEl = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalEl);
  const faultForm = document.getElementById("fault-modal-form");
  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  // In-memory data store for faults
  let faults = [];

  // Editing index, -1 means adding new
  let editingIndex = -1;

  // Render the fault table with filter and search applied
  function renderTable() {
    const filterValue = filterEquipmentType.value.toLowerCase();
    const searchValue = searchInput.value.trim().toLowerCase();

    faultTableBody.innerHTML = "";

    const filteredFaults = faults.filter(fault => {
      const matchesFilter = filterValue === "all" || fault.EquipmentType.toLowerCase() === filterValue;
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

    // Attach event listeners after rendering

    // Status change handler
    document.querySelectorAll(".status-select").forEach(select => {
      select.addEventListener("change", (e) => {
        const i = e.target.dataset.index;
        faults[i].Status = e.target.value;
        // Optional: save changes to localStorage or backend here
      });
    });

    // Edit button handler
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        editingIndex = e.target.dataset.index;
        populateForm(faults[editingIndex]);
        faultModal.show();
      });
    });

    // Delete button handler
    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", (e) => {
        const i = e.target.dataset.index;
        if (confirm("Are you sure you want to delete this fault report?")) {
          faults.splice(i, 1);
          renderTable();
          // Optional: save changes here
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

  // Clear modal form inputs
  function clearForm() {
    faultForm.reset();
  }

  // Handle form submit: add or update fault
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(faultForm);
    const faultData = Object.fromEntries(formData.entries());

    if (editingIndex === -1) {
      // Add new fault
      faults.push(faultData);
    } else {
      // Update existing fault
      faults[editingIndex] = faultData;
    }

    faultModal.hide();
    clearForm();
    editingIndex = -1;
    renderTable();
  });

  // Add Fault button click - open modal for new fault
  addFaultBtn.addEventListener("click", () => {
    editingIndex = -1;
    clearForm();
    faultModal.show();
  });

  // Filter and search inputs change triggers
  filterEquipmentType.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
});
