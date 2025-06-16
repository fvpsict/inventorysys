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

// Helper: format date string YYYY-MM-DD to "dd MMMM yyyy"
function formatDateDMY(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const day = date.getDate();
  const month = date.toLocaleString("default", { month: "long" });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

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
      <td>${formatDateDMY(item.EndDate)}</td>
      <td>${formatDateDMY(item.StartDate)}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${formatDateDMY(item.SanitiseDate)}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item["Lamp Hour"] || ""}</td>
      <td>${formatDateDMY(item.DateUpdated)}</td>
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
  editingIndex = null;
  document.getElementById("inventoryModalLabel").textContent = "Add Inventory Item";

  // Auto-fill DateUpdated field with today in modal on Add
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  inventoryForm["DateUpdated"].value = `${day} ${month} ${year}`;
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
      // For dates, convert display back to yyyy-mm-dd for input fields
      if (["StartDate", "EndDate", "SanitiseDate"].includes(key) && item[key]) {
        // Accept stored YYYY-MM-DD, else blank
        inventoryForm.elements[key].value = item[key];
      } else if (key === "DateUpdated" && item[key]) {
        inventoryForm.elements[key].value = item[key]; // Already formatted dd MMM yyyy
      } else {
        inventoryForm.elements[key].value = item[key];
      }
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

  // Convert date inputs to YYYY-MM-DD string for storage and display formatting
  ["StartDate", "EndDate", "SanitiseDate"].forEach(field => {
    if (item[field]) {
      // Ensure date is in YYYY-MM-DD format (from input type="date")
      const d = new Date(item[field]);
      if (!isNaN(d)) {
        item[field] = d.toISOString().slice(0, 10);
      }
    }
  });

  // Update DateUpdated to current date in dd MMMM yyyy format
  const now = new Date();
  const day = now.getDate();
  const month = now.toLocaleString("default", { month: "long" });
  const year = now.getFullYear();
  item.DateUpdated = `${day} ${month} ${year}`;

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
