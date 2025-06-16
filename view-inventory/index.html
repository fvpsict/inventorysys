// inventory.js

// Equipment types for dropdown
const equipmentTypes = [
  "SSOE",
  "Projector",
  "Projector Screen",
  "Patch Panel",
  "Macbook",
  "Speaker",
  "Apple TV",
  "SMax",
  "Portable HDD",
  "TV",
  "OMR",
  "Hansvision",
];

// Columns to display in the table, in order
const columns = [
  "EquipmentType",
  "Vendor",
  "BrandModel",
  "Profile",
  "Custodian",
  "AssetNo",
  "SerialNumber",
  "Location",
  "EndDate",
  "StartDate",
  "Hostname",
  "SSOE PO Number",
  "Cart No",
  "SanitiseDate",
  "Duration in use", // calculated, not stored
  "Lamp Hour",
  "DateUpdated",
];

// Globals
let inventory = [];
let editingIndex = null; // null = adding new

// DOM Elements
const inventoryTableBody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const modalForm = document.getElementById("inventory-form");
const modalBody = modalForm.querySelector(".modal-body");
const modalFooter = modalForm.querySelector(".modal-footer");

// Load data from localStorage or empty array
function loadInventory() {
  const data = localStorage.getItem("inventoryData");
  inventory = data ? JSON.parse(data) : [];
}

// Save data to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Calculate Duration in use (years and months) between startDate and today
function calcDurationInUse(startDateStr) {
  if (!startDateStr) return "";
  const startDate = new Date(startDateStr);
  if (isNaN(startDate)) return "";

  const today = new Date();
  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "";

  let result = "";
  if (years > 0) result += years + (years === 1 ? " yr " : " yrs ");
  if (months > 0) result += months + (months === 1 ? " mo" : " mos");
  return result.trim();
}

// Render the inventory table rows filtered by category and search text
function renderTable() {
  const filterValue = filterSelect.value;
  const searchTerm = searchInput.value.toLowerCase();

  inventoryTableBody.innerHTML = "";

  inventory.forEach((item, index) => {
    if (filterValue !== "All" && item.EquipmentType !== filterValue) return;

    // Check if any field contains the search term
    const matchesSearch = columns.some((col) => {
      if (col === "Duration in use") {
        return calcDurationInUse(item["StartDate"])
          .toLowerCase()
          .includes(searchTerm);
      }
      return (item[col] || "").toString().toLowerCase().includes(searchTerm);
    });
    if (!matchesSearch) return;

    // Create row
    const tr = document.createElement("tr");

    columns.forEach((col) => {
      const td = document.createElement("td");
      if (col === "Duration in use") {
        td.textContent = calcDurationInUse(item["StartDate"]);
      } else {
        td.textContent = item[col] || "";
      }
      tr.appendChild(td);
    });

    // Actions: Edit and Delete buttons
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("text-center");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openModalForEdit(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (
        confirm(
          `Are you sure you want to delete the item with AssetNo "${item.AssetNo}"?`
        )
      ) {
        inventory.splice(index, 1);
        saveInventory();
        renderTable();
      }
    });

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    inventoryTableBody.appendChild(tr);
  });
}

// Open modal to add a new item
function openModalForAdd() {
  editingIndex = null;
  modalForm.reset();
  buildModalForm(null);
  modal.show();
  setModalTitle("Add Inventory Item");
}

// Open modal to edit existing item
function openModalForEdit(index) {
  editingIndex = index;
  modalForm.reset();
  buildModalForm(inventory[index]);
  modal.show();
  setModalTitle("Edit Inventory Item");
}

// Set modal title
function setModalTitle(title) {
  document.getElementById("inventoryModalLabel").textContent = title;
}

// Build modal form fields dynamically based on columns and optional item data
function buildModalForm(item) {
  modalBody.innerHTML = "";
  modalFooter.innerHTML = "";

  columns.forEach((key) => {
    // Skip Duration in use (calculated)
    if (key === "Duration in use") return;

    const div = document.createElement("div");
    div.className = "mb-3";

    const label = document.createElement("label");
    label.htmlFor = `input-${key}`;
    label.className = "form-label fw-semibold";
    label.textContent = key.replace(/([A-Z])/g, " $1").trim();

    let input;

    if (key === "EquipmentType") {
      input = document.createElement("select");
      input.className = "form-select";
      input.id = `input-${key}`;
      input.name = key;

      equipmentTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        if (item && item[key] === type) option.selected = true;
        input.appendChild(option);
      });
    } else if (key === "DateUpdated") {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;
      // auto-fill with today, disabled
      input.value = new Date().toISOString().slice(0, 10);
      input.disabled = true;
      if (item && item[key]) input.value = item[key];
    } else if (
      key.toLowerCase().includes("date") ||
      key === "EndDate" ||
      key === "StartDate" ||
      key === "SanitiseDate"
    ) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;
      input.value = item ? item[key] || "" : "";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;
      input.value = item ? item[key] || "" : "";
    }

    div.appendChild(label);
    div.appendChild(input);
    modalBody.appendChild(div);
  });

  // Add buttons to modal footer
  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn btn-success";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-secondary";
  cancelBtn.textContent = "Cancel";
  cancelBtn.setAttribute("data-bs-dismiss", "modal");

  modalFooter.appendChild(saveBtn);
  modalFooter.appendChild(cancelBtn);
}

// Handle form submit to add or update item
modalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(modalForm);
  let newItem = {};

  columns.forEach((col) => {
    if (col === "Duration in use") return; // skip calc field

    if (col === "DateUpdated") {
      // Use current date string from form input (should be today)
      newItem[col] = document.getElementById(`input-${col}`).value;
    } else {
      newItem[col] = formData.get(col) ? formData.get(col).trim() : "";
    }
  });

  // Validate AssetNo uniqueness when adding
  if (
    !newItem.AssetNo ||
    (editingIndex === null &&
      inventory.some((i) => i.AssetNo.toLowerCase() === newItem.AssetNo.toLowerCase()))
  ) {
    alert(
      "AssetNo is required and must be unique. Please check your input."
    );
    return;
  }

  if (editingIndex === null) {
    inventory.push(newItem);
  } else {
    inventory[editingIndex] = newItem;
  }

  saveInventory();
  renderTable();
  modal.hide();
});

// Attach event listeners for filters and buttons
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);
addItemBtn.addEventListener("click", openModalForAdd);

// Initialization
loadInventory();
renderTable();
