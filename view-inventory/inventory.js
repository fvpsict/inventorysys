const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Calculate duration between start and end dates as years and months
function calculateDuration(start, end) {
  if (!start) return "";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();
  if (startDate > endDate) return "";
  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  return `${years ? years + " yr" + (years > 1 ? "s " : " ") : ""}${months ? months + " mo" + (months > 1 ? "s" : "") : ""}`.trim() || "<1 mo";
}

// Helper to create dropdown/select cell HTML
function dropdownCell(name, value, options) {
  return `<td><select class="form-select form-select-sm" data-field="${name}">${options
    .map(o => `<option${o === value ? " selected" : ""}>${o}</option>`)
    .join("")}</select></td>`;
}

// Helper to create input cell HTML
function inputCell(name, value, type = "text") {
  return `<td><input type="${type}" class="form-control form-control-sm" data-field="${name}" value="${value || ""}"></td>`;
}

function renderTable() {
  tbody.innerHTML = "";
  const filterVal = filterSelect.value.toLowerCase();
  const searchVal = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    const matchesFilter = filterVal === "all" || (item.EquipmentType && item.EquipmentType.toLowerCase() === filterVal);
    const matchesSearch = Object.values(item).some(v => (v ? v.toString().toLowerCase().includes(searchVal) : false));
    if (!matchesFilter || !matchesSearch) return;

    const tr = document.createElement("tr");
    tr.innerHTML =
      dropdownCell("EquipmentType", item.EquipmentType, ["SSOE", "Projector", "TV", "Visualiser", "Projector Screen"]) +
      dropdownCell("Equipment", item.Equipment, ["Desktop", "Laptop", "iPad", "Mobile Cart"]) +
      inputCell("Vendor", item.Vendor) +
      inputCell("BrandModel", item.BrandModel) +
      inputCell("Profile", item.Profile) +
      inputCell("Custodian", item.Custodian) +
      inputCell("AssetNo", item.AssetNo) +
      inputCell("SerialNumber", item.SerialNumber) +
      inputCell("Location", item.Location) +
      inputCell("EndDate", item.EndDate, "date") +
      inputCell("StartDate", item.StartDate, "date") +
      inputCell("Hostname", item.Hostname) +
      inputCell("SSOE PO Number", item["SSOE PO Number"]) +
      inputCell("Cart No", item["Cart No"]) +
      inputCell("SanitiseDate", item.SanitiseDate, "date") +
      `<td>${calculateDuration(item.StartDate, item.EndDate)}</td>` +
      inputCell("DateUpdated", item.DateUpdated, "text") +
      `<td>
        <button class="btn btn-sm btn-primary save-btn" data-index="${i}">Save</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>`;

    tbody.appendChild(tr);
  });

  // Add event listeners for save and delete buttons
  document.querySelectorAll(".save-btn").forEach(btn => btn.addEventListener("click", saveRow));
  document.querySelectorAll(".delete-btn").forEach(btn => btn.addEventListener("click", deleteRow));
}

function saveRow(e) {
  const index = +e.target.dataset.index;
  const row = e.target.closest("tr");
  const fields = row.querySelectorAll("[data-field]");

  const updatedItem = {};
  fields.forEach(el => {
    updatedItem[el.dataset.field] = el.value.trim();
  });

  // Update DateUpdated to current date in locale format
  updatedItem.DateUpdated = new Date().toLocaleDateString();

  inventory[index] = updatedItem;
  saveInventory();
  renderTable();
}

function deleteRow(e) {
  const index = +e.target.dataset.index;
  if (confirm("Are you sure you want to delete this item?")) {
    inventory.splice(index, 1);
    saveInventory();
    renderTable();
  }
}

function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

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

filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
