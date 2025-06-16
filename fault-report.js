// fault-report.js

const STORAGE_KEY_FAULT = "fault_report_data";

const EQUIPMENT_TYPES = ["Projector", "Visualiser", "Projector Screen"];
const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

let faultData = [];
let filteredEquipmentType = "All";

function loadFaultData() {
  const stored = localStorage.getItem(STORAGE_KEY_FAULT);
  if (stored) {
    faultData = JSON.parse(stored);
  } else {
    faultData = [];
  }
}

function saveFaultData() {
  localStorage.setItem(STORAGE_KEY_FAULT, JSON.stringify(faultData));
}

function renderEquipmentTypeFilter() {
  const select = document.getElementById("filter-equipmenttype");
  if (!select) return;

  // Clear existing options
  select.innerHTML = "";

  // Add "All" option
  const allOption = document.createElement("option");
  allOption.value = "All";
  allOption.textContent = "All Equipment Types";
  select.appendChild(allOption);

  EQUIPMENT_TYPES.forEach(type => {
    const option = document.createElement("option");
    option.value = type;
    option.textContent = type;
    select.appendChild(option);
  });

  select.value = filteredEquipmentType;

  select.onchange = (e) => {
    filteredEquipmentType = e.target.value;
    renderTableRows();
  };
}

function renderTableRows() {
  const tbody = document.querySelector("#fault-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  let dataToShow = faultData;

  if (filteredEquipmentType !== "All") {
    dataToShow = faultData.filter(item => item.EquipmentType === filteredEquipmentType);
  }

  dataToShow.forEach((item, index) => {
    const tr = document.createElement("tr");

    // EquipmentType
    let td = document.createElement("td");
    td.textContent = item.EquipmentType || "";
    tr.appendChild(td);

    // Vendor
    td = document.createElement("td");
    td.textContent = item.Vendor || "";
    tr.appendChild(td);

    // BrandModel
    td = document.createElement("td");
    td.textContent = item.BrandModel || "";
    tr.appendChild(td);

    // AssetNo
    td = document.createElement("td");
    td.textContent = item.AssetNo || "";
    tr.appendChild(td);

    // SerialNumber
    td = document.createElement("td");
    td.textContent = item.SerialNumber || "";
    tr.appendChild(td);

    // EndDate
    td = document.createElement("td");
    td.textContent = item.EndDate || "";
    tr.appendChild(td);

    // StartDate
    td = document.createElement("td");
    td.textContent = item.StartDate || "";
    tr.appendChild(td);

    // Room (optional, if used)
    td = document.createElement("td");
    td.textContent = item.Room || "";
    tr.appendChild(td);

    // Fault
    td = document.createElement("td");
    const faultInput = document.createElement("input");
    faultInput.type = "text";
    faultInput.value = item.Fault || "";
    faultInput.className = "form-control form-control-sm";
    faultInput.onchange = e => {
      faultData[index].Fault = e.target.value.trim();
      saveFaultData();
    };
    td.appendChild(faultInput);
    tr.appendChild(td);

    // Status - dropdown inline editable
    td = document.createElement("td");
    const statusSelect = document.createElement("select");
    statusSelect.className = "form-select form-select-sm";
    STATUS_OPTIONS.forEach(status => {
      const opt = document.createElement("option");
      opt.value = status;
      opt.textContent = status;
      if (item.Status === status) opt.selected = true;
      statusSelect.appendChild(opt);
    });
    statusSelect.onchange = e => {
      faultData[index].Status = e.target.value;
      saveFaultData();
      renderTableRows(); // Re-render if needed (for example, if filtering by status later)
    };
    td.appendChild(statusSelect);
    tr.appendChild(td);

    // Actions: Delete button
    td = document.createElement("td");
    const delBtn = document.createElement("button");
    delBtn.className = "btn btn-sm btn-danger";
    delBtn.textContent = "Delete";
    delBtn.onclick = () => {
      if (confirm("Delete this fault report?")) {
        faultData.splice(index, 1);
        saveFaultData();
        renderTableRows();
      }
    };
    td.appendChild(delBtn);
    tr.appendChild(td);

    tbody.appendChild(tr);
  });
}

function showAddFaultModal() {
  const modal = document.getElementById("faultModal");
  if (!modal) return;

  const formBody = modal.querySelector(".modal-body");
  formBody.innerHTML = "";

  // Create form inputs
  // EquipmentType select
  const equipmentLabel = document.createElement("label");
  equipmentLabel.className = "form-label";
  equipmentLabel.textContent = "Equipment Type";
  const equipmentSelect = document.createElement("select");
  equipmentSelect.className = "form-select";
  EQUIPMENT_TYPES.forEach(type => {
    const opt = document.createElement("option");
    opt.value = type;
    opt.textContent = type;
    equipmentSelect.appendChild(opt);
  });

  // Fault text input
  const faultLabel = document.createElement("label");
  faultLabel.className = "form-label mt-3";
  faultLabel.textContent = "Fault Description";
  const faultInput = document.createElement("textarea");
  faultInput.className = "form-control";
  faultInput.rows = 3;

  // Status select default to "Open"
  const statusLabel = document.createElement("label");
  statusLabel.className = "form-label mt-3";
  statusLabel.textContent = "Status";
  const statusSelect = document.createElement("select");
  statusSelect.className = "form-select";
  STATUS_OPTIONS.forEach(status => {
    const opt = document.createElement("option");
    opt.value = status;
    opt.textContent = status;
    if (status === "Open") opt.selected = true;
    statusSelect.appendChild(opt);
  });

  // Additional fields example (Vendor, BrandModel, AssetNo, SerialNumber, EndDate, StartDate, Room)
  // You can expand this with more fields as needed.

  // Vendor
  const vendorLabel = document.createElement("label");
  vendorLabel.className = "form-label mt-3";
  vendorLabel.textContent = "Vendor";
  const vendorInput = document.createElement("input");
  vendorInput.type = "text";
  vendorInput.className = "form-control";

  // BrandModel
  const brandLabel = document.createElement("label");
  brandLabel.className = "form-label mt-3";
  brandLabel.textContent = "Brand/Model";
  const brandInput = document.createElement("input");
  brandInput.type = "text";
  brandInput.className = "form-control";

  // AssetNo
  const assetLabel = document.createElement("label");
  assetLabel.className = "form-label mt-3";
  assetLabel.textContent = "Asset No";
  const assetInput = document.createElement("input");
  assetInput.type = "text";
  assetInput.className = "form-control";

  // SerialNumber
  const serialLabel = document.createElement("label");
  serialLabel.className = "form-label mt-3";
  serialLabel.textContent = "Serial Number";
  const serialInput = document.createElement("input");
  serialInput.type = "text";
  serialInput.className = "form-control";

  // EndDate
  const endDateLabel = document.createElement("label");
  endDateLabel.className = "form-label mt-3";
  endDateLabel.textContent = "End Date";
  const endDateInput = document.createElement("input");
  endDateInput.type = "date";
  endDateInput.className = "form-control";

  // StartDate
  const startDateLabel = document.createElement("label");
  startDateLabel.className = "form-label mt-3";
  startDateLabel.textContent = "Start Date";
  const startDateInput = document.createElement("input");
  startDateInput.type = "date";
  startDateInput.className = "form-control";

  // Room
  const roomLabel = document.createElement("label");
  roomLabel.className = "form-label mt-3";
  roomLabel.textContent = "Room";
  const roomInput = document.createElement("input");
  roomInput.type = "text";
  roomInput.className = "form-control";

  // Append all inputs to modal body
  formBody.appendChild(equipmentLabel);
  formBody.appendChild(equipmentSelect);
  formBody.appendChild(vendorLabel);
  formBody.appendChild(vendorInput);
  formBody.appendChild(brandLabel);
  formBody.appendChild(brandInput);
  formBody.appendChild(assetLabel);
  formBody.appendChild(assetInput);
  formBody.appendChild(serialLabel);
  formBody.appendChild(serialInput);
  formBody.appendChild(endDateLabel);
  formBody.appendChild(endDateInput);
  formBody.appendChild(startDateLabel);
  formBody.appendChild(startDateInput);
  formBody.appendChild(roomLabel);
  formBody.appendChild(roomInput);
  formBody.appendChild(faultLabel);
  formBody.appendChild(faultInput);
  formBody.appendChild(statusLabel);
  formBody.appendChild(statusSelect);

  // Store modal inputs in dataset for saving reference
  modal.dataset.editIndex = "";

  // Show modal
  const bootstrapModal = new bootstrap.Modal(modal);
  bootstrapModal.show();

  // Attach save button event
  const saveBtn = modal.querySelector("#saveFaultBtn");
  if (saveBtn) {
    saveBtn.onclick = (e) => {
      e.preventDefault();
      addNewFault({
        EquipmentType: equipmentSelect.value,
        Vendor: vendorInput.value.trim(),
        BrandModel: brandInput.value.trim(),
        AssetNo: assetInput.value.trim(),
        SerialNumber: serialInput.value.trim(),
        EndDate: endDateInput.value,
        StartDate: startDateInput.value,
        Room: roomInput.value.trim(),
        Fault: faultInput.value.trim(),
        Status: statusSelect.value
      });
      bootstrapModal.hide();
    };
  }
}

function addNewFault(newFault) {
  faultData.push(newFault);
  saveFaultData();
  renderTableRows();
}

function searchFaultReports() {
  const filter = document.getElementById("searchInput").value.toLowerCase();
  const tbody = document.querySelector("#fault-table tbody");
  if (!tbody) return;

  Array.from(tbody.rows).forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(filter) ? "" : "none";
  });
}

function clearSearch() {
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.value = "";
    searchFaultReports();
  }
}

function initFaultReport() {
  loadFaultData();
  renderEquipmentTypeFilter();
  renderTableRows();

  const addFaultBtn = document.getElementById("addFaultBtn");
  if (addFaultBtn) {
    addFaultBtn.onclick = showAddFaultModal;
  }

  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.oninput = searchFaultReports;
  }
}

document.addEventListener("DOMContentLoaded", initFaultReport);
