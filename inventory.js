// inventory.js

// Sample inventory data
let inventoryData = [];

// Elements
const tableBody = document.querySelector("#inventory-table tbody");
const filterCategory = document.getElementById("filter-category");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryForm = document.getElementById("inventory-form");
const modalEl = document.getElementById("inventoryModal");
const bootstrapModal = new bootstrap.Modal(modalEl);

let editingIndex = -1; // tracks editing row index

// Render table rows based on inventoryData, filter and search
function renderTable() {
  const filterVal = filterCategory.value.toLowerCase();
  const searchVal = searchInput.value.toLowerCase();

  tableBody.innerHTML = "";

  let filteredData = inventoryData.filter((item) => {
    // Filter by Equipment Type
    if (filterVal !== "all" && item.EquipmentType.toLowerCase() !== filterVal) {
      return false;
    }
    // Search in multiple fields
    const searchFields = [
      item.EquipmentType,
      item.Equipment,
      item.Vendor,
      item.BrandModel,
      item.Profile,
      item.Custodian,
      item.AssetNo,
      item.SerialNumber,
      item.Location,
      item.Hostname,
    ];

    return searchFields.some((field) =>
      field?.toLowerCase().includes(searchVal)
    );
  });

  filteredData.forEach((item, index) => {
    const tr = document.createElement("tr");

    // Build table row cells
    tr.innerHTML = `
      <td>${item.EquipmentType}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.Vendor || ""}</td>
      <td>${item.BrandModel || ""}</td>
      <td>${item.Profile || ""}</td>
      <td>${item.Custodian || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNumber || ""}</td>
      <td>${item.Location || ""}</td>
      <td>${formatDate(item.EndDate)}</td>
      <td>${formatDate(item.StartDate)}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item.SSOE_PONumber || ""}</td>
      <td>${item.CartNo || ""}</td>
      <td>${formatDate(item.SanitiseDate)}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item.LampHour || ""}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });

  attachRowButtons();
}

// Format date as dd MMM yyyy, e.g. 17 Jun 2025
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Calculate duration in use as years and months between start and end date
function calculateDuration(startDateStr, endDateStr) {
  if (!startDateStr) return "";

  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  if (isNaN(startDate) || isNaN(endDate)) return "";

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let result = "";
  if (years > 0) result += years + (years === 1 ? " year " : " years ");
  if (months > 0) result += months + (months === 1 ? " month" : " months");

  return result.trim() || "0 month";
}

// Attach event listeners to Edit and Delete buttons after rendering table
function attachRowButtons() {
  const editButtons = document.querySelectorAll(".edit-btn");
  editButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = +e.target.dataset.index;
      openEditModal(idx);
    })
  );

  const deleteButtons = document.querySelectorAll(".delete-btn");
  deleteButtons.forEach((btn) =>
    btn.addEventListener("click", (e) => {
      const idx = +e.target.dataset.index;
      if (confirm("Are you sure you want to delete this item?")) {
        inventoryData.splice(idx, 1);
        saveData();
        renderTable();
      }
    })
  );
}

// Open modal and populate fields for editing or blank for adding
function openEditModal(index = -1) {
  editingIndex = index;

  if (index === -1) {
    // Clear form
    inventoryForm.reset();
    document.getElementById("durationInUse").value = "";
    document.getElementById("dateUpdated").value = formatDate(new Date());
  } else {
    // Load data into form
    const item = inventoryData[index];
    inventoryForm.elements["EquipmentType"].value = item.EquipmentType || "";
    inventoryForm.elements["Equipment"].value = item.Equipment || "";
    inventoryForm.elements["Vendor"].value = item.Vendor || "";
    inventoryForm.elements["BrandModel"].value = item.BrandModel || "";
    inventoryForm.elements["Profile"].value = item.Profile || "";
    inventoryForm.elements["Custodian"].value = item.Custodian || "";
    inventoryForm.elements["AssetNo"].value = item.AssetNo || "";
    inventoryForm.elements["SerialNumber"].value = item.SerialNumber || "";
    inventoryForm.elements["Location"].value = item.Location || "";
    inventoryForm.elements["EndDate"].value = item.EndDate || "";
    inventoryForm.elements["StartDate"].value = item.StartDate || "";
    inventoryForm.elements["Hostname"].value = item.Hostname || "";
    inventoryForm.elements["SSOE_PONumber"].value = item.SSOE_PONumber || "";
    inventoryForm.elements["CartNo"].value = item.CartNo || "";
    inventoryForm.elements["SanitiseDate"].value = item.SanitiseDate || "";
    document.getElementById("durationInUse").value = calculateDuration(item.StartDate, item.EndDate);
    inventoryForm.elements["LampHour"].value = item.LampHour || "";
    document.getElementById("dateUpdated").value = item.DateUpdated || formatDate(new Date());
  }

  // Update Equipment required attribute on modal open
  const event = new Event("change");
  inventoryForm.elements["EquipmentType"].dispatchEvent(event);

  bootstrapModal.show();
}

// Save form data to inventoryData array
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Simple validation: Equipment required if EquipmentType is SSOE
  const equipmentType = inventoryForm.elements["EquipmentType"].value;
  const equipment = inventoryForm.elements["Equipment"].value;

  if (equipmentType === "SSOE" && !equipment) {
    alert("Equipment is required when Equipment Type is SSOE.");
    return;
  }

  // Construct item object
  const newItem = {
    EquipmentType: equipmentType,
    Equipment: equipment,
    Vendor: inventoryForm.elements["Vendor"].value.trim(),
    BrandModel: inventoryForm.elements["BrandModel"].value.trim(),
    Profile: inventoryForm.elements["Profile"].value.trim(),
    Custodian: inventoryForm.elements["Custodian"].value.trim(),
    AssetNo: inventoryForm.elements["AssetNo"].value.trim(),
    SerialNumber: inventoryForm.elements["SerialNumber"].value.trim(),
    Location: inventoryForm.elements["Location"].value.trim(),
    EndDate: inventoryForm.elements["EndDate"].value,
    StartDate: inventoryForm.elements["StartDate"].value,
    Hostname: inventoryForm.elements["Hostname"].value.trim(),
    SSOE_PONumber: inventoryForm.elements["SSOE_PONumber"].value.trim(),
    CartNo: inventoryForm.elements["CartNo"].value.trim(),
    SanitiseDate: inventoryForm.elements["SanitiseDate"].value,
    LampHour: inventoryForm.elements["LampHour"].value,
    DateUpdated: formatDate(new Date()),
  };

  if (editingIndex === -1) {
    // Add new item
    inventoryData.push(newItem);
  } else {
    // Update existing
    inventoryData[editingIndex] = newItem;
  }

  saveData();
  renderTable();
  bootstrapModal.hide();
});

// Save inventory data to localStorage
function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
}

// Load inventory data from localStorage
function loadData() {
  const saved = localStorage.getItem("inventoryData");
  if (saved) {
    inventoryData = JSON.parse(saved);
  }
}

// Filter and search event listeners
filterCategory.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Add Item button opens modal for adding new
addItemBtn.addEventListener("click", () => openEditModal(-1));

// Initialize
loadData();
renderTable();
