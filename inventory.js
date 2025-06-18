// inventory.js

const inventoryTableBody = document.querySelector("#inventory-table tbody");
const filterEquipmentType = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
const inventoryForm = document.getElementById("inventory-form");

let inventoryData = [];
let editingIndex = -1;

// Utility: format date as "DD MMM YYYY" e.g. "15 Jun 2025"
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// Calculate duration in use (years and months) from startDate to today
function calculateDuration(startDateStr) {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  const now = new Date();
  if (isNaN(start)) return "";
  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  if (years < 0) return "";
  let result = "";
  if (years > 0) result += years + (years === 1 ? " year " : " years ");
  if (months > 0) result += months + (months === 1 ? " month" : " months");
  return result.trim();
}

// Render inventory table rows with filters and search
function renderTable() {
  const filter = filterEquipmentType.value.toLowerCase();
  const search = searchInput.value.toLowerCase();

  inventoryTableBody.innerHTML = "";

  inventoryData.forEach((item, index) => {
    if (
      (filter === "all" || item.EquipmentType.toLowerCase() === filter) &&
      (JSON.stringify(item).toLowerCase().includes(search))
    ) {
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
        <td>${item.StartDate ? formatDate(item.StartDate) : ""}</td>
        <td>${calculateDuration(item.StartDate)}</td>
        <td>${item.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
        </td>
      `;

      inventoryTableBody.appendChild(tr);
    }
  });
}

// Reset the form fields and set DateUpdated to today
function resetForm() {
  inventoryForm.reset();
  document.getElementById("DateUpdated").value = formatDate(new Date());
  editingIndex = -1;
  document.getElementById("EquipmentType").disabled = false; // enable on add
}

// Fill the form for editing
function fillForm(item) {
  document.getElementById("EquipmentType").value = item.EquipmentType || "";
  document.getElementById("Equipment").value = item.Equipment || "";
  document.getElementById("Vendor").value = item.Vendor || "";
  document.getElementById("BrandModel").value = item.BrandModel || "";
  document.getElementById("Profile").value = item.Profile || "";
  document.getElementById("Custodian").value = item.Custodian || "";
  document.getElementById("AssetNo").value = item.AssetNo || "";
  document.getElementById("SerialNumber").value = item.SerialNumber || "";
  document.getElementById("Location").value = item.Location || "";
  document.getElementById("StartDate").value = item.StartDate || "";
  document.getElementById("DateUpdated").value = item.DateUpdated || formatDate(new Date());
}

// Save form submission
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(inventoryForm);

  // Collect data
  const item = {
    EquipmentType: formData.get("EquipmentType"),
    Equipment: formData.get("Equipment"),
    Vendor: formData.get("Vendor").trim(),
    BrandModel: formData.get("BrandModel").trim(),
    Profile: formData.get("Profile").trim(),
    Custodian: formData.get("Custodian").trim(),
    AssetNo: formData.get("AssetNo").trim(),
    SerialNumber: formData.get("SerialNumber").trim(),
    Location: formData.get("Location").trim(),
    StartDate: formData.get("StartDate"),
    DateUpdated: formatDate(new Date()),
  };

  // Validate required dropdowns (EquipmentType and Equipment)
  if (!item.EquipmentType || !item.Equipment) {
    alert("Please select Equipment Type and Equipment.");
    return;
  }

  if (editingIndex >= 0) {
    // Update existing item
    inventoryData[editingIndex] = item;
  } else {
    // Add new
    inventoryData.push(item);
  }

  renderTable();
  inventoryModal.hide();
});

// Handle Add Item button
addItemBtn.addEventListener("click", () => {
  resetForm();
  document.getElementById("inventoryModalLabel").textContent = "Add Inventory Item";
  inventoryModal.show();
});

// Edit & Delete buttons in table
inventoryTableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    editingIndex = +e.target.dataset.index;
    fillForm(inventoryData[editingIndex]);
    document.getElementById("inventoryModalLabel").textContent = "Edit Inventory Item";
    inventoryModal.show();
  } else if (e.target.classList.contains("btn-delete")) {
    if (confirm("Are you sure you want to delete this item?")) {
      const idx = +e.target.dataset.index;
      inventoryData.splice(idx, 1);
      renderTable();
    }
  }
});

// Filter and Search
filterEquipmentType.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);

// Initial render
renderTable();
