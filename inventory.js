const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Duration calculation
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

// Render table
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    const matchesFilter = filter === "all" || item.EquipmentType?.toLowerCase() === filter;
    const matchesSearch = Object.values(item).some(v => v?.toLowerCase().includes(search));
    if (!matchesFilter || !matchesSearch) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      ${createInputCell("EquipmentType", item.EquipmentType, equipmentTypeOptions())}
      ${createInputCell("Equipment", item.Equipment, equipmentOptions())}
      ${createTextCell("Vendor", item.Vendor)}
      ${createTextCell("BrandModel", item.BrandModel)}
      ${createTextCell("Profile", item.Profile)}
      ${createTextCell("Custodian", item.Custodian)}
      ${createTextCell("AssetNo", item.AssetNo)}
      ${createTextCell("SerialNumber", item.SerialNumber)}
      ${createTextCell("Location", item.Location)}
      ${createTextCell("EndDate", item.EndDate, "date")}
      ${createTextCell("StartDate", item.StartDate, "date")}
      ${createTextCell("Hostname", item.Hostname)}
      ${createTextCell("SSOE_PONumber", item["SSOE PO Number"])}
      ${createTextCell("CartNo", item["Cart No"])}
      ${createTextCell("SanitiseDate", item.SanitiseDate, "date")}
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary save-btn" data-index="${i}">Save</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  document.querySelectorAll(".save-btn").forEach(btn =>
    btn.addEventListener("click", saveRow));
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", deleteRow));
}

function createInputCell(name, value, options = "") {
  return `<td><select class="form-select form-select-sm" data-field="${name}">${options}</select></td>`;
}

function equipmentTypeOptions(selected) {
  const types = ["SSOE", "Projector", "TV", "Visualiser", "Projector Screen"];
  return types.map(t => `<option${t === selected ? " selected" : ""}>${t}</option>`).join("");
}

function equipmentOptions(selected) {
  const options = ["Desktop", "Laptop", "iPad", "Mobile Cart"];
  return options.map(t => `<option${t === selected ? " selected" : ""}>${t}</option>`).join("");
}

function createTextCell(name, value, type = "text") {
  return `<td><input type="${type}" class="form-control form-control-sm" data-field="${name}" value="${value || ""}"/></td>`;
}

function saveRow(e) {
  const index = +e.target.dataset.index;
  const row = e.target.closest("tr");
  const inputs = row.querySelectorAll("[data-field]");

  const updated = {};
  inputs.forEach(el => {
    const key = el.dataset.field;
    updated[key] = el.value.trim();
  });

  updated["DateUpdated"] = new Date().toLocaleDateString();

  inventory[index] = updated;
  saveData();
  renderTable();
}

function deleteRow(e) {
  const index = +e.target.dataset.index;
  if (confirm("Delete this item?")) {
    inventory.splice(index, 1);
    saveData();
    renderTable();
  }
}

function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Add new row
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
  saveData();
  renderTable();
});

// Filter and search
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Init
renderTable();
