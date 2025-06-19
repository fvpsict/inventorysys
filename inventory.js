const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Helper: format date for input[type=date], returns "" if invalid
function formatDateForInput(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  // YYYY-MM-DD
  return d.toISOString().slice(0, 10);
}

// Calculate duration (years + months)
function calculateDuration(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  if (s > e) return "";
  let y = e.getFullYear() - s.getFullYear();
  let m = e.getMonth() - s.getMonth();
  if (m < 0) {
    y--;
    m += 12;
  }
  return `${y ? `${y} yr${y > 1 ? "s" : ""} ` : ""}${m ? `${m} mo${m > 1 ? "s" : ""}` : ""}`.trim() || "<1 mo";
}

// Render inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    // Normalize equipmentType for filtering
    const eqType = (item.EquipmentType || "").toLowerCase();
    if (filter !== "all" && eqType !== filter) return;

    // Search across all values safely
    const searchableValues = Object.values(item)
      .map(v => (v || "").toString().toLowerCase());
    if (!searchableValues.some(v => v.includes(search))) return;

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
      ${inputCell("EndDate", formatDateForInput(item.EndDate), "date")}
      ${inputCell("StartDate", formatDateForInput(item.StartDate), "date")}
      ${inputCell("Hostname", item.Hostname)}
      ${inputCell("SSOE PO Number", item["SSOE PO Number"])}
      ${inputCell("Cart No", item["Cart No"])}
      ${inputCell("SanitiseDate", formatDateForInput(item.SanitiseDate), "date")}
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary save-btn" data-index="${i}">Save</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Add listeners
  document.querySelectorAll(".save-btn").forEach(btn => btn.addEventListener("click", saveRow));
  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteRow));
}

// Dropdown cell for selects
function dropdownCell(name, value, options) {
  return `<td><select class="form-select form-select-sm" data-field="${name}">${options.map(o => `<option${o === value ? " selected" : ""}>${o}</option>`).join("")}</select></td>`;
}

// Input cell for text/date inputs
function inputCell(name, value = "", type = "text") {
  return `<td><input type="${type}" class="form-control form-control-sm" data-field="${name}" value="${value || ""}" /></td>`;
}

// Save row data on save button click
function saveRow(e) {
  const index = +e.target.dataset.index;
  const row = e.target.closest("tr");
  const fields = row.querySelectorAll("[data-field]");

  const updated = {};
  fields.forEach(el => {
    updated[el.dataset.field] = el.value.trim();
  });
  updated.DateUpdated = new Date().toLocaleDateString();

  // Update inventory array and persist
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

// Save to localStorage
function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Add new empty row with current date updated
addItemBtn.addEventListener("click", () => {
  inventory.push({
    EquipmentType: "",
    Equipment: "",
    Vendor: "",
    BrandModel: "",
    Profile: "",
    Custodian: "",
    AssetNo: "",
    SerialNumber: "",
    Location: "",
    EndDate: "",
    StartDate: "",
    Hostname: "",
    "SSOE PO Number": "",
    "Cart No": "",
    SanitiseDate: "",
    DateUpdated: new Date().toLocaleDateString(),
  });
  saveInventory();
  renderTable();
});

// Filter and search events
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
