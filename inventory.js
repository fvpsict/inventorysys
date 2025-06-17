// inventory.js

let inventoryItems = [];
let editIndex = -1;

const equipmentTypeFilter = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");
const tbody = document.querySelector("#inventory-table tbody");
const modalEl = document.getElementById("inventoryModal");
const modal = new bootstrap.Modal(modalEl);
const form = document.getElementById("inventory-modal-form");

function formatDateDDMMMYYYY(dateStr) {
  if (!dateStr) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];
  const d = new Date(dateStr);
  if (isNaN(d)) return "";

  const day = d.getDate();
  const month = months[d.getMonth()];
  const year = d.getFullYear();

  return `${day} ${month} ${year}`;
}

function getDurationInUse(startDateStr) {
  if (!startDateStr) return "";

  const startDate = new Date(startDateStr);
  const today = new Date();

  if (isNaN(startDate)) return "";

  let years = today.getFullYear() - startDate.getFullYear();
  let months = today.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let result = "";
  if (years > 0) result += years + (years === 1 ? " yr " : " yrs ");
  if (months > 0) result += months + (months === 1 ? " mo" : " mos");

  return result.trim() || "0 mo";
}

function loadInventory() {
  const data = localStorage.getItem("inventoryItems");
  inventoryItems = data ? JSON.parse(data) : [];
}

function saveInventory() {
  localStorage.setItem("inventoryItems", JSON.stringify(inventoryItems));
}

function renderTable() {
  const filterVal = equipmentTypeFilter.value.toLowerCase();
  const searchVal = searchInput.value.toLowerCase();

  tbody.innerHTML = "";

  inventoryItems.forEach((item, index) => {
    if (filterVal !== "all" && item.EquipmentType.toLowerCase() !== filterVal) return;

    const searchableFields = [
      item.EquipmentType, item.Vendor, item.Equipment, item.BrandModel, item.Profile,
      item.Custodian, item.AssetNo, item.SerialNumber, item.Location, item.EndDate,
      item.StartDate, item.Hostname, item["SSOE PO Number"], item["Cart No"],
      item.SanitiseDate, item["Lamp Hour"] ? item["Lamp Hour"].toString() : "", item.DateUpdated
    ].join(" ").toLowerCase();

    if (!searchableFields.includes(searchVal)) return;

    const duration = getDurationInUse(item.StartDate);
    const dateUpdatedFormatted = formatDateDDMMMYYYY(item.DateUpdated);

    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
      <td>${item.Vendor || ""}</td>
      <td>${item.Equipment || ""}</td>
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
      <td>${duration}</td>
      <td>${item["Lamp Hour"] || ""}</td>
      <td>${dateUpdatedFormatted}</td>
      <td>
        <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
      </td>
    `;
    tbody.appendChild(tr);
  });

  attachRowEventListeners();
}

function attachRowEventListeners() {
  document.querySelectorAll(".edit-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const idx = parseInt(e.target.dataset.index);
      openEditModal(idx);
    })
  );

  document.querySelectorAll(".delete-btn").forEach(btn =>
    btn.addEventListener("click", e => {
      const idx = parseInt(e.target.dataset.index);
      if (confirm("Are you sure you want to delete this item?")) {
        inventoryItems.splice(idx, 1);
        saveInventory();
        renderTable();
      }
    })
  );
}

function openEditModal(index) {
  editIndex = index;
  const item = inventoryItems[index];
  const formElements = form.elements;

  formElements["EquipmentType"].value = item.EquipmentType || "";
  formElements["Equipment"].value = item.Equipment || "";
  formElements["Vendor"].value = item.Vendor || "";
  formElements["BrandModel"].value = item.BrandModel || "";
  formElements["Profile"].value = item.Profile || "";
  formElements["Custodian"].value = item.Custodian || "";
  formElements["AssetNo"].value = item.AssetNo || "";
  formElements["SerialNumber"].value = item.SerialNumber || "";
  formElements["Location"].value = item.Location || "";
  formElements["EndDate"].value = item.EndDate || "";
  formElements["StartDate"].value = item.StartDate || "";
  formElements["Hostname"].value = item.Hostname || "";
  formElements["SSOE PO Number"].value = item["SSOE PO Number"] || "";
  formElements["Cart No"].value = item["Cart No"] || "";
  formElements["SanitiseDate"].value = item.SanitiseDate || "";
  formElements["Lamp Hour"].value = item["Lamp Hour"] || "";

  // DateUpdated is auto-updated on save, no need to populate here

  modal.show();
}

function openAddModal() {
  editIndex = -1;
  form.reset();
  modal.show();
}

form.addEventListener("submit", e => {
  e.preventDefault();

  const formData = new FormData(form);
  const newItem = {};
  for (const [key, value] of formData.entries()) {
    newItem[key] = value.trim();
  }

  // Validation
  if (!newItem.EquipmentType) {
    alert("Equipment Type is required.");
    return;
  }
  if (!newItem.AssetNo) {
    alert("Asset No is required.");
    return;
  }
  if (!newItem.Equipment) {
    alert("Equipment is required.");
    return;
  }

  // Set DateUpdated to current date ISO string
  newItem.DateUpdated = new Date().toISOString();

  if (editIndex > -1) {
    inventoryItems[editIndex] = newItem;
  } else {
    inventoryItems.push(newItem);
  }

  saveInventory();
  renderTable();
  modal.hide();
});

equipmentTypeFilter.addEventListener("change", renderTable);
searchInput.addEventListener("input", renderTable);
addItemBtn.addEventListener("click", openAddModal);

loadInventory();
renderTable();
