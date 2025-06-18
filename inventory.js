document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("inventory-form");
  const tableBody = document.querySelector("#inventory-table tbody");
  const equipmentTypeField = form.EquipmentType;
  const equipmentField = form.Equipment;
  const searchInput = document.getElementById("search-inventory");
  const filterSelect = document.getElementById("filter-equipmenttype");

  let editIndex = null;

  function saveData() {
    const rows = Array.from(tableBody.querySelectorAll("tr")).map(row => {
      return Array.from(row.children).slice(0, -1).map(td => td.textContent);
    });
    localStorage.setItem("inventoryData", JSON.stringify(rows));
  }

  function loadData() {
    const data = JSON.parse(localStorage.getItem("inventoryData") || "[]");
    data.forEach(row => addRowToTable(row));
  }

  function addRowToTable(data) {
    const tr = document.createElement("tr");
    data.forEach(cell => {
      const td = document.createElement("td");
      td.textContent = cell;
      tr.appendChild(td);
    });

    const actionsTd = document.createElement("td");
    actionsTd.innerHTML = `
      <button class="btn btn-sm btn-primary me-1 edit-btn">Edit</button>
      <button class="btn btn-sm btn-danger delete-btn">Delete</button>
    `;
    tr.appendChild(actionsTd);
    tableBody.appendChild(tr);
  }

  function calculateDuration(start, end) {
    if (!start || !end) return '';
    const startDate = new Date(start);
    const endDate = new Date(end);
    if (isNaN(startDate) || isNaN(endDate) || endDate < startDate) return '';
    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years}y ${months}m`;
  }

  function clearForm() {
    form.reset();
    document.getElementById("DateUpdated").value = '';
    equipmentField.disabled = true;
    editIndex = null;
  }

  function populateForm(row) {
    const cells = row.querySelectorAll("td");
    const fields = [
      "EquipmentType", "Equipment", "Vendor", "BrandModel", "Profile", "Custodian",
      "AssetNo", "SerialNumber", "Location", "StartDate", "EndDate", "Duration", "DateUpdated"
    ];
    fields.forEach((name, index) => {
      if (form[name]) form[name].value = cells[index].textContent;
    });
    document.getElementById("DateUpdated").value = new Date().toISOString().split("T")[0];
  }

  function renderTable(data) {
    tableBody.innerHTML = '';
    data.forEach(row => addRowToTable(row));
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const rowData = [
      form.EquipmentType.value,
      form.Equipment.value || '',
      form.Vendor.value,
      form.BrandModel.value,
      form.Profile.value,
      form.Custodian.value,
      form.AssetNo.value,
      form.SerialNumber.value,
      form.Location.value,
      form.StartDate.value,
      form.EndDate.value,
      calculateDuration(form.StartDate.value, form.EndDate.value),
      new Date().toISOString().split("T")[0] // DateUpdated
    ];

    if (editIndex !== null) {
      const rows = tableBody.querySelectorAll("tr");
      const tr = rows[editIndex];
      rowData.forEach((cell, i) => {
        tr.children[i].textContent = cell;
      });
      editIndex = null;
    } else {
      addRowToTable(rowData);
    }

    saveData();
    clearForm();
    bootstrap.Modal.getInstance(document.getElementById("inventoryModal")).hide();
  });

  tableBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    const index = Array.from(tableBody.children).indexOf(tr);

    if (e.target.classList.contains("edit-btn")) {
      populateForm(tr);
      editIndex = index;
      bootstrap.Modal.getOrCreateInstance(document.getElementById("inventoryModal")).show();
    }

    if (e.target.classList.contains("delete-btn")) {
      if (confirm("Are you sure you want to delete this item?")) {
        tr.remove();
        saveData();
      }
    }
  });

  equipmentTypeField.addEventListener("change", () => {
    if (equipmentTypeField.value === "SSOE") {
      equipmentField.disabled = false;
      equipmentField.required = true;
    } else {
      equipmentField.disabled = true;
      equipmentField.required = false;
      equipmentField.value = "";
    }
  });

  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const text = row.textContent.toLowerCase();
      row.style.display = text.includes(query) ? "" : "none";
    });
  });

  filterSelect.addEventListener("change", () => {
    const selected = filterSelect.value;
    const rows = tableBody.querySelectorAll("tr");
    rows.forEach(row => {
      const type = row.children[0]?.textContent;
      row.style.display = selected === "all" || type === selected ? "" : "none";
    });
  });

  loadData();
});
