// inventory.js

const inventoryTableBody = document.querySelector("#inventory-table tbody");
const addItemBtn = document.getElementById("add-item-btn");
const inventoryModalEl = document.getElementById("inventoryModal");
const inventoryModal = new bootstrap.Modal(inventoryModalEl);
const inventoryForm = document.getElementById("inventory-form");

const equipmentTypeSelect = document.getElementById("equipmentType");
const equipmentSelect = document.getElementById("equipment");
const equipmentRequiredStar = document.getElementById("equipment-required-star");

const durationInUseInput = document.getElementById("durationInUse");
const startDateInput = document.getElementById("startDate");
const dateUpdatedInput = document.getElementById("dateUpdated");

let inventoryData = JSON.parse(localStorage.getItem("inventoryData")) || [];
let editIndex = -1;

// Utility: format date as "17 June 2025"
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  const options = { day: "numeric", month: "long", year: "numeric" };
  return date.toLocaleDateString("en-GB", options);
}

// Calculate duration between startDate and today in "X yrs Y mos" format
function calculateDuration(startDateStr) {
  if (!startDateStr) return "";
  const start = new Date(startDateStr);
  const today = new Date();
  if (isNaN(start) || start > today) return "";
  let years = today.getFullYear() - start.getFullYear();
  let months = today.getMonth() - start.getMonth();
  if (months < 0) {
    years--;
    months += 12;
  }
  let result = "";
  if (years > 0) result += years + (years === 1 ? " yr " : " yrs ");
  if (months > 0) result += months + (months === 1 ? " mo" : " mos");
  return result.trim();
}

// Render table rows
function renderTable() {
  inventoryTableBody.innerHTML = "";
  inventoryData.forEach((item, index) => {
    const tr = document.createElement("tr");

    function createCell(text) {
      const td = document.createElement("td");
      td.textContent = text || "";
      return td;
    }

    tr.appendChild(createCell(item.EquipmentType));
    tr.appendChild(createCell(item.Equipment));
    tr.appendChild(createCell(item.Vendor));
    tr.appendChild(createCell(item.BrandModel));
    tr.appendChild(createCell(item.Profile));
    tr.appendChild(createCell(item.Custodian));
    tr.appendChild(createCell(item.AssetNo));
    tr.appendChild(createCell(item.SerialNumber));
    tr.appendChild(createCell(item.Location));
    tr.appendChild(createCell(formatDate(item.EndDate)));
    tr.appendChild(createCell(formatDate(item.StartDate)));
    tr.appendChild(createCell(item.Hostname));
    tr.appendChild(createCell(item.SSOE_PONumber));
    tr.appendChild(createCell(item.CartNo));
    tr.appendChild(createCell(formatDate(item.SanitiseDate)));
    tr.appendChild(createCell(calculateDuration(item.StartDate)));
    tr.appendChild(createCell(item.LampHour));
    tr.appendChild(createCell(formatDate(item.DateUpdated)));

    // Actions cell (Edit + Delete buttons)
    const actionsTd = document.createElement("td");

    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.addEventListener("click", () => openEditModal(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.addEventListener("click", () => deleteItem(index));

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);

    tr.appendChild(actionsTd);

    inventoryTableBody.appendChild(tr);
  });
}

// Open modal to add new item
function openAddModal() {
  editIndex = -1;
  inventoryForm.reset();
  equipmentRequiredStar.classList.add("d-none");
  equipmentSelect.removeAttribute("required");
  durationInUseInput.value = "";
  dateUpdatedInput.value = formatDate(new Date());
  inventoryModal.show();
}

// Open modal to edit existing item
function openEditModal(index) {
  editIndex = index;
  const item = inventoryData[index];

  equipmentTypeSelect.value = item.EquipmentType || "";
  equipmentSelect.value = item.Equipment || "";
  equipmentRequiredStar.classList.toggle("d-none", item.EquipmentType !== "SSOE");
  if (item.EquipmentType === "SSOE") equipmentSelect.setAttribute("required", "required");
  else equipmentSelect.removeAttribute("required");

  document.getElementById("vendor").value = item.Vendor || "";
  document.getElementById("brandModel").value = item.BrandModel || "";
  document.getElementById("profile").value = item.Profile || "";
  document.getElementById("custodian").value = item.Custodian || "";
  document.getElementById("assetNo").value = item.AssetNo || "";
  document.getElementById("serialNumber").value = item.SerialNumber || "";
  document.getElementById("location").value = item.Location || "";
  document.getElementById("endDate").value = item.EndDate || "";
  startDateInput.value = item.StartDate || "";
  document.getElementById("hostname").value = item.Hostname || "";
  document.getElementById("ssoePoNumber").value = item.SSOE_PONumber || "";
  document.getElementById("cartNo").value = item.CartNo || "";
  document.getElementById("sanitiseDate").value = item.SanitiseDate || "";
  durationInUseInput.value = calculateDuration(item.StartDate);
  document.getElementById("lampHour").value = item.LampHour || "";
  dateUpdatedInput.value = formatDate(item.DateUpdated || new Date());

  inventoryModal.show();
}

// Delete item
function deleteItem(index) {
  if (confirm("Delete this item?")) {
    inventoryData.splice(index, 1);
    saveData();
    renderTable();
  }
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
}

// When EquipmentType changes, toggle Equipment required
function onEquipmentTypeChange() {
  if (equipmentTypeSelect.value === "SSOE") {
    equipmentSelect.setAttribute("required", "required");
    equipmentRequiredStar.classList.remove("d-none");
  } else {
    equipmentSelect.removeAttribute("required");
    equipmentRequiredStar.classList.add("d-none");
    equipmentSelect.value = "";
  }
}

// Calculate duration live on startDate change
function onStartDateChange() {
  durationInUseInput.value = calculateDuration(startDateInput.value);
}

equipmentTypeSelect.addEventListener("change", onEquipmentTypeChange);
startDateInput.addEventListener("change", onStartDateChange);

// Handle form submission (Add or Edit)
inventoryForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Gather form data
  const formData = {
    EquipmentType: equipmentTypeSelect.value.trim(),
    Equipment: equipmentSelect.value.trim(),
    Vendor: document.getElementById("vendor").value.trim(),
    BrandModel: document.getElementById("brandModel").value.trim(),
    Profile: document.getElementById("profile").value.trim(),
    Custodian: document.getElementById("custodian").value.trim(),
    AssetNo: document.getElementById("assetNo").value.trim(),
    SerialNumber: document.getElementById("serialNumber").value.trim(),
    Location: document.getElementById("location").value.trim(),
    EndDate: document.getElementById("endDate").value,
    StartDate: startDateInput.value,
    Hostname: document.getElementById("hostname").value.trim(),
    SSOE_PONumber: document.getElementById("ssoePoNumber").value.trim(),
    CartNo: document.getElementById("cartNo").value.trim(),
    SanitiseDate: document.getElementById("sanitiseDate").value,
    DurationInUse: durationInUseInput.value,
    LampHour: document.getElementById("lampHour").value,
    DateUpdated: new Date().toISOString().split("T")[0], // store as ISO string date
  };

  // Validate Equipment if EquipmentType is SSOE
  if (formData.EquipmentType === "SSOE" && !formData.Equipment) {
    alert("Equipment is required when Equipment Type is SSOE");
    return;
  }

  if (editIndex === -1) {
    // Add new
    inventoryData.push(formData);
  } else {
    // Update existing
    inventoryData[editIndex] = formData;
  }

  saveData();
  renderTable();
  inventoryModal.hide();
});

addItemBtn.addEventListener("click", openAddModal);

// Initial render
renderTable();
