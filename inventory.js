// inventory.js

// Globals
let inventoryData = [];
let editIndex = -1;

const inventoryTableBody = document.querySelector("#inventory-table tbody");
const inventoryForm = document.getElementById("inventory-form");
const modalElement = document.getElementById("inventoryModal");
const modal = new bootstrap.Modal(modalElement);

const filterCategory = document.getElementById("filter-category");
const searchInput = document.getElementById("search-inventory");

const equipmentTypeInput = document.getElementById("equipmentType");
const equipmentInput = document.getElementById("equipment");
const equipmentRequiredStar = document.getElementById("equipment-required-star");

const dateUpdatedInput = document.getElementById("dateUpdated");
const durationInUseInput = document.getElementById("durationInUse");
const startDateInput = document.getElementById("startDate");

const csvUploadInput = document.getElementById("csvUpload");

// Initialize
window.onload = () => {
  loadData();
  renderTable();
};

// Load from localStorage
function loadData() {
  const stored = localStorage.getItem("inventoryData");
  if (stored) {
    inventoryData = JSON.parse(stored);
  }
}

// Save to localStorage
function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
}

// Render inventory table
function renderTable() {
  inventoryTableBody.innerHTML = "";

  let filteredData = inventoryData;

  // Apply category filter
  const category = filterCategory.value;
  if (category !== "all") {
    filteredData = filteredData.filter(
      (item) => item.EquipmentType === category
    );
  }

  // Apply search filter (case-insensitive, checks all string fields)
  const searchTerm = searchInput.value.trim().toLowerCase();
  if (searchTerm) {
    filteredData = filteredData.filter((item) =>
      Object.values(item).some(
        (v) =>
          typeof v === "string" &&
          v.toLowerCase().includes(searchTerm)
      )
    );
  }

  filteredData.forEach((item, index) => {
    // Recalculate duration in use on render for accuracy
    item.DurationInUse = calculateDuration(item.StartDate);

    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.Vendor || ""}</td>
      <td>${item.BrandModel || ""}</td>
      <td>${item.Profile || ""}</td>
      <td>${item.Custodian || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNumber || ""}</td>
      <td>${item.Location || ""}</td>
      <td>${item.EndDate || ""}</td>
      <td>${item.StartDate || ""}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item.SSOE_PONumber || ""}</td>
      <td>${item.CartNo || ""}</td>
      <td>${item.SanitiseDate || ""}</td>
      <td>${item.DurationInUse || ""}</td>
      <td>${item.LampHour || ""}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    inventoryTableBody.appendChild(row);
  });

  attachRowEventListeners();
}

// Calculate Duration in Use as "X yrs Y mos" from StartDate to today
function calculateDuration(startDate) {
  if (!startDate) return "";

  const start = new Date(startDate);
  const today = new Date();

  if (isNaN(start)) return "";

  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return "";

  return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
}

// Open modal to add new item
document.getElementById("add-item-btn").addEventListener("click", () => {
  editIndex = -1;
  inventoryForm.reset();
  dateUpdatedInput.value = new Date().toLocaleDateString();
  durationInUseInput.value = "";
  equipmentRequiredStar.classList.add("d-none");
  modal.show();
});

// Form submission (Add or Edit)
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validate conditional Equipment field if EquipmentType is SSOE
  if (
    equipmentTypeInput.value === "SSOE" &&
    (!equipmentInput.value || equipmentInput.value.trim() === "")
  ) {
    equipmentRequiredStar.classList.remove("d-none");
    equipmentInput.focus();
    return;
  } else {
    equipmentRequiredStar.classList.add("d-none");
  }

  // Gather form data
  const formData = {
    EquipmentType: equipmentTypeInput.value.trim(),
    Equipment: equipmentInput.value.trim(),
    Vendor: document.getElementById("vendor").value.trim(),
    BrandModel: document.getElementById("brandModel").value.trim(),
    Profile: document.getElementById("profile").value.trim(),
    Custodian: document.getElementById("custodian").value.trim(),
    AssetNo: document.getElementById("assetNo").value.trim(),
    SerialNumber: document.getElementById("serialNumber").value.trim(),
    Location: document.getElementById("location").value.trim(),
    EndDate: document.getElementById("endDate").value,
    StartDate: startDateInput.value,
    Hostname: document.getElementById("hostname").value.trim(),
    SSOE_PONumber: document.getElementById("ssoePoNumber").value.trim(),
    CartNo: document.getElementById("cartNo").value.trim(),
    SanitiseDate: document.getElementById("sanitiseDate").value,
    DurationInUse: calculateDuration(startDateInput.value),
    LampHour: document.getElementById("lampHour").value.trim(),
    DateUpdated: new Date().toLocaleDateString(),
  };

  if (editIndex === -1) {
    // Add new
    inventoryData.push(formData);
  } else {
    // Edit existing
    inventoryData[editIndex] = formData;
  }

  saveData();
  renderTable();
  modal.hide();
});

// When EquipmentType changes, toggle required on Equipment field
equipmentTypeInput.addEventListener("change", () => {
  if (equipmentTypeInput.value === "SSOE") {
    equipmentInput.setAttribute("required", "required");
    equipmentRequiredStar.classList.remove("d-none");
  } else {
    equipmentInput.removeAttribute("required");
    equipmentRequiredStar.classList.add("d-none");
  }
});

// Edit button event handler
function attachRowEventListeners() {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");

  editButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      editIndex = idx;
      populateForm(inventoryData[idx]);
      modal.show();
    })
  );

  deleteButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      if (confirm("Are you sure you want to delete this item?")) {
        inventoryData.splice(idx, 1);
        saveData();
        renderTable();
      }
    })
  );
}

// Populate modal form fields for editing
function populateForm(item) {
  equipmentTypeInput.value = item.EquipmentType || "";
  equipmentInput.value = item.Equipment || "";
  document.getElementById("vendor").value = item.Vendor || "";
  document.getElementById("brandModel").value = item.BrandModel || "";
  document.getElementById("profile").value = item.Profile || "";
  document.getElementById("custodian").value = item.Custodian || "";
  document.getElementById("assetNo").value = item.AssetNo || "";
  document.getElementById("serialNumber").value = item.SerialNumber || "";
  document.getElementById("location").value = item.Location || "";
  document.getElementById("endDate").value = item.EndDate || "";
  startDateInput.value = item.StartDate || "";
  document.getElementById("hostname").value = item.Hostname || "";
  document.getElementById("ssoePoNumber").value = item.SSOE_PONumber || "";
  document.getElementById("cartNo").value = item.CartNo || "";
  document.getElementById("sanitiseDate").value = item.SanitiseDate || "";
  durationInUseInput.value = item.DurationInUse || "";
  document.getElementById("lampHour").value = item.LampHour || "";
  dateUpdatedInput.value = item.DateUpdated || "";
  // Toggle equipment required star
  if (equipmentTypeInput.value === "SSOE") {
    equipmentInput.setAttribute("required", "required");
    equipmentRequiredStar.classList.remove("d-none");
  } else {
    equipmentInput.removeAttribute("required");
    equipmentRequiredStar.classList.add("d-none");
  }
}

// Filter and search event handlers
filterCategory.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Update Duration In Use on Start Date change in modal
startDateInput.addEventListener("change", () => {
  durationInUseInput.value = calculateDuration(startDateInput.value);
});

// CSV Upload & Parsing
csvUploadInput.addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (event) => {
    const csvText = event.target.result;
    parseCSV(csvText);
    csvUploadInput.value = ""; // Reset input
  };
  reader.readAsText(file);
});

// Parse CSV text, convert to objects and add to inventory
function parseCSV(csvText) {
  const lines = csvText.trim().split(/\r?\n/);
  if (lines.length < 2) {
    alert("CSV must have header and at least one data row.");
    return;
  }

  // Assume first line header
  const headers = lines[0].split(",").map(h => h.trim());

  // Required headers list for validation (can be expanded)
  const requiredHeaders = [
    "EquipmentType", "Equipment", "Vendor", "BrandModel", "Profile", "Custodian",
    "AssetNo", "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
    "SSOE_PONumber", "CartNo", "SanitiseDate", "DurationInUse", "LampHour", "DateUpdated"
  ];

  // Check that all required headers exist
  for (const rh of requiredHeaders) {
    if (!headers.includes(rh)) {
      alert(`CSV missing required header: ${rh}`);
      return;
    }
  }

  for (let i = 1; i < lines.length; i++) {
    if (!lines[i].trim()) continue;
    const values = lines[i].split(",").map(v => v.trim());
    const item = {};
    headers.forEach((h, idx) => {
      item[h] = values[idx] || "";
    });

    // Recalculate DurationInUse
    item.DurationInUse = calculateDuration(item.StartDate);
    inventoryData.push(item);
  }

  saveData();
  renderTable();
  alert("CSV data loaded successfully.");
}

// CSV Export
function exportCSV() {
  if (inventoryData.length === 0) {
    alert("No data to export.");
    return;
  }

  const headers = [
    "EquipmentType", "Equipment", "Vendor", "BrandModel", "Profile", "Custodian",
    "AssetNo", "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
    "SSOE_PONumber", "CartNo", "SanitiseDate", "DurationInUse", "LampHour", "DateUpdated"
  ];

  const csvRows = [];
  csvRows.push(headers.join(","));

  inventoryData.forEach(item => {
    const row = headers.map(h => {
      // Escape quotes by doubling them
      const val = item[h] ? item[h].toString() : "";
      return `"${val.replace(/"/g, '""')}"`;
    });
    csvRows.push(row.join(","));
  });

  const csvString = csvRows.join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = "inventory_export.csv";
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Optional: Add an export button or trigger export on demand
// For example, add a button with id="export-csv-btn" and add:
// document.getElementById("export-csv-btn").addEventListener("click", exportCSV);
