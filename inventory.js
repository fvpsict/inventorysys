(() => {
  const STORAGE_KEY = "fvpsInventoryData";

  // Elements
  const inventoryTableBody = document.querySelector("#inventory-table tbody");
  const addItemBtn = document.getElementById("add-item-btn");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");

  // Modal elements
  const modalElement = document.getElementById("inventoryModal");
  const modalForm = document.getElementById("inventory-modal-form");
  const modal = new bootstrap.Modal(modalElement);

  // Current edited item index (null = adding new)
  let editIndex = null;

  // Load inventory data from localStorage or empty array
  function loadInventory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  }

  // Save inventory data to localStorage
  function saveInventory(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Format date as YYYY-MM-DD or empty string
  function formatDate(date) {
    if (!date) return "";
    const d = new Date(date);
    if (isNaN(d)) return "";
    return d.toISOString().split("T")[0];
  }

  // Calculate duration in use between StartDate and EndDate or today
  function calcDuration(startDateStr, endDateStr) {
    if (!startDateStr) return "";
    const start = new Date(startDateStr);
    const end = endDateStr ? new Date(endDateStr) : new Date();
    if (isNaN(start) || isNaN(end)) return "";

    let years = end.getFullYear() - start.getFullYear();
    let months = end.getMonth() - start.getMonth();
    if (months < 0) {
      years--;
      months += 12;
    }
    if (years < 0) return "";

    let result = "";
    if (years > 0) result += years + (years === 1 ? " year " : " years ");
    if (months > 0) result += months + (months === 1 ? " month" : " months");
    return result.trim();
  }

  // Render the inventory table rows, applying filter and search
  function renderTable() {
    const data = loadInventory();
    const filterVal = filterSelect.value.toLowerCase();
    const searchVal = searchInput.value.trim().toLowerCase();

    inventoryTableBody.innerHTML = "";

    data.forEach((item, index) => {
      // Filter by EquipmentType
      if (filterVal !== "all" && item["EquipmentType"]?.toLowerCase() !== filterVal) {
        return;
      }

      // Search in any field (concatenate all values)
      const combined = Object.values(item).join(" ").toLowerCase();
      if (searchVal && !combined.includes(searchVal)) {
        return;
      }

      // Calculate Duration in use
      const duration = calcDuration(item["StartDate"], item["EndDate"]);

      // Create table row
      const tr = document.createElement("tr");

      // Create cells in order of table header columns:
      const cols = [
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
        "Duration in use", // calculated
        "Lamp Hour",
        "DateUpdated",
      ];

      cols.forEach((col) => {
        const td = document.createElement("td");
        if (col === "Duration in use") {
          td.textContent = duration;
        } else if (col === "EndDate" || col === "StartDate" || col === "SanitiseDate") {
          td.textContent = formatDate(item[col]);
        } else {
          td.textContent = item[col] || "";
        }
        tr.appendChild(td);
      });

      // Actions cell (Edit, Delete buttons)
      const actionsTd = document.createElement("td");

      // Edit button
      const editBtn = document.createElement("button");
      editBtn.className = "btn btn-sm btn-primary me-2";
      editBtn.textContent = "Edit";
      editBtn.addEventListener("click", () => openEditModal(index));
      actionsTd.appendChild(editBtn);

      // Delete button
      const delBtn = document.createElement("button");
      delBtn.className = "btn btn-sm btn-danger";
      delBtn.textContent = "Delete";
      delBtn.addEventListener("click", () => deleteItem(index));
      actionsTd.appendChild(delBtn);

      tr.appendChild(actionsTd);

      inventoryTableBody.appendChild(tr);
    });
  }

  // Open modal for adding new item
  function openAddModal() {
    editIndex = null;
    modalForm.reset();
    modalForm.querySelector('input[name="DateUpdated"]').value = formatDate(new Date());
    modalForm.querySelector('input[name="AssetNo"]').removeAttribute("readonly");
    modalForm.querySelector('select[name="EquipmentType"]').focus();
    modal.show();
  }

  // Open modal for editing existing item at index
  function openEditModal(index) {
    editIndex = index;
    const data = loadInventory();
    const item = data[index];
    modalForm.reset();

    // Fill form fields
    Object.entries(item).forEach(([key, value]) => {
      const input = modalForm.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === "date") {
          input.value = formatDate(value);
        } else {
          input.value = value;
        }
      }
    });

    // Set DateUpdated to current date (editing now)
    modalForm.querySelector('input[name="DateUpdated"]').value = formatDate(new Date());
    // AssetNo readonly for editing
    modalForm.querySelector('input[name="AssetNo"]').setAttribute("readonly", true);

    modal.show();
  }

  // Delete item by index with confirmation
  function deleteItem(index) {
    if (!confirm("Are you sure you want to delete this item?")) return;
    const data = loadInventory();
    data.splice(index, 1);
    saveInventory(data);
    renderTable();
  }

  // Handle form submit for add/edit
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const formData = new FormData(modalForm);
    const newItem = {};

    // Convert FormData to object
    for (const [key, value] of formData.entries()) {
      newItem[key] = value.trim();
    }

    // Validate required fields
    if (!newItem["EquipmentType"]) {
      alert("Equipment Type is required.");
      return;
    }
    if (!newItem["AssetNo"]) {
      alert("Asset No is required.");
      return;
    }

    // Load data
    const data = loadInventory();

    // Check for duplicate AssetNo if adding new or changed
    if (
      (editIndex === null && data.some((item) => item.AssetNo === newItem.AssetNo)) ||
      (editIndex !== null &&
        data.some((item, idx) => item.AssetNo === newItem.AssetNo && idx !== editIndex))
    ) {
      alert("Asset No must be unique. Duplicate found.");
      return;
    }

    // Save DateUpdated
    newItem["DateUpdated"] = formatDate(new Date());

    if (editIndex === null) {
      // Add new
      data.push(newItem);
    } else {
      // Edit existing
      data[editIndex] = newItem;
    }

    saveInventory(data);
    renderTable();
    modal.hide();
  });

  // Event listeners
  addItemBtn.addEventListener("click", openAddModal);
  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
})();
