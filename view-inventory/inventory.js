const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Calculate duration between start and end dates in years and months
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

// Render the inventory table with filters and search
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    // Filter by EquipmentType
    const matchesFilter = filter === "all" || (item.EquipmentType || "").toLowerCase() === filter;
    // Search across all fields
    const matchesSearch = Object.values(item).some(v => (v || "").toString().toLowerCase().includes(search));

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
        <button class="btn btn-sm btn-primary save-btn" data-index="${i}">Save</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners to buttons
  document.querySelectorAll(".save-btn").forEach(btn => btn.addEventListener("click", saveRow));
  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteRow));
}

// Helper to create a dropdown <td> with given options
function dropdownCell(name, value, options) {
  return `<td><select class="form-select form-select-sm" data-field="${name}">${options
    .map(o => `<option${o === value ? " selected" : ""}>${o}</option>`)
    .join("")}</select></td>`;
}

// Helper to create an input <td>
function inputCell(name, value, type = "text") {
  return `<td><input type="${type}" class="form-control form-control-sm" data-field="${name}" value="${value || ""}" /></td>`;
}

// Save a row's data back to inventory and localStorage
function saveRow(e) {
  const index = +e.target.dataset.index;
  const row = e.target.closest("tr");
  const fields = row.querySelectorAll("[data-field]");

  const updated = {};
  fields.forEach(el => {
    updated[el.dataset.field] = el.value.trim();
  });

  // Update DateUpdated to today
  updated.DateUpdated = new Date().toLocaleDateString();

  inventory[index] = updated;

  saveInventory();
  renderTable();
}

// Delete a row from inventory and update storage
function deleteRow(e) {
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

// Add a blank new item to inventory
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

// Filter and Search event handlers
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
