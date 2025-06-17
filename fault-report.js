// fault-report.js

document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModalEl = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalEl);
  const faultForm = document.getElementById("fault-modal-form");

  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  const STORAGE_KEY = "faultReports";

  let editIndex = null;
  let faultReports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Format date to yyyy-mm-dd (for input values)
  function formatDateISO(date) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  }

  // Format date for display (yyyy-mm-dd)
  function formatDateDisplay(date) {
    return formatDateISO(date); // reuse same formatting for now
  }

  // Render the fault reports table filtered & searched
  function renderTable() {
    const filterVal = filterEquipmentType.value.toLowerCase();
    const searchVal = searchInput.value.toLowerCase();

    faultTableBody.innerHTML = "";

    faultReports.forEach((item, index) => {
      // Filter by EquipmentType
      if (filterVal !== "all" && filterVal !== "") {
        if (!item.EquipmentType || item.EquipmentType.toLowerCase() !== filterVal)
          return;
      }

      // Search filter
      const searchableFields = [
        item.DateReported,
        item.EquipmentType,
        item.Equipment,
        item.AssetNo,
        item.BrandModel,
        item.SerialNumber,
        item.Location,
        item.RoomNumber,
        item.FaultDescription,
        item.Status,
        item.DateUpdated,
      ];
      const matchesSearch = searchableFields.some(
        (field) => field && field.toLowerCase().includes(searchVal)
      );
      if (!matchesSearch) return;

      // Build table row
      const tr = document.createElement("tr");

      // Date Reported
      const tdDateReported = document.createElement("td");
      tdDateReported.textContent = formatDateDisplay(item.DateReported);
      tr.appendChild(tdDateReported);

      // Equipment Type
      const tdEquipmentType = document.createElement("td");
      tdEquipmentType.textContent = item.EquipmentType || "";
      tr.appendChild(tdEquipmentType);

      // Equipment
      const tdEquipment = document.createElement("td");
      tdEquipment.textContent = item.Equipment || "";
      tr.appendChild(tdEquipment);

      // Asset No
      const tdAssetNo = document.createElement("td");
      tdAssetNo.textContent = item.AssetNo || "";
      tr.appendChild(tdAssetNo);

      // Brand / Model
      const tdBrandModel = document.createElement("td");
      tdBrandModel.textContent = item.BrandModel || "";
      tr.appendChild(tdBrandModel);

      // Serial Number
      const tdSerialNumber = document.createElement("td");
      tdSerialNumber.textContent = item.SerialNumber || "";
      tr.appendChild(tdSerialNumber);

      // Location
      const tdLocation = document.createElement("td");
      tdLocation.textContent = item.Location || "";
      tr.appendChild(tdLocation);

      // Room Number
      const tdRoomNumber = document.createElement("td");
      tdRoomNumber.textContent = item.RoomNumber || "";
      tr.appendChild(tdRoomNumber);

      // Fault Description
      const tdFaultDesc = document.createElement("td");
      tdFaultDesc.textContent = item.FaultDescription || "";
      tr.appendChild(tdFaultDesc);

      // Status
      const tdStatus = document.createElement("td");
      tdStatus.textContent = item.Status || "";
      tr.appendChild(tdStatus);

      // Date Updated
      const tdDateUpdated = document.createElement("td");
      tdDateUpdated.textContent = formatDateDisplay(item.DateUpdated);
      tr.appendChild(tdDateUpdated);

      // Actions
      const tdActions = document.createElement("td");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-2";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditModal(index));
      tdActions.appendChild(editBtn);

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this fault report?")) {
          faultReports.splice(index, 1);
          saveAndRender();
        }
      });
      tdActions.appendChild(deleteBtn);

      tr.appendChild(tdActions);
      faultTableBody.appendChild(tr);
    });
  }

  // Save to localStorage and rerender
  function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faultReports));
    renderTable();
  }

  // Clear form for new entry
  function clearForm() {
    faultForm.reset();
    document.getElementById("DateUpdated").value = "";
    editIndex = null;
  }

  // Open modal for editing
  function openEditModal(index) {
    editIndex = index;
    const item = faultReports[index];

    document.getElementById("DateReported").value = formatDateISO(item.DateReported);
    document.getElementById("EquipmentType").value = item.EquipmentType || "";
    document.getElementById("Equipment").value = item.Equipment || "";
    document.getElementById("AssetNo").value = item.AssetNo || "";
    document.getElementById("BrandModel").value = item.BrandModel || "";
    document.getElementById("SerialNumber").value = item.SerialNumber || "";
    document.getElementById("Location").value = item.Location || "";
    document.getElementById("RoomNumber").value = item.RoomNumber || "";
    document.getElementById("FaultDescription").value = item.FaultDescription || "";
    document.getElementById("Status").value = item.Status || "";
    document.getElementById("DateUpdated").value = formatDateISO(item.DateUpdated);

    faultModal.show();
  }

  // Add new fault modal
  addFaultBtn.addEventListener("click", () => {
    clearForm();
    faultModal.show();
  });

  // Handle form submission
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validation
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

    const nowISO = new Date().toISOString().slice(0, 10);

    const data = {
      DateReported: faultForm.DateReported.value,
      EquipmentType: faultForm.EquipmentType.value,
      Equipment: faultForm.Equipment.value.trim() || "",
      AssetNo: faultForm.AssetNo.value.trim() || "",
      BrandModel: faultForm.BrandModel.value.trim() || "",
      SerialNumber: faultForm.SerialNumber.value.trim() || "",
      Location: faultForm.Location.value.trim() || "",
      RoomNumber: faultForm.RoomNumber.value.trim() || "",
      FaultDescription: faultForm.FaultDescription.value.trim(),
      Status: faultForm.Status.value,
      DateUpdated: nowISO,
    };

    if (editIndex === null) {
      faultReports.push(data);
    } else {
      faultReports[editIndex] = data;
    }

    saveAndRender();
    faultModal.hide();
  });

  // Filter and Search event listeners
  filterEquipmentType.addEventListener("change", renderTable);

  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderTable, 300);
  });

  // Initial table render
  renderTable();
});
