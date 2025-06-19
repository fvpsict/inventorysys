const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const inventoryForm = document.getElementById("inventory-form");

// Form inputs
const formFields = {
  EquipmentType: document.getElementById("equipmentType"),
  Equipment: document.getElementById("equipment"),
  Vendor: document.getElementById("vendor"),
  BrandModel: document.getElementById("brandModel"),
  Profile: document.getElementById("profile"),
  Custodian: document.getElementById("custodian"),
  AssetNo: document.getElementById("assetNo"),
  SerialNumber: document.getElementById("serialNumber"),
  Location: document.getElementById("location"),
  EndDate: document.getElementById("endDate"),
  StartDate: document.getElementById("startDate"),
  Hostname: document.getElementById("hostname"),
  "SSOE PO Number": document.getElementById("ssoePoNumber"),
  "Cart No": document.getElementById("cartNo"),
  SanitiseDate: document.getElementById("sanitiseDate"),
  DurationInUse: document.getElementById("durationInUse"),
};

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");
let editingIndex = null;

// Format date to "DD MMMM YYYY" e.g. "25 June 2025"
function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "long", year: "numeric" });
}

// Calculate duration in years and months between start and end date
function calculateDuration(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  if (s > e) return "";
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  let result = "";
  if (years > 0) result += years + (years > 1 ? " yrs " : " yr ");
  if (months > 0) result += months + (months > 1 ? " mos" : " mo");
  return result.trim() || "<1 mo";
}

// Update DurationInUse input when start or end dates change
function updateDurationInUse() {
  const start = formFields.StartDate.value;
  const end = formFields.EndDate.value;
  formFields.DurationInUse.value = calculateDuration(start, end);
}

// Render inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, index) => {
    // Filter by EquipmentType
    if (filter !== "all" && (item.EquipmentType || "").toLowerCase() !== filter) return;

    // Search in all fields
    const searchTarget = Object.values(item).join(" ").toLowerCase();
    if (!searchTarget.includes(search)) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Equipment || ""}</td>
      <td>${item.Vendor || ""}</td>
      <td>${item.BrandModel || ""}</td>
      <td>${item.Profile || ""}</td>
      <td>${item.Custodian || ""}</td>
      <td>${item.AssetNo || ""}</td>
      <td>${item.SerialNumber || ""}</td>
      <td>${item.Location || ""}</td>
      <td>${formatDateDisplay(item.EndDate)}</td>
      <td>${formatDateDisplay(item.StartDate)}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${formatDateDisplay(item.SanitiseDate)}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${formatDateDisplay(item.DateUpdated)}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners for edit/delete buttons
  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", onEdit)
  );
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", onDelete)
  );
}

// Save inventory data to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Clear form fields
function clearForm() {
  editingIndex = null;
  inventoryForm.reset();
  formFields.DurationInUse.value = "";
  document.getElementById("inventoryModalLabel").textContent = "Add Inventory Item";
}

// Populate form fields for editing
function populateForm(item) {
  for (const key in formFields) {
    if (key === "DurationInUse") continue; // readonly
    formFields[key].value = item[key] || "";
  }
  updateDurationInUse();
  document.getElementById("inventoryModalLabel").textContent = "Edit Inventory Item";
}

// On Add Item button click: clear form and show modal
addItemBtn.addEventListener("click", () => {
  clearForm();
  inventoryModal.show();
});

// Update duration on date changes
formFields.StartDate.addEventListener("change", updateDurationInUse);
formFields.EndDate.addEventListener("change", updateDurationInUse);

// Form submit: add new or update existing item
inventoryForm.addEventListener("submit", e => {
  e.preventDefault();

  // Validate required fields
  if (!formFields.EquipmentType.value.trim()) {
    alert("Equipment Type is required.");
    return;
  }
  if (!formFields.Vendor.value.trim()) {
    alert("Vendor is required.");
    return;
  }
  if (!formFields.BrandModel.value.trim()) {
    alert("Brand Model is required.");
    return;
  }
  if (!formFields.AssetNo.value.trim()) {
    alert("Asset No is required.");
    return;
  }
  if (!formFields.StartDate.value.trim()) {
    alert("Start Date is required.");
    return;
  }

  // Gather form data
  const newItem = {};
  for (const key in formFields) {
    newItem[key] = formFields[key].value.trim();
  }
  // Set DateUpdated to today formatted
  newItem.DateUpdated = new Date().toISOString();

  if (editingIndex !== null) {
    // Update existing
    inventory[editingIndex] = newItem;
  } else {
    // Add new
    inventory.push(newItem);
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
});

// Edit button handler
function onEdit(e) {
  const index = +e.target.dataset.index;
  const item = inventory[index];
  editingIndex = index;
  populateForm(item);
  inventoryModal.show();
}

// Delete button handler
function onDelete(e) {
  const index = +e.target.dataset.index;
  if (confirm("Are you sure you want to delete this item?")) {
    inventory.splice(index, 1);
    saveInventory();
    renderTable();
  }
}

// Filter and search event handlers
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
