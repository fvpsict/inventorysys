 // fault-report.js

const STORAGE_KEY_FAULT = "fault_report_data";
const EQUIPMENT_TYPES = ["Projector", "Visualiser", "Projector Screen"];
const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed"];

let faultData = [];
let filteredEquipmentType = "All";

function loadFaultData() {
  const stored = localStorage.getItem(STORAGE_KEY_FAULT);
  faultData = stored ? JSON.parse(stored) : [];
}

function saveFaultData() {
  localStorage.setItem(STORAGE_KEY_FAULT, JSON.stringify(faultData));
}

function renderEquipmentTypeFilter() {
  const select = document.getElementById("filter-equipmenttype");
  if (!select) return;

  select.innerHTML = `<option value="All">All Equipment Types</option>` +
    EQUIPMENT_TYPES.map(type => `<option value="${type}">${type}</option>`).join("");
  select.value = filteredEquipmentType;

  select.onchange = () => {
    filteredEquipmentType = select.value;
    renderTableRows();
  };
}

function renderTableRows() {
  const tbody = document.querySelector("#fault-table tbody");
  if (!tbody) return;

  tbody.innerHTML = "";

  let filtered = filteredEquipmentType === "All"
    ? faultData
    : faultData.filter(f => f.EquipmentType === filteredEquipmentType);

  filtered.forEach((item, idx) => {
    const tr = document.createElement("tr");

    // Columns: EquipmentType, Vendor, BrandModel, AssetNo, SerialNumber, EndDate, StartDate, Room, Fault, Status, Actions

    ["EquipmentType", "Vendor", "BrandModel", "AssetNo", "SerialNumber", "EndDate", "StartDate", "Room"].forEach(key => {
      const td = document.createElement("td");
      td.textContent = item[key] || "";
      tr.appendChild(td);
    });

    // Fault editable input
    let tdFault = document.createElement("td");
    let inputFault = document.createElement("input");
    inputFault.type = "text";
    inputFault.value = item.Fault || "";
    inputFault.className = "form-control form-control-sm";
    inputFault.onchange = e => {
      faultData[idx].Fault = e.target.value.trim();
      saveFaultData();
    };
    tdFault.appendChild(inputFault);
    tr.appendChild(tdFault);

    // Status dropdown inline editable
    let tdStatus = document.createElement("td");
    let selectStatus = document.createElement("select");
    selectStatus.className = "form-select form-select-sm";
    STATUS_OPTIONS.forEach(status => {
      let option = document.createElement("option");
      option.value = status;
      option.textContent = status;
      if (item.Status === status) option.selected = true;
      selectStatus.appendChild(option);
    });
    selectStatus.onchange = e => {
      faultData[idx].Status = e.target.value;
      saveFaultData();
      renderTableRows();
    };
    tdStatus.appendChild(selectStatus);
    tr.appendChild(tdStatus);

    // Actions - Delete button
    let tdActions = document.createElement("td");
    let btnDel = document.createElement("button");
    btnDel.textContent = "Delete";
    btnDel.className = "btn btn-sm btn-danger";
    btnDel.onclick = () => {
      if (confirm("Delete this fault report?")) {
        faultData.splice(idx, 1);
        saveFaultData();
        renderTableRows();
      }
    };
    tdActions.appendChild(btnDel);
    tr.appendChild(tdActions);

    tbody.appendChild(tr);
  });
}

function showAddFaultModal() {
  const modalEl = document.getElementById("faultModal");
  if (!modalEl) return;
  const modalBody = modalEl.querySelector(".modal-body");
  modalBody.innerHTML = "";

  // Build inputs dynamically (you can customize)
  function createLabel(text) {
    const label = document.createElement("label");
    label.className = "form-label mt-2";
    label.textContent = text;
    return label;
  }
  function createInput(type = "text") {
    const input = document.createElement("input");
    input.type = type;
    input.className = "form-control";
    return input;
  }
  function createSelect(options, defaultVal = null) {
    const select = document.createElement("select");
    select.className = "form-select";
    options.forEach(opt => {
      const option = document.createElement("option");
      option.value = opt;
      option.textContent = opt;
      if (defaultVal && opt === defaultVal) option.selected = true;
      select.appendChild(option);
    });
    return select;
  }

  // EquipmentType
  modalBody.appendChild(createLabel("Equipment Type"));
  const equipmentTypeSelect = createSelect(EQUIPMENT_TYPES, EQUIPMENT_TYPES[0]);
  modalBody.appendChild(equipmentTypeSelect);

  // Vendor
  modalBody.appendChild(createLabel("Vendor"));
  const vendorInput = createInput();

  modalBody.appendChild(vendorInput);

  // BrandModel
  modalBody.appendChild(createLabel("Brand/Model"));
  const brandInput = createInput();
  modalBody.appendChild(brandInput);

  // AssetNo
  modalBody.appendChild(createLabel("Asset No"));
  const assetInput = createInput();
  modalBody.appendChild(assetInput);

  // SerialNumber
  modalBody.appendChild(createLabel("Serial Number"));
  const serialInput = createInput();
  modalBody.appendChild(serialInput);

  // EndDate
  modalBody.appendChild(createLabel("End Date"));
  const endDateInput = createInput("date");
  modalBody.appendChild(endDateInput);

  // StartDate
  modalBody.appendChild(createLabel("Start Date"));
  const startDateInput = createInput("date");
  modalBody.appendChild(startDateInput);

  // Room
  modalBody.appendChild(createLabel("Room"));
  const roomInput = createInput();
  modalBody.appendChild(roomInput);

  // Fault description
  modalBody.appendChild(createLabel("Fault Description"));
  const faultInput = document.createElement("textarea");
  faultInput.className = "form-control";
  faultInput.rows = 3;
  modalBody.appendChild(faultInput);

  // Status select
  modalBody.appendChild(createLabel("Status"));
  const statusSelect = createSelect(STATUS_OPTIONS, "Open");
  modalBody.appendChild(statusSelect);

  // Show modal via Bootstrap
  const modal = new bootstrap.Modal(modalEl);
  modal.show();

  // Save button handler
  const saveBtn = modalEl.querySelector("#saveFaultBtn");
  saveBtn.onclick = () => {
    faultData.push({
      EquipmentType: equipmentTypeSelect.value,
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
    saveFaultData();
    renderTableRows();
    modal.hide();
  };
}

function searchFaultReports() {
  const filter = (document.getElementById("searchInput")?.value || "").toLowerCase();
  const tbody = document.querySelector("#fault-table tbody");
  if (!tbody) return;

  Array.from(tbody.rows).forEach(row => {
    const rowText = row.textContent.toLowerCase();
    row.style.display = rowText.includes(filter) ? "" : "none";
  });
}

function initFaultReport() {
  loadFaultData();
  renderEquipmentTypeFilter();
  renderTableRows();

  document.getElementById("addFaultBtn")?.addEventListener("click", showAddFaultModal);
  document.getElementById("searchInput")?.addEventListener("input", searchFaultReports);
}

document.addEventListener("DOMContentLoaded", initFaultReport);
