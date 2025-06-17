// inventory.js

const inventoryKey = "fvpsInventory";
let inventory = JSON.parse(localStorage.getItem(inventoryKey)) || [];

const keys = [
  "EquipmentType",
  "Vendor",
  "Equipment",       // New field added here
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
  "Lamp Hour",
  "DateUpdated"
];

const equipmentTypeFilter = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryTableBody = document.querySelector("#inventory-table tbody");
const modalEl = document.getElementById("inventoryModal");
const modal = new bootstrap.Modal(modalEl);
const form = document.getElementById("inventory-modal-form");

let editIndex = -1;

function renderTable() {
  inventoryTableBody.innerHTML = "";

  // Get current filter and search value
  const filterValue = equipmentTypeFilter.value.toLowerCase();
  const searchValue = searchInput.value.trim().toLowerCase();

  inventory.forEach((item, index) => {
    // Filter by EquipmentType if not "all"
    if (filterValue !== "all" && item.EquipmentType.toLowerCase() !== filterValue) {
      return;
    }

    // Search across all keys (except DateUpdated and EquipmentType maybe)
    const matchesSearch = keys.some(key => {
      if (!item[key]) return false;
      return item[key].toString().toLowerCase().includes(searchValue);
    });
    if (!matchesSearch) return;

    const tr = document.createElement("tr");
    keys.forEach(key => {
      const td = document.createElement("td");
      td.textContent = item[key] || "";
      tr.appendChild(td);
    });

    // Actions column
    const actionsTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openEditModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Delete this item?")) {
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

function openEditModal(index) {
  editIndex = index;
  const item = inventory[index];
  keys.forEach(key => {
    const el = form.elements[key];
    if (el) el.value = item[key] || "";
  });
  modal.show();
}

function openAddModal() {
  editIndex = -1;
  form.reset();
  form.elements["DateUpdated"].value = "";
  modal.show();
}

function saveInventory() {
  localStorage.setItem(inventoryKey, JSON.stringify(inventory));
}

function saveForm(event) {
  event.preventDefault();

  // Collect form data
  const item = {};
  keys.forEach(key => {
    const el = form.elements[key];
    if (el) {
      item[key] = el.value.trim();
    }
  });

  // Set DateUpdated to current date in "DD MMMM YYYY" format (e.g. 25 June 2025)
  const now = new Date();
  const options = { day: "2-digit", month: "long", year: "numeric" };
  item["DateUpdated"] = now.toLocaleDateString("en-GB", options);

  if (editIndex >= 0) {
    inventory[editIndex] = item;
  } else {
    inventory.push(item);
  }

  saveInventory();
  renderTable();
  modal.hide();
}

// Event Listeners
addItemBtn.addEventListener("click", openAddModal);
form.addEventListener("submit", saveForm);
equipmentTypeFilter.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
