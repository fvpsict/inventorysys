const headers = [
  "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo", "SerialNumber",
  "Location", "EndDate", "StartDate", "Hostname", "SSOE PO Number", "Cart No", "SanitiseDate",
  "Duration in use", "Lamp Hour", "DateUpdated", "Actions"
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
    day: '2-digit', month: 'short', year: 'numeric'
  }).replace(/ /g, ' ');
}

function calculateDuration(startDateStr) {
  const startDate = new Date(startDateStr);
  const now = new Date();
  if (isNaN(startDate)) return "";
  let years = now.getFullYear() - startDate.getFullYear();
  let months = now.getMonth() - startDate.getMonth();
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
  tableBody.innerHTML = "";

  const filterValue = document.getElementById("filter-equipmenttype")?.value || "All";

  inventory.forEach((item, index) => {
    if (filterValue !== "All" && item.EquipmentType !== filterValue) return;

    const row = document.createElement("tr");
    const color = equipmentTypeColors[item.EquipmentType] || "";
    if (color) row.style.backgroundColor = color;

    headers.forEach((header) => {
      const cell = document.createElement("td");

      if (["EndDate", "StartDate", "SanitiseDate", "DateUpdated"].includes(header)) {
        cell.textContent = formatDate(item[header]);
      } else if (header === "Duration in use") {
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
  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-form");
  form.innerHTML = "";

  const values = editIndex !== null ? inventory[editIndex] : {};

  headers.forEach(header => {
    if (header === "Actions" || header === "Duration in use") return;

    const formGroup = document.createElement("div");
    formGroup.className = "mb-2";

    const label = document.createElement("label");
    label.className = "form-label";
    label.textContent = header;
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

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-success";
  saveButton.textContent = "Save";
  form.appendChild(saveButton);

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const item = {};

    headers.forEach(header => {
      if (header === "Actions") return;

      item[header] = formData.get(header) || "";
    });

    item["Duration in use"] = calculateDuration(item["StartDate"]);

    if (editIndex !== null) {
      inventory[editIndex] = item;
    } else {
      inventory.push(item);
    }

    saveData();
    buildTable();
    modal.hide();
  };

  modal.show();
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

document.addEventListener("DOMContentLoaded", () => {
  buildTable();

  document.getElementById("add-item-btn").addEventListener("click", () => openForm());

  const filter = document.getElementById("filter-equipmenttype");
  if (filter) {
    filter.addEventListener("change", buildTable);
  }
});
