// Column headers
const headers = [
  "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian",
  "AssetNo", "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
  "SSOE PO Number", "Cart No", "SanitiseDate", "Duration in use", "Lamp Hour", "DateUpdated", "Actions"
];

let inventoryData = JSON.parse(localStorage.getItem("inventoryData")) || [];

const tableBody = document.querySelector("#inventory-table tbody");
const filterSelect = document.getElementById("filter-equipmenttype");
const searchInput = document.getElementById("search-inventory");
const modalForm = document.getElementById("inventory-modal-form");
let editingIndex = -1;

// Format date as "DD Month YYYY"
function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric"
  });
}

// Parse "DD Month YYYY" back to input type="date"
function parseDateToInput(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return "";
  return date.toISOString().split("T")[0];
}

// Calculate duration between two dates in years/months
function getDuration(start, end) {
  const s = new Date(start);
  const e = new Date(end || new Date());
  if (isNaN(s)) return "";
  const years = e.getFullYear() - s.getFullYear();
  const months = e.getMonth() - s.getMonth();
  const totalMonths = years * 12 + months;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return `${y}y ${m}m`;
}

// Render table
function renderTable() {
  tableBody.innerHTML = "";
  const search = searchInput.value.toLowerCase();
  const filter = filterSelect.value;

  inventoryData.forEach((item, index) => {
    if (
      (filter === "all" || item.EquipmentType === filter) &&
      Object.values(item).some(val => (val || "").toLowerCase().includes(search))
    ) {
      const tr = document.createElement("tr");
      headers.forEach(header => {
        const td = document.createElement("td");
        td.textContent = item[header] || "";
        tr.appendChild(td);
      });

      const actionsTd = tr.querySelector("td:last-child");
      actionsTd.innerHTML = `
        <button class="btn btn-sm btn-primary me-1" onclick="editItem(${index})">Edit</button>
        <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
      `;

      tableBody.appendChild(tr);
    }
  });
}

// Save data to localStorage
function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
}

// Add or update item
modalForm.addEventListener("submit", function (e) {
  e.preventDefault();
  const formData = new FormData(modalForm);
  const item = {};

  for (const [key, value] of formData.entries()) {
    if (["EndDate", "StartDate", "SanitiseDate"].includes(key)) {
      item[key] = formatDate(value);
    } else {
      item[key] = value.trim();
    }
  }

  // Calculate duration in use
  item["Duration in use"] = getDuration(formData.get("StartDate"), formData.get("EndDate"));

  if (editingIndex >= 0) {
    inventoryData[editingIndex] = item;
  } else {
    inventoryData.push(item);
  }

  saveData();
  renderTable();
  bootstrap.Modal.getInstance(document.getElementById("inventoryModal")).hide();
  modalForm.reset();
  editingIndex = -1;
});

// Add button
document.getElementById("add-item-btn").addEventListener("click", () => {
  modalForm.reset();
  modalForm.querySelector('[name="DateUpdated"]').value = formatDate(new Date().toISOString());
  editingIndex = -1;
  new bootstrap.Modal(document.getElementById("inventoryModal")).show();
});

// Edit item
function editItem(index) {
  editingIndex = index;
  const item = inventoryData[index];
  for (const key of headers) {
    const input = modalForm.querySelector(`[name="${key}"]`);
    if (!input) continue;

    if (["StartDate", "EndDate", "SanitiseDate"].includes(key)) {
      input.value = parseDateToInput(item[key]);
    } else if (key === "DateUpdated") {
      input.value = item[key];
    } else {
      input.value = item[key] || "";
    }
  }

  // Auto update DateUpdated
  modalForm.querySelector('[name="DateUpdated"]').value = formatDate(new Date().toISOString());
  new bootstrap.Modal(document.getElementById("inventoryModal")).show();
}

// Delete item
function deleteItem(index) {
  if (confirm("Are you sure you want to delete this item?")) {
    inventoryData.splice(index, 1);
    saveData();
    renderTable();
  }
}

// Search/filter
searchInput.addEventListener("input", renderTable);
filterSelect.addEventListener("change", renderTable);

// Initial render
renderTable();
