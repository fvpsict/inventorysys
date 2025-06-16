// inventory.js

const STORAGE_KEY = "fvps_inventory_data";

const inventoryTableBody = document.querySelector("#inventory-table tbody");
const filterEquipmentType = document.getElementById("filter-equipmenttype");
const searchInventory = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryModalElement = document.getElementById("inventoryModal");
const inventoryModal = new bootstrap.Modal(inventoryModalElement);
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

// Format date string (yyyy-mm-dd) to "dd MMMM yyyy" (e.g., 25 June 2025)
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";

  const options = { day: "2-digit", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

// Parse "dd MMMM yyyy" back to yyyy-mm-dd for inputs, or "" if invalid
function parseDisplayDateToISO(displayDate) {
  if (!displayDate) return "";
  const parsed = Date.parse(displayDate);
  if (isNaN(parsed)) return "";
  const d = new Date(parsed);
  return d.toISOString().slice(0, 10);
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
    const matchesType =
      filterType === "all" ||
      (item.EquipmentType && item.EquipmentType.toLowerCase() === filterType);
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
      <td>${formatDate(item.EndDate)}</td>
      <td>${formatDate(item.StartDate)}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${formatDate(item.SanitiseDate)}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item["Lamp Hour"] || ""}</td>
      <td>${formatDate(item.DateUpdated)}</td>
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

// Fill form fields with data for editing
function fillForm(item) {
  Object.keys(item).forEach(key => {
    if (inventoryForm.elements[key]) {
      if (key === "EndDate" || key === "StartDate" || key === "SanitiseDate") {
        inventoryForm.elements[key].value = item[key] || "";
      } else if (key === "DateUpdated") {
        // Show formatted date
        inventoryForm.elements[key].value = formatDate(item[key]);
      } else {
        inventoryForm.elements[key].value = item[key];
      }
    }
  });
  document.getElementById("inventoryModalLabel").textContent = "Edit Inventory Item";
}

// Handle Add Item button click
addItemBtn.addEventListener("click", () => {
  resetForm();
  // Set DateUpdated to today in display format
  const now = new Date();
  const options = { day: "2-digit", month: "long", year: "numeric" };
  inventoryForm["DateUpdated"].value = now.toLocaleDateString("en-GB", options);
  inventoryModal.show();
});

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

// Convert date input value (yyyy-mm-dd) to display format dd MMMM yyyy
function dateInputToDisplay(inputVal) {
  if (!inputVal) return "";
  const date = new Date(inputVal);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" });
}

// Convert display format dd MMMM yyyy to ISO yyyy-mm-dd
function displayToISODate(displayStr) {
  if (!displayStr) return "";
  const d = new Date(displayStr);
  if (isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

// Handle form submission for add/edit
inventoryForm.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(inventoryForm);
  let item = {};

  for (let [key, value] of formData.entries()) {
    value = value.trim();

    // For date inputs, convert display dates to ISO (yyyy-mm-dd)
    if (key === "EndDate" || key === "StartDate" || key === "SanitiseDate") {
      item[key] = value; // Date inputs return yyyy-mm-dd already
    } else if (key === "DateUpdated") {
      // We'll overwrite DateUpdated below with today's date
      item[key] = value;
    } else {
      item[key] = value;
    }
  }

  // Overwrite DateUpdated with today's date in ISO format
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const dd = String(now.getDate()).padStart(2, "0");
  const todayISO = `${yyyy}-${mm}-${dd}`;
  item.DateUpdated = todayISO;

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
