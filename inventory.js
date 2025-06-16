// inventory.js

// Inventory categories and headers per category
const CATEGORY_HEADERS = {
  SSOE: [
    "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo", "SerialNumber",
    "Location", "EndDate", "StartDate", "Hostname", "SSOE_PONumber", "CartNo", "SanitiseDate", "Fault", "Actions"
  ],
  Projector: [
    "EquipmentType", "Vendor", "BrandModel", "AssetNo", "SerialNumber", "EndDate", "StartDate",
    "Room", "RoomNumber", "Level", "Lamphour", "Fault", "DurationInUse", "LastUpdated", "Actions"
  ],
  "Projector Screen": [
    "EquipmentType", "Vendor", "BrandModel", "AssetNo", "SerialNumber", "EndDate", "StartDate",
    "Room", "RoomNumber", "Level", "Fault", "DurationInUse", "LastUpdated", "Actions"
  ],
  // Add other categories here with their headers as needed
  // Default headers if category not matched:
  Default: [
    "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo", "SerialNumber",
    "Location", "EndDate", "StartDate", "Hostname", "Fault", "DurationInUse", "LastUpdated", "Actions"
  ]
};

// Key to use in localStorage
const STORAGE_KEY = "inventory_data";

// Current category selected
let currentCategory = "SSOE";

// Inventory data format: { categoryName: [array of items] }
let inventoryData = {};

// Load data from localStorage
function loadData() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    inventoryData = JSON.parse(stored);
  } else {
    inventoryData = {};
  }
  // Ensure current category has array
  if (!inventoryData[currentCategory]) {
    inventoryData[currentCategory] = [];
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryData));
}

// Calculate duration in use given StartDate and EndDate (strings in yyyy-mm-dd)
function calculateDurationInUse(startDateStr, endDateStr) {
  if (!startDateStr) return "";
  const startDate = new Date(startDateStr);
  const endDate = endDateStr ? new Date(endDateStr) : new Date();

  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return "";

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  if (years < 0) return "";

  return `${years} yr${years !== 1 ? "s" : ""} ${months} mo${months !== 1 ? "s" : ""}`;
}

// Render table headers dynamically based on currentCategory
function renderTableHeaders() {
  const tableHead = document.querySelector("#inventory-table thead");
  if (!tableHead) return;

  const headers = CATEGORY_HEADERS[currentCategory] || CATEGORY_HEADERS.Default;

  const tr = document.createElement("tr");
  headers.forEach(header => {
    const th = document.createElement("th");
    // Beautify header names
    const headerText = header.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();
    th.textContent = headerText;
    tr.appendChild(th);
  });

  tableHead.innerHTML = "";
  tableHead.appendChild(tr);
}

// Render the inventory table rows
function renderTableRows() {
  const tableBody = document.querySelector("#inventory-table tbody");
  if (!tableBody) return;

  tableBody.innerHTML = "";

  const headers = CATEGORY_HEADERS[currentCategory] || CATEGORY_HEADERS.Default;
  const data = inventoryData[currentCategory] || [];

  data.forEach((item, index) => {
    const tr = document.createElement("tr");
    headers.forEach(header => {
      const td = document.createElement("td");

      if (header === "Actions") {
        // Actions: Edit and Delete buttons
        const editBtn = document.createElement("button");
        editBtn.textContent = "Edit";
        editBtn.className = "btn btn-sm btn-primary me-1";
        editBtn.onclick = () => editItem(index);

        const deleteBtn = document.createElement("button");
        deleteBtn.textContent = "Delete";
        deleteBtn.className = "btn btn-sm btn-danger";
        deleteBtn.onclick = () => deleteItem(index);

        td.appendChild(editBtn);
        td.appendChild(deleteBtn);
      } else if (header === "DurationInUse") {
        // Calculate duration in use
        const startDate = item["StartDate"] || "";
        const endDate = item["EndDate"] || "";
        td.textContent = calculateDurationInUse(startDate, endDate);
      } else if (header === "LastUpdated") {
        td.textContent = item["LastUpdated"] || "";
      } else if (header === "Fault") {
        // Make fault editable inline
        const faultInput = document.createElement("input");
        faultInput.type = "text";
        faultInput.value = item["Fault"] || "";
        faultInput.className = "form-control form-control-sm";
        faultInput.onchange = (e) => {
          inventoryData[currentCategory][index]["Fault"] = e.target.value.trim();
          saveData();
        };
        td.appendChild(faultInput);
      } else {
        td.textContent = item[header] || "";
      }
      tr.appendChild(td);
    });

    tableBody.appendChild(tr);
  });
}

// Show the add/edit form modal with optional item data to edit
function showForm(editIndex = null) {
  const modal = document.getElementById("inventoryModal");
  if (!modal) return;

  const headers = CATEGORY_HEADERS[currentCategory] || CATEGORY_HEADERS.Default;

  const formTitle = modal.querySelector(".modal-title");
  formTitle.textContent = editIndex === null ? `Add New ${currentCategory} Item` : `Edit ${currentCategory} Item`;

  const formBody = modal.querySelector(".modal-body");
  formBody.innerHTML = "";

  // Create form inputs for each header except Actions and DurationInUse (calculated)
  headers.forEach(header => {
    if (header === "Actions" || header === "DurationInUse" || header === "LastUpdated") return;

    const formGroup = document.createElement("div");
    formGroup.className = "mb-3";

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = header.replace(/([A-Z])/g, " $1").replace(/_/g, " ").trim();

    let input;
    if (header === "Fault") {
      input = document.createElement("textarea");
      input.rows = 2;
      input.className = "form-control";
    } else if (header.toLowerCase().includes("date")) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "form-control";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
    }
    input.name = header;
    formGroup.appendChild(label);
    formGroup.appendChild(input);
    formBody.appendChild(formGroup);
  });

  // If editing, fill in values
  if (editIndex !== null) {
    const item = inventoryData[currentCategory][editIndex];
    if (item) {
      headers.forEach(header => {
        if (header === "Actions" || header === "DurationInUse" || header === "LastUpdated") return;
        const input = formBody.querySelector(`[name="${header}"]`);
        if (input) {
          input.value = item[header] || "";
        }
      });
    }
  }

  // Store edit index in modal dataset for saving
  modal.dataset.editIndex = editIndex !== null ? editIndex : "";

  // Show modal (Bootstrap 5)
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();
}

// Handle form submit to add/edit item
function saveForm() {
  const modal = document.getElementById("inventoryModal");
  if (!modal) return;

  const formBody = modal.querySelector(".modal-body");
  const inputs = formBody.querySelectorAll("input, textarea");

  const newItem = {};
  inputs.forEach(input => {
    newItem[input.name] = input.value.trim();
  });

  // Set LastUpdated to current date string yyyy-mm-dd
  newItem["LastUpdated"] = new Date().toISOString().slice(0, 10);

  const editIndexStr = modal.dataset.editIndex;
  if (editIndexStr !== "") {
    // Editing existing item
    const index = parseInt(editIndexStr, 10);
    inventoryData[currentCategory][index] = newItem;
  } else {
    // Adding new item
    if (!inventoryData[currentCategory]) {
      inventoryData[currentCategory] = [];
    }
    inventoryData[currentCategory].push(newItem);
  }

  saveData();
  renderTableRows();

  // Hide modal
  const bootstrapModal = bootstrap.Modal.getInstance(modal);
  bootstrapModal.hide();
}

// Edit item handler
function editItem(index) {
  showForm(index);
}

// Delete item handler
function deleteItem(index) {
  if (!confirm("Are you sure you want to delete this item?")) return;
  inventoryData[currentCategory].splice(index, 1);
  saveData();
  renderTableRows();
}

// Change category and reload table
function changeCategory(category) {
  currentCategory = category;
  if (!inventoryData[currentCategory]) {
    inventoryData[currentCategory] = [];
  }
  renderTableHeaders();
  renderTableRows();
  document.getElementById("categorySelector").value = category;
  clearSearch();
}

// Search/filter table rows by AssetNo, BrandModel, or other key fields
function searchInventory() {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  const tableBody = document.querySelector("#inventory-table tbody");
  if (!tableBody) return;

  Array.from(tableBody.rows).forEach(row => {
    const cells = row.cells;
    let text = "";
    // Search relevant columns (AssetNo, BrandModel, EquipmentType)
    for (let cell of cells) {
      text += cell.textContent.toLowerCase() + " ";
    }
    if (text.includes(filter)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function clearSearch() {
  document.getElementById("searchInput").value = "";
  searchInventory();
}

// Initialize page: bind events, load data, render initial table
function init() {
  loadData();

  // Setup category selector change
  const catSelector = document.getElementById("categorySelector");
  if (catSelector) {
    catSelector.onchange = (e) => changeCategory(e.target.value);
  }

  // Setup Add New button
  const addNewBtn = document.getElementById("addNewBtn");
  if (addNewBtn) {
    addNewBtn.onclick = () => showForm(null);
  }

  // Setup form save button
  const saveBtn = document.getElementById("saveItemBtn");
  if (saveBtn) {
    saveBtn.onclick = (e) => {
      e.preventDefault();
      saveForm();
    };
  }

  // Setup search input
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.oninput = searchInventory;
  }

  // Initialize with currentCategory
  changeCategory(currentCategory);
}

// Run init on page load
document.addEventListener("DOMContentLoaded", init);
