const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const inventoryForm = document.getElementById("inventory-form");
const durationInput = document.getElementById("durationInUse");
const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");

// Utility: format date to "DD MMM YYYY"
function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Utility: calculate duration between two dates as years and months
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
  if (years > 0) result += years + (years === 1 ? " yr " : " yrs ");
  if (months > 0) result += months + (months === 1 ? " mo" : " mos");
  return result.trim() || "<1 mo";
}

// Render the inventory table rows
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, index) => {
    const matchesFilter = filter === "all" || (item.EquipmentType && item.EquipmentType.toLowerCase() === filter);
    const matchesSearch = Object.values(item).some(v => (v || "").toString().toLowerCase().includes(search));
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
      <td>${item.EndDate || ""}</td>
      <td>${item.StartDate || ""}</td>
      <td>${item.Hostname || ""}</td>
      <td>${item["SSOE PO Number"] || ""}</td>
      <td>${item["Cart No"] || ""}</td>
      <td>${item.SanitiseDate || ""}</td>
      <td>${calculateDuration(item.StartDate, item.EndDate)}</td>
      <td>${formatDateLong(item.DateUpdated)}</td>
      <td>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach delete handlers
  document.querySelectorAll(".delete-btn").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = +e.target.dataset.index;
      if (confirm("Are you sure you want to delete this item?")) {
        inventory.splice(idx, 1);
        saveInventory();
        renderTable();
      }
    });
  });
}

function saveInventory() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

// Calculate and update duration field live when StartDate or EndDate changes
function updateDuration() {
  const startDate = inventoryForm.startDate.value;
  const endDate = inventoryForm.endDate.value;
  durationInput.value = calculateDuration(startDate, endDate);
}

// Event listeners for live duration update on date fields
inventoryForm.startDate.addEventListener("change", updateDuration);
inventoryForm.endDate.addEventListener("change", updateDuration);

// Handle form submission to add new inventory item
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Gather form values
  const newItem = {
    EquipmentType: inventoryForm.EquipmentType.value.trim(),
    Equipment: inventoryForm.Equipment.value.trim(),
    Vendor: inventoryForm.Vendor.value.trim(),
    BrandModel: inventoryForm.BrandModel.value.trim(),
    Profile: inventoryForm.Profile.value.trim(),
    Custodian: inventoryForm.Custodian.value.trim(),
    AssetNo: inventoryForm.AssetNo.value.trim(),
    SerialNumber: inventoryForm.SerialNumber.value.trim(),
    Location: inventoryForm.Location.value.trim(),
    EndDate: inventoryForm.EndDate.value,
    StartDate: inventoryForm.StartDate.value,
    Hostname: inventoryForm.Hostname.value.trim(),
    "SSOE PO Number": inventoryForm["SSOE PO Number"].value.trim(),
    "Cart No": inventoryForm["Cart No"].value.trim(),
    SanitiseDate: inventoryForm.SanitiseDate.value,
    DateUpdated: new Date().toISOString().slice(0, 10), // Save raw ISO date for formatting on render
  };

  // Basic validation (EquipmentType and Equipment required)
  if (!newItem.EquipmentType || !newItem.Equipment) {
    alert("Please select Equipment Type and Equipment.");
    return;
  }

  // Add new item
  inventory.push(newItem);

  saveInventory();
  renderTable();
  inventoryForm.reset();
  durationInput.value = "";
  inventoryModal.hide();
});

// Filter and search event listeners
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
