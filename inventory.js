// inventory.js

document.addEventListener("DOMContentLoaded", () => {
  const STORAGE_KEY = "fvps_inventory";
  let inventory = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  const tableBody = document.querySelector("#inventory-table tbody");
  const addItemBtn = document.getElementById("add-item-btn");
  const modalEl = document.getElementById("inventoryModal");
  const modal = new bootstrap.Modal(modalEl);
  const form = document.getElementById("inventory-modal-form");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");

  let editIndex = null; // null means adding, otherwise editing index

  // Render the inventory table rows filtered by current filter and search
  function renderTable() {
    const filterVal = filterSelect.value.toLowerCase();
    const searchVal = searchInput.value.toLowerCase();

    tableBody.innerHTML = "";

    const filtered = inventory.filter(item => {
      const matchesFilter = filterVal === "all" || (item.EquipmentType?.toLowerCase() === filterVal);
      const matchesSearch = Object.values(item).some(v =>
        v && v.toString().toLowerCase().includes(searchVal)
      );
      return matchesFilter && matchesSearch;
    });

    if (filtered.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="18" class="text-center">No items found.</td></tr>`;
      return;
    }

    filtered.forEach((item, i) => {
      const duration = calculateDuration(item.StartDate, item.EndDate);
      const row = document.createElement("tr");

      row.innerHTML = `
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
        <td>${item.SSOE_PONumber || ""}</td>
        <td>${item.CartNo || ""}</td>
        <td>${item.SanitiseDate || ""}</td>
        <td>${duration}</td>
        <td>${item.LampHour || ""}</td>
        <td>${item.DateUpdated || ""}</td>
        <td>
          <button class="btn btn-sm btn-primary edit-btn" data-index="${i}">Edit</button>
          <button class="btn btn-sm btn-danger delete-btn" data-index="${i}">Delete</button>
        </td>
      `;

      tableBody.appendChild(row);
    });
  }

  // Calculate duration in years and months from StartDate to EndDate (or today)
  function calculateDuration(start, end) {
    if (!start) return "";
    const startDate = new Date(start);
    const endDate = end ? new Date(end) : new Date();
    if (isNaN(startDate)) return "";

    let years = endDate.getFullYear() - startDate.getFullYear();
    let months = endDate.getMonth() - startDate.getMonth();

    if (months < 0) {
      years--;
      months += 12;
    }

    if (years < 0) return "";

    let result = "";
    if (years > 0) result += `${years} yr${years > 1 ? "s" : ""} `;
    if (months > 0) result += `${months} mo${months > 1 ? "s" : ""}`;
    return result.trim();
  }

  // Open modal for adding a new item
  addItemBtn.addEventListener("click", () => {
    editIndex = null;
    form.reset();
    form.querySelector('[name="DateUpdated"]').value = "";
    modal.show();
  });

  // Handle form submit - add or update
  form.addEventListener("submit", e => {
    e.preventDefault();

    const formData = new FormData(form);
    const newItem = {};
    formData.forEach((val, key) => {
      newItem[key] = val.trim();
    });

    // Validate required fields
    if (!newItem.EquipmentType) {
      alert("Equipment Type is required.");
      return;
    }
    if (!newItem.AssetNo) {
      alert("Asset No is required.");
      return;
    }

    // Set DateUpdated to today in yyyy-mm-dd
    const todayStr = new Date().toISOString().slice(0, 10);
    newItem.DateUpdated = todayStr;

    if (editIndex === null) {
      // Add new
      inventory.push(newItem);
    } else {
      // Update existing
      inventory[editIndex] = newItem;
    }

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
    modal.hide();
    renderTable();
  });

  // Edit button click
  tableBody.addEventListener("click", e => {
    if (e.target.classList.contains("edit-btn")) {
      editIndex = parseInt(e.target.dataset.index);
      const item = inventory[editIndex];
      if (!item) return;

      // Populate form
      Object.entries(item).forEach(([key, val]) => {
        const input = form.querySelector(`[name="${key}"]`);
        if (input) input.value = val;
      });
      modal.show();
    } else if (e.target.classList.contains("delete-btn")) {
      const delIndex = parseInt(e.target.dataset.index);
      if (confirm("Delete this inventory item?")) {
        inventory.splice(delIndex, 1);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(inventory));
        renderTable();
      }
    }
  });

  // Filter & Search change handlers
  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
});
