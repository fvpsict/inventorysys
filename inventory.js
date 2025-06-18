document.addEventListener("DOMContentLoaded", () => {
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-modal-form");

  // Calculate Duration in Use (years and months) from StartDate to today
  function calculateDuration(startDateStr) {
    if (!startDateStr) return "";
    const startDate = new Date(startDateStr);
    const today = new Date();

    let years = today.getFullYear() - startDate.getFullYear();
    let months = today.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return ""; // future start date

    let result = "";
    if (years > 0) result += years + (years === 1 ? " year " : " years ");
    if (months > 0) result += months + (months === 1 ? " month" : " months");

    return result.trim();
  }

  // Render a single inventory item as a table row
  function createTableRow(item) {
    const tr = document.createElement("tr");

    [
      "EquipmentType",
      "Vendor",
      "BrandModel",
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
      "DurationInUse",
      "Lamp Hour",
      "DateUpdated",
    ].forEach((key) => {
      const td = document.createElement("td");

      if (key === "DurationInUse") {
        td.textContent = calculateDuration(item.StartDate);
      } else {
        td.textContent = item[key] || "";
      }

      tr.appendChild(td);
    });

    // Actions cell
    const actionTd = document.createElement("td");

    // Edit button
    const editBtn = document.createElement("button");
    editBtn.className = "btn btn-sm btn-primary me-2";
    editBtn.textContent = "Edit";
    editBtn.addEventListener("click", () => {
      Object.entries(item).forEach(([key, value]) => {
        const input = form.elements[key];
        if (input) input.value = value;
      });
      form.dataset.editingAssetNo = item.AssetNo;
      modal.show();
    });

    // Delete button
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "btn btn-sm btn-danger";
    deleteBtn.textContent = "Delete";
    deleteBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to delete this item?")) {
        tr.remove();
        inventoryItems = inventoryItems.filter((i) => i.AssetNo !== item.AssetNo);
      }
    });

    actionTd.appendChild(editBtn);
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);

    return tr;
  }

  // In-memory array to hold inventory items
  let inventoryItems = [];

  // Add or update item in inventoryItems
  function upsertItem(item) {
    const index = inventoryItems.findIndex((i) => i.AssetNo === item.AssetNo);
    if (index >= 0) {
      inventoryItems[index] = item;
    } else {
      inventoryItems.push(item);
    }
  }

  // Refresh the table with current inventoryItems
  function refreshTable() {
    inventoryTableBody.innerHTML = "";
    inventoryItems.forEach((item) => {
      inventoryTableBody.appendChild(createTableRow(item));
    });
  }

  // Form submit handler
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    const formData = new FormData(form);
    const item = {};
    formData.forEach((value, key) => {
      item[key] = value;
    });

    item.DateUpdated = new Date().toLocaleDateString();

    upsertItem(item);
    refreshTable();
    modal.hide();
    form.reset();
    delete form.dataset.editingAssetNo;
  });

  // Clear form on modal hide
  document
    .getElementById("inventoryModal")
    .addEventListener("hidden.bs.modal", () => {
      form.reset();
      delete form.dataset.editingAssetNo;
    });
});
