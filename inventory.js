(() => {
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const inventoryForm = document.getElementById("inventory-form");
  const durationInput = document.getElementById("durationInUse");

  let inventoryData = [];
  let editIndex = null;

  // Calculate Duration In Use from start and end date (years + months)
  function calculateDurationInUse(startDateStr, endDateStr) {
    if (!startDateStr) return "";
    const startDate = new Date(startDateStr);
    const endDate = endDateStr ? new Date(endDateStr) : new Date();

    if (endDate < startDate) return "Invalid dates";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let result = "";
    if (years > 0) result += `${years} year${years > 1 ? "s" : ""}`;
    if (months > 0) {
      if (result) result += " ";
      result += `${months} month${months > 1 ? "s" : ""}`;
    }
    if (!result) result = "0 months";
    return result;
  }

  // Render inventory table rows
  function renderTable() {
    inventoryTableBody.innerHTML = "";
    inventoryData.forEach((item, i) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${item.equipmentType || ""}</td>
        <td>${item.vendor || ""}</td>
        <td>${item.brandModel || ""}</td>
        <td>${item.profile || ""}</td>
        <td>${item.custodian || ""}</td>
        <td>${item.assetNo || ""}</td>
        <td>${item.serialNumber || ""}</td>
        <td>${item.location || ""}</td>
        <td>${item.startDate || ""}</td>
        <td>${item.endDate || ""}</td>
        <td>${calculateDurationInUse(item.startDate, item.endDate)}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${i}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
        </td>
      `;
      inventoryTableBody.appendChild(tr);
    });
  }

  // Load inventory from localStorage
  function loadInventory() {
    const saved = localStorage.getItem("inventoryData");
    if (saved) {
      try {
        inventoryData = JSON.parse(saved);
      } catch {
        inventoryData = [];
      }
    } else {
      inventoryData = [];
    }
  }

  // Save inventory to localStorage
  function saveInventory() {
    localStorage.setItem("inventoryData", JSON.stringify(inventoryData));
  }

  // Clear and reset form
  function resetForm() {
    inventoryForm.reset();
    durationInput.value = "";
    editIndex = null;
  }

  // Populate form for editing
  function populateForm(item) {
    inventoryForm.equipmentType.value = item.equipmentType || "";
    inventoryForm.vendor.value = item.vendor || "";
    inventoryForm.brandModel.value = item.brandModel || "";
    inventoryForm.profile.value = item.profile || "";
    inventoryForm.custodian.value = item.custodian || "";
    inventoryForm.assetNo.value = item.assetNo || "";
    inventoryForm.serialNumber.value = item.serialNumber || "";
    inventoryForm.location.value = item.location || "";
    inventoryForm.startDate.value = item.startDate || "";
    inventoryForm.endDate.value = item.endDate || "";
    durationInput.value = calculateDurationInUse(item.startDate, item.endDate);
  }

  // Handle form input change for startDate/endDate to update duration in real time
  function onDateChange() {
    const startDate = inventoryForm.startDate.value;
    const endDate = inventoryForm.endDate.value;
    durationInput.value = calculateDurationInUse(startDate, endDate);
  }

  // Search/filter table rows
  function filterTable(searchText) {
    const lowerText = searchText.toLowerCase();
    inventoryTableBody.querySelectorAll("tr").forEach(tr => {
      const rowText = tr.textContent.toLowerCase();
      tr.style.display = rowText.includes(lowerText) ? "" : "none";
    });
  }

  // Init
  function init() {
    loadInventory();
    renderTable();

    // Add item button opens modal with empty form
    addItemBtn.addEventListener("click", () => {
      resetForm();
      inventoryModal.show();
    });

    // Edit buttons
    inventoryTableBody.addEventListener("click", e => {
      if (e.target.classList.contains("edit-btn")) {
        const idx = Number(e.target.dataset.index);
        if (!isNaN(idx)) {
          editIndex = idx;
          populateForm(inventoryData[idx]);
          inventoryModal.show();
        }
      } else if (e.target.classList.contains("delete-btn")) {
        const idx = Number(e.target.dataset.index);
        if (!isNaN(idx)) {
          if (confirm("Are you sure you want to delete this item?")) {
            inventoryData.splice(idx, 1);
            saveInventory();
            renderTable();
          }
        }
      }
    });

    // Update duration live on date change
    inventoryForm.startDate.addEventListener("change", onDateChange);
    inventoryForm.endDate.addEventListener("change", onDateChange);

    // Form submission (add or edit)
    inventoryForm.addEventListener("submit", e => {
      e.preventDefault();
      if (!inventoryForm.checkValidity()) {
        inventoryForm.reportValidity();
        return;
      }

      const formData = {
        equipmentType: inventoryForm.equipmentType.value.trim(),
        vendor: inventoryForm.vendor.value.trim(),
        brandModel: inventoryForm.brandModel.value.trim(),
        profile: inventoryForm.profile.value.trim(),
        custodian: inventoryForm.custodian.value.trim(),
        assetNo: inventoryForm.assetNo.value.trim(),
        serialNumber: inventoryForm.serialNumber.value.trim(),
        location: inventoryForm.location.value.trim(),
        startDate: inventoryForm.startDate.value,
        endDate: inventoryForm.endDate.value,
      };

      if (editIndex !== null) {
        inventoryData[editIndex] = formData;
      } else {
        inventoryData.push(formData);
      }

      saveInventory();
      renderTable();
      inventoryModal.hide();
    });

    // Search input
    document.getElementById("search-inventory").addEventListener("input", e => {
      filterTable(e.target.value);
    });
  }

  // Run init on DOM ready
  document.addEventListener("DOMContentLoaded", init);
})();
