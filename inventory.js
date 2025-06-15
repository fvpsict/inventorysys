// inventory.js

const headers = [
  "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
  "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
  "SSOE PO Number", "Cart No", "SanitiseDate", "Duration in use",
  "Lamp Hour", "DateUpdated", "Actions"
];

const table = document.getElementById("inventory-table");
const tbody = table.querySelector("tbody");
const addForm = document.getElementById("add-form");

function saveToLocalStorage() {
  const rows = Array.from(tbody.querySelectorAll("tr"));
  const data = rows.map(row => {
    const cells = row.querySelectorAll("td");
    const item = {};
    headers.forEach((header, index) => {
      if (header !== "Actions") {
        item[header] = cells[index].textContent;
      }
    });
    return item;
  });
  localStorage.setItem("inventoryData", JSON.stringify(data));
}

function loadFromLocalStorage() {
  const data = JSON.parse(localStorage.getItem("inventoryData")) || [];
  data.forEach(item => addRow(item));
}

function addRow(item) {
  const row = document.createElement("tr");
  const equipmentType = (item["EquipmentType"] || "default").toLowerCase().replace(/\s+/g, "-");
  row.classList.add(`equipment-${equipmentType}`);

  headers.forEach(header => {
    const cell = document.createElement("td");
    if (header === "Actions") {
      const editBtn = document.createElement("button");
      editBtn.textContent = "Edit";
      editBtn.className = "btn btn-sm btn-primary me-1";
      editBtn.onclick = () => editRow(row);

      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "Delete";
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.onclick = () => deleteRow(row);

      cell.appendChild(editBtn);
      cell.appendChild(deleteBtn);
    } else {
      cell.textContent = item[header] || "";
      cell.contentEditable = true;
      cell.oninput = () => {
        updateDurationInUse(row);
        updateDateUpdated(row);
        saveToLocalStorage();
      };
    }
    row.appendChild(cell);
  });

  tbody.appendChild(row);
  saveToLocalStorage();
}

function editRow(row) {
  row.querySelectorAll("td").forEach(cell => {
    if (!cell.querySelector("button")) cell.contentEditable = true;
  });
}

function deleteRow(row) {
  row.remove();
  saveToLocalStorage();
}

addForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(addForm);
  const newItem = {};
  headers.forEach(header => {
    if (header !== "Actions") {
      newItem[header] = formData.get(header) || "";
    }
  });
  updateCalculatedFields(newItem);
  addRow(newItem);
  addForm.reset();
});

function updateCalculatedFields(item) {
  item["Duration in use"] = calculateDuration(item["StartDate"]);
  item["DateUpdated"] = new Date().toISOString().split("T")[0];
}

function updateDurationInUse(row) {
  const cells = row.querySelectorAll("td");
  const startDateIndex = headers.indexOf("StartDate");
  const durationIndex = headers.indexOf("Duration in use");
  const startDate = cells[startDateIndex].textContent;
  cells[durationIndex].textContent = calculateDuration(startDate);
}

function updateDateUpdated(row) {
  const dateUpdatedIndex = headers.indexOf("DateUpdated");
  row.querySelectorAll("td")[dateUpdatedIndex].textContent = new Date().toISOString().split("T")[0];
}

function calculateDuration(startDate) {
  if (!startDate) return "";
  const start = new Date(startDate);
  const now = new Date();
  const diffYears = now.getFullYear() - start.getFullYear();
  const diffMonths = now.getMonth() - start.getMonth();
  const totalMonths = diffYears * 12 + diffMonths;
  const years = Math.floor(totalMonths / 12);
  const months = totalMonths % 12;
  return `${years}y ${months}m`;
}

document.addEventListener("DOMContentLoaded", loadFromLocalStorage);
