// inventory.js

const STORAGE_KEY = "fvps_inventory_data";

const inventoryTableBody = document.querySelector("#inventory-table tbody");
const filterEquipmentType = document.getElementById("filter-equipmenttype");
const searchInventory = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const inventoryForm = document.getElementById("inventory-modal-form");

let inventoryData = [];
let editingIndex = null; // null means adding new

// Load data from localStorage
function loadInventory() {
  const storedData = localStorage.getItem(STORAGE_KEY);
  inventoryData = storedData ? JSON.parse(storedData) : [];
}

// Save data to localStorage
function saveInventory() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(inventoryData));
}

// Calculate duration between dates in years and months
function calculateDuration(startDateStr, endDateStr = null) {
  if (!startDateStr) return "";

  const start = new Date(startDateStr);
  const end = endDateStr ? new Date(endDateStr) : new Date();

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return "";

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "";

  let result = "";
  if (years > 0) result += years + (years === 1 ? " year " : " years ");
  if (months > 0) result += months + (months === 1 ? " month" : " months");
  return result.trim();
}

// Render the inventory table rows based on current filter and search
function renderInventory() {
  const filterType = filterEquipmentType.value.toLowerCase();
  const searchText = searchInventory.value.trim().toLowerCase();

  inventoryTableBody.innerHTML = "";

  const filtered = inventoryData.filter(item => {
    const matchesType = filterType === "all" || (item.EquipmentType && item.EquipmentType.toLowerCase() === filterType);
    const matchesSearch = Object.values(item).some(val =>
      val && val.toString().toLowerCase().includes(searchText)
    );
    return matchesType && matchesSearch;
  });

  filtered.forEach((item, index) => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
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
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${item.SanitiseDate || ""}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item["Lamp Hour"] || ""}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn ms-1" data-index="${index}">Delete</button>
      </td>
    `;

    inventoryTableBody.appendChild(tr);
  });

  // Attach event listeners for edit/delete buttons
  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", onEditItem)
  );
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", onDeleteItem)
  );
}

// Clear and reset modal form fields
function resetForm() {
  inventoryForm.reset();
  inventoryForm["DateUpdated"].value = "";
  editingIndex = null;
  document.getElementById("inventoryModalLabel").textContent = "Add Inventory Item";
}

// Handle Add Item button click
addItemBtn.addEventListener("click", () => {
  resetForm();
  inventoryModal.show();
});

// Fill form fields with data for editing
function fillForm(item) {
  Object.keys(item).forEach(key => {
    if (inventoryForm.elements[key]) {
      inventoryForm.elements[key].value = item[key];
    }
  });
  document.getElementById("inventoryModalLabel").textContent = "Edit Inventory Item";
}

// Handle Edit button click
function onEditItem(e) {
  const index = +e.target.dataset.index;
  editingIndex = index;
  const item = inventoryData[index];
  fillForm(item);
  inventoryModal.show();
}

// Handle Delete button click
function onDeleteItem(e) {
  const index = +e.target.dataset.index;
  if (confirm("Are you sure you want to delete this item?")) {
    inventoryData.splice(index, 1);
    saveInventory();
    renderInventory();
  }
}

// Handle form submission for add/edit
inventoryForm.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(inventoryForm);
  let item = {};
  for (let [key, value] of formData.entries()) {
    item[key] = value.trim();
  }

  // Update DateUpdated to current date in YYYY-MM-DD format
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  item.DateUpdated = `${yyyy}-${mm}-${dd}`;

  if (editingIndex !== null) {
    // Editing existing item
    inventoryData[editingIndex] = item;
  } else {
    // Adding new item
    inventoryData.push(item);
  }

  saveInventory();
  renderInventory();
  inventoryModal.hide();
});

// Filter and Search handlers
filterEquipmentType.addEventListener("change", renderInventory);
searchInventory.addEventListener("input", renderInventory);

// Initialize
loadInventory();
renderInventory();
