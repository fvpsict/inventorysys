// inventory.js

(() => {
  const STORAGE_KEY = "fvps_inventory_data";

  // Elements
  const tableBody = document.querySelector("#inventory-table tbody");
  const filterCategory = document.getElementById("filter-category");
  const searchInput = document.getElementById("search-inventory");
  const form = document.getElementById("inventory-form");

  // Form fields
  const equipmentTypeInput = form.elements["EquipmentType"];
  const equipmentInput = form.elements["Equipment"];
  const vendorInput = form.elements["Vendor"];
  const brandModelInput = form.elements["BrandModel"];
  const profileInput = form.elements["Profile"];
  const custodianInput = form.elements["Custodian"];
  const assetNoInput = form.elements["AssetNo"];
  const serialNumberInput = form.elements["SerialNumber"];
  const locationInput = form.elements["Location"];
  const endDateInput = form.elements["EndDate"];
  const startDateInput = form.elements["StartDate"];
  const hostnameInput = form.elements["Hostname"];
  const ssoePoNumberInput = form.elements["SSOE_PONumber"];
  const cartNoInput = form.elements["CartNo"];
  const sanitiseDateInput = form.elements["SanitiseDate"];
  const durationInUseInput = form.elements["DurationInUse"];
  const lampHourInput = form.elements["LampHour"];
  const dateUpdatedInput = form.elements["DateUpdated"];

  // Modal and current editing index
  let editingIndex = null;

  // Load inventory data from localStorage or empty array
  function loadInventory() {
    const dataJSON = localStorage.getItem(STORAGE_KEY);
    if (!dataJSON) return [];
    try {
      return JSON.parse(dataJSON);
    } catch {
      return [];
    }
  }

  // Save inventory data to localStorage
  function saveInventory(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Calculate duration between two dates as years and months string
  function calculateDuration(start, end) {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();

    if (endDate < startDate) return "";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    let parts = [];
    if (years > 0) parts.push(`${years} year${years > 1 ? "s" : ""}`);
    if (months > 0) parts.push(`${months} month${months > 1 ? "s" : ""}`);
    if (parts.length === 0) parts.push("Less than a month");

    return parts.join(" ");
  }

  // Format date as yyyy-mm-dd string or empty
  function formatDateInput(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toISOString().slice(0, 10);
  }

  // Format date for display (yyyy-mm-dd)
  function formatDateDisplay(dateStr) {
    return formatDateInput(dateStr);
  }

  // Format current date time string (yyyy-mm-dd HH:mm:ss)
  function currentDateTime() {
    const d = new Date();
    return d.toISOString().slice(0, 10) + " " + d.toTimeString().slice(0, 8);
  }

  // Clear form inputs
  function clearForm() {
    form.reset();
    durationInUseInput.value = "";
    dateUpdatedInput.value = "";
    editingIndex = null;
  }

  // Populate form inputs with given data object
  function fillForm(item) {
    equipmentTypeInput.value = item.EquipmentType || "";
    equipmentInput.value = item.Equipment || "";
    vendorInput.value = item.Vendor || "";
    brandModelInput.value = item.BrandModel || "";
    profileInput.value = item.Profile || "";
    custodianInput.value = item.Custodian || "";
    assetNoInput.value = item.AssetNo || "";
    serialNumberInput.value = item.SerialNumber || "";
    locationInput.value = item.Location || "";
    endDateInput.value = formatDateInput(item.EndDate);
    startDateInput.value = formatDateInput(item.StartDate);
    hostnameInput.value = item.Hostname || "";
    ssoePoNumberInput.value = item.SSOE_PONumber || "";
    cartNoInput.value = item.CartNo || "";
    sanitiseDateInput.value = formatDateInput(item.SanitiseDate);
    lampHourInput.value = item.LampHour || "";
    durationInUseInput.value = calculateDuration(item.StartDate, item.EndDate);
    dateUpdatedInput.value = item.DateUpdated || "";
  }

  // Render table rows based on filtered data
  function renderTable(data) {
    tableBody.innerHTML = "";

    if (!data.length) {
      tableBody.insertAdjacentHTML(
        "beforeend",
        `<tr><td colspan="19" class="text-center">No data found</td></tr>`
      );
      return;
    }

    data.forEach((item, idx) => {
      const duration = calculateDuration(item.StartDate, item.EndDate);
      const dateUpdated = item.DateUpdated || "";
      tableBody.insertAdjacentHTML(
        "beforeend",
        `<tr data-index="${idx}">
          <td>${item.EquipmentType || ""}</td>
          <td>${item.Equipment || ""}</td>
          <td>${item.Vendor || ""}</td>
          <td>${item.BrandModel || ""}</td>
          <td>${item.Profile || ""}</td>
          <td>${item.Custodian || ""}</td>
          <td>${item.AssetNo || ""}</td>
          <td>${item.SerialNumber || ""}</td>
          <td>${item.Location || ""}</td>
          <td>${formatDateDisplay(item.EndDate)}</td>
          <td>${formatDateDisplay(item.StartDate)}</td>
          <td>${item.Hostname || ""}</td>
          <td>${item.SSOE_PONumber || ""}</td>
          <td>${item.CartNo || ""}</td>
          <td>${formatDateDisplay(item.SanitiseDate)}</td>
          <td>${duration}</td>
          <td>${item.LampHour || ""}</td>
          <td>${dateUpdated}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-btn" title="Edit">✏️</button>
            <button class="btn btn-sm btn-danger delete-btn" title="Delete">🗑️</button>
          </td>
        </tr>`
      );
    });
  }

  // Filter and search data before rendering
  function filterAndRender() {
    const allData = loadInventory();

    const filterVal = filterCategory.value.toLowerCase();
    const searchVal = searchInput.value.trim().toLowerCase();

    const filtered = allData.filter((item) => {
      // Filter by category if not "all"
      if (filterVal !== "all" && item.EquipmentType?.toLowerCase() !== filterVal) {
        return false;
      }

      // Search all visible fields for searchVal
      if (!searchVal) return true;
      const searchableFields = [
        item.EquipmentType,
        item.Equipment,
        item.Vendor,
        item.BrandModel,
        item.Profile,
        item.Custodian,
        item.AssetNo,
        item.SerialNumber,
        item.Location,
        item.Hostname,
        item.SSOE_PONumber,
        item.CartNo,
      ];

      return searchableFields.some((field) =>
        field?.toString().toLowerCase().includes(searchVal)
      );
    });

    renderTable(filtered);
  }

  // Validate form, return true if valid else false
  function validateForm() {
    // Required: EquipmentType, if SSOE then Equipment required
    if (!equipmentTypeInput.value) {
      alert("Equipment Type is required.");
      equipmentTypeInput.focus();
      return false;
    }
    if (equipmentTypeInput.value === "SSOE" && !equipmentInput.value) {
      alert("Equipment is required when Equipment Type is SSOE.");
      equipmentInput.focus();
      return false;
    }

    // AssetNo unique check when adding or editing
    const data = loadInventory();
    const assetNo = assetNoInput.value.trim();
    if (!assetNo) {
      alert("Asset No is required.");
      assetNoInput.focus();
      return false;
    }
    // Check uniqueness except when editing same item
    const duplicate = data.find((item, idx) => {
      if (editingIndex !== null && idx === editingIndex) return false;
      return item.AssetNo.trim().toLowerCase() === assetNo.toLowerCase();
    });
    if (duplicate) {
      alert(`Asset No "${assetNo}" already exists.`);
      assetNoInput.focus();
      return false;
    }

    // Add more validations as needed...

    return true;
  }

  // Handle form submit (save or update)
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    const data = loadInventory();

    // Build item object from form values
    const item = {
      EquipmentType: equipmentTypeInput.value,
      Equipment: equipmentInput.value,
      Vendor: vendorInput.value,
      BrandModel: brandModelInput.value,
      Profile: profileInput.value,
      Custodian: custodianInput.value,
      AssetNo: assetNoInput.value.trim(),
      SerialNumber: serialNumberInput.value,
      Location: locationInput.value,
      EndDate: endDateInput.value,
      StartDate: startDateInput.value,
      Hostname: hostnameInput.value,
      SSOE_PONumber: ssoePoNumberInput.value,
      CartNo: cartNoInput.value,
      SanitiseDate: sanitiseDateInput.value,
      LampHour: lampHourInput.value,
      DateUpdated: currentDateTime(),
    };

    // Calculate duration for display only (readonly)
    item.DurationInUse = calculateDuration(item.StartDate, item.EndDate);

    if (editingIndex !== null) {
      data[editingIndex] = item;
      editingIndex = null;
    } else {
      data.push(item);
    }

    saveInventory(data);
    filterAndRender();
    clearForm();

    // Hide modal
    const modalEl = document.getElementById("inventoryModal");
    const modal = bootstrap.Modal.getInstance(modalEl);
    if (modal) modal.hide();
  });

  // Handle Add Item button click
  document.getElementById("add-item-btn").addEventListener("click", () => {
    clearForm();
  });

  // Handle click on Edit/Delete buttons in table
  tableBody.addEventListener("click", (e) => {
    const tr = e.target.closest("tr");
    if (!tr) return;
    const idx = parseInt(tr.dataset.index, 10);
    const data = loadInventory();

    if (e.target.classList.contains("edit-btn")) {
      // Edit
      editingIndex = idx;
      fillForm(data[idx]);
      // Show modal
      const modalEl = document.getElementById("inventoryModal");
      const modal = new bootstrap.Modal(modalEl);
      modal.show();
    } else if (e.target.classList.contains("delete-btn")) {
      // Delete confirmation
      if (
        confirm(
          `Are you sure you want to delete Asset No: ${data[idx].AssetNo}?`
        )
      ) {
        data.splice(idx, 1);
        saveInventory(data);
        filterAndRender();
      }
    }
  });

  // Filter and search events
  filterCategory.addEventListener("change", filterAndRender);
  searchInput.addEventListener("input", filterAndRender);

  // Update duration in use dynamically when dates change in form
  function updateDuration() {
    durationInUseInput.value = calculateDuration(
      startDateInput.value,
      endDateInput.value
    );
  }
  startDateInput.addEventListener("change", updateDuration);
  endDateInput.addEventListener("change", updateDuration);

  // Initialize page
  filterAndRender();
})();
