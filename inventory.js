const inventoryTable = document.getElementById("inventory-table");
const tbody = inventoryTable.querySelector("tbody");
const filterEquipmentType = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");

const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const inventoryForm = document.getElementById("inventory-modal-form");

// Inventory data array
let inventoryItems = JSON.parse(localStorage.getItem("inventoryItems")) || [];
let editingIndex = null;

// Utility: Format date to "DD MMMM YYYY" (e.g., 25 June 2025)
function formatDateDDMMMYYYY(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const day = d.getDate();
  const month = d.toLocaleString("default", { month: "long" });
  const year = d.getFullYear();
  return `${day} ${month} ${year}`;
}

// Utility: Calculate duration in years and months from a start date string to today
function getDurationInUse(startDateStr) {
  if (!startDateStr) return "";
  const startDate = new Date(startDateStr);
  if (isNaN(startDate)) return "";

  const now = new Date();
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "";

  let result = "";
  if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
  if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;
  return result.trim() || "0 mo";
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
}

// Render the inventory table rows
function renderTable() {
  const filterVal = filterEquipmentType.value.toLowerCase();
  const searchVal = searchInput.value.toLowerCase();

  tbody.innerHTML = "";

  inventoryItems.forEach((item, index) => {
    if (filterVal !== "all" && item.EquipmentType.toLowerCase() !== filterVal) return;

    const searchableText = [
      item.EquipmentType,
      item.Vendor,
      item.Equipment,
      item.BrandModel,
      item.Profile,
      item.Custodian,
      item.AssetNo,
      item.SerialNumber,
      item.Location,
      item.EndDate,
      item.StartDate,
      item.Hostname,
      item["SSOE PO Number"],
      item["Cart No"],
      item.SanitiseDate,
      item["Lamp Hour"]?.toString() || "",
      item.DateUpdated,
    ]
      .join(" ")
      .toLowerCase();

    if (!searchableText.includes(searchVal)) return;

    const duration = getDurationInUse(item.StartDate);
    const dateUpdatedFormatted = formatDateDDMMMYYYY(item.DateUpdated);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Vendor || ""}</td>
      <td>${item.Equipment || ""}</td>
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
      <td>${duration}</td>
      <td>${item["Lamp Hour"] || ""}</td>
      <td>${dateUpdatedFormatted}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachRowEventListeners();
}

// Attach click listeners to edit and delete buttons
function attachRowEventListeners() {
  const editButtons = document.querySelectorAll(".edit-btn");
  const deleteButtons = document.querySelectorAll(".delete-btn");

  editButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      editingIndex = parseInt(btn.dataset.index, 10);
      openEditModal(editingIndex);
    });
  });

  deleteButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const index = parseInt(btn.dataset.index, 10);
      if (confirm("Are you sure you want to delete this item?")) {
        inventoryItems.splice(index, 1);
        saveInventory();
        renderTable();
      }
    });
  });
}

// Open modal to edit item
function openEditModal(index) {
  const item = inventoryItems[index];
  if (!item) return;

  // Reset form first
  inventoryForm.reset();

  // Set form values
  for (const key in item) {
    const input = inventoryForm.elements[key];
    if (input) {
      input.value = item[key];
    }
  }
  // DateUpdated is readonly - no need to change here

  inventoryModal.show();
}

// Open modal to add new item
function openAddModal() {
  editingIndex = null;
  inventoryForm.reset();
  // Set DateUpdated empty for new item
  inventoryForm.elements["DateUpdated"].value = "";
  inventoryModal.show();
}

// Handle form submission (add or update)
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(inventoryForm);
  let itemObj = {};

  formData.forEach((value, key) => {
    itemObj[key] = value.trim();
  });

  // Auto-update the DateUpdated to today (ISO string)
  itemObj.DateUpdated = new Date().toISOString();

  if (editingIndex !== null) {
    // Update existing
    inventoryItems[editingIndex] = itemObj;
  } else {
    // Add new
    inventoryItems.push(itemObj);
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
});

// Initial rendering and event hookups
addItemBtn.addEventListener("click", openAddModal);
filterEquipmentType.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

renderTable();
