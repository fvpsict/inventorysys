(() => {
  "use strict";

  // Elements
  const addItemBtn = document.getElementById("addItemBtn");
  const inventoryTableBody = document.querySelector("#inventoryTable tbody");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const inventoryForm = document.getElementById("inventoryForm");

  const equipmentTypeSelect = document.getElementById("equipmentType");
  const equipmentContainer = document.getElementById("equipmentContainer");
  const equipmentSelect = document.getElementById("equipment");

  const filterEquipmentType = document.getElementById("filterEquipmentType");
  const searchInput = document.getElementById("searchInventory");

  // Data key
  const STORAGE_KEY = "fvps_inventory";

  // State
  let inventory = [];
  let editIndex = null;

  // --- Helpers ---

  // Duration in use calculation: from StartDate to EndDate or today if no EndDate
  function calculateDuration(startDateStr, endDateStr) {
    if (!startDateStr) return "";
    const start = new Date(startDateStr);
    const end = endDateStr ? new Date(endDateStr) : new Date();
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return "";

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let result = "";
    if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
    if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;

    return result.trim() || "0 mo";
  }

  // Save to localStorage
  function saveInventory() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
  }

  // Load from localStorage
  function loadInventory() {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        inventory = JSON.parse(stored);
      } catch {
        inventory = [];
      }
    } else {
      inventory = [];
    }
  }

  // Clear table
  function clearTable() {
    inventoryTableBody.innerHTML = "";
  }

  // Render table rows based on filtered and searched inventory
  function renderTable() {
    clearTable();

    // Get filter values
    const filterType = filterEquipmentType.value.trim();
    const searchTerm = searchInput.value.trim().toLowerCase();

    // Filter and search
    const filteredItems = inventory.filter((item) => {
      const matchesType = !filterType || item.equipmentType === filterType;
      const searchableString = Object.values(item)
        .map(String)
        .join(" ")
        .toLowerCase();
      const matchesSearch = searchableString.includes(searchTerm);
      return matchesType && matchesSearch;
    });

    if (filteredItems.length === 0) {
      const tr = document.createElement("tr");
      tr.innerHTML = `<td colspan="14" class="text-center text-muted">No records found</td>`;
      inventoryTableBody.appendChild(tr);
      return;
    }

    filteredItems.forEach((item, idx) => {
      const tr = document.createElement("tr");

      // Duration calculated live for display
      const duration = calculateDuration(item.startDate, item.endDate);

      tr.innerHTML = `
        <td>${item.equipmentType || ""}</td>
        <td>${item.equipmentType === "SSOE" ? (item.equipment || "") : ""}</td>
        <td>${item.vendor || ""}</td>
        <td>${item.brandModel || ""}</td>
        <td>${item.profile || ""}</td>
        <td>${item.custodian || ""}</td>
        <td>${item.assetNo || ""}</td>
        <td>${item.serialNumber || ""}</td>
        <td>${item.location || ""}</td>
        <td>${item.endDate || ""}</td>
        <td>${item.startDate || ""}</td>
        <td>${duration}</td>
        <td>${item.hostname || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-index="${idx}" title="Edit">✏️</button>
          <button class="btn btn-sm btn-danger btn-delete" data-index="${idx}" title="Delete">🗑️</button>
        </td>
      `;

      inventoryTableBody.appendChild(tr);
    });
  }

  // Reset form inputs and validation
  function resetForm() {
    inventoryForm.reset();
    equipmentContainer.style.display = "none";
    equipmentSelect.required = false;
    inventoryForm.classList.remove("was-validated");
    editIndex = null;
  }

  // Fill form inputs for edit
  function fillForm(item) {
    equipmentTypeSelect.value = item.equipmentType || "";
    if (item.equipmentType === "SSOE") {
      equipmentContainer.style.display = "block";
      equipmentSelect.required = true;
      equipmentSelect.value = item.equipment || "";
    } else {
      equipmentContainer.style.display = "none";
      equipmentSelect.required = false;
      equipmentSelect.value = "";
    }

    document.getElementById("vendor").value = item.vendor || "";
    document.getElementById("brandModel").value = item.brandModel || "";
    document.getElementById("profile").value = item.profile || "";
    document.getElementById("custodian").value = item.custodian || "";
    document.getElementById("assetNo").value = item.assetNo || "";
    document.getElementById("serialNumber").value = item.serialNumber || "";
    document.getElementById("location").value = item.location || "";
    document.getElementById("startDate").value = item.startDate || "";
    document.getElementById("endDate").value = item.endDate || "";
    document.getElementById("hostname").value = item.hostname || "";
  }

  // Collect form data as an object
  function getFormData() {
    return {
      equipmentType: equipmentTypeSelect.value.trim(),
      equipment: equipmentTypeSelect.value === "SSOE" ? equipmentSelect.value.trim() : "",
      vendor: document.getElementById("vendor").value.trim(),
      brandModel: document.getElementById("brandModel").value.trim(),
      profile: document.getElementById("profile").value.trim(),
      custodian: document.getElementById("custodian").value.trim(),
      assetNo: document.getElementById("assetNo").value.trim(),
      serialNumber: document.getElementById("serialNumber").value.trim(),
      location: document.getElementById("location").value.trim(),
      startDate: document.getElementById("startDate").value,
      endDate: document.getElementById("endDate").value,
      hostname: document.getElementById("hostname").value.trim(),
    };
  }

  // Validate uniqueness of AssetNo
  function isAssetNoUnique(assetNo, ignoreIndex = null) {
    return !inventory.some((item, idx) => item.assetNo === assetNo && idx !== ignoreIndex);
  }

  // Event handlers
  function onEquipmentTypeChange() {
    if (equipmentTypeSelect.value === "SSOE") {
      equipmentContainer.style.display = "block";
      equipmentSelect.required = true;
    } else {
      equipmentContainer.style.display = "none";
      equipmentSelect.required = false;
      equipmentSelect.value = "";
    }
  }

  function onAddItemClick() {
    resetForm();
    inventoryModal.show();
  }

  function onTableClick(e) {
    if (e.target.classList.contains("btn-edit")) {
      const idx = Number(e.target.dataset.index);
      if (Number.isInteger(idx)) {
        editIndex = idx;
        fillForm(inventory[idx]);
        inventoryModal.show();
      }
    } else if (e.target.classList.contains("btn-delete")) {
      const idx = Number(e.target.dataset.index);
      if (Number.isInteger(idx)) {
        if (confirm("Are you sure you want to delete this item?")) {
          inventory.splice(idx, 1);
          saveInventory();
          renderTable();
        }
      }
    }
  }

  function onFormSubmit(e) {
    e.preventDefault();
    e.stopPropagation();

    // Bootstrap validation
    if (!inventoryForm.checkValidity()) {
      inventoryForm.classList.add("was-validated");
      return;
    }

    const data = getFormData();

    // Validate AssetNo unique
    if (!isAssetNoUnique(data.assetNo, editIndex)) {
      alert("AssetNo must be unique.");
      return;
    }

    if (editIndex === null) {
      // Add new
      inventory.push(data);
    } else {
      // Update existing
      inventory[editIndex] = data;
    }

    saveInventory();
    renderTable();
    inventoryModal.hide();
  }

  // Init
  function init() {
    loadInventory();
    renderTable();

    addItemBtn.addEventListener("click", onAddItemClick);
    equipmentTypeSelect.addEventListener("change", onEquipmentTypeChange);
    inventoryTableBody.addEventListener("click", onTableClick);
    inventoryForm.addEventListener("submit", onFormSubmit);
    filterEquipmentType.addEventListener("change", renderTable);
    searchInput.addEventListener("input", renderTable);
  }

  init();
})();
