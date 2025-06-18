document.addEventListener("DOMContentLoaded", () => {
  const inventoryTable = document.getElementById("inventory-table").querySelector("tbody");
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-modal-form");
  let editingRow = null;

  // Load existing inventory from localStorage
  const loadInventory = () => {
    const data = JSON.parse(localStorage.getItem("inventoryData") || "[]");
    data.forEach(item => addRow(item));
  };

  // Save inventory data to localStorage
  const saveInventory = () => {
    const rows = [...inventoryTable.rows].map(row => {
      const cells = row.querySelectorAll("td");
      return {
        EquipmentType: cells[0].textContent,
        Vendor: cells[1].textContent,
        BrandModel: cells[2].textContent,
        Profile: cells[3].textContent,
        Custodian: cells[4].textContent,
        AssetNo: cells[5].textContent,
        SerialNumber: cells[6].textContent,
        Location: cells[7].textContent,
        EndDate: cells[8].textContent,
        StartDate: cells[9].textContent,
        Hostname: cells[10].textContent,
        ["SSOE PO Number"]: cells[11].textContent,
        ["Cart No"]: cells[12].textContent,
        SanitiseDate: cells[13].textContent,
        DurationInUse: cells[14].textContent,
        ["Lamp Hour"]: cells[15].textContent,
        DateUpdated: cells[16].textContent,
      };
    });
    localStorage.setItem("inventoryData", JSON.stringify(rows));
  };

  // Calculate Duration in use
  const calculateDuration = (startDateStr) => {
    if (!startDateStr) return "";
    const start = new Date(startDateStr);
    const now = new Date();
    let years = now.getFullYear() - start.getFullYear();
    let months = now.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    return `${years} yr ${months} mth`;
  };

  // Add a row to the table
  const addRow = (item) => {
    const row = inventoryTable.insertRow();
    const fields = [
      "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
      "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
      "SSOE PO Number", "Cart No", "SanitiseDate", "DurationInUse", "Lamp Hour", "DateUpdated"
    ];
    fields.forEach(field => {
      const cell = row.insertCell();
      cell.textContent = item[field] || "";
    });

    // Actions column
    const actionCell = row.insertCell();
    const editBtn = document.createElement("button");
    editBtn.textContent = "Edit";
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.onclick = () => editItem(row);
    const deleteBtn = document.createElement("button");
    deleteBtn.textContent = "Delete";
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.onclick = () => {
      if (confirm("Delete this item?")) {
        row.remove();
        saveInventory();
      }
    };
    actionCell.appendChild(editBtn);
    actionCell.appendChild(deleteBtn);
  };

  // Populate form with row data for editing
  const editItem = (row) => {
    editingRow = row;
    const cells = row.querySelectorAll("td");
    const formData = [
      "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
      "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
      "SSOE PO Number", "Cart No", "SanitiseDate", "Lamp Hour", "DateUpdated"
    ];
    formData.forEach((field, i) => {
      const input = form[field];
      if (input) input.value = cells[i].textContent;
    });
    inventoryModal.show();
  };

  // Open modal to add new item
  addItemBtn.addEventListener("click", () => {
    editingRow = null;
    form.reset();
    form["DateUpdated"].value = new Date().toLocaleDateString();
    inventoryModal.show();
  });

  // Submit modal form
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const startDate = form["StartDate"].value;
    const duration = calculateDuration(startDate);
    const updatedDate = new Date().toLocaleDateString();

    const item = {
      EquipmentType: form["EquipmentType"].value,
      Vendor: form["Vendor"].value,
      BrandModel: form["BrandModel"].value,
      Profile: form["Profile"].value,
      Custodian: form["Custodian"].value,
      AssetNo: form["AssetNo"].value,
      SerialNumber: form["SerialNumber"].value,
      Location: form["Location"].value,
      EndDate: form["EndDate"].value,
      StartDate: startDate,
      Hostname: form["Hostname"].value,
      ["SSOE PO Number"]: form["SSOE PO Number"].value,
      ["Cart No"]: form["Cart No"].value,
      SanitiseDate: form["SanitiseDate"].value,
      ["Lamp Hour"]: form["Lamp Hour"].value,
      DurationInUse: duration,
      DateUpdated: updatedDate
    };

    if (editingRow) {
      // Update existing row
      const cells = editingRow.querySelectorAll("td");
      const values = [
        "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian", "AssetNo",
        "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
        "SSOE PO Number", "Cart No", "SanitiseDate", "DurationInUse", "Lamp Hour", "DateUpdated"
      ];
      values.forEach((field, i) => {
        cells[i].textContent = item[field];
      });
    } else {
      addRow(item);
    }

    saveInventory();
    inventoryModal.hide();
  });

  // Filter by EquipmentType
  document.getElementById("filter-equipmenttype").addEventListener("change", function () {
    const selected = this.value.toLowerCase();
    [...inventoryTable.rows].forEach(row => {
      const type = row.cells[0].textContent.toLowerCase();
      row.style.display = (selected === "all" || type === selected) ? "" : "none";
    });
  });

  // Search box
  document.getElementById("search-inventory").addEventListener("input", function () {
    const search = this.value.toLowerCase();
    [...inventoryTable.rows].forEach(row => {
      const match = [...row.cells].some(cell => cell.textContent.toLowerCase().includes(search));
      row.style.display = match ? "" : "none";
    });
  });

  loadInventory();
});
