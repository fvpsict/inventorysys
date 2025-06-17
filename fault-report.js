// fault-report.js

document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
  const faultForm = document.getElementById("fault-modal-form");
  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  // Data store for faults
  let faults = [];
  let editIndex = null; // index of fault being edited, null if adding new

  // Helpers

  // Format Date object to yyyy-mm-dd string for input[type=date]
  function formatDateInput(date) {
    if (!(date instanceof Date)) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  }

  // Format Date object to readable string yyyy-mm-dd HH:MM:SS
  function formatDateTime(date) {
    if (!(date instanceof Date)) return "";
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const hh = String(date.getHours()).padStart(2, "0");
    const min = String(date.getMinutes()).padStart(2, "0");
    const ss = String(date.getSeconds()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
  }

  // Render table rows based on filtered faults
  function renderTable() {
    const filterType = filterEquipmentType.value.toLowerCase();
    const searchTerm = searchInput.value.trim().toLowerCase();

    faultTableBody.innerHTML = "";

    const filtered = faults.filter(fault => {
      const matchesType = filterType === "all" || fault.EquipmentType.toLowerCase() === filterType;
      // Search across multiple fields for convenience:
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
      ].map(field => (field || "").toLowerCase());

      const matchesSearch = searchableFields.some(field => field.includes(searchTerm));
      return matchesType && matchesSearch;
    });

    if (filtered.length === 0) {
      faultTableBody.innerHTML = `<tr><td colspan="12" class="text-center">No fault reports found.</td></tr>`;
      return;
    }

    filtered.forEach((fault, idx) => {
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
  }

  // Reset form fields to blank or default
  function resetForm() {
    faultForm.reset();
    faultForm.elements["DateUpdated"].value = "";
    editIndex = null;
  }

  // Open modal for adding new fault
  addFaultBtn.addEventListener("click", () => {
    resetForm();
    faultModal.show();
  });

  // Handle form submit (add or edit)
  faultForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Gather form data
    const formData = new FormData(faultForm);

    // Validate required fields:
    if (!formData.get("DateReported")) {
      alert("Date Reported is required.");
      return;
    }
    if (!formData.get("EquipmentType")) {
      alert("Equipment Type is required.");
      return;
    }
    if (!formData.get("FaultDescription")) {
      alert("Fault Description is required.");
      return;
    }
    if (!formData.get("Status")) {
      alert("Status is required.");
      return;
    }
    // Equipment, AssetNo, SerialNumber, RoomNumber are optional

    // Prepare fault object
    const now = new Date();
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
      DateUpdated: formatDateTime(now),
    };

    if (editIndex !== null) {
      // Edit existing
      faults[editIndex] = faultObj;
    } else {
      // Add new
      faults.push(faultObj);
    }

    faultModal.hide();
    renderTable();
  });

  // Edit and Delete button event delegation
  faultTableBody.addEventListener("click", (e) => {
    const target = e.target;
    if (target.classList.contains("edit-btn")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      if (isNaN(idx)) return;

      editIndex = idx;
      const fault = faults[idx];

      // Fill form fields
      faultForm.elements["DateReported"].value = fault.DateReported || "";
      faultForm.elements["EquipmentType"].value = fault.EquipmentType || "";
      faultForm.elements["Equipment"].value = fault.Equipment || "";
      faultForm.elements["AssetNo"].value = fault.AssetNo || "";
      faultForm.elements["BrandModel"].value = fault.BrandModel || "";
      faultForm.elements["SerialNumber"].value = fault.SerialNumber || "";
      faultForm.elements["Location"].value = fault.Location || "";
      faultForm.elements["RoomNumber"].value = fault.RoomNumber || "";
      faultForm.elements["FaultDescription"].value = fault.FaultDescription || "";
      faultForm.elements["Status"].value = fault.Status || "";
      faultForm.elements["DateUpdated"].value = fault.DateUpdated || "";

      faultModal.show();
    } else if (target.classList.contains("delete-btn")) {
      const idx = parseInt(target.getAttribute("data-index"), 10);
      if (isNaN(idx)) return;

      if (confirm("Are you sure you want to delete this fault report?")) {
        faults.splice(idx, 1);
        renderTable();
      }
    }
  });

  // Filtering and searching triggers
  filterEquipmentType.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
});
