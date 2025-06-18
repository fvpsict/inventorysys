// inventory.js

document.addEventListener("DOMContentLoaded", () => {
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const inventoryForm = document.getElementById("inventory-form");
  const tableBody = document.querySelector("#inventory-table tbody");

  // Form fields
  const equipmentTypeInput = document.getElementById("equipmentType");
  const equipmentInput = document.getElementById("equipment");
  const equipmentRequiredStar = document.getElementById("equipment-required-star");
  const vendorInput = document.getElementById("vendor");
  const brandModelInput = document.getElementById("brandModel");
  const profileInput = document.getElementById("profile");
  const custodianInput = document.getElementById("custodian");
  const assetNoInput = document.getElementById("assetNo");
  const serialNumberInput = document.getElementById("serialNumber");
  const locationInput = document.getElementById("location");
  const endDateInput = document.getElementById("endDate");
  const startDateInput = document.getElementById("startDate");
  const hostnameInput = document.getElementById("hostname");
  const ssoePoNumberInput = document.getElementById("ssoePoNumber");
  const cartNoInput = document.getElementById("cartNo");
  const sanitiseDateInput = document.getElementById("sanitiseDate");
  const durationInUseInput = document.getElementById("durationInUse");
  const lampHourInput = document.getElementById("lampHour");
  const dateUpdatedInput = document.getElementById("dateUpdated");

  let inventoryData = [];
  let editIndex = null; // null means adding new, otherwise editing existing item

  // Utility: Calculate duration between two dates in years and months
  function calculateDuration(startDateStr) {
    if (!startDateStr) return "";
    const startDate = new Date(startDateStr);
    const today = new Date();
    if (startDate > today) return "";

    let years = today.getFullYear() - startDate.getFullYear();
    let months = today.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return "";

    let result = "";
    if (years > 0) result += years + " year" + (years > 1 ? "s" : "");
    if (months > 0) {
      if (result) result += " ";
      result += months + " month" + (months > 1 ? "s" : "");
    }
    if (!result) result = "Less than a month";
    return result;
  }

  // Render inventory table rows
  function renderTable() {
    tableBody.innerHTML = "";
    inventoryData.forEach((item, index) => {
      const row = document.createElement("tr");

      // Create cells in the order of table headers
      [
        item.EquipmentType,
        item.Equipment,
        item.Vendor,
        item.BrandModel,
        item.Profile,
        item.Custodian,
        item.AssetNo,
        item.SerialNumber,
        item.Location,
        item.EndDate,
        item.StartDate,
        item.Hostname,
        item.SSOE_PoNumber,
        item.CartNo,
        item.SanitiseDate,
        item.DurationInUse,
        item.LampHour,
        item.DateUpdated,
      ].forEach((val) => {
        const td = document.createElement("td");
        td.textContent = val || "";
        row.appendChild(td);
      });

      // Actions cell with Edit and Delete buttons
      const actionTd = document.createElement("td");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-2";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => {
        openEditModal(index);
      });
      actionTd.appendChild(editBtn);

      // Delete button
      const deleteBtn = document.createElement("button");
      deleteBtn.className = "btn btn-sm btn-danger";
      deleteBtn.textContent = "Delete";
      deleteBtn.addEventListener("click", () => {
        if (confirm("Are you sure you want to delete this item?")) {
          inventoryData.splice(index, 1);
          renderTable();
        }
      });
      actionTd.appendChild(deleteBtn);

      row.appendChild(actionTd);

      tableBody.appendChild(row);
    });
  }

  // Clear form inputs
  function clearForm() {
    inventoryForm.reset();
    durationInUseInput.value = "";
    dateUpdatedInput.value = "";
    editIndex = null;
    equipmentRequiredStar.classList.add("d-none");
  }

  // Open modal for adding new item
  function openAddModal() {
    clearForm();
    inventoryModal.show();
  }

  // Open modal for editing existing item
  function openEditModal(index) {
    const item = inventoryData[index];
    editIndex = index;

    equipmentTypeInput.value = item.EquipmentType || "";
    equipmentInput.value = item.Equipment || "";
    vendorInput.value = item.Vendor || "";
    brandModelInput.value = item.BrandModel || "";
    profileInput.value = item.Profile || "";
    custodianInput.value = item.Custodian || "";
    assetNoInput.value = item.AssetNo || "";
    serialNumberInput.value = item.SerialNumber || "";
    locationInput.value = item.Location || "";
    endDateInput.value = item.EndDate || "";
    startDateInput.value = item.StartDate || "";
    hostnameInput.value = item.Hostname || "";
    ssoePoNumberInput.value = item.SSOE_PoNumber || "";
    cartNoInput.value = item.CartNo || "";
    sanitiseDateInput.value = item.SanitiseDate || "";
    durationInUseInput.value = item.DurationInUse || "";
    lampHourInput.value = item.LampHour || "";
    dateUpdatedInput.value = item.DateUpdated || "";

    // Show or hide Equipment required star
    toggleEquipmentRequiredStar();

    inventoryModal.show();
  }

  // Show or hide Equipment required star depending on EquipmentType
  function toggleEquipmentRequiredStar() {
    if (equipmentTypeInput.value === "SSOE") {
      equipmentRequiredStar.classList.remove("d-none");
      equipmentInput.setAttribute("required", "required");
    } else {
      equipmentRequiredStar.classList.add("d-none");
      equipmentInput.removeAttribute("required");
    }
  }

  // Update Duration In Use on Start Date change
  startDateInput.addEventListener("change", () => {
    durationInUseInput.value = calculateDuration(startDateInput.value);
  });

  // Update star visibility when EquipmentType changes
  equipmentTypeInput.addEventListener("change", toggleEquipmentRequiredStar);

  // Handle Add Item button click
  addItemBtn.addEventListener("click", openAddModal);

  // Handle form submit
  inventoryForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate form, required fields
    if (!equipmentTypeInput.value) {
      alert("Equipment Type is required.");
      return;
    }

    if (equipmentTypeInput.value === "SSOE" && !equipmentInput.value) {
      alert("Equipment is required when Equipment Type is SSOE.");
      return;
    }

    // Prepare item object
    const todayStr = new Date().toISOString().split("T")[0]; // yyyy-mm-dd

    const item = {
      EquipmentType: equipmentTypeInput.value.trim(),
      Equipment: equipmentInput.value.trim(),
      Vendor: vendorInput.value.trim(),
      BrandModel: brandModelInput.value.trim(),
      Profile: profileInput.value.trim(),
      Custodian: custodianInput.value.trim(),
      AssetNo: assetNoInput.value.trim(),
      SerialNumber: serialNumberInput.value.trim(),
      Location: locationInput.value.trim(),
      EndDate: endDateInput.value,
      StartDate: startDateInput.value,
      Hostname: hostnameInput.value.trim(),
      SSOE_PoNumber: ssoePoNumberInput.value.trim(),
      CartNo: cartNoInput.value.trim(),
      SanitiseDate: sanitiseDateInput.value,
      DurationInUse: calculateDuration(startDateInput.value),
      LampHour: lampHourInput.value ? lampHourInput.value.trim() : "",
      DateUpdated: todayStr,
    };

    if (editIndex === null) {
      // Add new item
      inventoryData.push(item);
    } else {
      // Update existing item
      inventoryData[editIndex] = item;
    }

    inventoryModal.hide();
    renderTable();
  });

  // Initialize star visibility on load
  toggleEquipmentRequiredStar();

  // Initial render empty table
  renderTable();
});
