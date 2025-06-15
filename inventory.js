const headers = [
  "EquipmentType",
  "Vendor",
  "BrandModel",
  "LampHour",
  "Profile",
  "Custodian",
  "AssetNo",
  "SerialNumber",
  "Location",
  "EndDate",
  "StartDate",
  "Hostname",
  "SSOE PO Number",
  "Cart No",
  "SanitiseDate",
  "DateUpdated",
  "DurationInUse",
  "Actions",
];

// Mapping to actual keys in data because DurationInUse and Actions aren't stored
const keyMap = {
  EquipmentType: "EquipmentType",
  Vendor: "Vendor",
  BrandModel: "BrandModel",
  LampHour: "Lamp Hour",
  Profile: "Profile",
  Custodian: "Custodian",
  AssetNo: "AssetNo",
  SerialNumber: "SerialNumber",
  Location: "Location",
  EndDate: "EndDate",
  StartDate: "StartDate",
  Hostname: "Hostname",
  "SSOE PO Number": "SSOE PO Number",
  "Cart No": "Cart No",
  SanitiseDate: "SanitiseDate",
  DateUpdated: "DateUpdated",
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
  OMR: "#f8d7da",
};

let inventory = JSON.parse(localStorage.getItem("inventoryData")) || [];

function formatDate(dateStr) {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date)) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, " ");
}

function calculateDuration(startStr, endStr) {
  if (!startStr) return "";
  const startDate = new Date(startStr);
  const endDate = endStr ? new Date(endStr) : new Date();
  if (isNaN(startDate) || isNaN(endDate)) return "";

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let durationStr = "";
  if (years > 0) durationStr += years + " yr" + (years > 1 ? "s" : "");
  if (months > 0) durationStr += (durationStr ? " " : "") + months + " mo" + (months > 1 ? "s" : "");

  return durationStr || "<1 mo";
}

function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

function buildFilterOptions() {
  const filterSelect = document.getElementById("filterEquipmentType");
  filterSelect.innerHTML = '<option value="">All</option>';

  // Get unique equipment types from inventory
  const types = [...new Set(inventory.map((item) => item.EquipmentType).filter(Boolean))].sort();

  types.forEach((type) => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    filterSelect.appendChild(option);
  });
}

function buildTable() {
  const tableBody = document.querySelector("#inventory-table tbody");
  tableBody.innerHTML = "";

  const filterValue = document.getElementById("filterEquipmentType").value;

  inventory.forEach((item, index) => {
    if (filterValue && item.EquipmentType !== filterValue) return;

    const row = document.createElement("tr");

    const color = equipmentTypeColors[item.EquipmentType] || "";
    if (color) row.style.backgroundColor = color;

    headers.forEach((header) => {
      const cell = document.createElement("td");

      if (header === "Actions") {
        cell.innerHTML = `
          <button class="btn btn-sm btn-primary me-1" onclick="editItem(${index})">Edit</button>
          <button class="btn btn-sm btn-danger" onclick="deleteItem(${index})">Delete</button>
        `;
      } else if (header === "DurationInUse") {
        // Calculate duration between StartDate and EndDate (or today)
        const startStr = item["StartDate"];
        const endStr = item["EndDate"];
        const duration = calculateDuration(startStr, endStr);
        cell.textContent = duration;
      } else if (["EndDate", "StartDate", "DateUpdated", "SanitiseDate"].includes(header)) {
        cell.textContent = formatDate(item[keyMap[header]] || "");
      } else {
        cell.textContent = item[keyMap[header]] || "";
      }

      row.appendChild(cell);
    });

    tableBody.appendChild(row);
  });
}

function openForm(editIndex = null) {
  const modalTitle = document.getElementById("inventoryModalLabel");
  const form = document.getElementById("inventory-form");
  form.innerHTML = "";

  modalTitle.textContent = editIndex === null ? "Add Inventory Item" : "Edit Inventory Item";

  const values = editIndex !== null ? inventory[editIndex] : {};

  headers.forEach((header) => {
    if (header === "Actions" || header === "DurationInUse") return;

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
        "",
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

      options.forEach((opt) => {
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

  const saveButton = document.createElement("button");
  saveButton.type = "submit";
  saveButton.className = "btn btn-success";
  saveButton.textContent = "Save";
  form.appendChild(saveButton);

  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  modal.show();

  form.onsubmit = function (e) {
    e.preventDefault();
    const formData = new FormData(form);
    const item = {};
    headers.forEach((header) => {
      if (header === "Actions" || header === "DurationInUse") return;
      item[header === "LampHour" ? "Lamp Hour" : header] = formData.get(header) || "";
    });

    // Date fields fix: Store in yyyy-mm-dd for consistency
    ["EndDate", "StartDate", "SanitiseDate", "Date]()
