const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const form = document.getElementById("inventory-form");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");
let editIndex = -1;

// Utility: Calculate duration between two dates in years and months
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
  return `${years ? years + (years > 1 ? " yrs " : " yr ") : ""}${
    months ? months + (months > 1 ? " mos" : " mo") : ""
  }`.trim() || "<1 mo";
}

// Format date as "DD MMMM YYYY" e.g. "25 June 2025"
function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  const options = { day: "2-digit", month: "long", year: "numeric" };
  return d.toLocaleDateString(undefined, options);
}

// Render table rows from inventory array, applying filter and search
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    const matchesFilter = filter === "all" || item.EquipmentType?.toLowerCase() === filter;
    const matchesSearch = Object.values(item)
      .some((v) => v?.toString().toLowerCase().includes(search));
    if (!matchesFilter || !matchesSearch) return;

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
        <button class="btn btn-sm btn-primary edit-btn" data-index="${i}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners for edit and delete buttons
  document.querySelectorAll(".edit-btn").forEach((btn) =>
    btn.addEventListener("click", onEdit)
  );
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", onDelete)
  );
}

// Show modal and populate form for editing an item
function onEdit(e) {
  editIndex = +e.target.dataset.index;
  const item = inventory[editIndex];
  if (!item) return;

  // Populate form fields
  form.EquipmentType.value = item.EquipmentType || "all";
  form.Equipment.value = item.Equipment || "";
  form.Vendor.value = item.Vendor || "";
  form.BrandModel.value = item.BrandModel || "";
  form.Profile.value = item.Profile || "";
  form.Custodian.value = item.Custodian || "";
  form.AssetNo.value = item.AssetNo || "";
  form.SerialNumber.value = item.SerialNumber || "";
  form.Location.value = item.Location || "";
  form.EndDate.value = item.EndDate || "";
  form.StartDate.value = item.StartDate || "";
  form.Hostname.value = item.Hostname || "";
  form["SSOE PO Number"].value = item["SSOE PO Number"] || "";
  form["Cart No"].value = item["Cart No"] || "";
  form.SanitiseDate.value = item.SanitiseDate || "";
  form.durationInUse.value = calculateDuration(item.StartDate, item.EndDate);
  
  inventoryModal.show();
}

// Delete inventory item
function onDelete(e) {
  const index = +e.target.dataset.index;
  if (confirm("Are you sure you want to delete this item?")) {
    inventory.splice(index, 1);
    saveInventory();
    renderTable();
  }
}

// Save inventory array to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Reset form fields
function resetForm() {
  form.reset();
  form.EquipmentType.value = "all";
  form.durationInUse.value = "";
  editIndex = -1;
}

// Calculate and update durationInUse field on start/end date changes
function updateDurationInUse() {
  const startDate = form.StartDate.value;
  const endDate = form.EndDate.value;
  form.durationInUse.value = calculateDuration(startDate, endDate);
}

// Handle form submission for add or edit
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Validation for required fields
  if (!form.AssetNo.value.trim()) {
    alert("Asset No is required");
    return;
  }

  const newItem = {
    EquipmentType: form.EquipmentType.value,
    Equipment: form.Equipment.value,
    Vendor: form.Vendor.value.trim(),
    BrandModel: form.BrandModel.value.trim(),
    Profile: form.Profile.value.trim(),
    Custodian: form.Custodian.value.trim(),
    AssetNo: form.AssetNo.value.trim(),
    SerialNumber: form.SerialNumber.value.trim(),
    Location: form.Location.value.trim(),
    EndDate: form.EndDate.value,
    StartDate: form.StartDate.value,
    Hostname: form.Hostname.value.trim(),
    "SSOE PO Number": form["SSOE PO Number"].value.trim(),
    "Cart No": form["Cart No"].value.trim(),
    SanitiseDate: form.SanitiseDate.value,
    DateUpdated: new Date().toISOString().slice(0, 10), // save as yyyy-mm-dd
  };

  if (editIndex >= 0) {
    inventory[editIndex] = newItem;
  } else {
    inventory.push(newItem);
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
  resetForm();
});

// Update duration in use when dates change
form.StartDate.addEventListener("change", updateDurationInUse);
form.EndDate.addEventListener("change", updateDurationInUse);

// Add Item button opens modal for new item
addItemBtn.addEventListener("click", () => {
  resetForm();
  inventoryModal.show();
});

// Filter and search handlers
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
