const headers = [
  "EquipmentType", "Vendor", "BrandModel", "LampHour Profile", "Custodian", "AssetNo", "SerialNumber",
  "Location", "EndDate", "StartDate", "Hostname", "SSOE PO No", "Cart No", "SanitiseDate",
  "DateUpdated", "DurationInUse", "Actions"
];

// Mapping header display names to inventory object keys:
const keyMap = {
  "EquipmentType": "EquipmentType",
  "Vendor": "Vendor",
  "BrandModel": "BrandModel",
  "LampHour Profile": "LampHour",
  "Custodian": "Custodian",
  "AssetNo": "AssetNo",
  "SerialNumber": "SerialNumber",
  "Location": "Location",
  "EndDate": "EndDate",
  "StartDate": "StartDate",
  "Hostname": "Hostname",
  "SSOE PO No": "SSOE PO Number",
  "Cart No": "Cart No",
  "SanitiseDate": "SanitiseDate",
  "DateUpdated": "DateUpdated",
  "DurationInUse": "Duration in use",
  "Actions": "Actions"
};

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
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  // Format as DD MMM YYYY (e.g., 15 Jun 2025)
  const options = { day: "2-digit", month: "short", year: "numeric" };
  return date.toLocaleDateString("en-GB", options).replace(/ /g, " ");
}

function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

function buildTable(filterEquipmentType = "All") {
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";

  inventory.forEach((item, index) => {
    if (filterEquipmentType !== "All" && item.EquipmentType !== filterEquipmentType) {
      return; // Skip rows not matching filter
    }

    const row = document.createElement("tr");

    // Row background color by EquipmentType
    const bgColor = equipmentTypeColors[item.EquipmentType] || "";
    if (bgColor) row.style.backgroundColor = bgColor;

    headers.forEach(header => {
      const cell = document.createElement("td");

      if (header === "Actions") {
        cell.innerHTML = `
          <button class="btn btn-sm btn-primary me-1" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
        `;
      } else if (["EndDate", "StartDate", "DateUpdated", "SanitiseDate"].includes(header)) {
        // Format date fields
        const key = keyMap[header];
        cell.textContent = formatDate(item[key]);
      } else {
        const key = keyMap[header];
        cell.textContent = item[key] || "";
      }

      row.appendChild(cell);
    });

    tbody.appendChild(row);
  });
}

function openForm(editIndex = null) {
  const modalTitle = document.getElementById("modal-title");
  const form = document.getElementById("inventory-form");
  form.innerHTML = "";

  modalTitle.textContent = editIndex === null ? "Add Inventory Item" : "Edit Inventory Item";

  const values = editIndex !== null ? inventory[editIndex] : {};

  headers.forEach(header => {
    if (header === "Actions") return;

    const formGroup = document.createElement("div");
    formGroup.className = "mb-3";

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
        if (values[keyMap[header]] === opt) option.selected = true;
        input.appendChild(option);
      });
    } else if (["EndDate", "StartDate", "DateUpdated", "SanitiseDate"].includes(header)) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "form-control";
      input.name = header;
      input.value = values[keyMap[header]] || "";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.name = header;
      input.value = values[keyMap[header]] || "";
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
      if (header === "Actions") return;
      const key = keyMap[header];
      item[key] = formData.get(header) || "";
    });

    if (editIndex !== null) {
      inventory[editIndex] = item;
    } else {
      inventory.push(item);
    }

    saveData();
    buildTable(document.getElementById("filter-equipmenttype").value);
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
    buildTable(document.getElementById("filter-equipmenttype").value);
  }
}

// Add Item button listener
document.getElementById("add-item-btn").addEventListener("click", () => openForm());

// Filter dropdown listener
document.getElementById("filter-equipmenttype").addEventListener("change", function () {
  buildTable(this.value);
});

// Build table on page load with no filter (all)
document.addEventListener("DOMContentLoaded", () => {
  buildTable();
});

document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("add-item-btn").addEventListener("click", () => {
    const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
    modal.show();

    // Optional: Clear form if needed
    const form = document.getElementById("inventory-form");
    form.innerHTML = '<p>Form content goes here.</p>'; // Replace with dynamic form if required
  });
});

