const tbody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");

const inventoryForm = document.getElementById("inventory-form");
const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));

let inventory = JSON.parse(localStorage.getItem("inventoryData") || "[]");
let editIndex = null;

// Utility: calculate duration in years and months
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
  if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
  if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;
  return result.trim() || "<1 mo";
}

// Utility: format date as "25 June 2025"
function formatDateDisplay(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

// Render the inventory table
function renderTable() {
  tbody.innerHTML = "";
  const filter = filterSelect.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventory.forEach((item, i) => {
    const matchesFilter = filter === "all" || (item.EquipmentType?.toLowerCase() === filter);
    const matchesSearch = Object.values(item).some(val =>
      val && val.toString().toLowerCase().includes(search)
    );
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
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${i}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  // Attach event listeners
  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", onEditRow)
  );
  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", onDeleteRow)
  );
}

// Load data into form for editing
function onEditRow(e) {
  editIndex = +e.target.dataset.index;
  const item = inventory[editIndex];

  // Fill form fields
  inventoryForm.elements["EquipmentType"].value = item.EquipmentType || "";
  inventoryForm.elements["Equipment"].value = item.Equipment || "";
  inventoryForm.elements["Vendor"].value = item.Vendor || "";
  inventoryForm.elements["BrandModel"].value = item.BrandModel || "";
  inventoryForm.elements["Profile"].value = item.Profile || "";
  inventoryForm.elements["Custodian"].value = item.Custodian || "";
  inventoryForm.elements["AssetNo"].value = item.AssetNo || "";
  inventoryForm.elements["SerialNumber"].value = item.SerialNumber || "";
  inventoryForm.elements["Location"].value = item.Location || "";
  inventoryForm.elements["EndDate"].value = item.EndDate || "";
  inventoryForm.elements["StartDate"].value = item.StartDate || "";
  inventoryForm.elements["Hostname"].value = item.Hostname || "";
  inventoryForm.elements["SSOE PO Number"].value = item["SSOE PO Number"] || "";
  inventoryForm.elements["Cart No"].value = item["Cart No"] || "";
  inventoryForm.elements["SanitiseDate"].value = item.SanitiseDate || "";
  inventoryForm.elements["Duration in Use"].value = calculateDuration(item.StartDate, item.EndDate);

  // Show modal
  modal.show();
}

// Delete a row
function onDeleteRow(e) {
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

// Handle form submit for add/edit
inventoryForm.addEventListener("submit", e => {
  e.preventDefault();

  // Validate required fields
  if (!inventoryForm.elements["EquipmentType"].value.trim()) {
    alert("Equipment Type is required.");
    return;
  }
  if (!inventoryForm.elements["AssetNo"].value.trim()) {
    alert("Asset No is required.");
    return;
  }

  // Collect form data
  const formData = {
    EquipmentType: inventoryForm.elements["EquipmentType"].value.trim(),
    Equipment: inventoryForm.elements["Equipment"].value.trim(),
    Vendor: inventoryForm.elements["Vendor"].value.trim(),
    BrandModel: inventoryForm.elements["BrandModel"].value.trim(),
    Profile: inventoryForm.elements["Profile"].value.trim(),
    Custodian: inventoryForm.elements["Custodian"].value.trim(),
    AssetNo: inventoryForm.elements["AssetNo"].value.trim(),
    SerialNumber: inventoryForm.elements["SerialNumber"].value.trim(),
    Location: inventoryForm.elements["Location"].value.trim(),
    EndDate: inventoryForm.elements["EndDate"].value,
    StartDate: inventoryForm.elements["StartDate"].value,
    Hostname: inventoryForm.elements["Hostname"].value.trim(),
    "SSOE PO Number": inventoryForm.elements["SSOE PO Number"].value.trim(),
    "Cart No": inventoryForm.elements["Cart No"].value.trim(),
    SanitiseDate: inventoryForm.elements["SanitiseDate"].value,
  };

  // Calculate Duration in Use for form field (readonly)
  formData["Duration in Use"] = calculateDuration(formData.StartDate, formData.EndDate);
  inventoryForm.elements["Duration in Use"].value = formData["Duration in Use"];

  // Set Date Updated to current date formatted
  formData.DateUpdated = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  if (editIndex !== null) {
    // Update existing item
    inventory[editIndex] = formData;
    editIndex = null;
  } else {
    // Add new item
    inventory.push(formData);
  }

  saveInventory();
  renderTable();
  modal.hide();
  inventoryForm.reset();
  // Reset duration in use field after reset
  inventoryForm.elements["Duration in Use"].value = "";
});

// Update Duration in Use field dynamically when dates change in modal
["startDate", "endDate"].forEach(id => {
  document.getElementById(id).addEventListener("change", () => {
    const start = inventoryForm.elements["StartDate"].value;
    const end = inventoryForm.elements["EndDate"].value;
    inventoryForm.elements["Duration in Use"].value = calculateDuration(start, end);
  });
});

// Filter and search event handlers
filterSelect.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
