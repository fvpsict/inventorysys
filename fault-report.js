// fault-report.js

document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");
  const modalTitle = document.getElementById("faultModalLabel");

  let faultData = [];
  let editIndex = null; // null means adding new, otherwise editing existing

  // Load data from localStorage or initialize empty
  function loadData() {
    const dataStr = localStorage.getItem("faultReports");
    faultData = dataStr ? JSON.parse(dataStr) : [];
  }

  // Save data to localStorage
  function saveData() {
    localStorage.setItem("faultReports", JSON.stringify(faultData));
  }

  // Render the table rows based on current filter/search
  function renderTable() {
    const filterValue = filterEquipmentType.value.toLowerCase();
    const searchValue = searchInput.value.toLowerCase();

    faultTableBody.innerHTML = "";

    faultData.forEach((fault, index) => {
      // Filter by Equipment Type
      if (filterValue !== "all" && fault.EquipmentType.toLowerCase() !== filterValue) {
        return;
      }

      // Search across multiple fields (case insensitive)
      const combinedFields = [
        fault.DateReported,
        fault.EquipmentType,
        fault.Equipment || "",
        fault.AssetNo || "",
        fault.BrandModel || "",
        fault.SerialNumber || "",
        fault.Location || "",
        fault.RoomNumber || "",
        fault.FaultDescription,
        fault.Status,
      ].join(" ").toLowerCase();

      if (!combinedFields.includes(searchValue)) {
        return;
      }

      // Create table row
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${fault.DateReported}</td>
        <td>${fault.EquipmentType}</td>
        <td>${fault.Equipment || ""}</td>
        <td>${fault.AssetNo || ""}</td>
        <td>${fault.BrandModel || ""}</td>
        <td>${fault.SerialNumber || ""}</td>
        <td>${fault.Location || ""}</td>
        <td>${fault.RoomNumber || ""}</td>
        <td>${fault.FaultDescription}</td>
        <td>${fault.Status}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
        </td>
      `;

      faultTableBody.appendChild(tr);
    });

    // Attach event listeners for Edit and Delete buttons
    document.querySelectorAll(".btn-edit").forEach(btn => {
      btn.addEventListener("click", onEditClick);
    });

    document.querySelectorAll(".btn-delete").forEach(btn => {
      btn.addEventListener("click", onDeleteClick);
    });
  }

  // Handle Add Fault button click
  addFaultBtn.addEventListener("click", () => {
    editIndex = null;
    modalTitle.textContent = "Add Fault Report";
    faultForm.reset();
    // Set default for EquipmentType select to empty
    faultForm.EquipmentType.value = "";
    faultModal.show();
  });

  // Handle Edit button click
  function onEditClick(e) {
    editIndex = Number(e.target.dataset.index);
    const fault = faultData[editIndex];
    modalTitle.textContent = "Edit Fault Report";

    // Populate form fields
    faultForm.DateReported.value = fault.DateReported;
    faultForm.EquipmentType.value = fault.EquipmentType;
    faultForm.Equipment.value = fault.Equipment || "";
    faultForm.AssetNo.value = fault.AssetNo || "";
    faultForm.BrandModel.value = fault.BrandModel || "";
    faultForm.SerialNumber.value = fault.SerialNumber || "";
    faultForm.Location.value = fault.Location || "";
    faultForm.RoomNumber.value = fault.RoomNumber || "";
    faultForm.FaultDescription.value = fault.FaultDescription;
    faultForm.Status.value = fault.Status;

    faultModal.show();
  }

  // Handle Delete button click
  function onDeleteClick(e) {
    const index = Number(e.target.dataset.index);
    if (confirm("Are you sure you want to delete this fault report?")) {
      faultData.splice(index, 1);
      saveData();
      renderTable();
    }
  }

  // Handle form submit (add or edit)
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(faultForm);

    // Build fault object
    const faultObj = {
      DateReported: formData.get("DateReported"),
      EquipmentType: formData.get("EquipmentType"),
      Equipment: formData.get("Equipment") || "",
      AssetNo: formData.get("AssetNo") || "",
      BrandModel: formData.get("BrandModel") || "",
      SerialNumber: formData.get("SerialNumber") || "",
      Location: formData.get("Location") || "",
      RoomNumber: formData.get("RoomNumber") || "",
      FaultDescription: formData.get("FaultDescription"),
      Status: formData.get("Status"),
    };

    // Validate required fields manually if needed (DateReported, EquipmentType, FaultDescription, Status)
    if (!faultObj.DateReported) {
      alert("Date Reported is required.");
      return;
    }
    if (!faultObj.EquipmentType) {
      alert("Equipment Type is required.");
      return;
    }
    if (!faultObj.FaultDescription) {
      alert("Fault Description is required.");
      return;
    }
    if (!faultObj.Status) {
      alert("Status is required.");
      return;
    }

    if (editIndex === null) {
      // Add new
      faultData.push(faultObj);
    } else {
      // Update existing
      faultData[editIndex] = faultObj;
    }

    saveData();
    renderTable();
    faultModal.hide();
  });

  // Filter and Search handlers
  filterEquipmentType.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial load
  loadData();
  renderTable();
});
