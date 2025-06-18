(() => {
  const STORAGE_KEY = "fvps_inventory_data";

  const tableBody = document.querySelector("#inventory-table tbody");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");
  const addItemBtn = document.getElementById("add-item-btn");
  const inventoryModal = new bootstrap.Modal(document.getElementById("inventoryModal"));
  const form = document.getElementById("inventory-modal-form");

  // Current editing index (null = adding new)
  let editIndex = null;

  // Load data from localStorage or empty array
  function loadData() {
    const raw = localStorage.getItem(STORAGE_KEY);
    try {
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  // Save data array to localStorage
  function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Calculate duration in use (years and months) from StartDate and EndDate
  // EndDate can be empty = today
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
    const yearPart = years > 0 ? years + (years === 1 ? " yr " : " yrs ") : "";
    const monthPart = months > 0 ? months + (months === 1 ? " mo" : " mos") : "";
    return (yearPart + monthPart).trim() || "<1 mo";
  }

  // Render the entire table based on data array, filter, and search
  function renderTable() {
    const data = loadData();
    const filterVal = filterSelect.value.toLowerCase();
    const searchVal = searchInput.value.trim().toLowerCase();

    // Clear table first
    tableBody.innerHTML = "";

    // Filter and search data
    const filtered = data.filter((item) => {
      const matchesFilter = filterVal === "all" || (item.EquipmentType && item.EquipmentType.toLowerCase() === filterVal);
      if (!matchesFilter) return false;

      if (!searchVal) return true;

      // Search any field (case-insensitive)
      return Object.values(item).some((v) =>
        v && v.toString().toLowerCase().includes(searchVal)
      );
    });

    // Add rows to table
    filtered.forEach((item, index) => {
      const tr = document.createElement("tr");

      // Duration in use calculated live
      const duration = calculateDuration(item.StartDate, item.EndDate);

      tr.innerHTML = `
        <td>${item.EquipmentType || ""}</td>
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
        <td>${item["SSOE PO Number"] || ""}</td>
        <td>${item["Cart No"] || ""}</td>
        <td>${item.SanitiseDate || ""}</td>
        <td>${duration}</td>
        <td>${item["Lamp Hour"] || ""}</td>
        <td>${item.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${index}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${index}">Delete</button>
        </td>
      `;
      tableBody.appendChild(tr);
    });
  }

  // Populate modal form with item data for editing
  function populateForm(item) {
    // Clear previous errors if any
    form.reset();
    for (const [key, value] of Object.entries(item)) {
      const input = form.elements[key];
      if (input) input.value = value || "";
    }
  }

  // Get form data as an object
  function getFormData() {
    const formData = {};
    for (const element of form.elements) {
      if (!element.name) continue;
      formData[element.name] = element.value.trim();
    }
    return formData;
  }

  // Event handlers
  // Add button clicked
  addItemBtn.addEventListener("click", () => {
    editIndex = null;
    form.reset();
    form.elements["DateUpdated"].value = "";
    inventoryModal.show();
  });

  // Edit button clicked (event delegation)
  tableBody.addEventListener("click", (e) => {
    if (e.target.classList.contains("edit-btn")) {
      const idx = Number(e.target.dataset.index);
      const data = loadData();
      if (data[idx]) {
        editIndex = idx;
        populateForm(data[idx]);
        inventoryModal.show();
      }
    } else if (e.target.classList.contains("delete-btn")) {
      const idx = Number(e.target.dataset.index);
      if (confirm("Are you sure you want to delete this item?")) {
        const data = loadData();
        data.splice(idx, 1);
        saveData(data);
        renderTable();
      }
    }
  });

  // Filter changed
  filterSelect.addEventListener("change", renderTable);

  // Search changed (debounce for better performance)
  let searchTimeout;
  searchInput.addEventListener("input", () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(renderTable, 300);
  });

  // Form submitted
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = getFormData();

    // Validate required fields
    if (!formData.EquipmentType) {
      alert("Please select an Equipment Type.");
      return;
    }
    if (!formData.AssetNo) {
      alert("Asset No is required.");
      return;
    }

    // Update DateUpdated to today (yyyy-mm-dd)
    const today = new Date();
    formData.DateUpdated = today.toISOString().split("T")[0];

    const data = loadData();

    // Check unique AssetNo except current editing (prevent duplicates)
    const duplicate = data.some((item, i) => item.AssetNo === formData.AssetNo && i !== editIndex);
    if (duplicate) {
      alert("Asset No must be unique.");
      return;
    }

    if (editIndex === null) {
      // Add new
      data.push(formData);
    } else {
      // Update existing
      data[editIndex] = formData;
    }

    saveData(data);
    inventoryModal.hide();
    renderTable();
  });

  // Initial render on page load
  renderTable();
})();
