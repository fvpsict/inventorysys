// inventory.js

// Sample inventory data array to start with
let inventoryData = [
  // Example item
  // {
  //   EquipmentType: "Projector",
  //   Vendor: "Sony",
  //   BrandModel: "VPL-EX430",
  //   Profile: "Standard",
  //   Custodian: "John Doe",
  //   AssetNo: "A123",
  //   SerialNumber: "SN001",
  //   Location: "Room 101",
  //   EndDate: "2025-12-31",
  //   StartDate: "2020-01-01",
  //   Hostname: "host1",
  //   SSOE_PONumber: "PO1234",
  //   CartNo: "Cart1",
  //   SanitiseDate: "2024-01-01",
  //   DurationInUse: "5 years 5 months",
  //   LampHour: "2000",
  //   DateUpdated: "2025-06-16 10:00 AM",
  // }
];

// DOM elements
const tableBody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const addItemBtn = document.getElementById("add-item-btn");

const modalElement = document.getElementById("inventoryModal");
const modal = new bootstrap.Modal(modalElement);
const form = document.getElementById("inventory-form");

// Keep track of the item being edited (null means new item)
let editingIndex = null;

// Equipment types list (same as dropdown options)
const equipmentTypes = [
  "SSOE",
  "Projector",
  "Projector Screen",
  "Touch Panel",
  "Visualiser",
  "SMax",
  "Macbook",
  "Portable HDD",
  "TV",
  "Monitor",
  "OMR",
];

// Populate EquipmentType dropdown in form dynamically (optional)
function populateEquipmentTypeDropdown() {
  const select = form.elements["equipmentType"];
  select.innerHTML = '<option value="">Select type...</option>';
  equipmentTypes.forEach((type) => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    select.appendChild(opt);
  });
}

// Render inventory table rows based on filtered & searched data
function renderTable() {
  const filterVal = filterSelect.value;
  const searchVal = searchInput.value.toLowerCase();

  tableBody.innerHTML = ""; // clear current rows

  inventoryData.forEach((item, index) => {
    // Filter by EquipmentType
    if (filterVal !== "All" && item.EquipmentType !== filterVal) return;

    // Search in some fields (EquipmentType, Vendor, BrandModel, AssetNo, etc)
    const searchableText =
      (item.EquipmentType + " " + item.Vendor + " " + item.BrandModel + " " + item.AssetNo).toLowerCase();

    if (!searchableText.includes(searchVal)) return;

    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td>${item.EquipmentType || ""}</td>
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
      <td>${item.SSOE_PONumber || ""}</td>
      <td>${item.CartNo || ""}</td>
      <td>${item.SanitiseDate || ""}</td>
      <td>${item.DurationInUse || ""}</td>
      <td>${item.LampHour || ""}</td>
      <td>${item.DateUpdated || ""}</td>
      <td>
        <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
        <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
      </td>
    `;

    tableBody.appendChild(tr);
  });
}

// Open modal for add or edit
function openInventoryModal(item = null, index = null) {
  form.reset();
  editingIndex = null;

  // Populate EquipmentType dropdown
  populateEquipmentTypeDropdown();

  if (item) {
    // Edit mode: fill inputs with item data
    form.elements["equipmentType"].value = item.EquipmentType || "";
    form.elements["vendor"].value = item.Vendor || "";
    form.elements["brandModel"].value = item.BrandModel || "";
    form.elements["profile"].value = item.Profile || "";
    form.elements["custodian"].value = item.Custodian || "";
    form.elements["assetNo"].value = item.AssetNo || "";
    form.elements["serialNumber"].value = item.SerialNumber || "";
    form.elements["location"].value = item.Location || "";
    form.elements["endDate"].value = item.EndDate || "";
    form.elements["startDate"].value = item.StartDate || "";
    form.elements["hostname"].value = item.Hostname || "";
    form.elements["SSOE_PONumber"].value = item.SSOE_PONumber || "";
    form.elements["cartNo"].value = item.CartNo || "";
    form.elements["sanitiseDate"].value = item.SanitiseDate || "";
    form.elements["durationInUse"].value = item.DurationInUse || "";
    form.elements["lampHour"].value = item.LampHour || "";
    form.elements["dateUpdated"].value = item.DateUpdated || "";
    editingIndex = index;
  } else {
    // Add mode: set current datetime for DateUpdated
    form.elements["dateUpdated"].value = new Date().toLocaleString();
  }

  modal.show();
}

// Handle form submission (add/edit)
form.addEventListener("submit", (e) => {
  e.preventDefault();

  // Gather data from form
  const newItem = {
    EquipmentType: form.elements["equipmentType"].value,
    Vendor: form.elements["vendor"].value,
    BrandModel: form.elements["brandModel"].value,
    Profile: form.elements["profile"].value,
    Custodian: form.elements["custodian"].value,
    AssetNo: form.elements["assetNo"].value,
    SerialNumber: form.elements["serialNumber"].value,
    Location: form.elements["location"].value,
    EndDate: form.elements["endDate"].value,
    StartDate: form.elements["startDate"].value,
    Hostname: form.elements["hostname"].value,
    SSOE_PONumber: form.elements["SSOE_PONumber"].value,
    CartNo: form.elements["cartNo"].value,
    SanitiseDate: form.elements["sanitiseDate"].value,
    DurationInUse: form.elements["durationInUse"].value,
    LampHour: form.elements["lampHour"].value,
    DateUpdated: new Date().toLocaleString(),
  };

  if (editingIndex !== null) {
    // Update existing item
    inventoryData[editingIndex] = newItem;
  } else {
    // Add new item
    inventoryData.push(newItem);
  }

  modal.hide();
  renderTable();
});

// Event delegation for Edit/Delete buttons
tableBody.addEventListener("click", (e) => {
  if (e.target.classList.contains("btn-edit")) {
    const index = Number(e.target.dataset.index);
    openInventoryModal(inventoryData[index], index);
  }
  if (e.target.classList
