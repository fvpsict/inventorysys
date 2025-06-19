const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Utility function to calculate duration in use
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
  return `${years ? years + " yr" + (years > 1 ? "s " : " ") : ""}${months ? months + " mo" + (months > 1 ? "s" : "") : ""}`.trim() || "<1 mo";
}

// Render the inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, index) => {
    const matchesFilter = filter === "all" || (item.EquipmentType && item.EquipmentType.toLowerCase() === filter);
    const matchesSearch = Object.values(item).some(value => value && value.toString().toLowerCase().includes(search));
    if (!matchesFilter || !matchesSearch) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      ${dropdownCell("EquipmentType", item.EquipmentType, ["SSOE", "Projector", "TV", "Visualiser", "Projector Screen"])}
      ${dropdownCell("Equipment", item.Equipment, ["Desktop", "Laptop", "iPad", "Mobile Cart"])}
      ${inputCell("Vendor", item.Vendor)}
      ${inputCell("BrandModel", item.BrandModel)}
      ${inputCell("Profile", item.Profile)}
      ${inputCell("Custodian", item.Custodian)}
      ${inputCell("AssetNo", item.AssetNo)}
      ${inputCell("SerialNumber", item.SerialNumber)}
      ${inputCell("Location", item.Location)}
      ${inputCell("EndDate", item.EndDate, "date")}
      ${inputCell("StartDate", item.StartDate, "date")}
      ${inputCell("Hostname", item.Hostname)}
      ${inputCell("SSOE PO Number", item["SSOE PO Number"])}
      ${inputCell("Cart No", item["Cart No"])}
      ${inputCell("SanitiseDate", item.SanitiseDate, "date")}
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary save-btn" data-index="${index}">Save</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners after rendering
  document.querySelectorAll(".save-btn").forEach(btn => btn.addEventListener("click", saveRow));
  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteRow));
}

// Helpers for creating cells
function dropdownCell(name, value, options) {
  return `<td><select class="form-select form-select-sm" data-field="${name}">${options.map(o => `<option${o === value ? " selected" : ""}>${o}</option>`).join("")}</select></td>`;
}

function inputCell(name, value, type = "text") {
  return `<td><input type="${type}" class="form-control form-control-sm" data-field="${name}" value="${value || ""}" /></td>`;
}

// Save edited row
function saveRow(e) {
  const index = +e.target.dataset.index;
  const row = e.target.closest("tr");
  const fields = row.querySelectorAll("[data-field]");

  const updated = {};
  fields.forEach(el => {
    updated[el.dataset.field] = el.value.trim();
  });
  updated.DateUpdated = new Date().toLocaleDateString();

  inventory[index] = updated;
  saveInventory();
  renderTable();
}

// Delete row
function deleteRow(e) {
  const index = +e.target.dataset.index;
  if (confirm("Are you sure you want to delete this item?")) {
    inventory.splice(index, 1);
    saveInventory();
    renderTable();
  }
}

// Save inventory to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Add item modal logic
const addItemModal = new bootstrap.Modal(document.getElementById("addItemModal"));
const addItemForm = document.getElementById("add-item-form");

// Show modal on Add Item click
addItemBtn.addEventListener("click", () => {
  addItemForm.reset();
  addItemModal.show();
});

// Handle add item form submission
addItemForm.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(addItemForm);
  const newItem = {
    EquipmentType: formData.get("EquipmentType") || "",
    Equipment: formData.get("Equipment") || "",
    Vendor: formData.get("Vendor") || "",
    BrandModel: formData.get("BrandModel") || "",
    Profile: formData.get("Profile") || "",
    Custodian: formData.get("Custodian") || "",
    AssetNo: formData.get("AssetNo")?.trim() || "",
    SerialNumber: formData.get("SerialNumber") || "",
    Location: formData.get("Location") || "",
    EndDate: formData.get("EndDate") || "",
    StartDate: formData.get("StartDate") || "",
    Hostname: formData.get("Hostname") || "",
    "SSOE PO Number": formData.get("SSOE PO Number") || "",
    "Cart No": formData.get("Cart No") || "",
    SanitiseDate: formData.get("SanitiseDate") || "",
    DateUpdated: new Date().toLocaleDateString(),
  };

  if (!newItem.EquipmentType || !newItem.Equipment || !newItem.AssetNo) {
    alert("Please fill in Equipment Type, Equipment, and AssetNo.");
    return;
  }

  inventory.push(newItem);
  saveInventory();
  renderTable();
  addItemModal.hide();
});

// Filter and search listeners
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
