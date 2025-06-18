document.addEventListener("DOMContentLoaded", () => {
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const modal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-modal-form");

  let inventoryItems = [];

  // Utility: format date as "DD Month YYYY"
  function formatDate(date) {
    const options = { day: "numeric", month: "long", year: "numeric" };
    return new Date(date).toLocaleDateString("en-GB", options);
  }

  // Utility: calculate duration from StartDate to today
  function calculateDuration(startDateStr) {
    if (!startDateStr) return "";
    const start = new Date(startDateStr);
    const today = new Date();
    let years = today.getFullYear() - start.getFullYear();
    let months = today.getMonth() - start.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return "";

    let result = "";
    if (years > 0) result += `${years} year${years > 1 ? "s" : ""} `;
    if (months > 0) result += `${months} month${months > 1 ? "s" : ""}`;
    return result.trim();
  }

  // Add or update inventory row
  function upsertItem(item) {
    const index = inventoryItems.findIndex(i => i.AssetNo === item.AssetNo);
    if (index >= 0) {
      inventoryItems[index] = item;
    } else {
      inventoryItems.push(item);
    }
  }

  // Render table rows
  function refreshTable() {
    inventoryTableBody.innerHTML = "";
    inventoryItems.forEach(item => {
      const tr = document.createElement("tr");

      const headers = [
        "EquipmentType", "Vendor", "BrandModel", "Profile", "Custodian",
        "AssetNo", "SerialNumber", "Location", "EndDate", "StartDate", "Hostname",
        "SSOE PO Number", "Cart No", "SanitiseDate", "DurationInUse",
        "Lamp Hour", "DateUpdated", "Equipment"
      ];

      headers.forEach(header => {
        const td = document.createElement("td");
        if (header === "DurationInUse") {
          td.textContent = calculateDuration(item.StartDate);
        } else {
          td.textContent = item[header] || "";
        }
        tr.appendChild(td);
      });

      const tdAction = document.createElement("td");
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-2";
      editBtn.textContent = "Edit";
      editBtn.onclick = () => {
        for (const [key, value] of Object.entries(item)) {
          const input = form.elements[key];
          if (input) input.value = value;
        }
        form.dataset.editingAssetNo = item.AssetNo;
        modal.show();
      };

      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.onclick = () => {
        if (confirm("Delete this item?")) {
          inventoryItems = inventoryItems.filter(i => i.AssetNo !== item.AssetNo);
          refreshTable();
        }
      };

      tdAction.appendChild(editBtn);
      tdAction.appendChild(deleteBtn);
      tr.appendChild(tdAction);

      inventoryTableBody.appendChild(tr);
    });
  }

  // Handle form submission
  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);
    const item = {};
    formData.forEach((val, key) => {
      item[key] = val;
    });

    item.DateUpdated = formatDate(new Date());
    item.DurationInUse = calculateDuration(item.StartDate);

    upsertItem(item);
    refreshTable();
    modal.hide();
    form.reset();
    delete form.dataset.editingAssetNo;
  });

  // Clear form on modal close
  document.getElementById("inventoryModal").addEventListener("hidden.bs.modal", () => {
    form.reset();
    delete form.dataset.editingAssetNo;
  });

  // Add Item button
  document.getElementById("add-item-btn").addEventListener("click", () => {
    form.reset();
    delete form.dataset.editingAssetNo;
    modal.show();
  });

  // Equipment dropdown setup (in case you want to dynamically populate later)
  const equipmentField = form.querySelector('[name="Equipment"]');
  if (equipmentField && equipmentField.options.length === 0) {
    ["", "Desktop", "Laptop", "iPad", "Mobile Cart"].forEach(type => {
      const opt = document.createElement("option");
      opt.value = type;
      opt.textContent = type;
      equipmentField.appendChild(opt);
    });
  }
});
