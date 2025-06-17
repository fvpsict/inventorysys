document.addEventListener("DOMContentLoaded", () => {
  const faultTableBody = document.querySelector("#fault-table tbody");
  const addFaultBtn = document.getElementById("add-fault-btn");
  const faultModalEl = document.getElementById("faultModal");
  const faultModal = new bootstrap.Modal(faultModalEl);
  const faultForm = document.getElementById("fault-modal-form");

  const filterEquipmentType = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-fault");

  const STORAGE_KEY = "faultReports";
  let faultReports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  let editIndex = null;

  function formatDateISO(date) {
    const d = new Date(date);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  }

  function renderTable() {
    const filterVal = filterEquipmentType.value.toLowerCase();
    const searchVal = searchInput.value.toLowerCase();
    faultTableBody.innerHTML = "";

    faultReports.forEach((item, index) => {
      if (filterVal !== "all" && filterVal !== "") {
        if (!item.EquipmentType || item.EquipmentType.toLowerCase() !== filterVal) return;
      }

      const searchableFields = Object.values(item).map((field) =>
        field ? field.toLowerCase?.() ?? field : ""
      );
      if (!searchableFields.some((f) => f.includes(searchVal))) return;

      const tr = document.createElement("tr");
      const fields = [
        "DateReported",
        "EquipmentType",
        "Equipment",
        "AssetNo",
        "BrandModel",
        "SerialNumber",
        "Location",
        "RoomNumber",
        "FaultDescription",
        "Status",
        "DateUpdated"
      ];

      fields.forEach((field) => {
        const td = document.createElement("td");
        td.textContent = item[field] || "";
        tr.appendChild(td);
      });

      const tdActions = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-2";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => openEditModal(index);
      tdActions.appendChild(editBtn);

      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger";
      delBtn.textContent = "Delete";
      delBtn.onclick = () => {
        if (confirm("Are you sure you want to delete this fault report?")) {
          faultReports.splice(index, 1);
          saveAndRender();
        }
      };
      tdActions.appendChild(delBtn);
      tr.appendChild(tdActions);

      faultTableBody.appendChild(tr);
    });
  }

  function saveAndRender() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(faultReports));
    renderTable();
  }

  function clearForm() {
    faultForm.reset();
    faultForm.DateUpdated.value = "";
    editIndex = null;
  }

  function openEditModal(index) {
    const item = faultReports[index];
    editIndex = index;

    for (const key in item) {
      if (faultForm[key]) faultForm[key].value = item[key];
    }

    faultModal.show();
  }

  addFaultBtn.onclick = () => {
    clearForm();
    faultModal.show();
  };

  faultForm.onsubmit = (e) => {
    e.preventDefault();

    const requiredFields = ["DateReported", "EquipmentType", "FaultDescription", "Status"];
    for (const field of requiredFields) {
      if (!faultForm[field].value.trim()) {
        alert(`${field.replace(/([A-Z])/g, " $1")} is required.`);
        return;
      }
    }

    const data = {};
    [...faultForm.elements].forEach((el) => {
      if (el.name) data[el.name] = el.value.trim();
    });

    data.DateUpdated = formatDateISO(new Date());

    if (editIndex === null) {
      faultReports.push(data);
    } else {
      faultReports[editIndex] = data;
    }

    saveAndRender();
    faultModal.hide();
  };

  filterEquipmentType.onchange = renderTable;

  let searchTimeout;
  searchInput.oninput = () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderTable, 200);
  };

  renderTable();
});
