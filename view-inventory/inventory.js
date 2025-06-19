const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Utility: calculate years/months between dates (Duration in Use)
function calculateDuration(start, end) {
  if (!start) return "";
  const s = new Date(start);
  const e = end ? new Date(end) : new Date();
  if (isNaN(s) || isNaN(e) || s > e) return "";
  let years = e.getFullYear() - s.getFullYear();
  let months = e.getMonth() - s.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  let result = "";
  if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
  if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;
  return result.trim() || "<1 mo";
}

// Helper: create dropdown <select> with options
function dropdownCell(name, value, options) {
  return `<td>
    <select class="form-select form-select-sm" data-field="${name}">
      ${options
        .map(
          (opt) =>
            `<option value="${opt}"${opt === value ? " selected" : ""}>${opt}</option>`
        )
        .join("")}
    </select>
  </td>`;
}

// Helper: create input <input> or <input type="date"> cell
function inputCell(name, value, type = "text") {
  return `<td><input type="${type}" class="form-control form-control-sm" data-field="${name}" value="${value || ""}" /></td>`;
}

// Render inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    const itemType = (item.EquipmentType || "").toLowerCase();
    const matchesFilter = filter === "all" || itemType === filter;
    const combinedFields = Object.values(item).join(" ").toLowerCase();
    const matchesSearch = combinedFields.includes(search);

    if (!matchesFilter || !matchesSearch) return;

    const tr = document.createElement("tr");
    tr.innerHTML = `
      ${dropdownCell("EquipmentType", item.EquipmentType, [
        "SSOE",
        "Projector",
        "TV",
        "Visualiser",
        "Projector Screen",
      ])}
      ${dropdownCell("Equipment", item.Equipment, [
        "Desktop",
        "Laptop",
        "iPad",
        "Mobile Cart",
      ])}
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

  // Attach event listeners for Save and Delete buttons
  document.querySelectorAll(".save-btn").forEach((btn) =>
    btn.addEventListener("click", saveRow)
  );
  document.querySelectorAll(".delete-btn").forEach((btn) =>
    btn.addEventListener("click", deleteRow)
  );
}

// Save changes from the editable row
function saveRow(e) {
  const index = +e.target.dataset.index;
  const row = e.target.closest("tr");
  const fields = row.querySelectorAll("[data-field]");

  const updatedItem = {};
  fields.forEach((el) => {
    updatedItem[el.dataset.field] = el.value.trim();
  });

  updatedItem.DateUpdated = new Date().toLocaleDateString();

  // Update inventory array and save
  inventory[index] = updatedItem;
  saveInventory();
  renderTable();
}

// Delete a row from inventory
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

// Add a new blank row for adding a new inventory item
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

// Filter and search handlers
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", re
