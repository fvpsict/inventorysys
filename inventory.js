// inventory.js

let inventoryData = []; // in-memory inventory array of objects

const tableHeaders = [
  "Equipment Type",
  "Vendor",
  "Brand & Model",
  "Serial No",
  "Asset No",
  "Location",
];

const tableHeadersKeys = [
  "equipmentType",
  "vendor",
  "brandModel",
  "serialNo",
  "assetNo",
  "location",
];

const inventoryTableHeaders = document.getElementById("tableHeaders");
const inventoryTableBody = document.getElementById("tableBody");
const itemModal = document.getElementById("itemModal");
const itemForm = document.getElementById("itemForm");

let currentEditIndex = -1;

function renderTableHeaders() {
  inventoryTableHeaders.innerHTML = "";
  tableHeaders.forEach((header) => {
    const th = document.createElement("th");
    th.textContent = header;
    inventoryTableHeaders.appendChild(th);
  });
}

function renderTable() {
  inventoryTableBody.innerHTML = "";
  inventoryData.forEach((item, index) => {
    const tr = document.createElement("tr");
    tr.addEventListener("click", () => openModal(index));

    tableHeadersKeys.forEach((key) => {
      const td = document.createElement("td");
      td.textContent = item[key] || "";
      tr.appendChild(td);
    });

    inventoryTableBody.appendChild(tr);
  });
}

function openModal(index = -1) {
  currentEditIndex = index;

  if (index >= 0) {
    // Edit existing item
    const item = inventoryData[index];
    tableHeadersKeys.forEach((key) => {
      const input = document.getElementById(key);
      if (input) input.value = item[key] || "";
    });
  } else {
    // New item
    itemForm.reset();
  }

  itemModal.style.display = "block";
  // Set focus to first input
  document.getElementById(tableHeadersKeys[0]).focus();
}

function closeModal() {
  itemModal.style.display = "none";
  currentEditIndex = -1;
}

itemForm.addEventListener("submit", (e) => {
  e.preventDefault();

  // Gather form data
  const newItem = {};
  let valid = true;
  tableHeadersKeys.forEach((key) => {
    const val = document.getElementById(key).value.trim();
    if (key === "equipmentType" && val === "") {
      alert("Equipment Type is required");
      valid = false;
    }
    newItem[key] = val;
  });

  if (!valid) return;

  if (currentEditIndex >= 0) {
    // Update existing
    inventoryData[currentEditIndex] = newItem;
  } else {
    // Add new
    inventoryData.push(newItem);
  }

  renderTable();
  closeModal();
});

window.onclick = function (event) {
  if (event.target === itemModal) {
    closeModal();
  }
};

// Initialization
renderTableHeaders();
renderTable();
