const headers = [
  "EquipmentType", "Vendor", "BrandModel", "LampHour Profile", "Custodian", "AssetNo",
  "SerialNumber", "Location", "EndDate", "StartDate", "Hostname", "SSOE PO No",
  "Cart No", "SanitiseDate", "DateUpdated", "DurationInUse", "Actions"
];

const equipmentTypeColors = {
  SSOE: "#e8f0fe",
  Projector: "#fff3cd",
  "Projector Screen": "#f8d7da",
  "Touch Panel": "#d1ecf1",
  Visualiser: "#e2e3e5",
  SMax: "#fefefe",
  Macbook: "#d4edda",
  "Portable HDD": "#cce5ff",
  TV: "#f5c6cb",
  Monitor: "#c3e6cb",
  OMR: "#f8d7da"
};

let inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];

function formatDate(dateStr) {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return isNaN(date) ? dateStr : date.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace(/ /g, ' ');
}

function calculateDuration(startDate) {
  if (!startDate) return "";
  const start = new Date(startDate);
  const now = new Date();
  if (isNaN(start)) return "";

  let years = now.getFullYear() - start.getFullYear();
  let months = now.getMonth() - start.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  return `${years}y ${months}m`;
}

function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

function buildTable() {
  const tableBody = document.querySelector("#inventory-table tbody");
  const filter = document.getElementById("category-filter").value;
  tableBody.innerHTML = "";

  inventory.forEach((item, index) => {
    if (filter && item.EquipmentType !== filter) return;

    const row = document.createElement("tr");
    const color = equipmentTypeColors[item.EquipmentType] || "";
    if (color) row.style.backgroundColor = color;

    headers.forEach(header => {
      const cell = document.createElement("td");

      if (header === "EndDate" || header === "StartDate" || header === "DateUpdated") {
        cell.textContent = formatDate(item[header]);
      } else if (header === "DurationInUse") {
        cell.textContent = calculateDuration(item["StartDate"]);
      } else if (header === "Actions") {
        cell.innerHTML = `
          <button class="btn btn-sm btn-primary me-1" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
        `;
      } else {
        cell.textContent = item[header] || "";
      }

      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}

function openForm(editIndex = null) {
  const modalTitle = document.getElementById("modal-title");
  const form = document.getElementById("inventory-form");
  form.innerHTML = "";
  modalTitle.textContent = editIndex === null ? "Add Inventory Item" : "Edit Inventory Item";

  const values = editIndex !== null ? inventory[editIndex] : {};

  headers.forEach((header) => {
    if (header === "Actions") return;

    const div = document.createElement("div");
    div.className = "mb-2";

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = header;
    div.appendChild(label);

    let input;

    if (header === "EquipmentType") {
      input = document.createElement("select");
      input.className = "form-select";
      input.name = header;
      const options = [
        "", "SSOE", "Projector", "Projector Screen", "Touch Panel", "Visualiser",
        "SMax", "Macbook", "Portable HDD", "TV", "Monitor", "OMR"
      ];
      options.forEach(opt => {
        const optEl = document.createElement("option");
        optEl.value = opt;
        optEl.textContent = opt || "Select EquipmentType";
        if (values[header] === opt) optEl.selected = true;
        input.appendChild(optEl);
      });
    } else if (["EndDate", "StartDate", "SanitiseDate", "DateUpdated"].includes(header)) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "form-control";
      input.name = header;
      input.value = values[header] || "";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.name = header;
      input.value = values[header] || "";
    }

    div.appendChild(input);
    form.appendChild(div);
  });

  const saveBtn = document.createElement("button");
  saveBtn.className = "btn btn-success";
  saveBtn.textContent = "Save";
  saveBtn.type = "submit";
  form.appendChild(saveBtn);

  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  modal.show();

  form.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const item = {};
    headers.forEach(h => {
      if (h !== "Actions") item[h] = formData.get(h) || "";
    });
    item["DurationInUse"] = calculateDuration(item["StartDate"]);

    if (editIndex !== null) {
      inventory[editIndex] = item;
    } else {
      inventory.push(item);
    }

    saveData();
    buildTable();
    modal.hide();
  };
}

function editItem(index) {
  openForm(index);
}

function deleteItem(index) {
  if (confirm("Delete this item?")) {
    inventory.splice(index, 1);
    saveData();
    buildTable();
  }
}

function parseCSV(csvText) {
  const rows = csvText.trim().split("\n");
  const keys = headers.filter(h => h !== "Actions");
  const data = [];

  for (let i = 1; i < rows.length; i++) {
    const cells = rows[i].split(",");
    const item = {};
    keys.forEach((k, j) => item[k] = cells[j]?.trim() || "");
    item["DurationInUse"] = calculateDuration(item["StartDate"]);
    data.push(item);
  }

  return data;
}

document.getElementById("add-item-btn").addEventListener("click", () => openForm());
document.getElementById("category-filter").addEventListener("change", buildTable);
document.addEventListener("DOMContentLoaded", buildTable);

document.getElementById("csv-upload").addEventListener("change", (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = function (event) {
    const csvText = event.target.result;
    const parsed = parseCSV(csvText);
    inventory = [...inventory, ...parsed];
    saveData();
    buildTable();
    e.target.value = "";
  };
  reader.readAsText(file);
});
