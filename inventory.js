const headers = [
  "EquipmentType", "Equipment Vendor", "BrandModel", "LampHour", "Profile", "Custodian", "AssetNo", "SerialNumber",
  "Location", "EndDate", "StartDate", "Hostname", "SSOE PO No", "Cart No", "SanitiseDate",
  "DateUpdated", "DurationInUse", "Actions"
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
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/ /g, ' ');
}

function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

function buildTable() {
  const tableBody = document.querySelector("#inventory-table tbody");
  tableBody.innerHTML = "";

  inventory.forEach((item, index) => {
    const row = document.createElement("tr");
    const color = equipmentTypeColors[item["EquipmentType"]] || "";
    if (color) row.style.backgroundColor = color;

    headers.forEach(header => {
      const cell = document.createElement("td");
      if (["EndDate", "StartDate", "SanitiseDate", "DateUpdated"].includes(header)) {
        cell.textContent = formatDate(item[header]);
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
  const form = document.getElementById("inventory-form");
  const modalTitle = document.getElementById("inventoryModalLabel");
  form.innerHTML = "";
  modalTitle.textContent = editIndex === null ? "Add Inventory Item" : "Edit Inventory Item";

  const values = editIndex !== null ? inventory[editIndex] : {};

  headers.forEach(header => {
    if (header === "Actions") return;

    const formGroup = document.createElement("div");
    formGroup.className = "mb-2";

    const label = document.createElement("label");
    label.textContent = header;
    label.className = "form-label";
    formGroup.appendChild(label);

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
        const option = document.createElement("option");
        option.value = opt;
        option.textContent = opt || "Select EquipmentType";
        if (values[header] === opt) option.selected = true;
        input.appendChild(option);
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

    formGroup.appendChild(input);
    form.appendChild(formGroup);
  });

  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn btn-success";
  saveBtn.textContent = "Save";
  form.appendChild(saveBtn);

  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  modal.show();

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const item = {};
    headers.forEach(header => {
      if (header !== "Actions") {
        item[header] = formData.get(header) || "";
      }
    });

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
  if (confirm("Are you sure you want to delete this item?")) {
    inventory.splice(index, 1);
    saveData();
    buildTable();
  }
}

document.getElementById("add-item-btn").addEventListener("click", () => openForm());
document.addEventListener("DOMContentLoaded", buildTable);
