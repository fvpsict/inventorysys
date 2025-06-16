// fault-report.js

const faultEquipmentTypes = [
  "Projector",
  "Visualiser",
  "Projector Screen",
];

const faultStatusOptions = [
  "Open",
  "In Progress",
  "Resolved",
  "Closed",
];

// Columns to show in table & form
const faultColumns = [
  "EquipmentType",
  "Vendor",
  "BrandModel",
  "AssetNo",
  "SerialNumber",
  "Location",
  "Status",
  "Fault",
  "DateReported",
];

// Globals
let faultReports = [];
let editingFaultIndex = null;

// DOM elements
const faultTableBody = document.querySelector("#fault-table tbody");
const filterFaultEquipment = document.getElementById("filter-fault-equipmenttype");
const searchFaultInput = document.getElementById("search-fault");
const addFaultBtn = document.getElementById("add-fault-btn");

const faultModal = new bootstrap.Modal(document.getElementById("faultModal"));
const faultModalForm = document.getElementById("fault-form");
const faultModalBody = faultModalForm.querySelector(".modal-body");
const faultModalFooter = faultModalForm.querySelector(".modal-footer");

// Load fault reports from localStorage
function loadFaultReports() {
  const data = localStorage.getItem("faultReports");
  faultReports = data ? JSON.parse(data) : [];
}

// Save fault reports to localStorage
function saveFaultReports() {
  localStorage.setItem("faultReports", JSON.stringify(faultReports));
}

// Render fault report table
function renderFaultTable() {
  const filterValue = filterFaultEquipment.value;
  const searchTerm = searchFaultInput.value.toLowerCase();

  faultTableBody.innerHTML = "";

  faultReports.forEach((fault, index) => {
    if (filterValue !== "All" && fault.EquipmentType !== filterValue) return;

    const matchesSearch = faultColumns.some((col) =>
      (fault[col] || "").toString().toLowerCase().includes(searchTerm)
    );
    if (!matchesSearch) return;

    const tr = document.createElement("tr");

    faultColumns.forEach((col) => {
      const td = document.createElement("td");
      if (col === "DateReported") {
        td.textContent = fault[col] || "";
      } else {
        td.textContent = fault[col] || "";
      }
      tr.appendChild(td);
    });

    // Actions column
    const actionsTd = document.createElement("td");
    actionsTd.classList.add("text-center");

    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => openFaultModalForEdit(index));

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (
        confirm(
          `Are you sure you want to delete the fault for AssetNo "${fault.AssetNo}"?`
        )
      ) {
        faultReports.splice(index, 1);
        saveFaultReports();
        renderFaultTable();
      }
    });

    actionsTd.appendChild(editBtn);
    actionsTd.appendChild(deleteBtn);
    tr.appendChild(actionsTd);

    faultTableBody.appendChild(tr);
  });
}

// Open modal to add new fault
function openFaultModalForAdd() {
  editingFaultIndex = null;
  faultModalForm.reset();
  buildFaultModalForm(null);
  faultModal.show();
  setFaultModalTitle("Add Fault Report");
}

// Open modal to edit fault
function openFaultModalForEdit(index) {
  editingFaultIndex = index;
  faultModalForm.reset();
  buildFaultModalForm(faultReports[index]);
  faultModal.show();
  setFaultModalTitle("Edit Fault Report");
}

// Set modal title
function setFaultModalTitle(title) {
  document.getElementById("faultModalLabel").textContent = title;
}

// Build modal form fields dynamically based on faultColumns and optional fault data
function buildFaultModalForm(fault) {
  faultModalBody.innerHTML = "";
  faultModalFooter.innerHTML = "";

  faultColumns.forEach((key) => {
    const div = document.createElement("div");
    div.className = "mb-3";

    const label = document.createElement("label");
    label.htmlFor = `input-${key}`;
    label.className = "form-label fw-semibold";
    label.textContent = key.replace(/([A-Z])/g, " $1").trim();

    let input;

    if (key === "EquipmentType") {
      input = document.createElement("select");
      input.className = "form-select";
      input.id = `input-${key}`;
      input.name = key;

      faultEquipmentTypes.forEach((type) => {
        const option = document.createElement("option");
        option.value = type;
        option.textContent = type;
        if (fault && fault[key] === type) option.selected = true;
        input.appendChild(option);
      });
    } else if (key === "Status") {
      input = document.createElement("select");
      input.className = "form-select";
      input.id = `input-${key}`;
      input.name = key;

      faultStatusOptions.forEach((status) => {
        const option = document.createElement("option");
        option.value = status;
        option.textContent = status;
        if (fault && fault[key] === status) option.selected = true;
        input.appendChild(option);
      });
    } else if (key === "DateReported") {
      input = document.createElement("input");
      input.type = "date";
      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;
      if (fault && fault[key]) {
        input.value = fault[key];
      } else {
        // Default to today
        input.value = new Date().toISOString().slice(0, 10);
      }
    } else {
      input = document.createElement("input");
      input.type = "text";
      input.className = "form-control";
      input.id = `input-${key}`;
      input.name = key;
      input.value = fault ? fault[key] || "" : "";
    }

    div.appendChild(label);
    div.appendChild(input);
    faultModalBody.appendChild(div);
  });

  // Add Save and Cancel buttons
  const saveBtn = document.createElement("button");
  saveBtn.type = "submit";
  saveBtn.className = "btn btn-success";
  saveBtn.textContent = "Save";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "btn btn-secondary";
  cancelBtn.textContent = "Cancel";
  cancelBtn.setAttribute("data-bs-dismiss", "modal");

  faultModalFooter.appendChild(saveBtn);
  faultModalFooter.appendChild(cancelBtn);
}

// Handle fault form submit
faultModalForm.addEventListener("submit", (e) => {
  e.preventDefault();

  const formData = new FormData(faultModalForm);
  let newFault = {};

  faultColumns.forEach((col) => {
    newFault[col] = formData.get(col) ? formData.get(col).trim() : "";
  });

  // Validate AssetNo required
  if (!newFault.AssetNo) {
    alert("AssetNo is required.");
    return;
  }

  if (editingFaultIndex === null) {
    faultReports.push(newFault);
  } else {
    faultReports[editingFaultIndex] = newFault;
  }

  saveFaultReports();
  renderFaultTable();
  faultModal.hide();
});

// Attach event listeners for filters and buttons
filterFaultEquipment.addEventListener("change", renderFaultTable);
searchFaultInput.addEventListener("input", renderFaultTable);
addFaultBtn.addEventListener("click", openFaultModalForAdd);

// Initialize
loadFaultReports();
renderFaultTable();
