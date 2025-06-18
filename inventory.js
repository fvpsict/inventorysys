document.addEventListener("DOMContentLoaded", () => {
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const inventoryForm = document.getElementById("inventory-form");
  const tableBody = document.querySelector("#inventory-table tbody");

  const equipmentTypeSelect = document.getElementById("equipmentType");
  const equipmentSelect = document.getElementById("equipmentField");

  let editIndex = -1; // tracks edit row index, -1 = new entry

  // Load inventory from localStorage or empty
  let inventoryData = JSON.parse(localStorage.getItem("inventoryData") || "[]");
  renderTable();

  // Show modal to add new item
  addItemBtn.addEventListener("click", () => {
    editIndex = -1;
    clearForm();
    inventoryModal.show();
  });

  // When EquipmentType changes, toggle Equipment required
  equipmentTypeSelect.addEventListener("change", () => {
    if (equipmentTypeSelect.value === "SSOE") {
      equipmentSelect.setAttribute("required", "required");
    } else {
      equipmentSelect.removeAttribute("required");
      equipmentSelect.classList.remove("is-invalid");
    }
  });

  // Clear form fields
  function clearForm() {
    inventoryForm.reset();
    equipmentSelect.removeAttribute("required");
    equipmentSelect.classList.remove("is-invalid");

    // Clear validation states
    inventoryForm.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));

    // Set Date Updated to today
    const dateUpdatedInput = document.getElementById("dateUpdated");
    dateUpdatedInput.value = formatDate(new Date());
  }

  // Format date as dd MMM yyyy (e.g. 17 Jun 2025)
  function formatDate(date) {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return date.toLocaleDateString(undefined, options);
  }

  // Render table from inventoryData
  function renderTable() {
    tableBody.innerHTML = "";

    inventoryData.forEach((item, index) => {
      const tr = document.createElement("tr");

      tr.innerHTML = `
        <td>${item.EquipmentType || ""}</td>
        <td>${item.Equipment || ""}</td>
        <td>${item.Vendor || ""}</td>
        <td>${item.BrandModel || ""}</td>
        <td>${item.Profile || ""}</td>
        <td>${item.Custodian || ""}</td>
        <td>${item.AssetNo || ""}</td>
        <td>${item.SerialNumber || ""}</td>
        <td>${item.Location || ""}</td>
        <td>${item.EndDate || ""}</td>
        <td>${item.StartDate || ""}</td>
        <td>${item.Hostname || ""}</td>
        <td>${item.SSOE_PONumber || ""}</td>
        <td>${item.CartNo || ""}</td>
        <td>${item.SanitiseDate || ""}</td>
        <td>${item.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary btn-edit" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger btn-delete" data-index="${index}">Delete</button>
        </td>
      `;

      tableBody.appendChild(tr);
    });

    // Attach edit/delete listeners
    document.querySelectorAll(".btn-edit").forEach(btn =>
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        editItem(idx);
      })
    );

    document.querySelectorAll(".btn-delete").forEach(btn =>
      btn.addEventListener("click", (e) => {
        const idx = e.target.dataset.index;
        deleteItem(idx);
      })
    );
  }

  // Edit item by index
  function editItem(index) {
    editIndex = index;
    const item = inventoryData[index];
    clearForm();

    // Populate form fields
    inventoryForm.elements["EquipmentType"].value = item.EquipmentType || "";
    inventoryForm.elements["Equipment"].value = item.Equipment || "";
    inventoryForm.elements["Vendor"].value = item.Vendor || "";
    inventoryForm.elements["BrandModel"].value = item.BrandModel || "";
    inventoryForm.elements["Profile"].value = item.Profile || "";
    inventoryForm.elements["Custodian"].value = item.Custodian || "";
    inventoryForm.elements["AssetNo"].value = item.AssetNo || "";
    inventoryForm.elements["SerialNumber"].value = item.SerialNumber || "";
    inventoryForm.elements["Location"].value = item.Location || "";
    inventoryForm.elements["EndDate"].value = item.EndDate || "";
    inventoryForm.elements["StartDate"].value = item.StartDate || "";
    inventoryForm.elements["Hostname"].value = item.Hostname || "";
    inventoryForm.elements["SSOE_PONumber"].value = item.SSOE_PONumber || "";
    inventoryForm.elements["CartNo"].value = item.CartNo || "";
    inventoryForm.elements["SanitiseDate"].value = item.SanitiseDate || "";
    inventoryForm.elements["DateUpdated"].value = item.DateUpdated || "";

    // Adjust Equipment required
    if (item.EquipmentType === "SSOE") {
      equipmentSelect.setAttribute("required", "required");
    } else {
      equipmentSelect.removeAttribute("required");
    }

    inventoryModal.show();
  }

  // Delete item
  function deleteItem(index) {
    if (confirm("Are you sure you want to delete this item?")) {
      inventoryData.splice(index, 1);
      saveData();
      renderTable();
    }
  }

  // Save data to localStorage
  function saveData() {
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
  }

  // Form submit handler
  inventoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Reset validation states
    inventoryForm.querySelectorAll(".is-invalid").forEach(el => el.classList.remove("is-invalid"));

    // Check Equipment required when EquipmentType = SSOE
    if (equipmentTypeSelect.value === "SSOE" && !equipmentSelect.value) {
      equipmentSelect.classList.add("is-invalid");
      equipmentSelect.focus();
      return;
    }

    // Check other HTML5 validations
    if (!inventoryForm.checkValidity()) {
      // Show invalid fields
      [...inventoryForm.elements].forEach(el => {
        if (el.checkValidity() === false) {
          el.classList.add("is-invalid");
        }
      });
      return;
    }

    // Gather form data
    const formData = {
      EquipmentType: inventoryForm.elements["EquipmentType"].value,
      Equipment: inventoryForm.elements["Equipment"].value,
      Vendor: inventoryForm.elements["Vendor"].value,
      BrandModel: inventoryForm.elements["BrandModel"].value,
      Profile: inventoryForm.elements["Profile"].value,
      Custodian: inventoryForm.elements["Custodian"].value,
      AssetNo: inventoryForm.elements["AssetNo"].value,
      SerialNumber: inventoryForm.elements["SerialNumber"].value,
      Location: inventoryForm.elements["Location"].value,
      EndDate: inventoryForm.elements["EndDate"].value,
      StartDate: inventoryForm.elements["StartDate"].value,
      Hostname: inventoryForm.elements["Hostname"].value,
      SSOE_PONumber: inventoryForm.elements["SSOE_PONumber"].value,
      CartNo: inventoryForm.elements["CartNo"].value,
      SanitiseDate: inventoryForm.elements["SanitiseDate"].value,
      DateUpdated: formatDate(new Date())
    };

    if (editIndex === -1) {
      // New item
      inventoryData.push(formData);
    } else {
      // Update existing
      inventoryData[editIndex] = formData;
    }

    saveData();
    renderTable();
    inventoryModal.hide();
  });
});
