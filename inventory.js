// inventory.js

// Selectors
const inventoryTableBody = document.querySelector("#inventory-table tbody");
const filterEquipmentType = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const modalForm = document.getElementById("inventory-modal-form");

// Inventory data array
let inventoryData = [];

// Current editing item index (null means add new)
let currentEditIndex = null;

// Utility: Save inventoryData to localStorage
function saveInventory() {
  localStorage.setItem("fvpsInventory", JSON.stringify(inventoryData));
}

// Utility: Load inventoryData from localStorage
function loadInventory() {
  const stored = localStorage.getItem("fvpsInventory");
  if (stored) {
    inventoryData = JSON.parse(stored);
  }
}

// Utility: Format date string yyyy-mm-dd to Date object or null
function parseDate(datestr) {
  if (!datestr) return null;
  const d = new Date(datestr);
  return isNaN(d) ? null : d;
}

// Utility: Format date to yyyy-mm-dd string or empty string
function formatDate(date) {
  if (!date) return "";
  if (typeof date === "string") return date; // Assume already string
  const y = date.getFullYear();
  const m = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// Calculate duration in use as "X yr Y mos" from StartDate to EndDate or today
function calcDuration(startDateStr, endDateStr) {
  const start = parseDate(startDateStr);
  if (!start) return "";
  const end = parseDate(endDateStr) || new Date();

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "";

  const yearsText = years > 0 ? `${years} yr${years > 1 ? "s" : ""}` : "";
  const monthsText = months > 0 ? `${months} mo${months > 1 ? "s" : ""}` : "";

  return `${yearsText}${yearsText && monthsText ? " " : ""}${monthsText}` || "";
}

// Render the inventory table rows based on inventoryData and current filters/search
function renderTable() {
  const filterValue = filterEquipmentType.value.toLowerCase();
  const searchTerm = searchInput.value.trim().toLowerCase();

  inventoryTableBody.innerHTML = "";

  inventoryData.forEach((item, index) => {
    // Filter by EquipmentType
    if (filterValue !== "all" && item.EquipmentType.toLowerCase() !== filterValue) {
      return;
    }

    // Search across multiple fields
    const searchableFields = [
      item.EquipmentType,
      item.Vendor,
      item.BrandModel,
      item.Profile,
      item.Custodian,
      item.AssetNo,
      item.SerialNumber,
      item.Location,
      item.Hostname,
      item.SSOE_PONumber,
      item.CartNo,
    ].join(" ").toLowerCase();

    if (!searchableFields.includes(searchTerm)) {
      return;
    }

    const tr = document.createElement("tr");

    // Create each table cell in order
    const cells = [
      item.EquipmentType,
      item.Vendor,
      item.BrandModel,
      item.Profile,
      item.Custodian,
      item.AssetNo,
      item.SerialNumber,
      item.Location,
      formatDate(item.EndDate),
      formatDate(item.StartDate),
      item.Hostname,
      item.SSOE_PONumber,
      item.CartNo,
      formatDate(item.SanitiseDate),
      calcDuration(item.StartDate, item.EndDate),
      item.LampHour || "",
      item.DateUpdated || "",
    ];

    cells.forEach(text => {
      const td = document.createElement("td");
      td.textContent = text || "";
      tr.appendChild(td);
    });

    // Actions buttons: Edit / Delete
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("text-nowrap");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => deleteItem(index));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    inventoryTableBody.appendChild(tr);
  });
}

// Open modal to add a new item
function openAddModal() {
  currentEditIndex = null;
  modalForm.reset();
  // Clear DateUpdated, LampHour fields
  modalForm.elements["DateUpdated"].value = "";
  modalForm.elements["LampHour"].value = "";
  inventoryModal.show();
  setTimeout(() => {
    modalForm.elements["EquipmentType"].focus();
  }, 200);
}

// Open modal to edit existing item at index
function openEditModal(index) {
  currentEditIndex = index;
  const item = inventoryData[index];
  if (!item) return;

  // Populate form fields
  for (const key in item) {
    if (modalForm.elements[key]) {
      modalForm.elements[key].value = item[key] || "";
    }
  }
  inventoryModal.show();
}

// Delete item at index with confirmation
function deleteItem(index) {
  if (confirm("Are you sure you want to delete this inventory item?")) {
    inventoryData.splice(index, 1);
    saveInventory();
    renderTable();
  }
}

// Handle form submission for add/edit
modalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Read form data into object
  const formData = new FormData(modalForm);
  const newItem = {};
  for (const [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Validate required fields
  if (!newItem.EquipmentType) {
    alert("Equipment Type is required");
    return;
  }
  if (!newItem.AssetNo) {
    alert("Asset No is required");
    return;
  }

  // Update DateUpdated to today
  newItem.DateUpdated = formatDate(new Date());

  // Add or update inventoryData
  if (currentEditIndex !== null) {
    // Update existing
    inventoryData[currentEditIndex] = newItem;
  } else {
    // Add new
    inventoryData.push(newItem);
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
});

// Event listeners for filter and search inputs
filterEquipmentType.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);
addItemBtn.addEventListener("click", openAddModal);

// Initialize app
function init() {
  loadInventory();
  renderTable();
}

init();
