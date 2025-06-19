const tbody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

const addItemForm = document.getElementById("add-item-form");
const addItemModal = new bootstrap.Modal(document.getElementById("addItemModal"));

// Load inventory data or empty array
let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Calculate duration between start and end dates as "X yr Y mo"
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
  return `${years ? years + (years > 1 ? " yrs " : " yr ") : ""}${months ? months + (months > 1 ? " mos" : " mo") : ""}`.trim() || "<1 mo";
}

// Render the inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    // Filter by EquipmentType or show all
    if (filter !== "all" && (item.EquipmentType || "").toLowerCase() !== filter) return;

    // Search across all fields
    const combinedValues = Object.values(item).join(" ").toLowerCase();
    if (!combinedValues.includes(search)) return;

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
      <td>${item.EndDate || ""}</td>
      <td>${item.StartDate || ""}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${item.SanitiseDate || ""}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${i}">Delete</button>
      </td>
    `;

    tbody.appendChild(tr);
  });

  // Attach delete listeners
  document.querySelectorAll(".btn-delete").forEach(btn => {
    btn.addEventListener("click", deleteRow);
  });
}

// Delete a row by index
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

// Handle Add Item form submit
addItemForm.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(addItemForm);
  const newItem = {
    EquipmentType: formData.get("EquipmentType").trim(),
    Equipment: formData.get("Equipment").trim(),
    Vendor: formData.get("Vendor").trim(),
    BrandModel: formData.get("BrandModel").trim(),
    Profile: formData.get("Profile").trim(),
    Custodian: formData.get("Custodian").trim(),
    AssetNo: formData.get("AssetNo").trim(),
    SerialNumber: formData.get("SerialNumber").trim(),
    Location: formData.get("Location").trim(),
    EndDate: formData.get("EndDate"),
    StartDate: formData.get("StartDate"),
    Hostname: formData.get("Hostname").trim(),
    "SSOE PO Number": formData.get("SSOE PO Number").trim(),
    "Cart No": formData.get("Cart No").trim(),
    SanitiseDate: formData.get("SanitiseDate"),
    DateUpdated: new Date().toLocaleDateString(),
  };

  // Validate required fields
  if (!newItem.EquipmentType || !newItem.Equipment || !newItem.AssetNo) {
    alert("Please fill in all required fields: Equipment Type, Equipment, and Asset No.");
    return;
  }

  // Add new item
  inventory.push(newItem);
  saveInventory();
  renderTable();
  addItemForm.reset();
  addItemModal.hide();
});

// Filter and search listeners
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial table render
renderTable();
