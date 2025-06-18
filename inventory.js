// inventory.js

"use strict";

const inventoryTableBody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterCategory = document.getElementById("filter-category");
const searchInput = document.getElementById("search-inventory");

const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const inventoryForm = document.getElementById("inventory-form");
const modalTitle = document.getElementById("inventoryModalLabel");

const equipmentTypeSelect = document.getElementById("equipmentType");
const ssoeFields = document.querySelectorAll(".ssoe-only");

let inventoryData = [];
let editIndex = -1; // -1 means add new

// Load from localStorage on init
function loadInventory() {
  const data = localStorage.getItem("inventoryData");
  inventoryData = data ? JSON.parse(data) : [];
}

// Save to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
}

// Format date string (YYYY-MM-DD) to readable format (e.g. 2025-06-18 => 18 Jun 2025)
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

// Calculate duration in use from StartDate to EndDate or Today
function calcDurationInUse(startDateStr, endDateStr) {
  if (!startDateStr) return "";
  const startDate = new Date(startDateStr);
  if (isNaN(startDate)) return "";
  const endDate = endDateStr && endDateStr.trim() !== "" ? new Date(endDateStr) : new Date();
  if (isNaN(endDate)) return "";

  let totalMonths =
    (endDate.getFullYear() - startDate.getFullYear()) * 12 +
    (endDate.getMonth() - startDate.getMonth());

  if (endDate.getDate() < startDate.getDate()) {
    totalMonths--;
  }
  if (totalMonths < 0) totalMonths = 0;

  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;

  let result = "";
  if (years > 0) result += `${years} year${years > 1 ? "s" : ""} `;
  if (months > 0) result += `${months} month${months > 1 ? "s" : ""}`;
  if (result.trim() === "") result = "0 months";

  return result.trim();
}

// Render table rows according to filter & search
function renderTable() {
  const categoryFilter = filterCategory.value;
  const searchTerm = searchInput.value.toLowerCase();

  inventoryTableBody.innerHTML = "";

  const filtered = inventoryData.filter((item) => {
    const matchesCategory = categoryFilter === "All" || item.equipmentType === categoryFilter;
    const searchableText = Object.values(item).join(" ").toLowerCase();
    const matchesSearch = searchableText.includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (filtered.length === 0) {
    inventoryTableBody.innerHTML = `<tr><td colspan="18" class="text-center text-muted">No records found.</td></tr>`;
    return;
  }

  filtered.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.equipmentType || ""}</td>
      <td>${item.vendor || ""}</td>
      <td>${item.brandModel || ""}</td>
      <td>${item.profile || ""}</td>
      <td>${item.custodian || ""}</td>
      <td>${item.assetNo || ""}</td>
      <td>${item.serialNumber || ""}</td>
      <td>${item.location || ""}</td>
      <td>${formatDate(item.endDate)}</td>
      <td>${formatDate(item.startDate)}</td>
      <td>${item.hostname || ""}</td>
      <td>${item.ssoePoNumber || ""}</td>
      <td>${item.cartNo || ""}</td>
      <td>${formatDate(item.sanitiseDate)}</td>
      <td>${calcDurationInUse(item.startDate, item.endDate)}</td>
      <td>${item.lampHour || ""}</td>
      <td>${item.dateUpdated || ""}</td>
      <td>
        <button type="button" class="btn btn-sm btn-primary edit-btn" data-index="${index}" title="Edit">&#9998;</button>
        <button type="button" class="btn btn-sm btn-danger delete-btn" data-index="${index}" title="Delete">&#128465;</button>
      </td>
    `;

    inventoryTableBody.appendChild(tr);
  });
}

// Show/hide SSOE fields depending on EquipmentType selection
function toggleSsoeFields() {
  const val = equipmentTypeSelect.value;
  ssoeFields.forEach((field) => {
    field.style.display = val === "SSOE" ? "block" : "none";
  });
}

// Reset form to default blank
function resetForm() {
  inventoryForm.reset();
  equipmentTypeSelect.value = "";
  toggleSsoeFields();
  document.getElementById("durationInUse").value = "";
  document.getElementById("dateUpdated").value = "";
  inventoryForm.classList.remove("was-validated");
}

// Fill form for editing
function fillForm(item) {
  equipmentTypeSelect.value = item.equipmentType || "";
  toggleSsoeFields();

  document.getElementById("vendor").value = item.vendor || "";
  document.getElementById("brandModel").value = item.brandModel || "";
  document.getElementById("profile").value = item.profile || "";
  document.getElementById("custodian").value = item.custodian || "";
  document.getElementById("assetNo").value = item.assetNo || "";
  document.getElementById("serialNumber").value = item.serialNumber || "";
  document.getElementById("location").value = item.location || "";
  document.getElementById("endDate").value = item.endDate || "";
  document.getElementById("startDate").value = item.startDate || "";
  document.getElementById("hostname").value = item.hostname || "";
  document.getElementById("ssoePoNumber").value = item.ssoePoNumber || "";
  document.getElementById("cartNo").value = item.cartNo || "";
  document.getElementById("sanitiseDate").value = item.sanitiseDate || "";
  document.getElementById("lampHour").value = item.lampHour || "";
  document.getElementById("durationInUse").value = calcDurationInUse(item.startDate, item.endDate);
  document.getElementById("dateUpdated").value = item.dateUpdated || "";
}

// Validate AssetNo uniqueness
function isAssetNoUnique(assetNo, skipIndex = -1) {
  assetNo = assetNo.trim().toLowerCase();
  return !inventoryData.some((item, idx) => idx !== skipIndex && item.assetNo.toLowerCase() === assetNo);
}

// On form submit handler
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Bootstrap validation
  if (!inventoryForm.checkValidity()) {
    inventoryForm.classList.add("was-validated");
    return;
  }

  // Custom validation: AssetNo unique
  const assetNoInput = document.getElementById("assetNo");
  const assetNoVal = assetNoInput.value.trim();
  if (!isAssetNoUnique(assetNoVal, editIndex)) {
    alert("Asset No must be unique.");
    assetNoInput.focus();
    return;
  }

  // Build item object from form values
  const item = {
    equipmentType: equipmentTypeSelect.value,
    vendor: document.getElementById("vendor").value.trim(),
    brandModel: document.getElementById("brandModel").value.trim(),
    profile: document.getElementById("profile").value.trim(),
    custodian: document.getElementById("custodian").value.trim(),
    assetNo: assetNoVal,
    serialNumber: document.getElementById("serialNumber").value.trim(),
    location: document.getElementById("location").value.trim(),
    endDate: document.getElementById("endDate").value,
    startDate: document.getElementById("startDate").value,
    hostname: document.getElementById("hostname").value.trim(),
    ssoePoNumber: document.getElementById("ssoePoNumber").value.trim(),
    cartNo: document.getElementById("cartNo").value.trim(),
    sanitiseDate: document.getElementById("sanitiseDate").value,
    lampHour: document.getElementById("lampHour").value ? Number(document.getElementById("lampHour").value) : "",
    dateUpdated: new Date().toLocaleDateString(undefined, {year: "numeric", month: "short", day: "numeric"}),
  };

  // Add or update
  if (editIndex === -1) {
    inventoryData.push(item);
  } else {
    inventoryData[editIndex] = item;
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
});

// On Add button click
addItemBtn.addEventListener("click", () => {
  editIndex = -1;
  modalTitle.textContent = "Add Item";
  resetForm();
  inventoryModal.show();
});

// Edit button click event delegation
inventoryTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("edit-btn")) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < inventoryData.length) {
      editIndex = index;
      modalTitle.textContent = "Edit Item";
      resetForm();
      fillForm(inventoryData[index]);
      inventoryModal.show();
    }
  } else if (e.target.classList.contains("delete-btn")) {
    const index = Number(e.target.dataset.index);
    if (index >= 0 && index < inventoryData.length) {
      if (confirm(`Delete item with Asset No: ${inventoryData[index].assetNo}?`)) {
        inventoryData.splice(index, 1);
        saveInventory();
        renderTable();
      }
    }
  }
});

// Filter and Search change handlers
filterCategory.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Update Duration in use when dates change in modal
function updateDurationField() {
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const durationField = document.getElementById("durationInUse");
  durationField.value = calcDurationInUse(startDate, endDate);
}

document.getElementById("startDate").addEventListener("change", updateDurationField);
document.getElementById("endDate").addEventListener("change", updateDurationField);

// Show/hide SSOE fields on EquipmentType change
equipmentTypeSelect.addEventListener("change", toggleSsoeFields);

// Initial load
loadInventory();
renderTable();
toggleSsoeFields();
