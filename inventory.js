(() => {
  "use strict";

  // Utility: format date as dd MMM yyyy e.g. 25 June 2025
  function formatDate(dateStr) {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d)) return "";
    return d.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Calculate duration between start and end dates in years + months (e.g. "2y 3m")
  function calculateDuration(startDateStr, endDateStr) {
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
    if (years < 0) return ""; // invalid
    let result = "";
    if (years > 0) result += years + "y ";
    if (months > 0) result += months + "m";
    return result.trim() || "0m";
  }

  // Get today's date formatted for DateUpdated
  function getTodayFormatted() {
    const today = new Date();
    return today.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  }

  // Storage key
  const STORAGE_KEY = "fvps_inventory_data";

  // Elements
  const tableBody = document.querySelector("#inventory-table tbody");
  const filterSelect = document.getElementById("filter-equipmenttype");
  const searchInput = document.getElementById("search-inventory");
  const addItemBtn = document.getElementById("add-item-btn");

  const modalEl = document.getElementById("inventoryModal");
  const bsModal = new bootstrap.Modal(modalEl, { keyboard: false, backdrop: "static" });
  const modalForm = document.getElementById("inventory-modal-form");

  // Current editing item index (null if adding)
  let editingIndex = null;

  // Load inventory from localStorage or empty array
  function loadInventory() {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  // Save inventory to localStorage
  function saveInventory(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  // Render table rows based on data & filter/search
  function renderTable() {
    const inventory = loadInventory();
    const filterVal = filterSelect.value.toLowerCase();
    const searchVal = searchInput.value.trim().toLowerCase();

    // Filter & search
    const filtered = inventory.filter((item) => {
      const matchesFilter =
        filterVal === "all" || (item.EquipmentType && item.EquipmentType.toLowerCase() === filterVal);
      if (!matchesFilter) return false;

      if (!searchVal) return true;

      // Search in many fields
      return (
        (item.EquipmentType && item.EquipmentType.toLowerCase().includes(searchVal)) ||
        (item.Vendor && item.Vendor.toLowerCase().includes(searchVal)) ||
        (item.BrandModel && item.BrandModel.toLowerCase().includes(searchVal)) ||
        (item.Profile && item.Profile.toLowerCase().includes(searchVal)) ||
        (item.Custodian && item.Custodian.toLowerCase().includes(searchVal)) ||
        (item.AssetNo && item.AssetNo.toLowerCase().includes(searchVal)) ||
        (item.SerialNumber && item.SerialNumber.toLowerCase().includes(searchVal)) ||
        (item.Location && item.Location.toLowerCase().includes(searchVal)) ||
        (item.Hostname && item.Hostname.toLowerCase().includes(searchVal)) ||
        (item.SSOE_PO_Number && item.SSOE_PO_Number.toLowerCase().includes(searchVal)) ||
        (item.Cart_No && item.Cart_No.toLowerCase().includes(searchVal))
      );
    });

    tableBody.innerHTML = filtered
      .map((item, idx) => {
        const duration = calculateDuration(item.StartDate, item.EndDate);

        return `<tr data-index="${idx}">
          <td>${item.EquipmentType || ""}</td>
          <td>${item.Vendor || ""}</td>
          <td>${item.BrandModel || ""}</td>
          <td>${item.Profile || ""}</td>
          <td>${item.Custodian || ""}</td>
          <td>${item.AssetNo || ""}</td>
          <td>${item.SerialNumber || ""}</td>
          <td>${item.Location || ""}</td>
          <td>${formatDate(item.EndDate)}</td>
          <td>${formatDate(item.StartDate)}</td>
          <td>${item.Hostname || ""}</td>
          <td>${item.SSOE_PO_Number || ""}</td>
          <td>${item.Cart_No || ""}</td>
          <td>${formatDate(item.SanitiseDate)}</td>
          <td>${duration}</td>
          <td>${item.Lamp_Hour !== undefined ? item.Lamp_Hour : ""}</td>
          <td>${item.DateUpdated || ""}</td>
          <td>
            <button class="btn btn-sm btn-primary edit-btn">Edit</button>
            <button class="btn btn-sm btn-danger delete-btn">Delete</button>
          </td>
        </tr>`;
      })
      .join("");
  }

  // Clear modal form inputs
  function clearForm() {
    modalForm.reset();
    modalForm.DateUpdated.value = getTodayFormatted();
  }

  // Fill modal form with item data for edit
  function fillForm(item) {
    const fields = modalForm.elements;
    for (const key in item) {
      if (fields[key]) {
        if (
          ["EndDate", "StartDate", "SanitiseDate"].includes(key) &&
          item[key]
        ) {
          // Date inputs require yyyy-MM-dd format
          const d = new Date(item[key]);
          if (!isNaN(d)) {
            const yyyy = d.getFullYear();
            const mm = String(d.getMonth() + 1).padStart(2, "0");
            const dd = String(d.getDate()).padStart(2, "0");
            fields[key].value = `${yyyy}-${mm}-${dd}`;
          } else {
            fields[key].value = "";
          }
        } else {
          fields[key].value = item[key] ?? "";
        }
      }
    }
    // Always update DateUpdated
    modalForm.DateUpdated.value = getTodayFormatted();
  }

  // Gather form data into an object
  function getFormData() {
    const data = {};
    const fields = modalForm.elements;
    for (let i = 0; i < fields.length; i++) {
      const field = fields[i];
      if (field.name) {
        data[field.name] = field.value.trim();
      }
    }
    return data;
  }

  // Add or update inventory item
  function saveItem(data) {
    const inventory = loadInventory();

    // If editing, update existing
    if (editingIndex !== null && editingIndex >= 0 && editingIndex < inventory.length) {
      inventory[editingIndex] = data;
    } else {
      // Add new
      inventory.push(data);
    }

    saveInventory(inventory);
  }

  // Delete item by index
  function deleteItem(index) {
    const inventory = loadInventory();
    inventory.splice(index, 1);
    saveInventory(inventory);
  }

  // Event: open modal for add new
  addItemBtn.addEventListener("click", () => {
    editingIndex = null;
    clearForm();
    bsModal.show();
  });

  // Event: submit modal form
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();

    // Basic validation: AssetNo and EquipmentType required
    const formData = getFormData();
    if (!formData.AssetNo) {
      alert("Asset No is required.");
      return;
    }
    if (!formData.EquipmentType) {
      alert("Equipment Type is required.");
      return;
    }

    // Auto set DateUpdated to today
    formData.DateUpdated = getTodayFormatted();

    saveItem(formData);
    bsModal.hide();
    renderTable();
  });

  // Event delegation for edit and delete buttons on table
  tableBody.addEventListener("click", (e) => {
    const btn = e.target;
    if (btn.classList.contains("edit-btn") || btn.classList.contains("delete-btn")) {
      const tr = btn.closest("tr");
      if (!tr) return;
      const index = Array.from(tableBody.children).indexOf(tr);
      const inventory = loadInventory();
      if (index < 0 || index >= inventory.length) return;

      if (btn.classList.contains("edit-btn")) {
        editingIndex = index;
        fillForm(inventory[index]);
        bsModal.show();
      } else if (btn.classList.contains("delete-btn")) {
        if (confirm("Are you sure you want to delete this item?")) {
          deleteItem(index);
          renderTable();
        }
      }
    }
  });

  // Filter & Search triggers
  filterSelect.addEventListener("change", renderTable);
  searchInput.addEventListener("input", renderTable);

  // Initial render
  renderTable();
})();
