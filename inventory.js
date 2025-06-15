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
  "SSOE PO No",
  "Cart No",
  "SanitiseDate",
  "DateUpdated",
  "DurationInUse",
  "Actions"
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

// Format date string to 'DD MMM YYYY'
function formatDate(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d)) return dateStr;
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).replace(/ /g, " ");
}

// Calculate duration between two dates in years + months
function calculateDuration(start, end) {
  if (!start) return "";
  const startDate = new Date(start);
  const endDate = end ? new Date(end) : new Date();

  if (isNaN(startDate) || isNaN(endDate)) return "";

  let years = endDate.getFullYear() - startDate.getFullYear();
  let months = endDate.getMonth() - startDate.getMonth();

  if (months < 0) {
    years--;
    months += 12;
  }

  let duration = "";
  if (years > 0) duration += `${years} yr${years > 1 ? "s" : ""} `;
  if (months > 0) duration += `${months} mo${months > 1 ? "s" : ""}`;

  return duration.trim() || "0 mo";
}

function saveData() {
  localStorage.setItem("inventoryData", JSON.stringify(inventory));
}

function buildTable() {
  const tbody = document.querySelector("#inventory-table tbody");
  tbody.innerHTML = "";

  inventory.forEach((item, idx) => {
    const tr = document.createElement("tr");

    // Row background by EquipmentType
    const color = equipmentTypeColors[item.EquipmentType] || "";
    if (color) tr.style.backgroundColor = color;

    headers.forEach((header) => {
      const td = document.createElement("td");

      if (header === "Actions") {
        td.innerHTML = `
          <button class="btn btn-sm btn-primary me-1" data-index="${idx}" data-action="edit">Edit</button>
          <button class="btn btn-sm btn-danger" data-index="${idx}" data-action="delete">Delete</button>
        `;
      } else if (["EndDate", "StartDate", "SanitiseDate", "DateUpdated"].includes(header)) {
        td.textContent = formatDate(item[header]) || "";
      } else if (header === "DurationInUse") {
        td.textContent = calculateDuration(item.StartDate, item.EndDate);
      } else {
        td.textContent = item[header] || "";
      }

      tr.appendChild(td);
    });

    tbody.appendChild(tr);
  });

  // Attach event listeners for edit/delete buttons after table build
  tbody.querySelectorAll("button").forEach((btn) => {
    const idx = btn.getAttribute("data-index");
    if (btn.getAttribute("data-action") === "edit") {
      btn.addEventListener("click", () => openForm(Number(idx)));
    } else if (btn.getAttribute("data-action") === "delete") {
      btn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this item?")) {
          inventory.splice(Number(idx), 1);
          saveData();
          buildTable();
        }
      });
    }
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
    label.className = "form-label";
    label.textContent = header;
    label.htmlFor = `field-${header}`;
    formGroup.appendChild(label);

    let input;

    if (header === "EquipmentType") {
      input = document.createElement("select");
      input.className = "form-select";
      input.name = header;
      input.id = `field-${header}`;

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
    } else if (
      ["EndDate", "StartDate", "SanitiseDate", "DateUpdated"].includes(header)
    ) {
      input = document.createElement("input");
      input.type = "date";
      input.className = "form-control";
      input.name = header;
      input.id = `field-${header}`;
      input.value = values[header] || "";
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.name = header;
      input.id = `field-${header}`;
      input.value = values[header] || "";
    }

    formGroup.appendChild(input);
    form.appendChild(formGroup);
  });

  // Save button
  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn btn-success";
  saveBtn.textContent = "Save";
  form.appendChild(saveBtn);

  const modalEl = document.getElementById("inventoryModal");
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  form.onsubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const newItem = {};
    headers.forEach((header) => {
      if (header === "Actions" || header === "DurationInUse") return;
      newItem[header] = formData.get(header) || "";
    });

    // Update DateUpdated field to today’s date automatically
    newItem.DateUpdated = new Date().toISOString().slice(0, 10);

    if (editIndex !== null) {
      inventory[editIndex] = newItem;
    } else {
      inventory.push(newItem);
    }

    saveData();
    buildTable();
    modal.hide();
  };
}

// Bind Add Item button
document.getElementById("add-item-btn").addEventListener("click", () => openForm());

// Build table on DOM load
document.addEventListener("DOMContentLoaded", buildTable);
