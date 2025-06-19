const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

const modalEl = document.getElementById("inventoryModal");
const inventoryModal = new bootstrap.Modal(modalEl);
const form = document.getElementById("inventory-form");
const modalTitle = document.getElementById("inventoryModalLabel");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");
let editingIndex = -1;

// Format date as DD MMM YYYY, e.g. "25 Jun 2025"
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Calculate duration between start and end dates in years and months
function calculateDuration(startStr, endStr) {
  if (!startStr) return "";
  const start = new Date(startStr);
  const end = endStr ? new Date(endStr) : new Date();
  if (isNaN(start) || isNaN(end) || start > end) return "";
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  let result = "";
  if (years > 0) result += years + " yr" + (years > 1 ? "s " : " ");
  if (months > 0) result += months + " mo" + (months > 1 ? "s" : "");
  return result.trim() || "<1 mo";
}

// Render the inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    const itemType = item.EquipmentType?.toLowerCase() || "";
    if (filter !== "all" && itemType !== filter) return;

    const combined = Object.values(item).join(" ").toLowerCase();
    if (!combined.includes(search)) return;

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
      <td>${formatDate(item.EndDate)}</td>
      <td>${formatDate(item.StartDate)}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${formatDate(item.SanitiseDate)}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${formatDate(item.DateUpdated)}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${i}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners after rendering
  document.querySelectorAll(".edit-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      editingIndex = +btn.dataset.index;
      loadItemToForm(inventory[editingIndex]);
      modalTitle.textContent = "Edit Inventory Item";
      inventoryModal.show();
    });
  });

  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const idx = +btn.dataset.index;
      if (confirm("Are you sure you want to delete this item?")) {
        inventory.splice(idx, 1);
        saveInventory();
        renderTable();
      }
    });
  });
}

// Load an item into the form fields
function loadItemToForm(item) {
  form["EquipmentType"].value = item.EquipmentType || "";
  form["Equipment"].value = item.Equipment || "";
  form["Vendor"].value = item.Vendor || "";
  form["BrandModel"].value = item.BrandModel || "";
  form["Profile"].value = item.Profile || "";
  form["Custodian"].value = item.Custodian || "";
  form["AssetNo"].value = item.AssetNo || "";
  form["SerialNumber"].value = item.SerialNumber || "";
  form["Location"].value = item.Location || "";
  form["EndDate"].value = item.EndDate || "";
  form["StartDate"].value = item.StartDate || "";
  form["Hostname"].value = item.Hostname || "";
  form["SSOE PO Number"].value = item["SSOE PO Number"] || "";
  form["Cart No"].value = item["Cart No"] || "";
  form["SanitiseDate"].value = item.SanitiseDate || "";
  form["DurationInUse"].value = calculateDuration(item.StartDate, item.EndDate);
}

// Clear form for adding new item
function clearForm() {
  form.reset();
  form["DurationInUse"].value = "";
  editingIndex = -1;
  modalTitle.textContent = "Add Inventory Item";
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// On form submit
form.addEventListener("submit", e => {
  e.preventDefault();

  const newItem = {
    EquipmentType: form["EquipmentType"].value,
    Equipment: form["Equipment"].value,
    Vendor: form["Vendor"].value.trim(),
    BrandModel: form["BrandModel"].value.trim(),
    Profile: form["Profile"].value.trim(),
    Custodian: form["Custodian"].value.trim(),
    AssetNo: form["AssetNo"].value.trim(),
    SerialNumber: form["SerialNumber"].value.trim(),
    Location: form["Location"].value.trim(),
    EndDate: form["EndDate"].value,
    StartDate: form["StartDate"].value,
    Hostname: form["Hostname"].value.trim(),
    "SSOE PO Number": form["SSOE PO Number"].value.trim(),
    "Cart No": form["Cart No"].value.trim(),
    SanitiseDate: form["SanitiseDate"].value,
    DateUpdated: new Date().toISOString().slice(0, 10), // save raw date string for formatting
  };

  // Required validation
  if (!newItem.EquipmentType) {
    alert("Please select Equipment Type.");
    return;
  }
  if (!newItem.Vendor) {
    alert("Please enter Vendor.");
    return;
  }
  if (!newItem.BrandModel) {
    alert("Please enter Brand Model.");
    return;
  }
  if (!newItem.AssetNo) {
    alert("Please enter Asset No.");
    return;
  }
  if (!newItem.StartDate) {
    alert("Please enter Start Date.");
    return;
  }

  if (editingIndex >= 0) {
    inventory[editingIndex] = newItem;
  } else {
    inventory.push(newItem);
  }

  saveInventory();
  renderTable();
  inventoryModal.hide();
  clearForm();
});

// Filter & Search event listeners
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Add item button shows modal
addItemBtn.addEventListener("click", () => {
  clearForm();
  inventoryModal.show();
});

// Update DurationInUse in form when date fields change
form["StartDate"].addEventListener("change", updateDurationInForm);
form["EndDate"].addEventListener("change", updateDurationInForm);

function updateDurationInForm() {
  const start = form["StartDate"].value;
  const end = form["EndDate"].value;
  form["DurationInUse"].value = calculateDuration(start, end);
}

// Initial render
renderTable();
