// fault-report.js

document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");
  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  let faults = JSON.parse(localStorage.getItem("faultReports") || "[]");
  let editIndex = null;

  function formatDateISO(date) {
    return date.toISOString().split("T")[0];
  }

  // Render table rows based on faults, filter, and search
  function renderTable() {
    const filterVal = filterEquipmentType.value.toLowerCase();
    const searchVal = searchInput.value.toLowerCase();

    faultTableBody.innerHTML = "";

    faults.forEach((fault, idx) => {
      // Filter by Equipment Type
      if (filterVal !== "all" && fault.EquipmentType.toLowerCase() !== filterVal) {
        return;
      }

      // Search filter across several fields
      const searchableFields = [
        fault.DateReported,
        fault.EquipmentType,
        fault.Equipment,
        fault.AssetNo,
        fault.BrandModel,
        fault.SerialNumber,
        fault.Location,
        fault.RoomNumber,
        fault.FaultDescription,
        fault.Status,
        fault.DateUpdated,
      ];
      if (!searchableFields.some(field => field && field.toLowerCase().includes(searchVal))) {
        return;
      }

      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${fault.DateReported || ""}</td>
        <td>${fault.EquipmentType || ""}</td>
        <td>${fault.Equipment || ""}</td>
        <td>${fault.AssetNo || ""}</td>
        <td>${fault.BrandModel || ""}</td>
        <td>${fault.SerialNumber || ""}</td>
        <td>${fault.Location || ""}</td>
        <td>${fault.RoomNumber || ""}</td>
        <td>${fault.FaultDescription || ""}</td>
        <td>${fault.Status || ""}</td>
        <td>${fault.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${idx}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${idx}">Delete</button>
        </td>
      `;
      faultTableBody.appendChild(tr);
    });

    attachRowButtonsListeners();
  }

  // Attach listeners to Edit and Delete buttons after table render
  function attachRowButtonsListeners() {
    document.querySelectorAll(".edit-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        editIndex = parseInt(e.target.dataset.index, 10);
        populateForm(faults[editIndex]);
        faultModal.show();
      });
    });

    document.querySelectorAll(".delete-btn").forEach(btn => {
      btn.addEventListener("click", e => {
        const delIndex = parseInt(e.target.dataset.index, 10);
        if (confirm("Are you sure you want to delete this fault report?")) {
          faults.splice(delIndex, 1);
          saveAndRender();
        }
      });
    });
  }

  // Populate modal form with data for editing
  function populateForm(fault) {
    // Populate all fields
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
    faultForm.DateUpdated.value = fault.DateUpdated || formatDateISO(new Date());
  }

  // Reset form for new entry
  function resetForm() {
    faultForm.reset();
    faultForm.DateUpdated.value = formatDateISO(new Date());
    editIndex = null;
  }

  // Save faults to localStorage and refresh table
  function saveAndRender() {
    localStorage.setItem("faultReports", JSON.stringify(faults));
    renderTable();
  }

  // Initialize
  renderTable();

  // Filter and Search handlers
  filterEquipmentType.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Add Fault button handler
  addFaultBtn.addEventListener("click", () => {
    resetForm();
    faultModal.show();
  });

  // Form submission
  faultForm.addEventListener("submit", e => {
    e.preventDefault();

    // Validate required fields manually if needed (DateReported, EquipmentType, FaultDescription, Status)
    if (!faultForm.DateReported.value) {
      alert("Date Reported is required.");
      return;
    }
    if (!faultForm.EquipmentType.value) {
      alert("Equipment Type is required.");
      return;
    }
    if (!faultForm.FaultDescription.value.trim()) {
      alert("Fault Description is required.");
      return;
    }
    if (!faultForm.Status.value) {
      alert("Status is required.");
      return;
    }

    // Build fault object from form data
    const faultObj = {
      DateReported: faultForm.DateReported.value,
      EquipmentType: faultForm.EquipmentType.value,
      Equipment: faultForm.Equipment.value,
      AssetNo: faultForm.AssetNo.value.trim(),
      BrandModel: faultForm.BrandModel.value.trim(),
      SerialNumber: faultForm.SerialNumber.value.trim(),
      Location: faultForm.Location.value.trim(),
      RoomNumber: faultForm.RoomNumber.value.trim(),
      FaultDescription: faultForm.FaultDescription.value.trim(),
      Status: faultForm.Status.value,
      DateUpdated: formatDateISO(new Date()),
    };

    if (editIndex !== null) {
      faults[editIndex] = faultObj;
    } else {
      faults.push(faultObj);
    }

    saveAndRender();
    faultModal.hide();
  });
});
